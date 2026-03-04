from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from flask import Flask, jsonify, request, session, send_from_directory, abort

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    name = db.Column(db.String(120), nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

class Booking(db.Model):
    __tablename__ = "bookings"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    booking_type = db.Column(db.String(20), nullable=False)  # "ticket" or "experience"

    # For tickets
    visit_date = db.Column(db.String(10), nullable=True)  # YYYY-MM-DD
    adult_qty = db.Column(db.Integer, nullable=True)
    child_qty = db.Column(db.Integer, nullable=True)
    concession_qty = db.Column(db.Integer, nullable=True)
    total_price_pence = db.Column(db.Integer, nullable=True)

    # For experiences
    experience_slot_id = db.Column(db.Integer, db.ForeignKey("experience_slots.id"), nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

class ExperienceSlot(db.Model):
    __tablename__ = "experience_slots"
    id = db.Column(db.Integer, primary_key=True)
    experience_name = db.Column(db.String(120), nullable=False)  # e.g., "Sunset Safari"
    date = db.Column(db.String(10), nullable=False, index=True)  # YYYY-MM-DD
    time = db.Column(db.String(5), nullable=False)              # HH:MM
    capacity = db.Column(db.Integer, nullable=False, default=10)
    booked = db.Column(db.Integer, nullable=False, default=0)

    def available(self) -> int:
        return max(0, self.capacity - self.booked)
