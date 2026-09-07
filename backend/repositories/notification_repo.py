import uuid
from utils.date_utils import utcnow_iso


def create_notification(db, user_id, ntype, title, body, ref_type=None, ref_id=None):
    now = utcnow_iso()
    db.execute(
        "INSERT INTO notifications(id,user_id,type,title,body,reference_type,reference_id,"
        "is_read,created_at) VALUES(?,?,?,?,?,?,?,0,?)",
        (str(uuid.uuid4()), user_id, ntype, title, body, ref_type, ref_id, now)
    )


def list_notifications(db, user_id, unread_only=False):
    if unread_only:
        return db.execute(
            "SELECT * FROM notifications WHERE user_id=? AND is_read=0 ORDER BY created_at DESC",
            (user_id,)
        ).fetchall()
    return db.execute(
        "SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC", (user_id,)
    ).fetchall()


def count_unread(db, user_id):
    row = db.execute(
        "SELECT COUNT(*) as cnt FROM notifications WHERE user_id=? AND is_read=0", (user_id,)
    ).fetchone()
    return row['cnt']


def find_notification(db, notif_id, user_id):
    return db.execute(
        "SELECT id FROM notifications WHERE id=? AND user_id=?", (notif_id, user_id)
    ).fetchone()


def find_by_reference(db, user_id, ref_type, ref_id):
    return db.execute(
        "SELECT id FROM notifications WHERE user_id=? AND reference_type=? AND reference_id=?",
        (user_id, ref_type, ref_id)
    ).fetchone()


def mark_read(db, notif_id, user_id):
    db.execute(
        "UPDATE notifications SET is_read=1 WHERE id=? AND user_id=?", (notif_id, user_id)
    )


def mark_all_read(db, user_id):
    db.execute("UPDATE notifications SET is_read=1 WHERE user_id=?", (user_id,))


def get_alert_preferences(db, user_id):
    return db.execute(
        "SELECT * FROM travel_alert_preferences WHERE user_id=?", (user_id,)
    ).fetchone()


def upsert_alert_preferences(db, user_id, prefs: dict):
    now = utcnow_iso()
    existing = db.execute(
        "SELECT id FROM travel_alert_preferences WHERE user_id=?", (user_id,)
    ).fetchone()
    if existing:
        prefs = dict(prefs)
        prefs['updated_at'] = now
        set_clause = ', '.join(f'{k}=?' for k in prefs)
        db.execute(
            f"UPDATE travel_alert_preferences SET {set_clause} WHERE user_id=?",
            (*prefs.values(), user_id)
        )
    else:
        pid = str(uuid.uuid4())
        cols = ['id', 'user_id'] + list(prefs.keys()) + ['updated_at']
        vals = [pid, user_id] + list(prefs.values()) + [now]
        placeholders = ','.join(['?'] * len(cols))
        db.execute(
            f"INSERT INTO travel_alert_preferences({','.join(cols)}) VALUES({placeholders})", vals
        )
