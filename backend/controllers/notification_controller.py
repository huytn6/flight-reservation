from core.router import route
from core import response, request as req, authentication as auth
from database.connection import get_db
from services import notification_service


@route('GET', '/users/me/notifications')
def list_notifications(handler):
    db = get_db()
    user = auth.require_auth(handler, db)
    page, size = req.get_pagination(handler)
    result = notification_service.list_notifications(user['user_id'], page, size)
    response.success(handler, result)


@route('GET', '/users/me/notifications/unread-count')
def unread_count(handler):
    db = get_db()
    user = auth.require_auth(handler, db)
    result = notification_service.get_unread_count(user['user_id'])
    response.success(handler, result)


@route('PATCH', '/users/me/notifications/{notif_id}/read')
def mark_read(handler, notif_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    notification_service.mark_read(user['user_id'], notif_id)
    response.success(handler, None, 'Marked as read')


@route('POST', '/users/me/notifications/read-all')
def read_all(handler):
    db = get_db()
    user = auth.require_auth(handler, db)
    notification_service.mark_all_read(user['user_id'])
    response.success(handler, None, 'All notifications marked as read')


@route('GET', '/users/me/travel-alert-preferences')
def get_alert_prefs(handler):
    db = get_db()
    user = auth.require_auth(handler, db)
    result = notification_service.get_alert_preferences(user['user_id'])
    response.success(handler, result)


@route('PATCH', '/users/me/travel-alert-preferences')
def update_alert_prefs(handler):
    db = get_db()
    user = auth.require_auth(handler, db)
    data = req.parse_json_body(handler)
    notification_service.update_alert_preferences(user['user_id'], data)
    response.success(handler, None, 'Preferences updated')
