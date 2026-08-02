import uuid
import datetime
from core.router import route
from core import response, request as req, authentication as auth
from database.connection import get_db
from utils.pagination import paginate


@route('GET', '/users/me/notifications')
def list_notifications(handler):
    db = get_db()
    user = auth.require_auth(handler, db)
    page, size = req.get_pagination(handler)
    rows = db.execute(
        "SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC",
        (user['user_id'],)
    ).fetchall()
    result = paginate([dict(r) for r in rows], page, size)
    response.success(handler, result)


@route('GET', '/users/me/notifications/unread-count')
def unread_count(handler):
    db = get_db()
    user = auth.require_auth(handler, db)
    row = db.execute("SELECT COUNT(*) as cnt FROM notifications WHERE user_id=? AND is_read=0", (user['user_id'],)).fetchone()
    response.success(handler, {'unread_count': row['cnt']})


@route('PATCH', '/users/me/notifications/{notif_id}/read')
def mark_read(handler, notif_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    row = db.execute("SELECT id FROM notifications WHERE id=? AND user_id=?", (notif_id, user['user_id'])).fetchone()
    if not row:
        from core.exceptions import NotFoundError
        raise NotFoundError('Notification')
    db.execute("UPDATE notifications SET is_read=1 WHERE id=?", (notif_id,))
    db.commit()
    response.success(handler, None, 'Marked as read')


@route('POST', '/users/me/notifications/read-all')
def read_all(handler):
    db = get_db()
    user = auth.require_auth(handler, db)
    db.execute("UPDATE notifications SET is_read=1 WHERE user_id=?", (user['user_id'],))
    db.commit()
    response.success(handler, None, 'All notifications marked as read')


@route('GET', '/users/me/travel-alert-preferences')
def get_alert_prefs(handler):
    db = get_db()
    user = auth.require_auth(handler, db)
    row = db.execute("SELECT * FROM travel_alert_preferences WHERE user_id=?", (user['user_id'],)).fetchone()
    if not row:
        # Return defaults
        response.success(handler, {
            'delay_alerts': True, 'gate_changes': True,
            'cancellation_alerts': True, 'price_drop_alerts': True,
        })
        return
    response.success(handler, dict(row))


@route('PATCH', '/users/me/travel-alert-preferences')
def update_alert_prefs(handler):
    db = get_db()
    user = auth.require_auth(handler, db)
    data = req.parse_json_body(handler)
    now = datetime.datetime.utcnow().isoformat()
    existing = db.execute("SELECT id FROM travel_alert_preferences WHERE user_id=?", (user['user_id'],)).fetchone()
    if existing:
        allowed = {'delay_alerts', 'gate_changes', 'cancellation_alerts', 'price_drop_alerts'}
        updates = {k: (1 if v else 0) for k, v in data.items() if k in allowed}
        updates['updated_at'] = now
        set_clause = ', '.join(f'{k}=?' for k in updates)
        db.execute(f"UPDATE travel_alert_preferences SET {set_clause} WHERE user_id=?", (*updates.values(), user['user_id']))
    else:
        db.execute(
            "INSERT INTO travel_alert_preferences(id,user_id,delay_alerts,gate_changes,cancellation_alerts,price_drop_alerts,updated_at) VALUES(?,?,?,?,?,?,?)",
            (str(uuid.uuid4()), user['user_id'],
             1 if data.get('delay_alerts', True) else 0,
             1 if data.get('gate_changes', True) else 0,
             1 if data.get('cancellation_alerts', True) else 0,
             1 if data.get('price_drop_alerts', True) else 0,
             now)
        )
    db.commit()
    response.success(handler, None, 'Preferences updated')
