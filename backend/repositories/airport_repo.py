import uuid
from utils.date_utils import utcnow_iso
from utils.text_utils import normalize_search_text


# ── Airports ──────────────────────────────────────────────────────────────────

def _airport_search_score(airport, query):
    normalized_query = normalize_search_text(query)
    compact_query = normalized_query.replace(' ', '')
    if not compact_query:
        return 0

    iata = normalize_search_text(airport.get('iata_code'))
    city = normalize_search_text(airport.get('city'))
    name = normalize_search_text(airport.get('name'))
    country = normalize_search_text(airport.get('country'))
    icao = normalize_search_text(airport.get('icao_code'))
    compact_city = city.replace(' ', '')
    compact_name = name.replace(' ', '')

    if compact_query == iata or compact_query == icao:
        return 0
    if compact_query == compact_city:
        return 1
    if city.startswith(normalized_query) or compact_city.startswith(compact_query):
        return 2
    if any(word.startswith(normalized_query) for word in city.split()):
        return 3
    if normalized_query in city or compact_query in compact_city:
        return 4
    if normalized_query in name or compact_query in compact_name:
        return 5
    if normalized_query in country.replace(' ', '') or normalized_query in country:
        return 6
    return None


def list_airports(db, q=''):
    rows = db.execute("SELECT * FROM airports ORDER BY city").fetchall()
    if not q or not normalize_search_text(q):
        return rows

    matches = []
    for row in rows:
        score = _airport_search_score(row, q)
        if score is not None:
            matches.append((score, normalize_search_text(row.get('city')), row))
    return [row for _, _, row in sorted(matches, key=lambda match: (match[0], match[1]))]


def autocomplete_airports(db, q, limit=10):
    return list_airports(db, q)[:limit]


def find_airport(db, id_or_iata):
    return db.execute(
        "SELECT * FROM airports WHERE id=? OR iata_code=?",
        (id_or_iata, id_or_iata.upper())
    ).fetchone()


def find_airport_by_iata(db, iata):
    return db.execute(
        "SELECT * FROM airports WHERE iata_code=?", (iata.upper(),)
    ).fetchone()


def all_airports(db):
    return db.execute("SELECT * FROM airports").fetchall()


def create_airport(db, aid, data: dict):
    now = utcnow_iso()
    db.execute(
        "INSERT INTO airports(id,iata_code,icao_code,name,city,country,country_code,timezone,"
        "latitude,longitude,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)",
        (aid, data['iata_code'].upper(), data.get('icao_code'), data['name'], data['city'],
         data['country'], data['country_code'].upper(), data['timezone'],
         data.get('latitude'), data.get('longitude'), now, now)
    )


def update_airport(db, airport_id, updates: dict):
    now = utcnow_iso()
    updates = dict(updates)
    updates['updated_at'] = now
    set_clause = ', '.join(f'{k}=?' for k in updates)
    db.execute(f"UPDATE airports SET {set_clause} WHERE id=?", (*updates.values(), airport_id))


def delete_airport(db, airport_id):
    db.execute("DELETE FROM airports WHERE id=?", (airport_id,))


# ── Airlines ──────────────────────────────────────────────────────────────────

def list_airlines(db):
    return db.execute("SELECT * FROM airlines ORDER BY name").fetchall()


def find_airline(db, id_or_iata):
    return db.execute(
        "SELECT * FROM airlines WHERE id=? OR iata_code=?",
        (id_or_iata, id_or_iata.upper())
    ).fetchone()


def create_airline(db, alid, data: dict):
    now = utcnow_iso()
    db.execute(
        "INSERT INTO airlines(id,iata_code,icao_code,name,country,logo_url,created_at,updated_at) "
        "VALUES(?,?,?,?,?,?,?,?)",
        (alid, data['iata_code'].upper(), data.get('icao_code'), data['name'],
         data.get('country'), data.get('logo_url'), now, now)
    )


def update_airline(db, airline_id, updates: dict):
    now = utcnow_iso()
    updates = dict(updates)
    updates['updated_at'] = now
    set_clause = ', '.join(f'{k}=?' for k in updates)
    db.execute(f"UPDATE airlines SET {set_clause} WHERE id=?", (*updates.values(), airline_id))


def delete_airline(db, airline_id):
    db.execute("DELETE FROM airlines WHERE id=?", (airline_id,))


# ── Aircraft types ────────────────────────────────────────────────────────────

def list_aircraft_types(db):
    return db.execute("SELECT * FROM aircraft_types ORDER BY name").fetchall()


def create_aircraft_type(db, atid, data: dict):
    now = utcnow_iso()
    db.execute(
        "INSERT INTO aircraft_types(id,iata_code,name,manufacturer,seat_capacity,created_at,updated_at) "
        "VALUES(?,?,?,?,?,?,?)",
        (atid, data['iata_code'], data['name'], data.get('manufacturer'), data.get('seat_capacity'), now, now)
    )


def update_aircraft_type(db, at_id, updates: dict):
    now = utcnow_iso()
    updates = dict(updates)
    updates['updated_at'] = now
    set_clause = ', '.join(f'{k}=?' for k in updates)
    db.execute(f"UPDATE aircraft_types SET {set_clause} WHERE id=?", (*updates.values(), at_id))


def delete_aircraft_type(db, at_id):
    db.execute("DELETE FROM aircraft_types WHERE id=?", (at_id,))


# ── Cabin classes ─────────────────────────────────────────────────────────────

def list_cabin_classes(db):
    return db.execute("SELECT * FROM cabin_classes ORDER BY id").fetchall()
