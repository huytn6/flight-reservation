import uuid
import datetime
import logging

from core import authentication as auth
from core.exceptions import ConflictError, AuthenticationError, ValidationError
from database.connection import get_db
from repositories import user_repo, audit_repo
from utils.date_utils import utcnow_iso
import config

logger = logging.getLogger(__name__)


def register(email: str, password: str, full_name: str, ip: str) -> dict:
    db = get_db()
    if user_repo.find_by_email(db, email):
        raise ConflictError('Email already registered', 'EMAIL_TAKEN')
    uid = str(uuid.uuid4())
    hashed = auth.hash_password(password)
    user_repo.create(db, uid, email, hashed, full_name)
    audit_repo.log(db, uid, 'REGISTER', 'users', uid, ip=ip)
    db.commit()
    return {'id': uid, 'email': email, 'full_name': full_name, 'role': 'CUSTOMER'}


def login(email: str, password: str, ip: str, user_agent: str) -> dict:
    db = get_db()
    user = user_repo.find_by_email(db, email)
    if not user or not auth.verify_password(password, user['password']):
        raise AuthenticationError('Invalid email or password')
    if user['status'] != 'ACTIVE':
        raise AuthenticationError('Account is not active')

    token = auth.generate_token()
    token_hash = auth.hash_token(token)
    session_id = str(uuid.uuid4())
    now = datetime.datetime.utcnow()
    expires = now + datetime.timedelta(hours=config.SESSION_EXPIRE_HOURS)

    user_repo.create_session(db, session_id, user['id'], token_hash, ip, user_agent,
                             now.isoformat(), expires.isoformat())
    audit_repo.log(db, user['id'], 'LOGIN', 'sessions', session_id, ip=ip)
    db.commit()
    return {
        'token': token,
        'expires_at': expires.isoformat(),
        'user': {'id': user['id'], 'email': user['email'],
                 'full_name': user['full_name'], 'role': user['role']},
    }


def logout(user_ctx: dict, token: str, ip: str) -> None:
    db = get_db()
    token_hash = auth.hash_token(token)
    now = utcnow_iso()
    user_repo.revoke_session_by_token(db, token_hash, now)
    audit_repo.log(db, user_ctx['user_id'], 'LOGOUT', 'sessions', ip=ip)
    db.commit()


def refresh(user_ctx: dict, old_token: str, ip: str, user_agent: str) -> dict:
    db = get_db()
    old_hash = auth.hash_token(old_token)
    now = datetime.datetime.utcnow()
    user_repo.revoke_session_by_token(db, old_hash, now.isoformat())

    new_token = auth.generate_token()
    new_hash = auth.hash_token(new_token)
    session_id = str(uuid.uuid4())
    expires = now + datetime.timedelta(hours=config.SESSION_EXPIRE_HOURS)
    user_repo.create_session(db, session_id, user_ctx['user_id'], new_hash, ip, user_agent,
                             now.isoformat(), expires.isoformat())
    db.commit()
    return {'token': new_token, 'expires_at': expires.isoformat()}


def get_me(user_id: str) -> dict:
    db = get_db()
    row = db.execute(
        "SELECT id,email,full_name,role,status,created_at FROM users WHERE id=?", (user_id,)
    ).fetchone()
    return dict(row)


def forgot_password(email: str) -> None:
    db = get_db()
    user = user_repo.find_by_email(db, email)
    if user:
        token = auth.generate_token()
        token_hash = auth.hash_token(token)
        now = datetime.datetime.utcnow()
        expires = now + datetime.timedelta(minutes=config.RESET_TOKEN_EXPIRE_MINUTES)
        user_repo.create_reset_token(db, str(uuid.uuid4()), user['id'], token_hash,
                                     now.isoformat(), expires.isoformat())
        db.commit()
        logger.info('PASSWORD_RESET_TOKEN for %s: %s', email, token)


def reset_password(token: str, new_password: str) -> None:
    db = get_db()
    token_hash = auth.hash_token(token)
    now = utcnow_iso()
    row = user_repo.find_valid_reset_token(db, token_hash, now)
    if not row:
        raise ValidationError('Invalid or expired reset token')
    hashed = auth.hash_password(new_password)
    user_repo.update_password(db, row['user_id'], hashed)
    user_repo.mark_reset_token_used(db, row['id'], now)
    user_repo.revoke_all_sessions(db, row['user_id'], now)
    db.commit()


def change_password(user_id: str, old_password: str, new_password: str, ip: str) -> None:
    db = get_db()
    row = user_repo.find_by_id(db, user_id)
    if not auth.verify_password(old_password, row['password']):
        raise ValidationError('Old password is incorrect')
    hashed = auth.hash_password(new_password)
    now = utcnow_iso()
    user_repo.update_password(db, user_id, hashed)
    user_repo.revoke_all_sessions(db, user_id, now)
    audit_repo.log(db, user_id, 'CHANGE_PASSWORD', 'users', user_id, ip=ip)
    db.commit()
