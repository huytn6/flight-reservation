import uuid
from utils.date_utils import utcnow_iso


def create_ticket(db, tid, user_id, subject, category, booking_id=None):
    now = utcnow_iso()
    db.execute(
        "INSERT INTO support_tickets(id,user_id,booking_id,subject,category,status,created_at,updated_at) "
        "VALUES(?,?,?,?,?,?,?,?)",
        (tid, user_id, booking_id, subject, category, 'OPEN', now, now)
    )


def find_ticket(db, ticket_id):
    return db.execute("SELECT * FROM support_tickets WHERE id=?", (ticket_id,)).fetchone()


def list_tickets_for_user(db, user_id):
    return db.execute(
        "SELECT * FROM support_tickets WHERE user_id=? ORDER BY created_at DESC", (user_id,)
    ).fetchall()


def list_all_tickets(db, status=None):
    if status:
        return db.execute(
            "SELECT * FROM support_tickets WHERE status=? ORDER BY created_at DESC", (status,)
        ).fetchall()
    return db.execute("SELECT * FROM support_tickets ORDER BY created_at DESC").fetchall()


def update_ticket_status(db, ticket_id, status):
    now = utcnow_iso()
    db.execute(
        "UPDATE support_tickets SET status=?, updated_at=? WHERE id=?", (status, now, ticket_id)
    )


def assign_ticket(db, ticket_id, staff_id):
    now = utcnow_iso()
    db.execute(
        "UPDATE support_tickets SET assigned_to=?, updated_at=? WHERE id=?",
        (staff_id, now, ticket_id)
    )


def add_message(db, mid, ticket_id, sender_id, body, sender_role):
    now = utcnow_iso()
    db.execute(
        "INSERT INTO support_messages(id,ticket_id,sender_id,sender_role,body,created_at) "
        "VALUES(?,?,?,?,?,?)",
        (mid, ticket_id, sender_id, sender_role, body, now)
    )


def get_messages(db, ticket_id):
    return db.execute(
        "SELECT * FROM support_messages WHERE ticket_id=? ORDER BY created_at", (ticket_id,)
    ).fetchall()
