import datetime
import uuid
from core.router import route
from core import response, request as req, authentication as auth, validation as val, middleware
from database.connection import get_db
import config


def _audit(db, user_id, action, resource, resource_id=None, details=None, ip=None):
    import json
    from utils.date_utils import utcnow_iso
    db.execute(
        "INSERT INTO audit_logs(id,user_id,action,resource,resource_id,details_json,ip_address,created_at) VALUES(?,?,?,?,?,?,?,?)",
        (str(uuid.uuid4()), user_id, action, resource, resource_id, json.dumps(details) if details else None, ip, utcnow_iso())
    )


@route('POST', '/auth/register')
def register(handler):
    data = req.parse_json_body(handler)
    val.require_fields(data, 'email', 'password', 'full_name')
    email = val.validate_email(data['email'])
    val.validate_password(data['password'])
    full_name = val.sanitize_str(data['full_name'], 100, 'full_name')

    db = get_db()
    if db.execute("SELECT id FROM users WHERE email=?", (email,)).fetchone():
        from core.exceptions import ConflictError
        raise ConflictError('Email already registered', 'EMAIL_TAKEN')

    uid = str(uuid.uuid4())
    now = datetime.datetime.utcnow().isoformat()
    hashed = auth.hash_password(data['password'])
    db.execute(
        "INSERT INTO users(id,email,password,full_name,role,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)",
        (uid, email, hashed, full_name, 'CUSTOMER', 'ACTIVE', now, now)
    )
    _audit(db, uid, 'REGISTER', 'users', uid, ip=handler.client_address[0])
    db.commit()

    response.created(handler, {'id': uid, 'email': email, 'full_name': full_name, 'role': 'CUSTOMER'}, 'Registration successful')


@route('POST', '/auth/login')
def login(handler):
    ip = handler.client_address[0]
    middleware.check_rate_limit(f'login:{ip}', config.RATE_LIMIT_LOGIN, config.RATE_LIMIT_WINDOW)

    data = req.parse_json_body(handler)
    val.require_fields(data, 'email', 'password')
    email = data['email'].strip().lower()

    db = get_db()
    user = db.execute("SELECT * FROM users WHERE email=?", (email,)).fetchone()
    if not user or not auth.verify_password(data['password'], user['password']):
        from core.exceptions import AuthenticationError
        raise AuthenticationError('Invalid email or password')
    if user['status'] != 'ACTIVE':
        from core.exceptions import AuthenticationError
        raise AuthenticationError('Account is not active')

    token = auth.generate_token()
    token_hash = auth.hash_token(token)
    session_id = str(uuid.uuid4())
    now = datetime.datetime.utcnow()
    expires = now + datetime.timedelta(hours=config.SESSION_EXPIRE_HOURS)

    db.execute(
        "INSERT INTO sessions(id,user_id,token_hash,ip_address,user_agent,created_at,expires_at,last_seen_at) VALUES(?,?,?,?,?,?,?,?)",
        (session_id, user['id'], token_hash, ip, handler.headers.get('User-Agent', ''),
         now.isoformat(), expires.isoformat(), now.isoformat())
    )
    _audit(db, user['id'], 'LOGIN', 'sessions', session_id, ip=ip)
    db.commit()

    response.success(handler, {
        'token': token,
        'expires_at': expires.isoformat(),
        'user': {'id': user['id'], 'email': user['email'], 'full_name': user['full_name'], 'role': user['role']}
    }, 'Login successful')


@route('POST', '/auth/logout')
def logout(handler):
    db = get_db()
    user = auth.require_auth(handler, db)
    token = req.get_bearer_token(handler)
    token_hash = auth.hash_token(token)
    now = datetime.datetime.utcnow().isoformat()
    db.execute("UPDATE sessions SET revoked_at=? WHERE token_hash=?", (now, token_hash))
    _audit(db, user['user_id'], 'LOGOUT', 'sessions', ip=handler.client_address[0])
    db.commit()
    response.success(handler, None, 'Logged out successfully')


@route('POST', '/auth/refresh')
def refresh_token(handler):
    db = get_db()
    user = auth.require_auth(handler, db)
    # Revoke current
    old_token = req.get_bearer_token(handler)
    old_hash = auth.hash_token(old_token)
    now = datetime.datetime.utcnow()
    db.execute("UPDATE sessions SET revoked_at=? WHERE token_hash=?", (now.isoformat(), old_hash))
    # Issue new
    new_token = auth.generate_token()
    new_hash = auth.hash_token(new_token)
    session_id = str(uuid.uuid4())
    expires = now + datetime.timedelta(hours=config.SESSION_EXPIRE_HOURS)
    db.execute(
        "INSERT INTO sessions(id,user_id,token_hash,ip_address,user_agent,created_at,expires_at,last_seen_at) VALUES(?,?,?,?,?,?,?,?)",
        (session_id, user['user_id'], new_hash, handler.client_address[0], handler.headers.get('User-Agent', ''),
         now.isoformat(), expires.isoformat(), now.isoformat())
    )
    db.commit()
    response.success(handler, {'token': new_token, 'expires_at': expires.isoformat()})


@route('GET', '/auth/me')
def me(handler):
    db = get_db()
    user = auth.require_auth(handler, db)
    row = db.execute("SELECT id,email,full_name,role,status,created_at FROM users WHERE id=?", (user['user_id'],)).fetchone()
    response.success(handler, dict(row))


@route('POST', '/auth/forgot-password')
def forgot_password(handler):
    ip = handler.client_address[0]
    middleware.check_rate_limit(f'forgot:{ip}', 5, 300)
    data = req.parse_json_body(handler)
    val.require_fields(data, 'email')
    email = data['email'].strip().lower()
    db = get_db()
    user = db.execute("SELECT id FROM users WHERE email=?", (email,)).fetchone()
    # Always return success to prevent email enumeration
    if user:
        token = auth.generate_token()
        token_hash = auth.hash_token(token)
        now = datetime.datetime.utcnow()
        expires = now + datetime.timedelta(minutes=config.RESET_TOKEN_EXPIRE_MINUTES)
        db.execute(
            "INSERT INTO password_reset_tokens(id,user_id,token_hash,created_at,expires_at) VALUES(?,?,?,?,?)",
            (str(uuid.uuid4()), user['id'], token_hash, now.isoformat(), expires.isoformat())
        )
        db.commit()
        # In production would send email; log token for demo
        import logging
        logging.getLogger(__name__).info('PASSWORD_RESET_TOKEN for %s: %s', email, token)
    response.success(handler, None, 'If the email exists, a reset link has been sent')


@route('POST', '/auth/reset-password')
def reset_password(handler):
    data = req.parse_json_body(handler)
    val.require_fields(data, 'token', 'new_password')
    val.validate_password(data['new_password'])
    db = get_db()
    token_hash = auth.hash_token(data['token'])
    now = datetime.datetime.utcnow().isoformat()
    row = db.execute(
        "SELECT * FROM password_reset_tokens WHERE token_hash=? AND used_at IS NULL AND expires_at > ?",
        (token_hash, now)
    ).fetchone()
    if not row:
        from core.exceptions import ValidationError
        raise ValidationError('Invalid or expired reset token')
    hashed = auth.hash_password(data['new_password'])
    db.execute("UPDATE users SET password=?, updated_at=? WHERE id=?", (hashed, now, row['user_id']))
    db.execute("UPDATE password_reset_tokens SET used_at=? WHERE id=?", (now, row['id']))
    db.commit()
    response.success(handler, None, 'Password reset successfully')


@route('PUT', '/auth/change-password')
def change_password(handler):
    db = get_db()
    user = auth.require_auth(handler, db)
    data = req.parse_json_body(handler)
    val.require_fields(data, 'old_password', 'new_password')
    val.validate_password(data['new_password'])
    row = db.execute("SELECT password FROM users WHERE id=?", (user['user_id'],)).fetchone()
    if not auth.verify_password(data['old_password'], row['password']):
        from core.exceptions import ValidationError
        raise ValidationError('Old password is incorrect')
    hashed = auth.hash_password(data['new_password'])
    now = datetime.datetime.utcnow().isoformat()
    db.execute("UPDATE users SET password=?, updated_at=? WHERE id=?", (hashed, now, user['user_id']))
    # Revoke all sessions
    db.execute("UPDATE sessions SET revoked_at=? WHERE user_id=? AND revoked_at IS NULL", (now, user['user_id']))
    _audit(db, user['user_id'], 'CHANGE_PASSWORD', 'users', user['user_id'], ip=handler.client_address[0])
    db.commit()
    response.success(handler, None, 'Password changed. Please login again.')
