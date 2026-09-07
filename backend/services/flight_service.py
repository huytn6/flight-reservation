import datetime
import uuid

from core.exceptions import ValidationError, NotFoundError
from core import validation as val
from database.connection import get_db
from repositories import flight_repo, airport_repo, user_repo


def search_flights(data: dict) -> dict:
    trip_type = data.get('trip_type', 'ONE_WAY')

    if trip_type == 'MULTI_CITY':
        legs = data.get('legs', [])
        if not legs:
            raise ValidationError('legs are required for multi-city search')
        return {
            'trip_type': 'MULTI_CITY',
            'legs': [_search_one_way(leg, data) for leg in legs],
        }

    outbound = _search_one_way(data, data)
    if trip_type == 'ONE_WAY':
        return {'trip_type': 'ONE_WAY', 'outbound': outbound}

    return_date = data.get('return_date')
    if not return_date:
        raise ValidationError('return_date is required for round-trip')
    val.validate_date(return_date, 'return_date')

    return_data = dict(data)
    return_data['origin'] = data.get('destination')
    return_data['destination'] = data.get('origin')
    return_data['departure_date'] = return_date
    inbound = _search_one_way(return_data, data)
    return {'trip_type': 'ROUND_TRIP', 'outbound': outbound, 'inbound': inbound}


def _search_one_way(leg_data: dict, options: dict) -> dict:
    db = get_db()
    origin = leg_data.get('origin', '')
    destination = leg_data.get('destination', '')
    departure_date = leg_data.get('departure_date', '')

    if not origin or not destination or not departure_date:
        raise ValidationError('origin, destination, departure_date required')
    val.validate_date(departure_date, 'departure_date')

    dep_row = airport_repo.find_airport_by_iata(db, origin)
    arr_row = airport_repo.find_airport_by_iata(db, destination)
    if not dep_row:
        raise NotFoundError(f'Origin airport {origin}')
    if not arr_row:
        raise NotFoundError(f'Destination airport {destination}')

    cabin = options.get('cabin_class', '')
    min_price = options.get('min_price')
    max_price = options.get('max_price')
    airline_codes = options.get('airlines', [])
    refundable = options.get('refundable')
    sort = options.get('sort', 'price')

    flights = flight_repo.search_flights(db, dep_row['id'], arr_row['id'], departure_date)
    result = []
    for f in flights:
        if airline_codes and f['airline_code'] not in airline_codes:
            continue
        fares = flight_repo.list_fares_for_flight(
            db, f['id'], cabin_code=cabin, refundable=refundable,
            min_price=min_price, max_price=max_price
        )
        if not fares:
            continue
        result.append({
            'id': f['id'],
            'flight_number': f['flight_number'],
            'airline': {'iata_code': f['airline_code'], 'name': f['airline_name'], 'logo_url': f['logo_url']},
            'departure_airport': {'iata_code': dep_row['iata_code'], 'name': dep_row['name'],
                                  'city': dep_row['city'], 'timezone': dep_row['timezone']},
            'arrival_airport': {'iata_code': arr_row['iata_code'], 'name': arr_row['name'],
                                'city': arr_row['city'], 'timezone': arr_row['timezone']},
            'departure_time': f['departure_time'],
            'arrival_time': f['arrival_time'],
            'duration_minutes': f['duration_minutes'],
            'status': f['status'],
            'stops': 0,
            'fares': [dict(fa) for fa in fares],
            'cheapest_total': fares[0]['base_price'] + fares[0]['tax'] + fares[0]['fees'],
        })

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


def search_flight_status(query: str) -> list:
    db = get_db()
    rows = flight_repo.search_flight_status(db, (query or '').strip())
    return [dict(r) for r in rows]


def get_flexible_dates(origin: str, destination: str, base_date: str) -> list:
    db = get_db()
    dep_row = airport_repo.find_airport_by_iata(db, origin)
    arr_row = airport_repo.find_airport_by_iata(db, destination)
    if not dep_row or not arr_row:
        return []

    base = datetime.date.fromisoformat(base_date)
    results = []
    for offset in range(-3, 4):
        check_date = (base + datetime.timedelta(days=offset)).isoformat()
        row = flight_repo.get_min_price_for_date(db, dep_row['id'], arr_row['id'], check_date)
        results.append({'date': check_date, 'min_price': row['min_price']})
    return results


def get_price_calendar(origin: str, destination: str, year_month: str) -> list:
    db = get_db()
    dep_row = airport_repo.find_airport_by_iata(db, origin)
    arr_row = airport_repo.find_airport_by_iata(db, destination)
    if not dep_row or not arr_row:
        return []
    rows = flight_repo.get_price_calendar(db, dep_row['id'], arr_row['id'], year_month)
    return [dict(r) for r in rows]


def get_flight_offer(flight_id: str) -> dict:
    db = get_db()
    f = flight_repo.find_flight(db, flight_id)
    if not f:
        raise NotFoundError('Flight')
    return _enrich_flight(db, f)


def reprice_offer(flight_id: str, fare_id: str | None) -> dict:
    db = get_db()
    f = flight_repo.find_flight(db, flight_id)
    if not f:
        raise NotFoundError('Flight')
    if fare_id:
        fare = flight_repo.find_fare_with_flight(db, fare_id, flight_id)
        if not fare:
            raise NotFoundError('Fare')
        return {
            'flight_id': flight_id,
            'fare_id': fare_id,
            'base_price': fare['base_price'],
            'tax': fare['tax'],
            'fees': fare['fees'],
            'total': fare['base_price'] + fare['tax'] + fare['fees'],
            'available_seats': fare['available_seats'],
            'price_changed': False,
        }
    return _enrich_flight(db, f)


def _enrich_flight(db, f) -> dict:
    d = dict(f)
    airline = db.execute(
        "SELECT iata_code, name, logo_url FROM airlines WHERE id=?", (d['airline_id'],)
    ).fetchone()
    dep_ap = db.execute(
        "SELECT iata_code, name, city, timezone FROM airports WHERE id=?", (d['departure_airport_id'],)
    ).fetchone()
    arr_ap = db.execute(
        "SELECT iata_code, name, city, timezone FROM airports WHERE id=?", (d['arrival_airport_id'],)
    ).fetchone()
    fares = flight_repo.list_fares_for_flight(db, d['id'])
    d['airline'] = dict(airline) if airline else None
    d['departure_airport'] = dict(dep_ap) if dep_ap else None
    d['arrival_airport'] = dict(arr_ap) if arr_ap else None
    d['fares'] = [dict(fa) for fa in fares]
    d['cheapest_fare'] = dict(fares[0]) if fares else None
    return d


def get_flight_segments(flight_id: str) -> list:
    db = get_db()
    f = flight_repo.find_flight(db, flight_id)
    if not f:
        raise NotFoundError('Flight')
    segs = flight_repo.get_flight_segments(db, flight_id)
    return [dict(s) for s in segs] if segs else [dict(f)]


def get_fare(fare_id: str) -> dict:
    db = get_db()
    fare = flight_repo.find_fare(db, fare_id)
    if not fare:
        raise NotFoundError('Fare')
    return dict(fare)


def get_fare_rules(fare_id: str) -> list:
    db = get_db()
    rules = flight_repo.get_fare_rules(db, fare_id)
    if not rules:
        fare = flight_repo.find_fare_basic(db, fare_id)
        if not fare:
            raise NotFoundError('Fare')
        return [
            {'rule_type': 'CANCELLATION',
             'description': f'Cancellation fee: {fare["cancel_fee"]:,} VND' if fare['cancel_fee'] else 'Non-refundable'},
            {'rule_type': 'CHANGE',
             'description': f'Change fee: {fare["change_fee"]:,} VND' if fare['is_changeable'] else 'Not changeable'},
        ]
    return [dict(r) for r in rules]


def get_fare_baggage(fare_id: str) -> dict:
    db = get_db()
    fare = flight_repo.find_fare_basic(db, fare_id)
    if not fare:
        raise NotFoundError('Fare')
    return {
        'checked_baggage_kg': fare['baggage_kg'],
        'carry_on_kg': fare['carry_on_kg'],
        'extra_baggage_available': True,
    }


def get_saved_flights(user_id: str) -> list:
    db = get_db()
    from repositories import user_repo as ur
    rows = ur.list_saved_flights(db, user_id)
    return [dict(r) for r in rows]


def save_flight(user_id: str, flight_id: str, fare_id: str | None) -> dict:
    db = get_db()
    from repositories import user_repo as ur
    f = flight_repo.find_flight(db, flight_id)
    if not f:
        raise NotFoundError('Flight')
    existing = ur.find_saved_flight_by_flight(db, user_id, flight_id)
    if existing:
        db.commit()
        return {'id': existing['id']}
    sid = str(uuid.uuid4())
    ur.create_saved_flight(db, sid, user_id, flight_id, fare_id)
    db.commit()
    return {'id': sid}


def unsave_flight(user_id: str, saved_id: str) -> None:
    db = get_db()
    from repositories import user_repo as ur
    row = ur.find_saved_flight(db, saved_id, user_id)
    if not row:
        raise NotFoundError('Saved flight')
    ur.delete_saved_flight(db, saved_id)
    db.commit()
