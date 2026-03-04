import secrets
from werkzeug.security import generate_password_hash, check_password_hash
from flask import session, request, abort

def hash_password(password: str) -> str:
    return generate_password_hash(password)

def verify_password(pw_hash: str, password: str) -> bool:
    return check_password_hash(pw_hash, password)

def ensure_csrf():
    """
    Simple CSRF protection for this prototype:
    - A token is stored in session
    - Client sends it in X-CSRF-Token header for POST/DELETE
    """
    if "csrf_token" not in session:
        session["csrf_token"] = secrets.token_urlsafe(32)

def require_csrf():
    token = session.get("csrf_token")
    header = request.headers.get("X-CSRF-Token")
    if not token or not header or header != token:
        abort(403, description="CSRF token missing/invalid")
