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
from seed import seed_products, seed_lessons


# =====================================
# APP FACTORY
# =====================================

def create_app():
    app = Flask(__name__, static_folder="static", static_url_path="/static")

    app.config.update(
        SECRET_KEY="dev",
        SQLALCHEMY_DATABASE_URI="sqlite:///coffee_shop.db",
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
    )

    db.init_app(app)

    with app.app_context():
        db.create_all()
        seed_products()
        seed_lessons()

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

    def parse_iso_datetime(value, field):
        if not value:
            abort(400, description=f"{field} is required")

        try:
            return datetime.fromisoformat(value)
        except (TypeError, ValueError):
            abort(400, description=f"{field} must be a valid ISO date/time")

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

        user = db.session.get(User, uid)

        if not user:
            session.pop("user_id", None)
            return jsonify({"loggedIn": False})

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

        data = request.get_json(silent=True) or {}

        location = (data.get("location") or "").strip()
        guests = parse_positive_int(data.get("guests"), "guests")
        booking_time = parse_iso_datetime(data.get("bookingTime"), "bookingTime")

        if not location:
            abort(400, description="Location is required")

        booking = RestaurantBooking(
            user_id=uid,
            location=location,
            guests=guests,
            booking_time=booking_time
        )

        db.session.add(booking)
        db.session.commit()

        return jsonify({"ok": True})

    @app.get("/api/bookings")
    def my_bookings():
        uid = require_login()

        bookings = (
            RestaurantBooking.query
            .filter_by(user_id=uid)
            .order_by(RestaurantBooking.booking_time.asc())
            .all()
        )

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
        lessons = Lesson.query.order_by(Lesson.lesson_date.asc()).all()

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

        data = request.get_json(silent=True) or {}
        lesson_id = data.get("lessonId")

        if not lesson_id:
            abort(400, description="lessonId is required")

        lesson = db.session.get(Lesson, lesson_id)

        if not lesson:
            abort(404, description="Lesson not found")

        existing_booking = LessonBooking.query.filter_by(
            lesson_id=lesson.id,
            user_id=uid
        ).first()

        if existing_booking:
            abort(409, description="You have already booked this lesson")

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
        products = Product.query.order_by(Product.name.asc()).all()

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
    # CHECKOUT (ORDERS)
    # =====================================

    @app.post("/api/checkout")
    def checkout():
        require_csrf()
        uid = require_login()

        data = request.get_json(silent=True) or {}
        items = data.get("items")

        if not isinstance(items, list) or not items:
            abort(400, description="Cart is empty")

        order = Order(
            user_id=uid,
            total_price_pence=0,
            status="paid",
            created_at=datetime.utcnow()
        )

        db.session.add(order)
        db.session.flush()

        total = 0

        for item in items:
            product_id = item.get("productId")
            quantity = parse_positive_int(item.get("quantity"), "quantity")

            product = db.session.get(Product, product_id)

            if not product:
                abort(404, description="Product not found")

            if product.stock < quantity:
                abort(409, description=f"Not enough stock for {product.name}")

            product.stock -= quantity

            line_total = product.price_pence * quantity
            total += line_total

            order_item = OrderItem(
                order_id=order.id,
                product_id=product.id,
                quantity=quantity,
                price_pence=product.price_pence
            )

            db.session.add(order_item)

        order.total_price_pence = total
        db.session.commit()

        return jsonify({
            "ok": True,
            "orderId": order.id,
            "totalPricePence": total
        })

    # =====================================
    # ORDER HISTORY
    # =====================================

    @app.get("/api/orders")
    def get_orders():
        uid = require_login()

        orders = (
            Order.query
            .filter_by(user_id=uid)
            .order_by(Order.created_at.desc())
            .all()
        )

        orders_data = []

        for order in orders:
            items = []

            for item in order.items:
                items.append({
                    "productName": item.product.name,
                    "quantity": item.quantity,
                    "pricePence": item.price_pence
                })

            orders_data.append({
                "id": order.id,
                "status": order.status,
                "totalPricePence": order.total_price_pence,
                "createdAt": order.created_at.isoformat(),
                "items": items
            })

        return jsonify({
            "orders": orders_data
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