import uuid
from utils.date_utils import utcnow_iso


def find_coupon(db, code):
    return db.execute(
        "SELECT * FROM coupons WHERE code=? AND is_active=1", (code,)
    ).fetchone()


def find_coupon_by_id(db, coupon_id):
    return db.execute("SELECT * FROM coupons WHERE id=?", (coupon_id,)).fetchone()


def list_coupons(db):
    return db.execute("SELECT * FROM coupons ORDER BY created_at DESC").fetchall()


def create_coupon(db, cid, data: dict):
    now = utcnow_iso()
    db.execute(
        "INSERT INTO coupons(id,code,discount_type,discount_value,min_amount,max_uses,"
        "used_count,valid_from,valid_until,is_active,created_at,updated_at) "
        "VALUES(?,?,?,?,?,?,0,?,?,?,?,?)",
        (
            cid,
            data['code'].upper(),
            data['discount_type'],
            int(data['discount_value']),
            data.get('min_amount', data.get('min_order_amount')),
            data.get('max_uses', data.get('usage_limit')),
            data.get('valid_from', data.get('start_date')),
            data.get('valid_until', data.get('end_date')),
            1 if data.get('is_active', True) else 0,
            now,
            now,
        )
    )


def update_coupon(db, coupon_id, updates: dict):
    now = utcnow_iso()
    updates = dict(updates)
    updates['updated_at'] = now
    set_clause = ', '.join(f'{k}=?' for k in updates)
    db.execute(f"UPDATE coupons SET {set_clause} WHERE id=?", (*updates.values(), coupon_id))


def increment_coupon_usage(db, coupon_id):
    db.execute(
        "UPDATE coupons SET used_count=used_count+1 WHERE id=?", (coupon_id,)
    )
