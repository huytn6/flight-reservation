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
    ('QH100', 'QH', '738', 'SGN', 'HAN', 10, 0, 130),
    ('QH101', 'QH', '738', 'HAN', 'SGN', 13, 0, 130),
    ('VN200', 'VN', '789', 'SGN', 'HAN', 14, 0, 130),
    ('VN201', 'VN', '789', 'HAN', 'SGN', 17, 30, 130),
    ('VJ100', 'VJ', '321', 'SGN', 'HAN', 19, 0, 130),
    ('VJ101', 'VJ', '321', 'HAN', 'SGN', 21, 0, 130),
    ('VJ300', 'VJ', '321', 'SGN', 'DAD', 7, 0, 75),
    ('VJ301', 'VJ', '321', 'DAD', 'SGN', 10, 30, 75),
    ('VJ302', 'VJ', '32N', 'SGN', 'DAD', 13, 0, 75),
    ('VJ303', 'VJ', '32N', 'DAD', 'SGN', 16, 0, 75),
    ('VJ400', 'VJ', '32N', 'HAN', 'DAD', 8, 0, 75),
    ('VJ401', 'VJ', '32N', 'DAD', 'HAN', 11, 30, 75),
    ('VN120', 'VN', '738', 'HAN', 'DAD', 14, 0, 85),
    ('VN121', 'VN', '738', 'DAD', 'HAN', 17, 0, 85),
    ('QH500', 'QH', '738', 'SGN', 'PQC', 9, 0, 60),
    ('QH501', 'QH', '738', 'PQC', 'SGN', 11, 30, 60),
    ('QH540', 'QH', '321', 'SGN', 'PQC', 15, 0, 60),
    ('QH541', 'QH', '321', 'PQC', 'SGN', 17, 0, 60),
    ('VN600', 'VN', '789', 'SGN', 'BKK', 7, 30, 90),
    ('VN601', 'VN', '789', 'BKK', 'SGN', 10, 30, 90),
    ('TG910', 'TG', '77W', 'SGN', 'BKK', 13, 0, 90),
    ('TG911', 'TG', '77W', 'BKK', 'SGN', 16, 0, 90),
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

# Higher-frequency domestic profiles used by the V6 realistic Vietnam demo
# schedule. Each row is:
# (airline, aircraft, origin, destination, flight-number base, frequency,
#  first departure minute, spacing minutes, duration minutes)
#
# Times and flight numbers are synthetic. Routes, carriers and relative
# frequencies are modelled after Vietnam's hub-and-tourism travel patterns.
ADDITIONAL_DAILY_FLIGHT_PROFILES = [
    ('VN', '321', 'SGN', 'HAN', 1200, 4, 300, 240, 130),
    ('VN', '321', 'HAN', 'SGN', 1210, 4, 360, 240, 130),
    ('VJ', '32N', 'SGN', 'HAN', 1500, 4, 390, 240, 130),
    ('VJ', '32N', 'HAN', 'SGN', 1510, 4, 450, 240, 130),
    ('BL', '320', 'SGN', 'HAN', 600, 2, 480, 480, 130),
    ('BL', '320', 'HAN', 'SGN', 610, 2, 540, 480, 130),
    ('VU', '321', 'SGN', 'HAN', 300, 1, 750, 0, 130),
    ('VU', '321', 'HAN', 'SGN', 310, 1, 825, 0, 130),

    ('VN', '321', 'SGN', 'DAD', 1300, 3, 360, 300, 75),
    ('VN', '321', 'DAD', 'SGN', 1310, 3, 480, 300, 75),
    ('VJ', '32N', 'SGN', 'DAD', 1600, 3, 450, 300, 75),
    ('VJ', '32N', 'DAD', 'SGN', 1610, 3, 570, 300, 75),
    ('BL', '320', 'SGN', 'DAD', 700, 1, 840, 0, 75),
    ('BL', '320', 'DAD', 'SGN', 710, 1, 960, 0, 75),
    ('VU', '321', 'SGN', 'DAD', 400, 1, 1110, 0, 75),
    ('VU', '321', 'DAD', 'SGN', 410, 1, 1230, 0, 75),

    ('VN', '321', 'HAN', 'DAD', 1400, 2, 420, 480, 85),
    ('VN', '321', 'DAD', 'HAN', 1410, 2, 540, 480, 85),
    ('VJ', '32N', 'HAN', 'DAD', 1700, 2, 600, 480, 85),
    ('VJ', '32N', 'DAD', 'HAN', 1710, 2, 720, 480, 85),
    ('BL', '320', 'HAN', 'DAD', 800, 1, 780, 0, 85),
    ('BL', '320', 'DAD', 'HAN', 810, 1, 900, 0, 85),

    ('VN', '321', 'SGN', 'CXR', 1500, 2, 390, 480, 65),
    ('VN', '321', 'CXR', 'SGN', 1510, 2, 510, 480, 65),
    ('VJ', '32N', 'SGN', 'CXR', 1800, 2, 570, 480, 65),
    ('VJ', '32N', 'CXR', 'SGN', 1810, 2, 690, 480, 65),
    ('BL', '320', 'SGN', 'CXR', 900, 1, 750, 0, 65),
    ('BL', '320', 'CXR', 'SGN', 910, 1, 870, 0, 65),
    ('VN', '321', 'HAN', 'CXR', 1600, 2, 420, 480, 115),
    ('VN', '321', 'CXR', 'HAN', 1610, 2, 570, 480, 115),
    ('VJ', '32N', 'HAN', 'CXR', 1900, 1, 660, 0, 115),
    ('VJ', '32N', 'CXR', 'HAN', 1910, 1, 840, 0, 115),

    ('VN', '321', 'SGN', 'DLI', 1700, 1, 480, 0, 50),
    ('VN', '321', 'DLI', 'SGN', 1710, 1, 570, 0, 50),
    ('VJ', '32N', 'SGN', 'DLI', 2000, 2, 720, 420, 50),
    ('VJ', '32N', 'DLI', 'SGN', 2010, 2, 810, 420, 50),
    ('VN', '321', 'HAN', 'DLI', 1800, 1, 420, 0, 110),
    ('VN', '321', 'DLI', 'HAN', 1810, 1, 570, 0, 110),
    ('VJ', '32N', 'HAN', 'DLI', 2100, 1, 900, 0, 110),
    ('VJ', '32N', 'DLI', 'HAN', 2110, 1, 1050, 0, 110),

    ('VN', '321', 'SGN', 'VCA', 1900, 2, 450, 360, 45),
    ('VN', '321', 'VCA', 'SGN', 1910, 2, 540, 360, 45),
    ('VJ', '32N', 'SGN', 'VCA', 2200, 1, 1020, 0, 45),
    ('VJ', '32N', 'VCA', 'SGN', 2210, 1, 1110, 0, 45),
    ('VN', '321', 'HAN', 'VCA', 2300, 1, 420, 0, 125),
    ('VN', '321', 'VCA', 'HAN', 2310, 1, 600, 0, 125),
    ('VJ', '32N', 'HAN', 'VCA', 2700, 1, 840, 0, 125),
    ('VJ', '32N', 'VCA', 'HAN', 2710, 1, 1020, 0, 125),

    ('VN', '321', 'HAN', 'PQC', 2000, 2, 360, 540, 130),
    ('VN', '321', 'PQC', 'HAN', 2010, 2, 540, 540, 130),
    ('VJ', '32N', 'HAN', 'PQC', 2300, 1, 660, 0, 130),
    ('VJ', '32N', 'PQC', 'HAN', 2310, 1, 840, 0, 130),
    ('9G', '321', 'HAN', 'PQC', 100, 1, 780, 0, 130),
    ('9G', '321', 'PQC', 'HAN', 110, 1, 960, 0, 130),
    ('VJ', '32N', 'DAD', 'PQC', 2400, 1, 540, 0, 90),
    ('VJ', '32N', 'PQC', 'DAD', 2410, 1, 660, 0, 90),
    ('9G', '321', 'DAD', 'PQC', 200, 1, 780, 0, 90),
    ('9G', '321', 'PQC', 'DAD', 210, 1, 900, 0, 90),
    ('9G', '321', 'HPH', 'PQC', 300, 1, 600, 0, 125),
    ('9G', '321', 'PQC', 'HPH', 310, 1, 775, 0, 125),

    ('VN', '321', 'SGN', 'HPH', 2100, 1, 390, 0, 120),
    ('VN', '321', 'HPH', 'SGN', 2110, 1, 930, 0, 120),
    ('VJ', '32N', 'SGN', 'HPH', 2500, 1, 720, 0, 120),
    ('VJ', '32N', 'HPH', 'SGN', 2510, 1, 840, 0, 120),
    ('9G', '321', 'SGN', 'HPH', 400, 1, 425, 0, 125),
    ('9G', '321', 'HPH', 'SGN', 410, 1, 950, 0, 130),

    ('VN', '321', 'SGN', 'HUI', 2200, 1, 420, 0, 85),
    ('VN', '321', 'HUI', 'SGN', 2210, 1, 540, 0, 85),
    ('VJ', '32N', 'SGN', 'HUI', 2600, 1, 900, 0, 85),
    ('VJ', '32N', 'HUI', 'SGN', 2610, 1, 1020, 0, 85),
    ('VN', '321', 'SGN', 'UIH', 2400, 1, 480, 0, 70),
    ('VN', '321', 'UIH', 'SGN', 2410, 1, 600, 0, 70),
    ('VJ', '32N', 'SGN', 'UIH', 2800, 1, 900, 0, 70),
    ('VJ', '32N', 'UIH', 'SGN', 2810, 1, 1020, 0, 70),
    ('VN', '321', 'SGN', 'BMV', 2500, 1, 420, 0, 60),
    ('VN', '321', 'BMV', 'SGN', 2510, 1, 540, 0, 60),
    ('VJ', '32N', 'SGN', 'BMV', 2900, 1, 840, 0, 60),
    ('VJ', '32N', 'BMV', 'SGN', 2910, 1, 960, 0, 60),
    ('VN', '321', 'SGN', 'VII', 2600, 1, 360, 0, 110),
    ('VN', '321', 'VII', 'SGN', 2610, 1, 510, 0, 110),
    ('VJ', '32N', 'SGN', 'VII', 3000, 1, 780, 0, 110),
    ('VJ', '32N', 'VII', 'SGN', 3010, 1, 930, 0, 110),
]


def _expand_additional_profiles():
    flights = []
    for airline, aircraft, origin, destination, number_base, frequency, first_minute, spacing, duration in ADDITIONAL_DAILY_FLIGHT_PROFILES:
        for slot in range(frequency):
            departure_minute = first_minute + slot * spacing
            hour, minute = divmod(departure_minute, 60)
            flights.append(
                (f'{airline}{number_base + slot}', airline, aircraft, origin,
                 destination, hour, minute, duration)
            )
    return flights


DAILY_FLIGHT_TEMPLATE.extend(_expand_additional_profiles())

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

    seat_values = []
    for row_num in SEAT_ROWS:
        if row_num <= 4:
            columns, cabin = ['A', 'C', 'D', 'F'], 'BUSINESS'
        else:
            columns, cabin = ['A', 'B', 'C', 'D', 'E', 'F'], 'ECONOMY'
        for col in columns:
            seat_type = 'EXIT' if row_num in (15, 16) else ('WINDOW' if col in ('A', 'F') else ('AISLE' if col in ('C', 'D') else 'STANDARD'))
            extra_fee = 100000 if seat_type in ('EXIT', 'WINDOW') else 0
            seat_values.append(
                (_uid(), flight_id, f"{row_num}{col}", cabin_ids[cabin], row_num, col,
                 seat_type, 'AVAILABLE', extra_fee, n, n)
            )

    # A flight has 172 seats. Sending them as one multi-row statement keeps the
    # full two-month demo seed fast enough for local development.
    seat_placeholders = ','.join(['(?,?,?,?,?,?,?,?,?,?,?)'] * len(seat_values))
    seat_params = tuple(value for row in seat_values for value in row)
    db.execute(
        "INSERT INTO seats(id,flight_id,seat_number,cabin_class_id,seat_row,column_label,"
        f"seat_type,status,extra_fee,created_at,updated_at) VALUES{seat_placeholders}",
        seat_params
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
            db.begin()
            try:
                db.execute(
                    "INSERT INTO flights(id,flight_number,airline_id,aircraft_type_id,departure_airport_id,"
                    "arrival_airport_id,departure_time,arrival_time,duration_minutes,status,created_at,updated_at) "
                    "VALUES(?,?,?,?,?,?,?,?,?,?,?,?)",
                    (flight_id, flight_no, airline_ids[airline_iata], aircraft_ids.get(aircraft_code),
                     airport_ids[dep_iata], airport_ids[arr_iata], dep_dt.isoformat(), arr_dt.isoformat(),
                     duration, 'SCHEDULED', n, n)
                )
                _create_fares_and_seats(db, flight_id, cabin_ids)
                db.commit()
            except Exception:
                db.rollback()
                raise
            created += 1
    return created
