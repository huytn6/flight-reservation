from core.router import route
from core import response, request as req, authentication as auth, validation as val
from database.connection import get_db
from services import price_alert_service


@route('GET', '/users/me/price-alerts')
def list_price_alerts(handler):
    db = get_db()
    user = auth.require_auth(handler, db)
    result = price_alert_service.list_alerts(user['user_id'])
    response.success(handler, result)


@route('POST', '/users/me/price-alerts')
def create_price_alert(handler):
    db = get_db()
    user = auth.require_auth(handler, db)
    data = req.parse_json_body(handler)
    val.require_fields(data, 'origin_iata', 'destination_iata', 'departure_date')
    result = price_alert_service.create_alert(user['user_id'], data)
    response.created(handler, result)


@route('GET', '/users/me/price-alerts/{alert_id}')
def get_price_alert(handler, alert_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    result = price_alert_service.get_alert(user['user_id'], alert_id)
    response.success(handler, result)


@route('PATCH', '/users/me/price-alerts/{alert_id}')
def update_price_alert(handler, alert_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    data = req.parse_json_body(handler)
    price_alert_service.update_alert(user['user_id'], alert_id, data)
    response.success(handler, None, 'Alert updated')


@route('DELETE', '/users/me/price-alerts/{alert_id}')
def delete_price_alert(handler, alert_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    price_alert_service.delete_alert(user['user_id'], alert_id)
    response.no_content(handler)


@route('GET', '/users/me/price-alerts/{alert_id}/history')
def price_alert_history(handler, alert_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    result = price_alert_service.get_history(user['user_id'], alert_id)
    response.success(handler, result)
