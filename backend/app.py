from datetime import datetime
from flask import Flask, jsonify, request, session, send_from_directory, abort

from models import (
    db,
    User,
    Product,
    Order,
    OrderItem,
    RestaurantBooking,
    Lesson,
    LessonBooking,
    Hamper,
    HamperItem
)

from security import hash_password, verify_password, ensure_csrf, require_csrf
from seed import seed_products


# =====================================
# APP FACTORY
# =====================================

def create_app():
    app = Flask(__name__, static_folder="static", static_url_path="/static")

    # ----------------------------
    # CONFIG
    # ----------------------------

    app.config.update(
        SECRET_KEY="dev",  # CHANGE BEFORE DEPLOYMENT
        SQLALCHEMY_DATABASE_URI="sqlite:///coffee_shop.db",
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
    )

    db.init_app(app)

    with app.app_context():
        db.create_all()
        seed_products()

    # =====================================
    # HELPERS
    # =====================================

    def require_login():
        uid = session.get("user_id")
        if not uid:
            abort(401, description="You must be logged in")
        return uid

    def parse_positive_int(value, field):
        try:
            v = int(value)
        except (TypeError, ValueError):
            abort(400, description=f"{field} must be an integer")

        if v <= 0:
            abort(400, description=f"{field} must be greater than 0")

        return v

    # =====================================
    # CSRF
    # =====================================

    @app.before_request
    def csrf_bootstrap():
        ensure_csrf()

    @app.get("/api/csrf")
    def get_csrf():
        return jsonify({"csrfToken": session.get("csrf_token")})

    # =====================================
    # AUTH
    # =====================================

    @app.post("/api/register")
    def register():
        require_csrf()
        data = request.get_json(silent=True) or {}

        email = (data.get("email") or "").strip().lower()
        name = (data.get("name") or "").strip()
        password = data.get("password") or ""

        if not email or "@" not in email:
            abort(400, description="Valid email required")

        if len(name) < 2:
            abort(400, description="Name too short")

        if len(password) < 8:
            abort(400, description="Password must be at least 8 characters")

        if User.query.filter_by(email=email).first():
            abort(409, description="Email already registered")

        user = User(
            email=email,
            name=name,
            password_hash=hash_password(password),
        )

        db.session.add(user)
        db.session.commit()

        session["user_id"] = user.id

        return jsonify({
            "ok": True,
            "user": {
                "id": user.id,
                "email": user.email,
                "name": user.name
            }
        })

    @app.post("/api/login")
    def login():
        require_csrf()

        data = request.get_json(silent=True) or {}

        email = (data.get("email") or "").strip().lower()
        password = data.get("password") or ""

        user = User.query.filter_by(email=email).first()

        if not user or not verify_password(user.password_hash, password):
            abort(401, description="Invalid email or password")

        session["user_id"] = user.id

        return jsonify({
            "ok": True,
            "user": {
                "id": user.id,
                "email": user.email,
                "name": user.name
            }
        })

    @app.post("/api/logout")
    def logout():
        require_csrf()
        session.pop("user_id", None)
        return jsonify({"ok": True})

    @app.get("/api/me")
    def me():

        uid = session.get("user_id")

        if not uid:
            return jsonify({"loggedIn": False})

        user = User.query.get(uid)

        return jsonify({
            "loggedIn": True,
            "user": {
                "id": user.id,
                "email": user.email,
                "name": user.name
            }
        })

    # =====================================
    # RESTAURANT BOOKINGS
    # =====================================

    @app.post("/api/bookings")
    def create_booking():
        require_csrf()
        uid = require_login()

        data = request.get_json()

        location = data.get("location")
        guests = parse_positive_int(data.get("guests"), "guests")
        booking_time = data.get("bookingTime")

        booking = RestaurantBooking(
            user_id=uid,
            location=location,
            guests=guests,
            booking_time=datetime.fromisoformat(booking_time)
        )

        db.session.add(booking)
        db.session.commit()

        return jsonify({"ok": True})

    @app.get("/api/bookings")
    def my_bookings():

        uid = require_login()

        bookings = RestaurantBooking.query.filter_by(user_id=uid).all()

        return jsonify({
            "bookings": [
                {
                    "id": b.id,
                    "location": b.location,
                    "guests": b.guests,
                    "bookingTime": b.booking_time.isoformat()
                }
                for b in bookings
            ]
        })

    # =====================================
    # LESSONS
    # =====================================

    @app.get("/api/lessons")
    def list_lessons():

        lessons = Lesson.query.all()

        return jsonify({
            "lessons": [
                {
                    "id": l.id,
                    "title": l.title,
                    "description": l.description,
                    "date": l.lesson_date.isoformat(),
                    "spaces": l.spaces
                }
                for l in lessons
            ]
        })

    @app.post("/api/lessons/book")
    def book_lesson():

        require_csrf()
        uid = require_login()

        data = request.get_json()

        lesson_id = data.get("lessonId")

        lesson = Lesson.query.get_or_404(lesson_id)

        if lesson.spaces <= 0:
            abort(409, description="Lesson is full")

        lesson.spaces -= 1

        booking = LessonBooking(
            lesson_id=lesson.id,
            user_id=uid
        )

        db.session.add(booking)
        db.session.commit()

        return jsonify({"ok": True})

    # =====================================
    # PRODUCTS
    # =====================================

    @app.get("/api/products")
    def list_products():

        products = Product.query.all()

        return jsonify({
            "products": [
                {
                    "id": p.id,
                    "name": p.name,
                    "description": p.description,
                    "pricePence": p.price_pence,
                    "stock": p.stock
                }
                for p in products
            ]
        })

    # =====================================
    # CHECKOUT
    # =====================================

    @app.post("/api/checkout")
    def checkout():

        require_csrf()
        uid = require_login()

        data = request.get_json(silent=True) or {}

        card_number = (data.get("cardNumber") or "").strip()
        expiry = (data.get("expiry") or "").strip()
        cvc = (data.get("cvc") or "").strip()

        if not card_number.isdigit() or len(card_number) != 16:
            abort(400, description="Card number must be 16 digits")

        if not cvc.isdigit() or len(cvc) not in (3, 4):
            abort(400, description="Invalid CVC")

        if not expiry or len(expiry) != 5 or expiry[2] != "/":
            abort(400, description="Expiry must be in MM/YY format")

        items = data.get("items")

        if not isinstance(items, list) or not items:
            abort(400, description="Cart is empty")

        collection_time = data.get("collectionTime")
        location = data.get("location")

        order = Order(
            user_id=uid,
            total_price_pence=0,
            status="paid",
            collection_time=datetime.fromisoformat(collection_time) if collection_time else None,
            collection_location=location
        )

        db.session.add(order)
        db.session.flush()

        total = 0

        for item in items:

            product_id = item.get("productId")
            quantity = parse_positive_int(item.get("quantity"), "quantity")

            product = Product.query.get(product_id)

            if not product:
                abort(404, description="Product not found")

            if product.stock < quantity:
                abort(409, description=f"Not enough stock for {product.name}")

            product.stock -= quantity

            line_total = product.price_pence * quantity
            total += line_total

            db.session.add(OrderItem(
                order_id=order.id,
                product_id=product.id,
                quantity=quantity,
                price_pence=product.price_pence
            ))

        order.total_price_pence = total
        db.session.commit()

        return jsonify({
            "ok": True,
            "orderId": order.id,
            "totalPricePence": total
        })

    # =====================================
    # HAMPERS
    # =====================================

    @app.post("/api/hampers")
    def create_hamper():

        require_csrf()
        uid = require_login()

        data = request.get_json()

        items = data.get("items")

        hamper = Hamper(name="Custom Hamper")

        db.session.add(hamper)
        db.session.flush()

        for item in items:

            product = Product.query.get(item["productId"])

            db.session.add(HamperItem(
                hamper_id=hamper.id,
                product_id=product.id,
                quantity=item["quantity"]
            ))

        db.session.commit()

        return jsonify({
            "ok": True,
            "hamperId": hamper.id
        })

    # =====================================
    # ORDER HISTORY
    # =====================================

    @app.get("/api/orders")
    def my_orders():

        uid = require_login()

        orders = Order.query \
            .filter_by(user_id=uid) \
            .order_by(Order.created_at.desc()) \
            .all()

        return jsonify({
            "orders": [
                {
                    "id": o.id,
                    "totalPricePence": o.total_price_pence,
                    "status": o.status,
                    "createdAt": o.created_at.isoformat(),
                    "items": [
                        {
                            "productName": item.product.name,
                            "quantity": item.quantity,
                            "pricePence": item.price_pence
                        }
                        for item in o.items
                    ]
                }
                for o in orders
            ]
        })

    # =====================================
    # FRONTEND
    # =====================================

    @app.get("/")
    def root():
        return send_from_directory("../frontend", "index.html")

    @app.get("/<path:path>")
    def static_proxy(path):
        return send_from_directory("../frontend", path)

    # =====================================
    # ERROR HANDLING
    # =====================================

    @app.errorhandler(400)
    @app.errorhandler(401)
    @app.errorhandler(404)
    @app.errorhandler(409)
    def api_errors(err):

        if not request.path.startswith("/api/"):
            return err

        return jsonify({
            "ok": False,
            "error": getattr(err, "description", "Request failed")
        }), err.code

    return app


app = create_app()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)