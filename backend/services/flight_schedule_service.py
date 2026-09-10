"""Keeps the flight schedule populated for a rolling window of future dates.

The demo schedule is a fixed set of daily routes (same flight number, airline,
aircraft and time every day). `ensure_schedule_range` makes sure every route in
DAILY_FLIGHT_TEMPLATE has a flight row for every date in [start_date, end_date],
creating whatever is missing (flight, fares, fare inventory, seats, seat map).
It is safe to call repeatedly — dates that already have their flights are left
untouched, so this both seeds fresh data and tops up an existing schedule
before it runs out.

Used by:
- `database/seed.py`, once, for the initial demo window.
- `services/background_jobs.py`'s `extend_flight_schedule` job, continuously,
  so production never runs out of future flights to search (see FIX.ipynb #15/#16).
"""
import uuid
import datetime
import json


def _uid() -> str:
    return str(uuid.uuid4())


def _now_iso() -> str:
    return datetime.datetime.utcnow().isoformat()


# (flight_number, airline_iata, aircraft_code, dep_iata, arr_iata, dep_hour, dep_min, duration_min)
DAILY_FLIGHT_TEMPLATE = [
    ('VN100', 'VN', '321', 'SGN', 'HAN', 6, 0, 130),
    ('VN101', 'VN', '321', 'HAN', 'SGN', 9, 0, 130),
    ('VN200', 'VN', '789', 'SGN', 'HAN', 14, 0, 130),
    ('VN201', 'VN', '789', 'HAN', 'SGN', 17, 30, 130),
    ('VJ300', 'VJ', '321', 'SGN', 'DAD', 7, 0, 75),
    ('VJ301', 'VJ', '321', 'DAD', 'SGN', 10, 30, 75),
    ('VJ400', 'VJ', '32N', 'HAN', 'DAD', 8, 0, 75),
    ('VJ401', 'VJ', '32N', 'DAD', 'HAN', 11, 30, 75),
    ('QH500', 'QH', '738', 'SGN', 'PQC', 9, 0, 60),
    ('QH501', 'QH', '738', 'PQC', 'SGN', 11, 30, 60),
    ('VN600', 'VN', '789', 'SGN', 'BKK', 7, 30, 90),
    ('VN601', 'VN', '789', 'BKK', 'SGN', 10, 30, 90),
    ('SQ700', 'SQ', '789', 'SGN', 'SIN', 10, 0, 115),
    ('SQ701', 'SQ', '789', 'SIN', 'SGN', 14, 0, 115),
    ('NH800', 'NH', '77W', 'SGN', 'NRT', 0, 30, 360),
    ('NH801', 'NH', '77W', 'NRT', 'SGN', 11, 0, 360),
    ('VN110', 'VN', '738', 'HAN', 'DAD', 6, 30, 85),
    ('VN111', 'VN', '738', 'DAD', 'HAN', 9, 30, 85),
    ('QH520', 'QH', '321', 'HAN', 'PQC', 8, 0, 140),
    ('QH521', 'QH', '321', 'PQC', 'HAN', 11, 30, 140),
    ('VJ320', 'VJ', '32N', 'SGN', 'HPH', 6, 45, 115),
    ('VJ321', 'VJ', '32N', 'HPH', 'SGN', 10, 0, 115),
    ('QH530', 'QH', '738', 'DAD', 'PQC', 13, 0, 90),
    ('QH531', 'QH', '738', 'PQC', 'DAD', 15, 30, 90),
    ('TG900', 'TG', '77W', 'HAN', 'BKK', 9, 0, 120),
    ('TG901', 'TG', '77W', 'BKK', 'HAN', 12, 0, 120),
    ('VN610', 'VN', '789', 'HAN', 'SIN', 8, 0, 220),
    ('VN611', 'VN', '789', 'SIN', 'HAN', 12, 30, 220),
]

# (fare_code, fare_name, base_price, baggage_kg, refundable, changeable, change_fee, cancel_fee)
FARE_TEMPLATE = [
    ('ECO_LITE', 'Economy Lite',  1200000, 0,  0, 0, 0, 0),
    ('ECO_FLEX', 'Economy Flex',  1800000, 20, 1, 1, 300000, 150000),
    ('BUS_FULL', 'Business Full', 4500000, 30, 1, 1, 0, 0),
]

SEAT_ROWS = range(1, 31)  # rows 1-4 business, 5-30 economy


def _lookup_ids(db, table: str, code_column: str, codes: set) -> dict:
    ids = {}
    for code in codes:
        row = db.execute(f"SELECT id FROM {table} WHERE {code_column}=?", (code,)).fetchone()
        if row:
            ids[code] = row['id']
    return ids


def _create_fares_and_seats(db, flight_id: str, cabin_ids: dict) -> None:
    n = _now_iso()
    for fare_code, fare_name, base_price, baggage, refundable, changeable, change_fee, cancel_fee in FARE_TEMPLATE:
        cabin = 'BUSINESS' if 'BUS' in fare_code else 'ECONOMY'
        fare_id = _uid()
        db.execute(
            "INSERT INTO fares(id,flight_id,cabin_class_id,fare_code,fare_name,base_price,tax,fees,"
            "currency,baggage_kg,is_refundable,is_changeable,change_fee,cancel_fee,created_at,updated_at) "
            "VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            (fare_id, flight_id, cabin_ids[cabin], fare_code, fare_name, base_price,
             int(base_price * 0.1), 50000, 'VND', baggage, refundable, changeable,
             change_fee, cancel_fee, n, n)
        )
        total = 80 if cabin == 'ECONOMY' else 20
        available = total - (5 if fare_code == 'ECO_LITE' else 0)
        db.execute(
            "INSERT INTO fare_inventories(id,fare_id,total_seats,available_seats,updated_at) VALUES(?,?,?,?,?)",
            (_uid(), fare_id, total, available, n)
        )

    for row_num in SEAT_ROWS:
        if row_num <= 4:
            columns, cabin = ['A', 'C', 'D', 'F'], 'BUSINESS'
        else:
            columns, cabin = ['A', 'B', 'C', 'D', 'E', 'F'], 'ECONOMY'
        for col in columns:
            seat_type = 'EXIT' if row_num in (15, 16) else ('WINDOW' if col in ('A', 'F') else ('AISLE' if col in ('C', 'D') else 'STANDARD'))
            extra_fee = 100000 if seat_type in ('EXIT', 'WINDOW') else 0
            db.execute(
                "INSERT INTO seats(id,flight_id,seat_number,cabin_class_id,seat_row,column_label,"
                "seat_type,status,extra_fee,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)",
                (_uid(), flight_id, f"{row_num}{col}", cabin_ids[cabin], row_num, col,
                 seat_type, 'AVAILABLE', extra_fee, n, n)
            )

    layout = {'business': {'rows': [1, 4], 'columns': ['A', 'C', 'D', 'F']},
              'economy': {'rows': [5, 30], 'columns': ['A', 'B', 'C', 'D', 'E', 'F']}}
    db.execute(
        "INSERT INTO seat_maps(id,flight_id,layout_json,created_at,updated_at) VALUES(?,?,?,?,?)",
        (_uid(), flight_id, json.dumps(layout), n, n)
    )


def ensure_schedule_range(db, start_date: datetime.date, end_date: datetime.date) -> int:
    """Make sure every DAILY_FLIGHT_TEMPLATE route has a flight for every date in
    [start_date, end_date] (inclusive). Returns how many flights were created."""
    airline_ids = _lookup_ids(db, 'airlines', 'iata_code', {t[1] for t in DAILY_FLIGHT_TEMPLATE})
    aircraft_ids = _lookup_ids(db, 'aircraft_types', 'iata_code', {t[2] for t in DAILY_FLIGHT_TEMPLATE})
    airport_ids = _lookup_ids(db, 'airports', 'iata_code', {t[3] for t in DAILY_FLIGHT_TEMPLATE} | {t[4] for t in DAILY_FLIGHT_TEMPLATE})
    cabin_ids = _lookup_ids(db, 'cabin_classes', 'code', {'ECONOMY', 'BUSINESS'})

    created = 0
    day_count = (end_date - start_date).days + 1
    for day_offset in range(day_count):
        target_date = start_date + datetime.timedelta(days=day_offset)
        for flight_no, airline_iata, aircraft_code, dep_iata, arr_iata, hour, minute, duration in DAILY_FLIGHT_TEMPLATE:
            dep_dt = datetime.datetime(target_date.year, target_date.month, target_date.day, hour, minute)
            existing = db.execute(
                "SELECT id FROM flights WHERE flight_number=? AND departure_time=?",
                (flight_no, dep_dt.isoformat())
            ).fetchone()
            if existing:
                continue
            arr_dt = dep_dt + datetime.timedelta(minutes=duration)
            flight_id = _uid()
            n = _now_iso()
            db.execute(
                "INSERT INTO flights(id,flight_number,airline_id,aircraft_type_id,departure_airport_id,"
                "arrival_airport_id,departure_time,arrival_time,duration_minutes,status,created_at,updated_at) "
                "VALUES(?,?,?,?,?,?,?,?,?,?,?,?)",
                (flight_id, flight_no, airline_ids[airline_iata], aircraft_ids.get(aircraft_code),
                 airport_ids[dep_iata], airport_ids[arr_iata], dep_dt.isoformat(), arr_dt.isoformat(),
                 duration, 'SCHEDULED', n, n)
            )
            _create_fares_and_seats(db, flight_id, cabin_ids)
            created += 1
        db.commit()
    return created
