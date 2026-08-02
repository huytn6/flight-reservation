from core.router import route
from core import response, request as req
from database.connection import get_db
from utils.pagination import paginate


@route('GET', '/airports')
def list_airports(handler):
    db = get_db()
    q = req.get_query_param(handler, 'q', '')
    page, size = req.get_pagination(handler, 20, 200)
    if q:
        rows = db.execute(
            "SELECT * FROM airports WHERE iata_code LIKE ? OR name LIKE ? OR city LIKE ? ORDER BY city",
            (f'%{q}%', f'%{q}%', f'%{q}%')
        ).fetchall()
    else:
        rows = db.execute("SELECT * FROM airports ORDER BY city").fetchall()
    result = paginate([dict(r) for r in rows], page, size)
    response.success(handler, result)


@route('GET', '/airports/autocomplete')
def autocomplete_airports(handler):
    db = get_db()
    q = req.get_query_param(handler, 'q', '')
    if len(q) < 1:
        response.success(handler, [])
        return
    rows = db.execute(
        """SELECT iata_code, name, city, country, country_code, timezone
           FROM airports
           WHERE iata_code LIKE ? OR name LIKE ? OR city LIKE ?
           ORDER BY city LIMIT 10""",
        (f'{q}%', f'%{q}%', f'%{q}%')
    ).fetchall()
    response.success(handler, [dict(r) for r in rows])


@route('GET', '/airports/nearby')
def nearby_airports(handler):
    db = get_db()
    try:
        lat = float(req.get_query_param(handler, 'lat', '0'))
        lng = float(req.get_query_param(handler, 'lng', '0'))
    except ValueError:
        from core.exceptions import ValidationError
        raise ValidationError('lat and lng must be numbers')

    rows = db.execute("SELECT * FROM airports").fetchall()
    # Simple distance calculation (Euclidean for demo)
    def dist(r):
        if r['latitude'] is None or r['longitude'] is None:
            return 9999
        return ((r['latitude'] - lat) ** 2 + (r['longitude'] - lng) ** 2) ** 0.5

    sorted_airports = sorted([dict(r) for r in rows], key=dist)[:5]
    response.success(handler, sorted_airports)


@route('GET', '/airports/{airport_id}')
def get_airport(handler, airport_id):
    db = get_db()
    row = db.execute(
        "SELECT * FROM airports WHERE id=? OR iata_code=?",
        (airport_id, airport_id.upper())
    ).fetchone()
    if not row:
        from core.exceptions import NotFoundError
        raise NotFoundError('Airport')
    response.success(handler, dict(row))


@route('GET', '/airlines')
def list_airlines(handler):
    db = get_db()
    rows = db.execute("SELECT * FROM airlines ORDER BY name").fetchall()
    response.success(handler, [dict(r) for r in rows])


@route('GET', '/airlines/{airline_id}')
def get_airline(handler, airline_id):
    db = get_db()
    row = db.execute(
        "SELECT * FROM airlines WHERE id=? OR iata_code=?",
        (airline_id, airline_id.upper())
    ).fetchone()
    if not row:
        from core.exceptions import NotFoundError
        raise NotFoundError('Airline')
    response.success(handler, dict(row))


@route('GET', '/cabin-classes')
def list_cabin_classes(handler):
    db = get_db()
    rows = db.execute("SELECT * FROM cabin_classes ORDER BY id").fetchall()
    response.success(handler, [dict(r) for r in rows])


@route('GET', '/config/countries')
def list_countries(handler):
    countries = [
        {'code': 'VN', 'name': 'Vietnam'},
        {'code': 'TH', 'name': 'Thailand'},
        {'code': 'SG', 'name': 'Singapore'},
        {'code': 'JP', 'name': 'Japan'},
        {'code': 'US', 'name': 'United States'},
        {'code': 'GB', 'name': 'United Kingdom'},
        {'code': 'FR', 'name': 'France'},
        {'code': 'DE', 'name': 'Germany'},
        {'code': 'AU', 'name': 'Australia'},
        {'code': 'KR', 'name': 'South Korea'},
    ]
    response.success(handler, countries)


@route('GET', '/config/currencies')
def list_currencies(handler):
    currencies = [
        {'code': 'VND', 'name': 'Vietnamese Dong', 'symbol': '₫'},
        {'code': 'USD', 'name': 'US Dollar', 'symbol': '$'},
        {'code': 'SGD', 'name': 'Singapore Dollar', 'symbol': 'S$'},
    ]
    response.success(handler, currencies)


@route('GET', '/config/payment-methods')
def list_payment_methods(handler):
    methods = [
        {'code': 'CARD', 'name': 'Credit / Debit Card', 'description': 'Simulated card payment'},
        {'code': 'MOMO', 'name': 'MoMo Wallet', 'description': 'Simulated MoMo payment'},
        {'code': 'BANK_TRANSFER', 'name': 'Bank Transfer', 'description': 'Simulated bank transfer'},
    ]
    response.success(handler, methods)
