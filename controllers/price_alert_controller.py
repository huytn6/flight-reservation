import uuid
import datetime
from core.router import route
from core import response, request as req, authentication as auth, validation as val
from database.connection import get_db


@route('GET', '/users/me/price-alerts')
def list_price_alerts(handler):
    db = get_db()
    user = auth.require_auth(handler, db)
    rows = db.execute("SELECT * FROM price_alerts WHERE user_id=? ORDER BY created_at DESC", (user['user_id'],)).fetchall()
    response.success(handler, [dict(r) for r in rows])


@route('POST', '/users/me/price-alerts')
def create_price_alert(handler):
    db = get_db()
    user = auth.require_auth(handler, db)
    data = req.parse_json_body(handler)
    val.require_fields(data, 'origin_iata', 'destination_iata', 'departure_date')
    aid = str(uuid.uuid4())
    now = datetime.datetime.utcnow().isoformat()
    db.execute(
        "INSERT INTO price_alerts(id,user_id,origin_iata,destination_iata,departure_date,return_date,cabin_class,max_price,is_active,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,1,?,?)",
        (aid, user['user_id'], data['origin_iata'].upper(), data['destination_iata'].upper(),
         data['departure_date'], data.get('return_date'), data.get('cabin_class'), data.get('max_price'), now, now)
    )
    db.commit()
    response.created(handler, {'id': aid})


@route('GET', '/users/me/price-alerts/{alert_id}')
def get_price_alert(handler, alert_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    row = db.execute("SELECT * FROM price_alerts WHERE id=? AND user_id=?", (alert_id, user['user_id'])).fetchone()
    if not row:
        from core.exceptions import NotFoundError
        raise NotFoundError('Price alert')
    response.success(handler, dict(row))


@route('PATCH', '/users/me/price-alerts/{alert_id}')
def update_price_alert(handler, alert_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    row = db.execute("SELECT id FROM price_alerts WHERE id=? AND user_id=?", (alert_id, user['user_id'])).fetchone()
    if not row:
        from core.exceptions import NotFoundError
        raise NotFoundError('Price alert')
    data = req.parse_json_body(handler)
    allowed = {'max_price', 'cabin_class', 'is_active', 'return_date'}
    updates = {k: v for k, v in data.items() if k in allowed}
    now = datetime.datetime.utcnow().isoformat()
    updates['updated_at'] = now
    set_clause = ', '.join(f'{k}=?' for k in updates)
    db.execute(f"UPDATE price_alerts SET {set_clause} WHERE id=?", (*updates.values(), alert_id))
    db.commit()
    response.success(handler, None, 'Alert updated')


@route('DELETE', '/users/me/price-alerts/{alert_id}')
def delete_price_alert(handler, alert_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    row = db.execute("SELECT id FROM price_alerts WHERE id=? AND user_id=?", (alert_id, user['user_id'])).fetchone()
    if not row:
        from core.exceptions import NotFoundError
        raise NotFoundError('Price alert')
    db.execute("DELETE FROM price_alerts WHERE id=?", (alert_id,))
    db.commit()
    response.no_content(handler)


@route('GET', '/users/me/price-alerts/{alert_id}/history')
def price_alert_history(handler, alert_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    row = db.execute("SELECT id FROM price_alerts WHERE id=? AND user_id=?", (alert_id, user['user_id'])).fetchone()
    if not row:
        from core.exceptions import NotFoundError
        raise NotFoundError('Price alert')
    hist = db.execute(
        "SELECT * FROM price_alert_histories WHERE alert_id=? ORDER BY recorded_at DESC LIMIT 30",
        (alert_id,)
    ).fetchall()
    response.success(handler, [dict(h) for h in hist])
