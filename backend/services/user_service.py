import uuid
from core.exceptions import ValidationError, NotFoundError
from core import validation as val
from database.connection import get_db
from repositories import user_repo
from utils.pagination import paginate
from utils.date_utils import utcnow_iso

ALLOWED_PROFILE_FIELDS = {'full_name', 'phone', 'date_of_birth', 'nationality', 'passport_number', 'passport_expiry'}
ALLOWED_PASSENGER_FIELDS = {'full_name', 'date_of_birth', 'nationality', 'passport_number', 'passport_expiry', 'passenger_type'}


def get_profile(user_id: str) -> dict:
    db = get_db()
    row = db.execute(
        "SELECT id,email,full_name,phone,date_of_birth,nationality,passport_number,"
        "passport_expiry,role,status,created_at FROM users WHERE id=?",
        (user_id,)
    ).fetchone()
    return dict(row)


def update_profile(user_id: str, data: dict) -> None:
    updates = {k: v for k, v in data.items() if k in ALLOWED_PROFILE_FIELDS}
    if not updates:
        raise ValidationError('No updatable fields provided')
    if updates.get('phone'):
        updates['phone'] = val.validate_phone(updates['phone'])
    if updates.get('date_of_birth'):
        val.validate_date(updates['date_of_birth'], 'date_of_birth')
        if updates['date_of_birth'] > utcnow_iso()[:10]:
            raise ValidationError('date_of_birth cannot be in the future')
    db = get_db()
    user_repo.update(db, user_id, updates)
    db.commit()


def get_sessions(user_id: str, page: int, size: int) -> dict:
    db = get_db()
    rows = user_repo.list_active_sessions(db, user_id)
    return paginate([dict(r) for r in rows], page, size)


def revoke_session(user_id: str, session_id: str) -> None:
    db = get_db()
    row = user_repo.find_active_session(db, session_id, user_id)
    if not row:
        raise NotFoundError('Session')
    now = utcnow_iso()
    db.execute("UPDATE sessions SET revoked_at=? WHERE id=?", (now, session_id))
    db.commit()


def get_saved_passengers(user_id: str) -> list:
    db = get_db()
    rows = user_repo.list_saved_passengers(db, user_id)
    return [dict(r) for r in rows]


def add_saved_passenger(user_id: str, data: dict) -> dict:
    if not data.get('full_name'):
        raise ValidationError('full_name is required')
    db = get_db()
    pid = str(uuid.uuid4())
    user_repo.create_saved_passenger(db, pid, user_id, data)
    db.commit()
    return {'id': pid}


def update_saved_passenger(user_id: str, passenger_id: str, data: dict) -> None:
    db = get_db()
    row = user_repo.find_saved_passenger(db, passenger_id, user_id)
    if not row:
        raise NotFoundError('Saved passenger')
    updates = {k: v for k, v in data.items() if k in ALLOWED_PASSENGER_FIELDS}
    user_repo.update_saved_passenger(db, passenger_id, updates)
    db.commit()


def delete_saved_passenger(user_id: str, passenger_id: str) -> None:
    db = get_db()
    row = user_repo.find_saved_passenger(db, passenger_id, user_id)
    if not row:
        raise NotFoundError('Saved passenger')
    user_repo.delete_saved_passenger(db, passenger_id)
    db.commit()
