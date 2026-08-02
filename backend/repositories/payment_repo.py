import uuid
from utils.date_utils import utcnow_iso


# ── Payments ──────────────────────────────────────────────────────────────────

def create_payment(db, pid, booking_id, amount, currency, method, idempotency_key=None):
    now = utcnow_iso()
    db.execute(
        "INSERT INTO payments(id,booking_id,amount,currency,payment_method,status,"
        "idempotency_key,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)",
        (pid, booking_id, amount, currency, method, 'PENDING', idempotency_key, now, now)
    )


def find_payment(db, payment_id):
    return db.execute("SELECT * FROM payments WHERE id=?", (payment_id,)).fetchone()


def find_payment_by_idempotency(db, key):
    return db.execute("SELECT * FROM payments WHERE idempotency_key=?", (key,)).fetchone()


def update_payment_status(db, payment_id, status):
    now = utcnow_iso()
    db.execute("UPDATE payments SET status=?, updated_at=? WHERE id=?", (status, now, payment_id))


def list_payments_for_booking(db, booking_id, status=None):
    if status:
        return db.execute(
            "SELECT * FROM payments WHERE booking_id=? AND status=?", (booking_id, status)
        ).fetchall()
    return db.execute(
        "SELECT id,amount,currency,payment_method,status,created_at FROM payments WHERE booking_id=?",
        (booking_id,)
    ).fetchall()


def find_successful_payment(db, booking_id):
    return db.execute(
        "SELECT id FROM payments WHERE booking_id=? AND status='SUCCESS'", (booking_id,)
    ).fetchone()


def list_all_payments(db):
    return db.execute("SELECT * FROM payments ORDER BY created_at DESC").fetchall()


# ── Payment transactions ──────────────────────────────────────────────────────

def add_transaction(db, payment_id, event_type, amount):
    now = utcnow_iso()
    db.execute(
        "INSERT INTO payment_transactions(id,payment_id,event_type,amount,created_at) VALUES(?,?,?,?,?)",
        (str(uuid.uuid4()), payment_id, event_type, amount, now)
    )


def get_transactions(db, payment_id):
    return db.execute(
        "SELECT * FROM payment_transactions WHERE payment_id=? ORDER BY created_at", (payment_id,)
    ).fetchall()


# ── Refunds ───────────────────────────────────────────────────────────────────

def create_refund(db, rid, booking_id, payment_id, amount, currency, status, reason):
    now = utcnow_iso()
    db.execute(
        "INSERT INTO refunds(id,booking_id,payment_id,amount,currency,status,reason,"
        "created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)",
        (rid, booking_id, payment_id, amount, currency, status, reason, now, now)
    )


def find_refund(db, refund_id):
    return db.execute("SELECT * FROM refunds WHERE id=?", (refund_id,)).fetchone()


def list_refunds_for_booking(db, booking_id):
    return db.execute(
        "SELECT * FROM refunds WHERE booking_id=? ORDER BY created_at DESC", (booking_id,)
    ).fetchall()


def update_refund_status(db, refund_id, status):
    now = utcnow_iso()
    db.execute("UPDATE refunds SET status=?, updated_at=? WHERE id=?", (status, now, refund_id))


def list_all_refunds(db):
    return db.execute("SELECT * FROM refunds ORDER BY created_at DESC").fetchall()
