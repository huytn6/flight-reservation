import uuid
from core.exceptions import ValidationError, NotFoundError
from core import validation as val
from database.connection import get_db
from repositories import user_repo
from utils.pagination import paginate
from utils.date_utils import utcnow_iso

ALLOWED_PROFILE_FIELDS = {
    'full_name', 'phone', 'date_of_birth', 'nationality', 'passport_number', 'passport_expiry',
    'gender', 'bio', 'special_assistance',
}
ALLOWED_PASSENGER_FIELDS = {'full_name', 'date_of_birth', 'nationality', 'passport_number', 'passport_expiry', 'passenger_type'}


def _validate_required_identity(data: dict) -> None:
    if not data.get('date_of_birth'):
        raise ValidationError('Vui lòng nhập ngày sinh')
    if not str(data.get('passport_number') or '').strip():
        raise ValidationError('Vui lòng nhập Số Hộ chiếu / CCCD')
    val.validate_date(data['date_of_birth'], 'ngày sinh')
    if data['date_of_birth'] > utcnow_iso()[:10]:
        raise ValidationError('Ngày sinh không được lớn hơn ngày hiện tại')
    data['passport_number'] = val.sanitize_str(
        data['passport_number'], max_len=20, field='Số Hộ chiếu / CCCD'
    )


def get_profile(user_id: str) -> dict:
    db = get_db()
    row = db.execute(
        "SELECT id,email,full_name,phone,date_of_birth,nationality,passport_number,"
        "passport_expiry,gender,bio,special_assistance,role,status,created_at FROM users WHERE id=?",
        (user_id,)
    ).fetchone()
    return dict(row)


def update_profile(user_id: str, data: dict) -> None:
    updates = {k: v for k, v in data.items() if k in ALLOWED_PROFILE_FIELDS}
    if not updates:
        raise ValidationError('Không có thông tin nào để cập nhật')
    _validate_required_identity(updates)
    if updates.get('phone'):
        updates['phone'] = val.validate_phone(updates['phone'])
    if updates.get('gender'):
        updates['gender'] = val.sanitize_str(updates['gender'], max_len=30, field='gender')
    if updates.get('bio'):
        updates['bio'] = val.sanitize_str(updates['bio'], max_len=1000, field='bio')
    if updates.get('special_assistance'):
        updates['special_assistance'] = val.sanitize_str(updates['special_assistance'], max_len=255, field='special_assistance')
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
        raise ValidationError('Vui lòng nhập họ tên hành khách')
    _validate_required_identity(data)
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
    merged = {**dict(row), **updates}
    _validate_required_identity(merged)
    updates['date_of_birth'] = merged['date_of_birth']
    updates['passport_number'] = merged['passport_number']
    user_repo.update_saved_passenger(db, passenger_id, updates)
    db.commit()


def delete_saved_passenger(user_id: str, passenger_id: str) -> None:
    db = get_db()
    row = user_repo.find_saved_passenger(db, passenger_id, user_id)
    if not row:
        raise NotFoundError('Saved passenger')
    user_repo.delete_saved_passenger(db, passenger_id)
    db.commit()
