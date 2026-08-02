import uuid
import datetime
from core.router import route
from core import response, request as req, authentication as auth, validation as val
from database.connection import get_db


@route('GET', '/users/me')
def get_profile(handler):
    db = get_db()
    user = auth.require_auth(handler, db)
    row = db.execute(
        "SELECT id,email,full_name,phone,date_of_birth,nationality,passport_number,passport_expiry,role,status,created_at FROM users WHERE id=?",
        (user['user_id'],)
    ).fetchone()
    response.success(handler, dict(row))


@route('PATCH', '/users/me')
def update_profile(handler):
    db = get_db()
    user = auth.require_auth(handler, db)
    data = req.parse_json_body(handler)
    allowed = {'full_name', 'phone', 'date_of_birth', 'nationality', 'passport_number', 'passport_expiry'}
    updates = {k: v for k, v in data.items() if k in allowed}
    if not updates:
        from core.exceptions import ValidationError
        raise ValidationError('No updatable fields provided')
    now = datetime.datetime.utcnow().isoformat()
    updates['updated_at'] = now
    set_clause = ', '.join(f'{k}=?' for k in updates)
    db.execute(f"UPDATE users SET {set_clause} WHERE id=?", (*updates.values(), user['user_id']))
    db.commit()
    response.success(handler, None, 'Profile updated')


@route('GET', '/users/me/sessions')
def get_sessions(handler):
    db = get_db()
    user = auth.require_auth(handler, db)
    page, size = req.get_pagination(handler)
    rows = db.execute(
        "SELECT id,ip_address,user_agent,created_at,expires_at,last_seen_at FROM sessions WHERE user_id=? AND revoked_at IS NULL ORDER BY created_at DESC",
        (user['user_id'],)
    ).fetchall()
    from utils.pagination import paginate
    result = paginate([dict(r) for r in rows], page, size)
    response.success(handler, result)


@route('DELETE', '/users/me/sessions/{session_id}')
def revoke_session(handler, session_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    row = db.execute("SELECT id FROM sessions WHERE id=? AND user_id=?", (session_id, user['user_id'])).fetchone()
    if not row:
        from core.exceptions import NotFoundError
        raise NotFoundError('Session')
    now = datetime.datetime.utcnow().isoformat()
    db.execute("UPDATE sessions SET revoked_at=? WHERE id=?", (now, session_id))
    db.commit()
    response.no_content(handler)


@route('GET', '/users/me/saved-passengers')
def get_saved_passengers(handler):
    db = get_db()
    user = auth.require_auth(handler, db)
    rows = db.execute(
        "SELECT * FROM saved_passengers WHERE user_id=? ORDER BY created_at DESC",
        (user['user_id'],)
    ).fetchall()
    response.success(handler, [dict(r) for r in rows])


@route('POST', '/users/me/saved-passengers')
def add_saved_passenger(handler):
    db = get_db()
    user = auth.require_auth(handler, db)
    data = req.parse_json_body(handler)
    val.require_fields(data, 'full_name')
    pid = str(uuid.uuid4())
    now = datetime.datetime.utcnow().isoformat()
    db.execute(
        "INSERT INTO saved_passengers(id,user_id,full_name,date_of_birth,nationality,passport_number,passport_expiry,passenger_type,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?)",
        (pid, user['user_id'], data['full_name'], data.get('date_of_birth'), data.get('nationality'),
         data.get('passport_number'), data.get('passport_expiry'), data.get('passenger_type', 'ADULT'), now, now)
    )
    db.commit()
    response.created(handler, {'id': pid})


@route('PATCH', '/users/me/saved-passengers/{pid}')
def update_saved_passenger(handler, pid):
    db = get_db()
    user = auth.require_auth(handler, db)
    row = db.execute("SELECT id FROM saved_passengers WHERE id=? AND user_id=?", (pid, user['user_id'])).fetchone()
    if not row:
        from core.exceptions import NotFoundError
        raise NotFoundError('Saved passenger')
    data = req.parse_json_body(handler)
    allowed = {'full_name', 'date_of_birth', 'nationality', 'passport_number', 'passport_expiry', 'passenger_type'}
    updates = {k: v for k, v in data.items() if k in allowed}
    now = datetime.datetime.utcnow().isoformat()
    updates['updated_at'] = now
    set_clause = ', '.join(f'{k}=?' for k in updates)
    db.execute(f"UPDATE saved_passengers SET {set_clause} WHERE id=?", (*updates.values(), pid))
    db.commit()
    response.success(handler, None, 'Passenger updated')


@route('DELETE', '/users/me/saved-passengers/{pid}')
def delete_saved_passenger(handler, pid):
    db = get_db()
    user = auth.require_auth(handler, db)
    row = db.execute("SELECT id FROM saved_passengers WHERE id=? AND user_id=?", (pid, user['user_id'])).fetchone()
    if not row:
        from core.exceptions import NotFoundError
        raise NotFoundError('Saved passenger')
    db.execute("DELETE FROM saved_passengers WHERE id=?", (pid,))
    db.commit()
    response.no_content(handler)
