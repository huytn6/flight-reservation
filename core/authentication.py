import hashlib
import hmac
import secrets
import datetime
from core.exceptions import AuthenticationError
import config


def hash_password(password: str, salt: bytes = None):
    if salt is None:
        salt = secrets.token_bytes(32)
    dk = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, config.PBKDF2_ITERATIONS)
    return salt.hex() + ':' + dk.hex()


def verify_password(password: str, stored: str) -> bool:
    try:
        salt_hex, dk_hex = stored.split(':')
        salt = bytes.fromhex(salt_hex)
        dk = bytes.fromhex(dk_hex)
    except Exception:
        return False
    check = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, config.PBKDF2_ITERATIONS)
    return hmac.compare_digest(check, dk)


def generate_token() -> str:
    return secrets.token_urlsafe(config.TOKEN_LENGTH)


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def get_current_user(handler, db):
    from core.request import get_bearer_token
    token = get_bearer_token(handler)
    if not token:
        raise AuthenticationError()
    token_hash = hash_token(token)
    now = datetime.datetime.utcnow().isoformat()
    row = db.execute(
        """SELECT s.id as session_id, s.user_id, s.expires_at, s.revoked_at,
                  u.id, u.email, u.role, u.status, u.full_name
           FROM sessions s
           JOIN users u ON u.id = s.user_id
           WHERE s.token_hash = ? AND s.revoked_at IS NULL AND s.expires_at > ?""",
        (token_hash, now)
    ).fetchone()
    if not row:
        raise AuthenticationError('Token is invalid or expired')
    if row['status'] != 'ACTIVE':
        raise AuthenticationError('Account is not active')
    # update last seen
    db.execute("UPDATE sessions SET last_seen_at=? WHERE id=?", (now, row['session_id']))
    return dict(row)


def require_auth(handler, db):
    return get_current_user(handler, db)


def require_role(handler, db, *roles):
    user = get_current_user(handler, db)
    if user['role'] not in roles:
        from core.exceptions import AuthorizationError
        raise AuthorizationError()
    return user


def require_customer(handler, db):
    return require_role(handler, db, 'CUSTOMER', 'STAFF', 'ADMIN')


def require_staff(handler, db):
    return require_role(handler, db, 'STAFF', 'ADMIN')


def require_admin(handler, db):
    return require_role(handler, db, 'ADMIN')
