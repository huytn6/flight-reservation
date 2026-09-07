import uuid
from utils.date_utils import utcnow_iso


# ── Users ────────────────────────────────────────────────────────────────────

def find_by_id(db, user_id):
    return db.execute("SELECT * FROM users WHERE id=?", (user_id,)).fetchone()


def find_by_email(db, email):
    return db.execute("SELECT * FROM users WHERE email=?", (email,)).fetchone()


def create(db, uid, email, hashed_pw, full_name, role='CUSTOMER', status='ACTIVE'):
    now = utcnow_iso()
    db.execute(
        "INSERT INTO users(id,email,password,full_name,role,status,created_at,updated_at) "
        "VALUES(?,?,?,?,?,?,?,?)",
        (uid, email, hashed_pw, full_name, role, status, now, now)
    )


def update(db, user_id, updates: dict):
    now = utcnow_iso()
    updates = dict(updates)
    updates['updated_at'] = now
    set_clause = ', '.join(f'{k}=?' for k in updates)
    db.execute(f"UPDATE users SET {set_clause} WHERE id=?", (*updates.values(), user_id))


def update_password(db, user_id, hashed_pw):
    now = utcnow_iso()
    db.execute("UPDATE users SET password=?, updated_at=? WHERE id=?", (hashed_pw, now, user_id))


def update_status(db, user_id, status):
    now = utcnow_iso()
    db.execute("UPDATE users SET status=?, updated_at=? WHERE id=?", (status, now, user_id))


def update_role(db, user_id, role):
    now = utcnow_iso()
    db.execute("UPDATE users SET role=?, updated_at=? WHERE id=?", (role, now, user_id))


def list_customers(db):
    return db.execute(
        "SELECT id,email,full_name,phone,role,status,created_at FROM users "
        "WHERE role='CUSTOMER' ORDER BY created_at DESC"
    ).fetchall()


def list_staff(db):
    return db.execute(
        "SELECT id,email,full_name,role,status,created_at FROM users "
        "WHERE role IN ('STAFF','ADMIN') ORDER BY created_at DESC"
    ).fetchall()


# ── Sessions ─────────────────────────────────────────────────────────────────

def create_session(db, session_id, user_id, token_hash, ip, user_agent, now, expires):
    db.execute(
        "INSERT INTO sessions(id,user_id,token_hash,ip_address,user_agent,created_at,expires_at,last_seen_at) "
        "VALUES(?,?,?,?,?,?,?,?)",
        (session_id, user_id, token_hash, ip, user_agent, now, expires, now)
    )


def revoke_session_by_token(db, token_hash, now):
    db.execute("UPDATE sessions SET revoked_at=? WHERE token_hash=?", (now, token_hash))


def revoke_all_sessions(db, user_id, now):
    db.execute(
        "UPDATE sessions SET revoked_at=? WHERE user_id=? AND revoked_at IS NULL",
        (now, user_id)
    )


def find_active_session(db, session_id, user_id):
    return db.execute(
        "SELECT id FROM sessions WHERE id=? AND user_id=? AND revoked_at IS NULL",
        (session_id, user_id)
    ).fetchone()


def list_active_sessions(db, user_id):
    now = utcnow_iso()
    return db.execute(
        "SELECT id,ip_address,user_agent,created_at,expires_at,last_seen_at "
        "FROM sessions WHERE user_id=? AND revoked_at IS NULL AND expires_at > ? ORDER BY created_at DESC",
        (user_id, now)
    ).fetchall()


# ── Password reset tokens ─────────────────────────────────────────────────────

def create_reset_token(db, token_id, user_id, token_hash, now, expires):
    db.execute(
        "INSERT INTO password_reset_tokens(id,user_id,token_hash,created_at,expires_at) VALUES(?,?,?,?,?)",
        (token_id, user_id, token_hash, now, expires)
    )


def find_valid_reset_token(db, token_hash, now):
    return db.execute(
        "SELECT * FROM password_reset_tokens WHERE token_hash=? AND used_at IS NULL AND expires_at > ?",
        (token_hash, now)
    ).fetchone()


def mark_reset_token_used(db, token_id, now):
    db.execute("UPDATE password_reset_tokens SET used_at=? WHERE id=?", (now, token_id))


# ── Saved passengers ──────────────────────────────────────────────────────────

def list_saved_passengers(db, user_id):
    return db.execute(
        "SELECT * FROM saved_passengers WHERE user_id=? ORDER BY created_at DESC", (user_id,)
    ).fetchall()


def find_saved_passenger(db, pid, user_id):
    return db.execute(
        "SELECT id FROM saved_passengers WHERE id=? AND user_id=?", (pid, user_id)
    ).fetchone()


def create_saved_passenger(db, pid, user_id, data: dict):
    now = utcnow_iso()
    db.execute(
        "INSERT INTO saved_passengers(id,user_id,full_name,date_of_birth,nationality,"
        "passport_number,passport_expiry,passenger_type,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?)",
        (pid, user_id, data['full_name'], data.get('date_of_birth'), data.get('nationality'),
         data.get('passport_number'), data.get('passport_expiry'),
         data.get('passenger_type', 'ADULT'), now, now)
    )


def update_saved_passenger(db, pid, updates: dict):
    now = utcnow_iso()
    updates = dict(updates)
    updates['updated_at'] = now
    set_clause = ', '.join(f'{k}=?' for k in updates)
    db.execute(f"UPDATE saved_passengers SET {set_clause} WHERE id=?", (*updates.values(), pid))


def delete_saved_passenger(db, pid):
    db.execute("DELETE FROM saved_passengers WHERE id=?", (pid,))


# ── Saved flights ─────────────────────────────────────────────────────────────

def list_saved_flights(db, user_id):
    return db.execute(
        "SELECT sf.*, f.flight_number, f.departure_time, f.arrival_time, f.status as flight_status, "
        "dep.iata_code as origin, dep.city as origin_city, "
        "arr.iata_code as destination, arr.city as destination_city, "
        "al.name as airline_name, al.iata_code as airline_code "
        "FROM saved_flights sf "
        "JOIN flights f ON f.id=sf.flight_id "
        "JOIN airports dep ON dep.id=f.departure_airport_id "
        "JOIN airports arr ON arr.id=f.arrival_airport_id "
        "JOIN airlines al ON al.id=f.airline_id "
        "WHERE sf.user_id=? ORDER BY sf.created_at DESC",
        (user_id,)
    ).fetchall()


def find_saved_flight(db, saved_id, user_id):
    return db.execute(
        "SELECT id FROM saved_flights WHERE id=? AND user_id=?", (saved_id, user_id)
    ).fetchone()


def find_saved_flight_by_flight(db, user_id, flight_id):
    return db.execute(
        "SELECT id FROM saved_flights WHERE user_id=? AND flight_id=?", (user_id, flight_id)
    ).fetchone()


def create_saved_flight(db, sid, user_id, flight_id, fare_id=None):
    now = utcnow_iso()
    db.execute(
        "INSERT INTO saved_flights(id,user_id,flight_id,fare_id,created_at) VALUES(?,?,?,?,?)",
        (sid, user_id, flight_id, fare_id, now)
    )


def delete_saved_flight(db, saved_id):
    db.execute("DELETE FROM saved_flights WHERE id=?", (saved_id,))
