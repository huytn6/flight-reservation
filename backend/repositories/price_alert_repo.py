import uuid
from utils.date_utils import utcnow_iso


def list_alerts_for_user(db, user_id):
    return db.execute(
        "SELECT * FROM price_alerts WHERE user_id=? ORDER BY created_at DESC", (user_id,)
    ).fetchall()


def find_alert(db, alert_id, user_id=None):
    if user_id:
        return db.execute(
            "SELECT * FROM price_alerts WHERE id=? AND user_id=?", (alert_id, user_id)
        ).fetchone()
    return db.execute("SELECT * FROM price_alerts WHERE id=?", (alert_id,)).fetchone()


def list_active_alerts(db):
    return db.execute(
        "SELECT * FROM price_alerts WHERE is_active=1", ()
    ).fetchall()


def create_alert(db, aid, user_id, data: dict):
    now = utcnow_iso()
    db.execute(
        "INSERT INTO price_alerts(id,user_id,origin_iata,destination_iata,departure_date,"
        "return_date,cabin_class,max_price,is_active,created_at,updated_at) "
        "VALUES(?,?,?,?,?,?,?,?,1,?,?)",
        (
            aid, user_id, data['origin_iata'], data['destination_iata'], data['departure_date'],
            data.get('return_date'), data.get('cabin_class'), data.get('max_price'), now, now
        )
    )


def update_alert(db, alert_id, updates: dict):
    now = utcnow_iso()
    updates = dict(updates)
    updates['updated_at'] = now
    set_clause = ', '.join(f'{k}=?' for k in updates)
    db.execute(f"UPDATE price_alerts SET {set_clause} WHERE id=?", (*updates.values(), alert_id))


def delete_alert(db, alert_id):
    db.execute("DELETE FROM price_alerts WHERE id=?", (alert_id,))


def add_history_entry(db, alert_id, current_price):
    now = utcnow_iso()
    db.execute(
        "INSERT INTO price_alert_histories(id,alert_id,price,recorded_at) VALUES(?,?,?,?)",
        (str(uuid.uuid4()), alert_id, current_price, now)
    )


def get_alert_history(db, alert_id):
    return db.execute(
        "SELECT * FROM price_alert_histories WHERE alert_id=? ORDER BY recorded_at DESC",
        (alert_id,)
    ).fetchall()
