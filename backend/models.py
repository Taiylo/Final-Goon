from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


# =========================
# USER
# =========================

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    name = db.Column(db.String(120), nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    orders = db.relationship("Order", backref="user", lazy=True)
    restaurant_bookings = db.relationship("RestaurantBooking", backref="user", lazy=True)
    lesson_bookings = db.relationship("LessonBooking", backref="user", lazy=True)


# =========================
# PRODUCT (Coffee Items)
# =========================

class Product(db.Model):
    __tablename__ = "products"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=True)
    price_pence = db.Column(db.Integer, nullable=False)
    stock = db.Column(db.Integer, nullable=False, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    order_items = db.relationship("OrderItem", backref="product", lazy=True)
    hamper_items = db.relationship("HamperItem", backref="product", lazy=True)


# =========================
# ORDER
# =========================

class Order(db.Model):
    __tablename__ = "orders"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    total_price_pence = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(50), default="pending")  # pending, paid, shipped

    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # For pre-order collection
    collection_time = db.Column(db.DateTime)
    collection_location = db.Column(db.String(120))

    # Relationships
    items = db.relationship("OrderItem", backref="order", lazy=True)


# =========================
# ORDER ITEMS
# =========================

class OrderItem(db.Model):
    __tablename__ = "order_items"

    id = db.Column(db.Integer, primary_key=True)

    order_id = db.Column(db.Integer, db.ForeignKey("orders.id"), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey("products.id"), nullable=False)

    quantity = db.Column(db.Integer, nullable=False, default=1)

    # Snapshot of product price at time of purchase
    price_pence = db.Column(db.Integer, nullable=False)


# =========================
# RESTAURANT BOOKINGS
# =========================

class RestaurantBooking(db.Model):
    __tablename__ = "restaurant_bookings"

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    location = db.Column(db.String(120), nullable=False)  # Leeds / Harrogate / Knaresborough
    guests = db.Column(db.Integer, nullable=False)
    booking_time = db.Column(db.DateTime, nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)


# =========================
# LESSONS
# =========================

class Lesson(db.Model):
    __tablename__ = "lessons"

    id = db.Column(db.Integer, primary_key=True)

    title = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text)

    lesson_date = db.Column(db.DateTime, nullable=False)
    spaces = db.Column(db.Integer, nullable=False)

    # Relationships
    bookings = db.relationship("LessonBooking", backref="lesson", lazy=True)


# =========================
# LESSON BOOKINGS
# =========================

class LessonBooking(db.Model):
    __tablename__ = "lesson_bookings"

    id = db.Column(db.Integer, primary_key=True)

    lesson_id = db.Column(db.Integer, db.ForeignKey("lessons.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)


# =========================
# HAMPERS
# =========================

class Hamper(db.Model):
    __tablename__ = "hampers"

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String(120))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    items = db.relationship("HamperItem", backref="hamper", lazy=True)


# =========================
# HAMPER ITEMS
# =========================

class HamperItem(db.Model):
    __tablename__ = "hamper_items"

    id = db.Column(db.Integer, primary_key=True)

    hamper_id = db.Column(db.Integer, db.ForeignKey("hampers.id"), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey("products.id"), nullable=False)

    quantity = db.Column(db.Integer, nullable=False, default=1)