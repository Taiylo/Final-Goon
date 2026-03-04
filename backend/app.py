from datetime import datetime
from flask import Flask, jsonify, request, session, send_from_directory, abort

from models import db, User, Product, Order, OrderItem
from security import hash_password, verify_password, ensure_csrf, require_csrf
from seed import seed_products


# =========================
# APP FACTORY
# =========================

def create_app():
    app = Flask(__name__, static_folder="static", static_url_path="/static")

    app.config["SECRET_KEY"] = "dev"  # CHANGE BEFORE DEPLOYMENT
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///coffee_shop.db"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)

    with app.app_context():
        db.create_all()
        seed_products()   # auto-seed products on first run

    # =========================
    # HELPERS
    # =========================

    def require_login():
        uid = session.get("user_id")
        if not uid:
            abort(401, description="Not logged in")
        return uid

    def parse_int(value, field_name):
        try:
            v = int(value)
        except (TypeError, ValueError):
            abort(400, description=f"{field_name} must be an integer")
        if v <= 0:
            abort(400, description=f"{field_name} must be greater than 0")
        return v

    # =========================
    # CSRF
    # =========================

    @app.before_request
    def _csrf_bootstrap():
        ensure_csrf()

    @app.get("/api/csrf")
    def get_csrf():
        return jsonify({"csrfToken": session.get("csrf_token")})

    # =========================
    # AUTH
    # =========================

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

    # =========================
    # PRODUCTS
    # =========================

    @app.get("/api/products")
    def list_products():
        products = Product.query.order_by(Product.created_at.desc()).all()

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

    # =========================
# CHECKOUT (LOGIN REQUIRED)
# =========================

@app.post("/api/checkout")
def checkout():
    require_csrf()

    # 🔐 Must be logged in before entering payment details
    uid = require_login()

    data = request.get_json(silent=True) or {}

    # -------------------------
    # Validate Card Details
    # -------------------------
    card_number = (data.get("cardNumber") or "").strip()
    expiry = (data.get("expiry") or "").strip()
    cvc = (data.get("cvc") or "").strip()

    if not card_number.isdigit() or len(card_number) != 16:
        abort(400, description="Card number must be 16 digits")

    if not cvc.isdigit() or len(cvc) not in (3, 4):
        abort(400, description="Invalid CVC")

    if not expiry or len(expiry) != 5 or expiry[2] != "/":
        abort(400, description="Expiry must be in MM/YY format")

    # -------------------------
    # Validate Cart
    # -------------------------
    items = data.get("items")
    if not isinstance(items, list) or not items:
        abort(400, description="Cart is empty")

    order = Order(
        user_id=uid,
        total_price_pence=0,
        status="paid"
    )

    db.session.add(order)
    db.session.flush()

    total = 0

    for item in items:
        product_id = item.get("productId")

        try:
            quantity = int(item.get("quantity"))
        except (TypeError, ValueError):
            abort(400, description="Invalid quantity")

        if quantity <= 0:
            abort(400, description="Quantity must be greater than 0")

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

    # =========================
    # MY ORDERS
    # =========================

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
                            "productId": item.product_id,
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

    # =========================
    # FRONTEND
    # =========================

    @app.get("/")
    def root():
        return send_from_directory("../frontend", "index.html")

    @app.get("/<path:path>")
    def static_proxy(path):
        return send_from_directory("../frontend", path)

    # =========================
    # ERROR HANDLING
    # =========================

    @app.errorhandler(400)
    @app.errorhandler(401)
    @app.errorhandler(403)
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