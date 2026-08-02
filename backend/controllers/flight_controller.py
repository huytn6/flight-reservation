from core.router import route
from core import response, request as req, authentication as auth, validation as val
from database.connection import get_db
from services import flight_service


@route('POST', '/flights/search')
def search_flights(handler):
    data = req.parse_json_body(handler)
    result = flight_service.search_flights(data)
    response.success(handler, result)


@route('GET', '/flights/flexible-dates')
def flexible_dates(handler):
    origin = req.get_query_param(handler, 'origin', '')
    destination = req.get_query_param(handler, 'destination', '')
    base_date = req.get_query_param(handler, 'date', '')
    if not origin or not destination or not base_date:
        from core.exceptions import ValidationError
        raise ValidationError('origin, destination, date required')
    result = flight_service.get_flexible_dates(origin, destination, base_date)
    response.success(handler, result)


@route('GET', '/flights/price-calendar')
def price_calendar(handler):
    origin = req.get_query_param(handler, 'origin', '')
    destination = req.get_query_param(handler, 'destination', '')
    year_month = req.get_query_param(handler, 'month', '')
    if not origin or not destination or not year_month:
        from core.exceptions import ValidationError
        raise ValidationError('origin, destination, month required')
    result = flight_service.get_price_calendar(origin, destination, year_month)
    response.success(handler, result)


@route('GET', '/flights/weekly-prices')
def weekly_prices(handler):
    return price_calendar(handler)


@route('GET', '/flight-offers/{flight_id}')
def get_flight_offer(handler, flight_id):
    result = flight_service.get_flight_offer(flight_id)
    response.success(handler, result)


@route('POST', '/flight-offers/{flight_id}/reprice')
def reprice_offer(handler, flight_id):
    data = req.parse_json_body(handler)
    result = flight_service.reprice_offer(flight_id, data.get('fare_id'))
    response.success(handler, result)


@route('GET', '/flight-offers/{flight_id}/segments')
def get_flight_segments(handler, flight_id):
    result = flight_service.get_flight_segments(flight_id)
    response.success(handler, result)


@route('GET', '/flight-offers/{flight_id}/fare-options')
def get_fare_options(handler, flight_id):
    from repositories import flight_repo
    from database.connection import get_db as _db
    db = _db()
    fares = db.execute(
        """SELECT fa.*, fi.available_seats, cc.code as cabin_code, cc.name as cabin_name
           FROM fares fa JOIN fare_inventories fi ON fi.fare_id=fa.id
           JOIN cabin_classes cc ON cc.id=fa.cabin_class_id
           WHERE fa.flight_id=? ORDER BY fa.base_price""",
        (flight_id,)
    ).fetchall()
    response.success(handler, [dict(f) for f in fares])


@route('GET', '/flight-offers/{flight_id}/fare-comparison')
def fare_comparison(handler, flight_id):
    return get_fare_options(handler, flight_id)


@route('GET', '/fares/{fare_id}')
def get_fare(handler, fare_id):
    result = flight_service.get_fare(fare_id)
    response.success(handler, result)


@route('GET', '/fares/{fare_id}/rules')
def get_fare_rules(handler, fare_id):
    result = flight_service.get_fare_rules(fare_id)
    response.success(handler, result)


@route('GET', '/fares/{fare_id}/baggage')
def get_fare_baggage(handler, fare_id):
    result = flight_service.get_fare_baggage(fare_id)
    response.success(handler, result)


@route('GET', '/users/me/saved-flights')
def get_saved_flights(handler):
    db = get_db()
    user = auth.require_auth(handler, db)
    result = flight_service.get_saved_flights(user['user_id'])
    response.success(handler, result)


@route('POST', '/users/me/saved-flights')
def save_flight(handler):
    db = get_db()
    user = auth.require_auth(handler, db)
    data = req.parse_json_body(handler)
    val.require_fields(data, 'flight_id')
    result = flight_service.save_flight(user['user_id'], data['flight_id'], data.get('fare_id'))
    response.created(handler, result)


@route('DELETE', '/users/me/saved-flights/{saved_id}')
def unsave_flight(handler, saved_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    flight_service.unsave_flight(user['user_id'], saved_id)
    response.no_content(handler)
