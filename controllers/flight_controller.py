import json
import datetime
import uuid
from core.router import route
from core import response, request as req, authentication as auth, validation as val
from database.connection import get_db


def _flight_to_dict(f, db):
    """Enrich flight row with airline, airports, and cheapest fare."""
    d = dict(f)
    airline = db.execute("SELECT iata_code, name, logo_url FROM airlines WHERE id=?", (d['airline_id'],)).fetchone()
    dep_ap = db.execute("SELECT iata_code, name, city, timezone FROM airports WHERE id=?", (d['departure_airport_id'],)).fetchone()
    arr_ap = db.execute("SELECT iata_code, name, city, timezone FROM airports WHERE id=?", (d['arrival_airport_id'],)).fetchone()
    fares = db.execute(
        """SELECT f.*, fi.available_seats, cc.code as cabin_code, cc.name as cabin_name
           FROM fares f
           JOIN fare_inventories fi ON fi.fare_id=f.id
           JOIN cabin_classes cc ON cc.id=f.cabin_class_id
           WHERE f.flight_id=? AND fi.available_seats>0
           ORDER BY f.base_price""",
        (d['id'],)
    ).fetchall()
    d['airline'] = dict(airline) if airline else None
    d['departure_airport'] = dict(dep_ap) if dep_ap else None
    d['arrival_airport'] = dict(arr_ap) if arr_ap else None
    d['fares'] = [dict(fa) for fa in fares]
    d['cheapest_fare'] = dict(fares[0]) if fares else None
    return d


def _build_flight_filter(data):
    """Build WHERE conditions for flight search."""
    conditions = []
    params = []

    dep = data.get('origin')
    arr = data.get('destination')
    dep_date = data.get('departure_date')
    cabin = data.get('cabin_class')

    if not dep or not arr or not dep_date:
        from core.exceptions import ValidationError
        raise ValidationError('origin, destination, departure_date are required')

    val.validate_date(dep_date, 'departure_date')

    # Departure airport
    dep_row = db_find_airport(dep)
    arr_row = db_find_airport(arr)

    if not dep_row or not arr_row:
        from core.exceptions import NotFoundError
        raise NotFoundError('Airport')

    conditions.append("f.departure_airport_id=?")
    params.append(dep_row['id'])
    conditions.append("f.arrival_airport_id=?")
    params.append(arr_row['id'])
    conditions.append("DATE(f.departure_time)=?")
    params.append(dep_date)
    conditions.append("f.status NOT IN ('CANCELLED')")

    return conditions, params, dep_row, arr_row


def db_find_airport(iata_or_id):
    db = get_db()
    return db.execute("SELECT * FROM airports WHERE iata_code=? OR id=?", (iata_or_id.upper(), iata_or_id)).fetchone()


@route('POST', '/flights/search')
def search_flights(handler):
    data = req.parse_json_body(handler)
    trip_type = data.get('trip_type', 'ONE_WAY')  # ONE_WAY | ROUND_TRIP | MULTI_CITY

    if trip_type == 'MULTI_CITY':
        legs = data.get('legs', [])
        if not legs:
            from core.exceptions import ValidationError
            raise ValidationError('legs are required for multi-city search')
        results = []
        for leg in legs:
            leg_results = _search_one_way(leg, data)
            results.append(leg_results)
        response.success(handler, {'trip_type': 'MULTI_CITY', 'legs': results})
        return

    outbound = _search_one_way(data, data)
    if trip_type == 'ONE_WAY':
        response.success(handler, {'trip_type': 'ONE_WAY', 'outbound': outbound})
        return

    # ROUND_TRIP
    return_date = data.get('return_date')
    if not return_date:
        from core.exceptions import ValidationError
        raise ValidationError('return_date is required for round-trip')
    val.validate_date(return_date, 'return_date')

    return_data = dict(data)
    return_data['origin'] = data.get('destination')
    return_data['destination'] = data.get('origin')
    return_data['departure_date'] = return_date
    inbound = _search_one_way(return_data, data)

    response.success(handler, {'trip_type': 'ROUND_TRIP', 'outbound': outbound, 'inbound': inbound})


def _search_one_way(leg_data, options):
    db = get_db()
    origin = leg_data.get('origin', '')
    destination = leg_data.get('destination', '')
    departure_date = leg_data.get('departure_date', '')

    if not origin or not destination or not departure_date:
        from core.exceptions import ValidationError
        raise ValidationError('origin, destination, departure_date required')
    val.validate_date(departure_date, 'departure_date')

    dep_row = db.execute("SELECT * FROM airports WHERE iata_code=?", (origin.upper(),)).fetchone()
    arr_row = db.execute("SELECT * FROM airports WHERE iata_code=?", (destination.upper(),)).fetchone()
    if not dep_row:
        from core.exceptions import NotFoundError
        raise NotFoundError(f'Origin airport {origin}')
    if not arr_row:
        from core.exceptions import NotFoundError
        raise NotFoundError(f'Destination airport {destination}')

    cabin = options.get('cabin_class', '')
    max_stops = options.get('max_stops')
    min_price = options.get('min_price')
    max_price = options.get('max_price')
    airline_codes = options.get('airlines', [])
    refundable = options.get('refundable')
    sort = options.get('sort', 'price')  # price | departure | duration | recommended

    flights = db.execute(
        """SELECT f.*, al.iata_code as airline_code, al.name as airline_name, al.logo_url
           FROM flights f JOIN airlines al ON al.id=f.airline_id
           WHERE f.departure_airport_id=?
             AND f.arrival_airport_id=?
             AND DATE(f.departure_time)=?
             AND f.status!='CANCELLED'
           ORDER BY f.departure_time""",
        (dep_row['id'], arr_row['id'], departure_date)
    ).fetchall()

    result = []
    for f in flights:
        # Filter by airline
        if airline_codes and f['airline_code'] not in airline_codes:
            continue
        # Get fares
        fare_query = """SELECT fa.*, fi.available_seats, cc.code as cabin_code
                        FROM fares fa
                        JOIN fare_inventories fi ON fi.fare_id=fa.id
                        JOIN cabin_classes cc ON cc.id=fa.cabin_class_id
                        WHERE fa.flight_id=? AND fi.available_seats>0"""
        fare_params = [f['id']]
        if cabin:
            fare_query += " AND cc.code=?"
            fare_params.append(cabin)
        if refundable:
            fare_query += " AND fa.is_refundable=1"
        if min_price:
            fare_query += " AND (fa.base_price + fa.tax + fa.fees) >= ?"
            fare_params.append(int(min_price))
        if max_price:
            fare_query += " AND (fa.base_price + fa.tax + fa.fees) <= ?"
            fare_params.append(int(max_price))
        fare_query += " ORDER BY fa.base_price"
        fares = db.execute(fare_query, fare_params).fetchall()
        if not fares:
            continue

        dep_ap = dict(dep_row)
        arr_ap = dict(arr_row)
        flight_dict = {
            'id': f['id'],
            'flight_number': f['flight_number'],
            'airline': {'iata_code': f['airline_code'], 'name': f['airline_name'], 'logo_url': f['logo_url']},
            'departure_airport': {'iata_code': dep_ap['iata_code'], 'name': dep_ap['name'], 'city': dep_ap['city'], 'timezone': dep_ap['timezone']},
            'arrival_airport': {'iata_code': arr_ap['iata_code'], 'name': arr_ap['name'], 'city': arr_ap['city'], 'timezone': arr_ap['timezone']},
            'departure_time': f['departure_time'],
            'arrival_time': f['arrival_time'],
            'duration_minutes': f['duration_minutes'],
            'status': f['status'],
            'stops': 0,  # direct flight for seed data
            'fares': [dict(fa) for fa in fares],
            'cheapest_total': dict(fares[0])['base_price'] + dict(fares[0])['tax'] + dict(fares[0])['fees'],
        }
        result.append(flight_dict)

    # Sort
    if sort == 'price':
        result.sort(key=lambda x: x['cheapest_total'])
    elif sort == 'departure':
        result.sort(key=lambda x: x['departure_time'])
    elif sort == 'duration':
        result.sort(key=lambda x: x['duration_minutes'])

    return {
        'origin': origin.upper(),
        'destination': destination.upper(),
        'departure_date': departure_date,
        'flights': result,
        'total': len(result),
    }


@route('GET', '/flights/flexible-dates')
def flexible_dates(handler):
    db = get_db()
    origin = req.get_query_param(handler, 'origin', '')
    destination = req.get_query_param(handler, 'destination', '')
    base_date = req.get_query_param(handler, 'date', '')
    if not origin or not destination or not base_date:
        from core.exceptions import ValidationError
        raise ValidationError('origin, destination, date required')

    dep_row = db.execute("SELECT id FROM airports WHERE iata_code=?", (origin.upper(),)).fetchone()
    arr_row = db.execute("SELECT id FROM airports WHERE iata_code=?", (destination.upper(),)).fetchone()
    if not dep_row or not arr_row:
        response.success(handler, [])
        return

    base = datetime.date.fromisoformat(base_date)
    results = []
    for offset in range(-3, 4):
        check_date = (base + datetime.timedelta(days=offset)).isoformat()
        fare = db.execute(
            """SELECT MIN(fa.base_price + fa.tax + fa.fees) as min_price
               FROM flights f
               JOIN fares fa ON fa.flight_id=f.id
               JOIN fare_inventories fi ON fi.fare_id=fa.id
               WHERE f.departure_airport_id=? AND f.arrival_airport_id=?
                 AND DATE(f.departure_time)=? AND fi.available_seats>0""",
            (dep_row['id'], arr_row['id'], check_date)
        ).fetchone()
        results.append({'date': check_date, 'min_price': fare['min_price']})
    response.success(handler, results)


@route('GET', '/flights/price-calendar')
def price_calendar(handler):
    db = get_db()
    origin = req.get_query_param(handler, 'origin', '')
    destination = req.get_query_param(handler, 'destination', '')
    year_month = req.get_query_param(handler, 'month', '')  # YYYY-MM

    if not origin or not destination or not year_month:
        from core.exceptions import ValidationError
        raise ValidationError('origin, destination, month required')

    dep_row = db.execute("SELECT id FROM airports WHERE iata_code=?", (origin.upper(),)).fetchone()
    arr_row = db.execute("SELECT id FROM airports WHERE iata_code=?", (destination.upper(),)).fetchone()
    if not dep_row or not arr_row:
        response.success(handler, [])
        return

    rows = db.execute(
        """SELECT DATE(f.departure_time) as dep_date, MIN(fa.base_price + fa.tax + fa.fees) as min_price
           FROM flights f
           JOIN fares fa ON fa.flight_id=f.id
           JOIN fare_inventories fi ON fi.fare_id=fa.id
           WHERE f.departure_airport_id=? AND f.arrival_airport_id=?
             AND strftime('%Y-%m', f.departure_time)=?
             AND fi.available_seats>0
           GROUP BY dep_date
           ORDER BY dep_date""",
        (dep_row['id'], arr_row['id'], year_month)
    ).fetchall()
    response.success(handler, [dict(r) for r in rows])


@route('GET', '/flights/weekly-prices')
def weekly_prices(handler):
    return price_calendar(handler)


@route('GET', '/flight-offers/{flight_id}')
def get_flight_offer(handler, flight_id):
    db = get_db()
    f = db.execute("SELECT * FROM flights WHERE id=?", (flight_id,)).fetchone()
    if not f:
        from core.exceptions import NotFoundError
        raise NotFoundError('Flight')
    response.success(handler, _flight_to_dict(f, db))


@route('POST', '/flight-offers/{flight_id}/reprice')
def reprice_offer(handler, flight_id):
    db = get_db()
    f = db.execute("SELECT * FROM flights WHERE id=?", (flight_id,)).fetchone()
    if not f:
        from core.exceptions import NotFoundError
        raise NotFoundError('Flight')
    data = req.parse_json_body(handler)
    fare_id = data.get('fare_id')
    if fare_id:
        fare = db.execute(
            """SELECT fa.*, fi.available_seats FROM fares fa
               JOIN fare_inventories fi ON fi.fare_id=fa.id WHERE fa.id=? AND fa.flight_id=?""",
            (fare_id, flight_id)
        ).fetchone()
        if not fare:
            from core.exceptions import NotFoundError
            raise NotFoundError('Fare')
        response.success(handler, {
            'flight_id': flight_id,
            'fare_id': fare_id,
            'base_price': fare['base_price'],
            'tax': fare['tax'],
            'fees': fare['fees'],
            'total': fare['base_price'] + fare['tax'] + fare['fees'],
            'available_seats': fare['available_seats'],
            'price_changed': False,
        })
    else:
        response.success(handler, _flight_to_dict(f, db))


@route('GET', '/flight-offers/{flight_id}/segments')
def get_flight_segments(handler, flight_id):
    db = get_db()
    f = db.execute("SELECT * FROM flights WHERE id=?", (flight_id,)).fetchone()
    if not f:
        from core.exceptions import NotFoundError
        raise NotFoundError('Flight')
    segs = db.execute("SELECT * FROM flight_segments WHERE flight_id=? ORDER BY segment_order", (flight_id,)).fetchall()
    response.success(handler, [dict(s) for s in segs] if segs else [dict(f)])


@route('GET', '/flight-offers/{flight_id}/fare-options')
def get_fare_options(handler, flight_id):
    db = get_db()
    fares = db.execute(
        """SELECT fa.*, fi.available_seats, cc.code as cabin_code, cc.name as cabin_name
           FROM fares fa
           JOIN fare_inventories fi ON fi.fare_id=fa.id
           JOIN cabin_classes cc ON cc.id=fa.cabin_class_id
           WHERE fa.flight_id=?
           ORDER BY fa.base_price""",
        (flight_id,)
    ).fetchall()
    response.success(handler, [dict(f) for f in fares])


@route('GET', '/flight-offers/{flight_id}/fare-comparison')
def fare_comparison(handler, flight_id):
    return get_fare_options(handler, flight_id)


@route('GET', '/fares/{fare_id}')
def get_fare(handler, fare_id):
    db = get_db()
    fare = db.execute(
        """SELECT fa.*, fi.available_seats, cc.code as cabin_code, cc.name as cabin_name
           FROM fares fa
           JOIN fare_inventories fi ON fi.fare_id=fa.id
           JOIN cabin_classes cc ON cc.id=fa.cabin_class_id
           WHERE fa.id=?""",
        (fare_id,)
    ).fetchone()
    if not fare:
        from core.exceptions import NotFoundError
        raise NotFoundError('Fare')
    response.success(handler, dict(fare))


@route('GET', '/fares/{fare_id}/rules')
def get_fare_rules(handler, fare_id):
    db = get_db()
    rules = db.execute("SELECT * FROM fare_rules WHERE fare_id=?", (fare_id,)).fetchall()
    if not rules:
        # Return fare's built-in changeable/refundable info
        fare = db.execute("SELECT * FROM fares WHERE id=?", (fare_id,)).fetchone()
        if not fare:
            from core.exceptions import NotFoundError
            raise NotFoundError('Fare')
        rules_data = [
            {'rule_type': 'CANCELLATION', 'description': f'Cancellation fee: {fare["cancel_fee"]:,} VND' if fare['cancel_fee'] else 'Non-refundable'},
            {'rule_type': 'CHANGE', 'description': f'Change fee: {fare["change_fee"]:,} VND' if fare['is_changeable'] else 'Not changeable'},
        ]
        response.success(handler, rules_data)
        return
    response.success(handler, [dict(r) for r in rules])


@route('GET', '/fares/{fare_id}/baggage')
def get_fare_baggage(handler, fare_id):
    db = get_db()
    fare = db.execute("SELECT * FROM fares WHERE id=?", (fare_id,)).fetchone()
    if not fare:
        from core.exceptions import NotFoundError
        raise NotFoundError('Fare')
    response.success(handler, {
        'checked_baggage_kg': fare['baggage_kg'],
        'carry_on_kg': fare['carry_on_kg'],
        'extra_baggage_available': True,
    })


@route('GET', '/users/me/saved-flights')
def get_saved_flights(handler):
    db = get_db()
    user = auth.require_auth(handler, db)
    rows = db.execute(
        "SELECT sf.*, f.flight_number, f.departure_time, f.arrival_time FROM saved_flights sf JOIN flights f ON f.id=sf.flight_id WHERE sf.user_id=? ORDER BY sf.created_at DESC",
        (user['user_id'],)
    ).fetchall()
    response.success(handler, [dict(r) for r in rows])


@route('POST', '/users/me/saved-flights')
def save_flight(handler):
    db = get_db()
    user = auth.require_auth(handler, db)
    data = req.parse_json_body(handler)
    val.require_fields(data, 'flight_id')
    flight = db.execute("SELECT id FROM flights WHERE id=?", (data['flight_id'],)).fetchone()
    if not flight:
        from core.exceptions import NotFoundError
        raise NotFoundError('Flight')
    existing = db.execute("SELECT id FROM saved_flights WHERE user_id=? AND flight_id=?", (user['user_id'], data['flight_id'])).fetchone()
    if existing:
        response.success(handler, {'id': existing['id']})
        return
    sid = str(uuid.uuid4())
    now = datetime.datetime.utcnow().isoformat()
    db.execute(
        "INSERT INTO saved_flights(id,user_id,flight_id,fare_id,created_at) VALUES(?,?,?,?,?)",
        (sid, user['user_id'], data['flight_id'], data.get('fare_id'), now)
    )
    db.commit()
    response.created(handler, {'id': sid})


@route('DELETE', '/users/me/saved-flights/{saved_id}')
def unsave_flight(handler, saved_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    row = db.execute("SELECT id FROM saved_flights WHERE id=? AND user_id=?", (saved_id, user['user_id'])).fetchone()
    if not row:
        from core.exceptions import NotFoundError
        raise NotFoundError('Saved flight')
    db.execute("DELETE FROM saved_flights WHERE id=?", (saved_id,))
    db.commit()
    response.no_content(handler)
