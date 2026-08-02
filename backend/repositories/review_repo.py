import uuid
from utils.date_utils import utcnow_iso


def list_reviews(db, airline_id=None, status='APPROVED'):
    if airline_id:
        return db.execute(
            "SELECT r.*, u.full_name as reviewer_name FROM airline_reviews r "
            "JOIN users u ON u.id=r.user_id WHERE r.airline_id=? AND r.status=? "
            "ORDER BY r.created_at DESC",
            (airline_id, status)
        ).fetchall()
    return db.execute(
        "SELECT r.*, u.full_name as reviewer_name FROM airline_reviews r "
        "JOIN users u ON u.id=r.user_id WHERE r.status=? ORDER BY r.created_at DESC",
        (status,)
    ).fetchall()


def find_review(db, review_id):
    return db.execute("SELECT * FROM airline_reviews WHERE id=?", (review_id,)).fetchone()


def find_review_by_user_and_airline(db, user_id, airline_id):
    return db.execute(
        "SELECT id FROM airline_reviews WHERE user_id=? AND airline_id=?", (user_id, airline_id)
    ).fetchone()


def create_review(db, rid, user_id, airline_id, rating, title, body):
    now = utcnow_iso()
    db.execute(
        "INSERT INTO airline_reviews(id,user_id,airline_id,rating,title,body,status,created_at,updated_at) "
        "VALUES(?,?,?,?,?,?,?,?,?)",
        (rid, user_id, airline_id, rating, title, body, 'PENDING', now, now)
    )


def update_review(db, review_id, updates: dict):
    now = utcnow_iso()
    updates = dict(updates)
    updates['updated_at'] = now
    set_clause = ', '.join(f'{k}=?' for k in updates)
    db.execute(f"UPDATE airline_reviews SET {set_clause} WHERE id=?", (*updates.values(), review_id))


def delete_review(db, review_id):
    db.execute("DELETE FROM airline_reviews WHERE id=?", (review_id,))


def report_review(db, review_id, reporter_id, reason):
    now = utcnow_iso()
    db.execute(
        "INSERT INTO review_reports(id,review_id,reporter_id,reason,created_at) VALUES(?,?,?,?,?)",
        (str(uuid.uuid4()), review_id, reporter_id, reason, now)
    )
