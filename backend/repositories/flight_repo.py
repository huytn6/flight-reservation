import json
import uuid
import datetime
from utils.date_utils import utcnow_iso


# ── Flights ───────────────────────────────────────────────────────────────────

def find_flight(db, flight_id):
    return db.execute("SELECT * FROM flights WHERE id=?", (flight_id,)).fetchone()


def search_flights(db, dep_airport_id, arr_airport_id, date):
    return db.execute(
        """SELECT f.*, al.iata_code as airline_code, al.name as airline_name, al.logo_url
           FROM flights f JOIN airlines al ON al.id=f.airline_id
           WHERE f.departure_airport_id=? AND f.arrival_airport_id=?
             AND DATE(f.departure_time)=? AND f.status!='CANCELLED'
           ORDER BY f.departure_time""",
        (dep_airport_id, arr_airport_id, date)
    ).fetchall()


def search_flight_status(db, query: str, limit: int = 20):
    """Public flight-status lookup: by flight number, city, or airline name.
    With no query, returns the soonest upcoming flights."""
    base = (
        "SELECT f.*, al.name as airline_name, al.iata_code as airline_code, "
        "dep.city as departure_city, dep.iata_code as departure_iata, "
        "arr.city as arrival_city, arr.iata_code as arrival_iata "
        "FROM flights f "
        "JOIN airlines al ON al.id=f.airline_id "
        "JOIN airports dep ON dep.id=f.departure_airport_id "
        "JOIN airports arr ON arr.id=f.arrival_airport_id "
    )
    if query:
        like = f'%{query}%'
        return db.execute(
            base + "WHERE f.flight_number LIKE ? OR dep.city LIKE ? OR arr.city LIKE ? OR al.name LIKE ? "
            "ORDER BY f.departure_time LIMIT ?",
            (like, like, like, like, limit)
        ).fetchall()
    # departure_time is stored as "YYYY-MM-DD HH:MM:SS" (space-separated, no 'T'/microseconds) —
    # match that exact format so the string comparison below sorts correctly.
    now_str = datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
    return db.execute(
        base + "WHERE f.departure_time >= ? ORDER BY f.departure_time LIMIT ?",
        (now_str, limit)
    ).fetchall()


_LIST_FLIGHTS_ADMIN_SELECT = (
    "SELECT f.*, al.name as airline_name, al.iata_code as airline_code, "
    "dep.iata_code as departure_iata, dep.city as departure_city, dep.name as departure_airport_name, "
    "arr.iata_code as arrival_iata, arr.city as arrival_city, arr.name as arrival_airport_name, "
    "ac.name as aircraft_type_name, ac.iata_code as aircraft_code, ac.seat_capacity as capacity "
    "FROM flights f "
    "JOIN airlines al ON al.id=f.airline_id "
    "JOIN airports dep ON dep.id=f.departure_airport_id "
    "JOIN airports arr ON arr.id=f.arrival_airport_id "
    "LEFT JOIN aircraft_types ac ON ac.id=f.aircraft_type_id "
)


def list_flights_admin(db, date_filter=''):
    if date_filter:
        return db.execute(
            _LIST_FLIGHTS_ADMIN_SELECT + "WHERE DATE(f.departure_time)=? ORDER BY f.departure_time DESC",
            (date_filter,)
        ).fetchall()
    return db.execute(
        _LIST_FLIGHTS_ADMIN_SELECT + "ORDER BY f.departure_time DESC"
    ).fetchall()


def create_flight(db, fid, data: dict):
    now = utcnow_iso()
    db.execute(
        "INSERT INTO flights(id,flight_number,airline_id,aircraft_type_id,departure_airport_id,"
        "arrival_airport_id,departure_time,arrival_time,duration_minutes,status,created_at,updated_at) "
        "VALUES(?,?,?,?,?,?,?,?,?,?,?,?)",
        (fid, data['flight_number'], data['airline_id'], data.get('aircraft_type_id'),
         data['departure_airport_id'], data['arrival_airport_id'],
         data['departure_time'], data['arrival_time'], int(data['duration_minutes']),
         data.get('status', 'SCHEDULED'), now, now)
    )


def update_flight(db, flight_id, updates: dict):
    now = utcnow_iso()
    updates = dict(updates)
    updates['updated_at'] = now
    set_clause = ', '.join(f'{k}=?' for k in updates)
    db.execute(f"UPDATE flights SET {set_clause} WHERE id=?", (*updates.values(), flight_id))


def cancel_flight(db, flight_id):
    now = utcnow_iso()
    db.execute("UPDATE flights SET status='CANCELLED', updated_at=? WHERE id=?", (now, flight_id))


def update_flight_status(db, flight_id, status):
    now = utcnow_iso()
    db.execute("UPDATE flights SET status=?, updated_at=? WHERE id=?", (status, now, flight_id))


def get_flight_segments(db, flight_id):
    return db.execute(
        "SELECT * FROM flight_segments WHERE flight_id=? ORDER BY segment_order", (flight_id,)
    ).fetchall()


# ── Fares ─────────────────────────────────────────────────────────────────────

def find_fare(db, fare_id):
    return db.execute(
        """SELECT fa.*, fi.available_seats, cc.code as cabin_code, cc.name as cabin_name
           FROM fares fa
           JOIN fare_inventories fi ON fi.fare_id=fa.id
           JOIN cabin_classes cc ON cc.id=fa.cabin_class_id
           WHERE fa.id=?""",
        (fare_id,)
    ).fetchone()


def find_fare_with_flight(db, fare_id, flight_id):
    return db.execute(
        """SELECT fa.*, fi.available_seats FROM fares fa
           JOIN fare_inventories fi ON fi.fare_id=fa.id
           WHERE fa.id=? AND fa.flight_id=?""",
        (fare_id, flight_id)
    ).fetchone()


def find_fare_basic(db, fare_id):
    return db.execute("SELECT * FROM fares WHERE id=?", (fare_id,)).fetchone()


def list_fares_for_flight(db, flight_id, cabin_code=None, refundable=None, min_price=None, max_price=None):
    query = (
        "SELECT fa.*, fi.available_seats, cc.code as cabin_code "
        "FROM fares fa "
        "JOIN fare_inventories fi ON fi.fare_id=fa.id "
        "JOIN cabin_classes cc ON cc.id=fa.cabin_class_id "
        "WHERE fa.flight_id=? AND fi.available_seats>0"
    )
    params = [flight_id]
    if cabin_code:
        query += " AND cc.code=?"
        params.append(cabin_code)
    if refundable:
        query += " AND fa.is_refundable=1"
    if min_price:
        query += " AND (fa.base_price + fa.tax + fa.fees) >= ?"
        params.append(int(min_price))
    if max_price:
        query += " AND (fa.base_price + fa.tax + fa.fees) <= ?"
        params.append(int(max_price))
    query += " ORDER BY fa.base_price"
    return db.execute(query, params).fetchall()


def list_fares_admin(db, flight_id):
    return db.execute(
        "SELECT fa.*, fi.available_seats, fi.total_seats FROM fares fa "
        "JOIN fare_inventories fi ON fi.fare_id=fa.id WHERE fa.flight_id=?",
        (flight_id,)
    ).fetchall()


def get_fare_rules(db, fare_id):
    return db.execute("SELECT * FROM fare_rules WHERE fare_id=?", (fare_id,)).fetchall()


def create_fare(db, farid, flight_id, data: dict):
    now = utcnow_iso()
    db.execute(
        "INSERT INTO fares(id,flight_id,cabin_class_id,fare_code,fare_name,base_price,tax,fees,"
        "currency,baggage_kg,carry_on_kg,is_refundable,is_changeable,change_fee,cancel_fee,created_at,updated_at) "
        "VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
        (farid, flight_id, data['cabin_class_id'], data['fare_code'], data['fare_name'],
         int(data['base_price']), int(data.get('tax', 0)), int(data.get('fees', 0)),
         data.get('currency', 'VND'), int(data.get('baggage_kg', 0)),
         int(data.get('carry_on_kg', 7)),
         1 if data.get('is_refundable') else 0, 1 if data.get('is_changeable') else 0,
         int(data.get('change_fee', 0)), int(data.get('cancel_fee', 0)), now, now)
    )


def update_fare(db, fare_id, updates: dict, available_seats=None):
    now = utcnow_iso()
    updates = dict(updates)
    updates['updated_at'] = now
    set_clause = ', '.join(f'{k}=?' for k in updates)
    db.execute(f"UPDATE fares SET {set_clause} WHERE id=?", (*updates.values(), fare_id))
    if available_seats is not None:
        db.execute(
            "UPDATE fare_inventories SET available_seats=?, updated_at=? WHERE fare_id=?",
            (int(available_seats), now, fare_id)
        )


def delete_fare(db, fare_id):
    db.execute("DELETE FROM fares WHERE id=?", (fare_id,))


# ── Fare inventory ────────────────────────────────────────────────────────────

def create_fare_inventory(db, inv_id, fare_id, total_seats):
    now = utcnow_iso()
    db.execute(
        "INSERT INTO fare_inventories(id,fare_id,total_seats,available_seats,updated_at) VALUES(?,?,?,?,?)",
        (inv_id, fare_id, total_seats, total_seats, now)
    )


def reduce_fare_inventory(db, fare_id, count):
    now = utcnow_iso()
    db.execute(
        "UPDATE fare_inventories SET available_seats=GREATEST(0,available_seats-?), updated_at=? WHERE fare_id=?",
        (count, now, fare_id)
    )


# ── Seat maps & Seats ─────────────────────────────────────────────────────────

def get_seat_map(db, flight_id):
    return db.execute("SELECT * FROM seat_maps WHERE flight_id=?", (flight_id,)).fetchone()


def upsert_seat_map(db, flight_id, layout_json):
    now = utcnow_iso()
    existing = db.execute("SELECT id FROM seat_maps WHERE flight_id=?", (flight_id,)).fetchone()
    if existing:
        db.execute(
            "UPDATE seat_maps SET layout_json=?, updated_at=? WHERE flight_id=?",
            (layout_json, now, flight_id)
        )
    else:
        db.execute(
            "INSERT INTO seat_maps(id,flight_id,layout_json,created_at,updated_at) VALUES(?,?,?,?,?)",
            (str(uuid.uuid4()), flight_id, layout_json, now, now)
        )


def list_seats(db, flight_id):
    return db.execute(
        "SELECT * FROM seats WHERE flight_id=? ORDER BY seat_row, column_label", (flight_id,)
    ).fetchall()


def find_seat(db, seat_id):
    return db.execute("SELECT * FROM seats WHERE id=?", (seat_id,)).fetchone()


def find_seat_for_update(db, seat_id):
    """Locks the seat row for the duration of the caller's transaction so two
    concurrent seat-hold requests for the same seat serialize instead of deadlocking."""
    return db.execute("SELECT * FROM seats WHERE id=? FOR UPDATE", (seat_id,)).fetchone()


def update_seat_status(db, seat_id, status):
    now = utcnow_iso()
    db.execute("UPDATE seats SET status=?, updated_at=? WHERE id=?", (status, now, seat_id))


def update_seat(db, seat_id, flight_id, updates: dict):
    now = utcnow_iso()
    updates = dict(updates)
    updates['updated_at'] = now
    set_clause = ', '.join(f'{k}=?' for k in updates)
    db.execute(
        f"UPDATE seats SET {set_clause} WHERE id=? AND flight_id=?",
        (*updates.values(), seat_id, flight_id)
    )


# ── Price queries ─────────────────────────────────────────────────────────────

def get_min_price_for_date(db, dep_id, arr_id, date):
    return db.execute(
        """SELECT MIN(fa.base_price + fa.tax + fa.fees) as min_price
           FROM flights f
           JOIN fares fa ON fa.flight_id=f.id
           JOIN fare_inventories fi ON fi.fare_id=fa.id
           WHERE f.departure_airport_id=? AND f.arrival_airport_id=?
             AND DATE(f.departure_time)=? AND fi.available_seats>0""",
        (dep_id, arr_id, date)
    ).fetchone()


def get_price_calendar(db, dep_id, arr_id, year_month):
    return db.execute(
        """SELECT DATE(f.departure_time) as dep_date, MIN(fa.base_price + fa.tax + fa.fees) as min_price
           FROM flights f
           JOIN fares fa ON fa.flight_id=f.id
           JOIN fare_inventories fi ON fi.fare_id=fa.id
           WHERE f.departure_airport_id=? AND f.arrival_airport_id=?
             AND DATE_FORMAT(f.departure_time, '%Y-%m')=?
             AND fi.available_seats>0
           GROUP BY dep_date
           ORDER BY dep_date""",
        (dep_id, arr_id, year_month)
    ).fetchall()
