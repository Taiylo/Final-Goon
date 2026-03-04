from datetime import date, datetime, timedelta
from pathlib import Path
import re

from flask import Flask, jsonify, request, session, send_from_directory, abort

from models import db, User, Booking, ExperienceSlot
from security import hash_password, verify_password, ensure_csrf, require_csrf
from seed import seed_experiences

# ---- Config ----
TICKET_PRICES_PENCE = {
    "adult": 1800,      # £18.00
    "child": 1200,      # £12.00
    "concession": 999,  # £9.99
}

MAX_TICKETS_PER_BOOKING = 20
MAX_BOOKING_ADVANCE_DAYS = 180

COMMON_PASSWORDS = set()


def load_common_passwords():
    """
    Loads a newline-delimited password list from COMMON-PASSWORDS.txt (if present).
    Keeps the app running even if the file is missing in dev.
    """
    global COMMON_PASSWORDS
    p = Path("COMMON-PASSWORDS.txt")
    if not p.exists():
        COMMON_PASSWORDS = set()
        return

    with p.open("r", encoding="utf-8", errors="ignore") as f:
        COMMON_PASSWORDS = {line.strip().lower() for line in f if line.strip()}


def create_app():
    app = Flask(__name__, static_folder="static", static_url_path="/static")

    load_common_passwords()

    app.config["SECRET_KEY"] = "dev"  # CHANGE BEFORE DEPLOYMENT
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///safari_heights.db"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)

    with app.app_context():
        db.create_all()
        seed_experiences()

    # ---- Helpers ----
    def require_login():
        uid = session.get("user_id")
        if not uid:
            abort(401, description="Not logged in")
        return uid

    def parse_int(value, field_name: str) -> int:
        """
        Strict-ish integer parsing:
        - rejects None/""/non-numeric values
        - rejects negatives
        """
        try:
            v = int(value)
        except (TypeError, ValueError):
            abort(400, description=f"{field_name} must be an integer")
        if v < 0:
            abort(400, description=f"{field_name} cannot be negative")
        return v

    def parse_date_yyyy_mm_dd(value, field_name: str) -> date:
        """
        Parses a YYYY-MM-DD string into a real date object.
        Does NOT apply business rules (past/future) — just parsing/validity.
        """
        if value is None:
            abort(400, description=f"{field_name} is required")
        if not isinstance(value, str):
            abort(400, description=f"{field_name} must be a string in YYYY-MM-DD format")

        s = value.strip()
        if not s:
            abort(400, description=f"{field_name} is required")

        try:
            return datetime.strptime(s, "%Y-%m-%d").date()
        except ValueError:
            abort(400, description=f"{field_name} must be a valid date in YYYY-MM-DD format")

    def validate_visit_date_business(d: date) -> None:
        """
        Business rules for booking visit dates.
        """
        today = date.today()

        if d < today:
            abort(400, description="The visit Date cannot be in the past")

        max_advance = today + timedelta(days=MAX_BOOKING_ADVANCE_DAYS)
        if d > max_advance:
            abort(400, description="The bisit date is too far in the future")

    # ---- CSRF bootstrap ----
    @app.before_request
    def _csrf_bootstrap():
        ensure_csrf()

    @app.get("/api/csrf")
    def get_csrf():
        return jsonify({"csrfToken": session.get("csrf_token")})

    # ---- Auth ----
    @app.post("/api/register")
    def register():
        require_csrf()
        data = request.get_json(silent=True) or {}

        email = (data.get("email") or "").strip().lower()
        name = (data.get("name") or "").strip()
        password = data.get("password") or ""

        if not email or "@" not in email:
            abort(400, description="Enter a valid email address")
        if len(name) < 2:
            abort(400, description="Name is too short")
        if len(password) < 8:
            abort(400, description="Password must be at least 8 characters")
        if not re.search(r"[A-Za-z]", password) or not re.search(r"\d", password):
            abort(400, description="Password must contain at least a letter and a number")

        if User.query.filter_by(email=email).first():
            abort(409, description="Email is already registered")

        if password.lower() in COMMON_PASSWORDS:
            abort(400, description="Password is too common. Use a more unique password")

        user = User(email=email, name=name, password_hash=hash_password(password))
        db.session.add(user)
        db.session.commit()

        session["user_id"] = user.id
        return jsonify({"ok": True, "user": {"id": user.id, "email": user.email, "name": user.name}})

    @app.post("/api/login")
    def login():
        require_csrf()
        data = request.get_json(silent=True) or {}

        email = (data.get("email") or "").strip().lower()
        password = data.get("password") or ""

        user = User.query.filter_by(email=email).first()
        if not user or not verify_password(user.password_hash, password):
            abort(401, description="Email/password incorrect")

        session["user_id"] = user.id
        return jsonify({"ok": True, "user": {"id": user.id, "email": user.email, "name": user.name}})

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
        return jsonify({"loggedIn": True, "user": {"id": user.id, "email": user.email, "name": user.name}})

    # ---- Tickets ----
    @app.post("/api/tickets/book")
    def book_tickets():
        require_csrf()
        uid = require_login()
        data = request.get_json(silent=True)

        if not isinstance(data, dict):
            abort(400, description="Body must be a JSON object")

        visit_date = parse_date_yyyy_mm_dd(data.get("visitDate"), "visitDate")
        validate_visit_date_business(visit_date)

        adult = parse_int(data.get("adultQty"), "adultQty")
        child = parse_int(data.get("childQty"), "childQty")
        concession = parse_int(data.get("concessionQty"), "concessionQty")

        total_tickets = adult + child + concession
        if total_tickets <= 0:
            abort(400, description="Select at least 1 ticket")

        if total_tickets > MAX_TICKETS_PER_BOOKING:
            abort(400, description=f"Maximum {MAX_TICKETS_PER_BOOKING} tickets per booking")

        # Business rule: children require at least one adult
        if child > 0 and adult == 0:
            abort(400, description="At least one adult ticket is required with child tickets")

        total = (
            adult * TICKET_PRICES_PENCE["adult"]
            + child * TICKET_PRICES_PENCE["child"]
            + concession * TICKET_PRICES_PENCE["concession"]
        )

        booking = Booking(
            user_id=uid,
            booking_type="ticket",
            visit_date=visit_date,
            adult_qty=adult,
            child_qty=child,
            concession_qty=concession,
            total_price_pence=total,
        )

        db.session.add(booking)
        db.session.commit()

        return jsonify({"ok": True, "bookingId": booking.id, "totalPricePence": total})

    # ---- Edit/Delete bookings ----
    @app.route("/api/bookings/<int:booking_id>", methods=["DELETE"])
    def delete_booking(booking_id):
        require_csrf()
        uid = require_login()

        booking = Booking.query.get(booking_id)
        if not booking or booking.user_id != uid:
            abort(404, description="Booking not found")

        # If it's an experience booking, release 1 space
        if booking.booking_type == "experience" and booking.experience_slot_id:
            slot = ExperienceSlot.query.get(booking.experience_slot_id)
            if slot and slot.booked > 0:
                slot.booked -= 1

        db.session.delete(booking)
        db.session.commit()
        return jsonify({"ok": True})

    @app.route("/api/bookings/<int:booking_id>", methods=["PUT"])
    def update_booking(booking_id):
        require_csrf()
        uid = require_login()

        booking = Booking.query.get(booking_id)
        if not booking or booking.user_id != uid:
            abort(404, description="Booking not found")

        data = request.get_json(silent=True) or {}

        # ---- Update ticket booking ----
        if booking.booking_type == "ticket":
            visit_date = parse_date_yyyy_mm_dd(data.get("visitDate"), "visitDate")
            validate_visit_date_business(visit_date)

            adult = parse_int(data.get("adultQty"), "adultQty")
            child = parse_int(data.get("childQty"), "childQty")
            concession = parse_int(data.get("concessionQty"), "concessionQty")

            total_tickets = adult + child + concession
            if total_tickets <= 0:
                abort(400, description="Select at least 1 ticket")

            if total_tickets > MAX_TICKETS_PER_BOOKING:
                abort(400, description=f"Maximum {MAX_TICKETS_PER_BOOKING} tickets per booking")

            if child > 0 and adult == 0:
                abort(400, description="At least one adult ticket is required with child tickets")

            total = (
                adult * TICKET_PRICES_PENCE["adult"]
                + child * TICKET_PRICES_PENCE["child"]
                + concession * TICKET_PRICES_PENCE["concession"]
            )

            booking.visit_date = visit_date
            booking.adult_qty = adult
            booking.child_qty = child
            booking.concession_qty = concession
            booking.total_price_pence = total

            db.session.commit()
            return jsonify({"ok": True, "totalPricePence": total})

        # ---- Update experience booking (change slot) ----
        if booking.booking_type == "experience":
            new_slot_id = data.get("slotId")
            try:
                new_slot_id = int(new_slot_id)
            except (TypeError, ValueError):
                abort(400, description="slotId must be an integer")

            if not new_slot_id:
                abort(400, description="slotId required")

            old_slot_id = booking.experience_slot_id
            if old_slot_id == new_slot_id:
                return jsonify({"ok": True})  # no-op

            old_slot = ExperienceSlot.query.get(old_slot_id) if old_slot_id else None
            new_slot = ExperienceSlot.query.get(new_slot_id)

            if not new_slot:
                abort(404, description="New slot not found")
            if new_slot.available() <= 0:
                abort(409, description="That slot is fully booked")

            # Release old slot
            if old_slot and old_slot.booked > 0:
                old_slot.booked -= 1

            # Take space in new slot
            new_slot.booked += 1
            booking.experience_slot_id = new_slot.id

            db.session.commit()
            return jsonify({"ok": True})

        abort(400, description="Unsupported booking type")

    # ---- Experiences ----
    @app.get("/api/experiences")
    def list_experiences():
        """
        Query params:
          - from=YYYY-MM-DD
          - to=YYYY-MM-DD
        Note: these are just filters; they do not apply booking business rules.
        """
        from_s = (request.args.get("from") or "").strip()
        to_s = (request.args.get("to") or "").strip()

        q = ExperienceSlot.query

        if from_s:
            from_d = parse_date_yyyy_mm_dd(from_s, "from")
            q = q.filter(ExperienceSlot.date >= from_d)

        if to_s:
            to_d = parse_date_yyyy_mm_dd(to_s, "to")
            q = q.filter(ExperienceSlot.date <= to_d)

        slots = q.order_by(ExperienceSlot.date.asc(), ExperienceSlot.time.asc()).all()

        return jsonify({
            "slots": [
                {
                    "id": s.id,
                    "experienceName": s.experience_name,
                    "date": s.date,
                    "time": s.time,
                    "capacity": s.capacity,
                    "booked": s.booked,
                    "available": s.available(),
                }
                for s in slots
            ]
        })

    @app.post("/api/experiences/book")
    def book_experience():
        require_csrf()
        uid = require_login()
        data = request.get_json(silent=True) or {}

        slot_id = data.get("slotId")
        try:
            slot_id = int(slot_id)
        except (TypeError, ValueError):
            abort(400, description="slotId must be an integer")

        slot = ExperienceSlot.query.get(slot_id)
        if not slot:
            abort(404, description="Slot not found")
        if slot.available() <= 0:
            abort(409, description="That slot is fully booked")

        slot.booked += 1

        booking = Booking(
            user_id=uid,
            booking_type="experience",
            experience_slot_id=slot.id
        )
        db.session.add(booking)
        db.session.commit()

        return jsonify({"ok": True, "bookingId": booking.id})

    # ---- My bookings ----
    @app.get("/api/bookings")
    def my_bookings():
        uid = require_login()
        bookings = Booking.query.filter_by(user_id=uid).order_by(Booking.created_at.desc()).all()

        slot_ids = [
            b.experience_slot_id
            for b in bookings
            if b.booking_type == "experience" and b.experience_slot_id
        ]

        slots_by_id = {}
        if slot_ids:
            slots = ExperienceSlot.query.filter(ExperienceSlot.id.in_(slot_ids)).all()
            slots_by_id = {s.id: s for s in slots}

        out = []
        for b in bookings:
            if b.booking_type == "ticket":
                out.append({
                    "id": b.id,
                    "type": "ticket",
                    "visitDate": b.visit_date,
                    "adultQty": b.adult_qty,
                    "childQty": b.child_qty,
                    "concessionQty": b.concession_qty,
                    "totalPricePence": b.total_price_pence,
                    "createdAt": b.created_at.isoformat(),
                })
            else:
                s = slots_by_id.get(b.experience_slot_id)
                out.append({
                    "id": b.id,
                    "type": "experience",
                    "slot": None if not s else {
                        "experienceName": s.experience_name,
                        "date": s.date,
                        "time": s.time,
                    },
                    "createdAt": b.created_at.isoformat(),
                })

        return jsonify({"bookings": out})

    # ---- Frontend serving ----
    @app.get("/")
    def root():
        return send_from_directory("../frontend", "index.html")

    @app.get("/<path:path>")
    def static_proxy(path):
        return send_from_directory("../frontend", path)

    # ---- Error handling (nice JSON for API) ----
    @app.errorhandler(400)
    @app.errorhandler(401)
    @app.errorhandler(403)
    @app.errorhandler(404)
    @app.errorhandler(409)
    def api_errors(err):
        if not request.path.startswith("/api/"):
            return err
        return jsonify({"ok": False, "error": getattr(err, "description", "Request failed")}), err.code

    return app


app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
