from datetime import date, timedelta
from models import db, ExperienceSlot

EXPERIENCES = [
    ("Sunset Safari", "18:30", 12),
    ("Ranger For A Day", "10:00", 8),
    ("Behind The Scenes", "14:00", 10),
    ("Rainforest Expedition", "12:00", 16),
    ("Climate Change Talk", "15:00", 32),
    ("Feed The Penguines", "10:00", 6),
]

def seed_experiences(days_ahead: int = 90):
    """Create example experience slots if the table is empty."""
    # Only seed if empty
    if ExperienceSlot.query.first():
        return

    today = date.today()
    for i in range(days_ahead):
        d = today + timedelta(days=i)
        for name, time, cap in EXPERIENCES:
            db.session.add(
                ExperienceSlot(
                    experience_name=name,
                    date=d.isoformat(),
                    time=time,
                    capacity=cap,
                    booked=0,
                )
            )
    db.session.commit()
