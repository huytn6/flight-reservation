"""Seed demo data. Run: python -m database.seed"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import uuid
import json
import datetime
from database.connection import get_db, init_schema
from core.authentication import hash_password
import config


def now_iso():
    return datetime.datetime.utcnow().isoformat()


def uid():
    return str(uuid.uuid4())


def main():
    init_schema()
    db = get_db()

    # ---- Users ----
    users = [
        ('customer@example.com', 'Customer@123', 'Nguyen Van A', 'CUSTOMER'),
        ('staff@example.com',    'Staff@123',    'Tran Thi B',   'STAFF'),
        ('admin@example.com',    'Admin@123',    'Le Van C',      'ADMIN'),
    ]
    user_ids = {}
    for email, pw, name, role in users:
        existing = db.execute('SELECT id FROM users WHERE email=?', (email,)).fetchone()
        if existing:
            user_ids[email] = existing['id']
            continue
        uid_ = uid()
        user_ids[email] = uid_
        n = now_iso()
        db.execute(
            "INSERT INTO users(id,email,password,full_name,role,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)",
            (uid_, email, hash_password(pw), name, role, 'ACTIVE', n, n)
        )
    db.commit()
    print('Users seeded.')

    # ---- Airports ----
    airports = [
        ('SGN', 'VVTS', 'Tan Son Nhat International Airport', 'Ho Chi Minh City', 'Vietnam', 'VN', 'Asia/Ho_Chi_Minh', 10.8188, 106.6519),
        ('HAN', 'VVNB', 'Noi Bai International Airport',      'Hanoi',            'Vietnam', 'VN', 'Asia/Ho_Chi_Minh', 21.2212, 105.8074),
        ('DAD', 'VVDN', 'Da Nang International Airport',       'Da Nang',          'Vietnam', 'VN', 'Asia/Ho_Chi_Minh', 16.0439, 108.1993),
        ('PQC', 'VVPQ', 'Phu Quoc International Airport',      'Phu Quoc',         'Vietnam', 'VN', 'Asia/Ho_Chi_Minh',  9.7328, 104.1699),
        ('HPH', 'VVCI', 'Cat Bi International Airport',         'Hai Phong',        'Vietnam', 'VN', 'Asia/Ho_Chi_Minh', 20.8194, 106.7249),
        ('BKK', 'VTBS', 'Suvarnabhumi Airport',                 'Bangkok',          'Thailand', 'TH', 'Asia/Bangkok',     13.6811, 100.7475),
        ('SIN', 'WSSS', 'Singapore Changi Airport',             'Singapore',        'Singapore', 'SG', 'Asia/Singapore', 1.3644,  103.9915),
        ('NRT', 'RJAA', 'Narita International Airport',          'Tokyo',            'Japan',    'JP', 'Asia/Tokyo',       35.7720, 140.3929),
    ]
    airport_ids = {}
    for row in airports:
        iata = row[0]
        existing = db.execute('SELECT id FROM airports WHERE iata_code=?', (iata,)).fetchone()
        if existing:
            airport_ids[iata] = existing['id']
            continue
        aid = uid()
        airport_ids[iata] = aid
        n = now_iso()
        db.execute(
            "INSERT INTO airports(id,iata_code,icao_code,name,city,country,country_code,timezone,latitude,longitude,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)",
            (aid, *row, n, n)
        )
    db.commit()
    print('Airports seeded.')

    # ---- Airlines ----
    airlines_data = [
        ('VN', 'HVN', 'Vietnam Airlines', 'Vietnam', None),
        ('VJ', 'VJC', 'VietJet Air',      'Vietnam', None),
        ('QH', 'BAV', 'Bamboo Airways',   'Vietnam', None),
        ('TG', 'THA', 'Thai Airways',     'Thailand', None),
        ('SQ', 'SIA', 'Singapore Airlines','Singapore', None),
        ('NH', 'ANA', 'All Nippon Airways','Japan', None),
    ]
    airline_ids = {}
    for row in airlines_data:
        iata = row[0]
        existing = db.execute('SELECT id FROM airlines WHERE iata_code=?', (iata,)).fetchone()
        if existing:
            airline_ids[iata] = existing['id']
            continue
        alid = uid()
        airline_ids[iata] = alid
        n = now_iso()
        db.execute(
            "INSERT INTO airlines(id,iata_code,icao_code,name,country,logo_url,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)",
            (alid, *row, n, n)
        )
    db.commit()
    print('Airlines seeded.')

    # ---- Aircraft types ----
    aircraft_data = [
        ('738', 'Boeing 737-800',     'Boeing',  160),
        ('321', 'Airbus A321',        'Airbus',  220),
        ('789', 'Boeing 787-9',       'Boeing',  296),
        ('77W', 'Boeing 777-300ER',   'Boeing',  396),
        ('32N', 'Airbus A320neo',     'Airbus',  150),
    ]
    aircraft_ids = {}
    for row in aircraft_data:
        code = row[0]
        existing = db.execute('SELECT id FROM aircraft_types WHERE iata_code=?', (code,)).fetchone()
        if existing:
            aircraft_ids[code] = existing['id']
            continue
        atid = uid()
        aircraft_ids[code] = atid
        n = now_iso()
        db.execute(
            "INSERT INTO aircraft_types(id,iata_code,name,manufacturer,seat_capacity,created_at,updated_at) VALUES(?,?,?,?,?,?,?)",
            (atid, *row, n, n)
        )
    db.commit()
    print('Aircraft types seeded.')

    # ---- Cabin classes ----
    cabin_data = [
        ('ECONOMY', 'Economy'),
        ('PREMIUM_ECONOMY', 'Premium Economy'),
        ('BUSINESS', 'Business'),
        ('FIRST', 'First Class'),
    ]
    cabin_ids = {}
    for code, name in cabin_data:
        existing = db.execute('SELECT id FROM cabin_classes WHERE code=?', (code,)).fetchone()
        if existing:
            cabin_ids[code] = existing['id']
            continue
        ccid = uid()
        cabin_ids[code] = ccid
        n = now_iso()
        db.execute(
            "INSERT INTO cabin_classes(id,code,name,created_at,updated_at) VALUES(?,?,?,?,?)",
            (ccid, code, name, n, n)
        )
    db.commit()
    print('Cabin classes seeded.')

    # ---- Flights ----
    base_date = datetime.date.today() + datetime.timedelta(days=1)

    def make_flight(fn, airline_iata, ac_code, dep_iata, arr_iata, dep_hour, dep_min, duration_min, day_offset=0):
        fid = uid()
        dep_dt = datetime.datetime(
            base_date.year, base_date.month, base_date.day,
            dep_hour, dep_min
        ) + datetime.timedelta(days=day_offset)
        arr_dt = dep_dt + datetime.timedelta(minutes=duration_min)
        n = now_iso()
        db.execute(
            "INSERT INTO flights(id,flight_number,airline_id,aircraft_type_id,departure_airport_id,arrival_airport_id,departure_time,arrival_time,duration_minutes,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)",
            (fid, fn, airline_ids[airline_iata], aircraft_ids.get(ac_code), airport_ids[dep_iata], airport_ids[arr_iata],
             dep_dt.isoformat(), arr_dt.isoformat(), duration_min, 'SCHEDULED', n, n)
        )
        return fid

    flight_definitions = [
        # (flight_no, airline, aircraft, dep, arr, hour, min, duration, day_offset)
        ('VN100', 'VN', '321', 'SGN', 'HAN', 6, 0, 130, 0),
        ('VN101', 'VN', '321', 'HAN', 'SGN', 9, 0, 130, 0),
        ('VN200', 'VN', '789', 'SGN', 'HAN', 14, 0, 130, 0),
        ('VN201', 'VN', '789', 'HAN', 'SGN', 17, 30, 130, 0),
        ('VJ300', 'VJ', '321', 'SGN', 'DAD', 7, 0, 75, 0),
        ('VJ301', 'VJ', '321', 'DAD', 'SGN', 10, 30, 75, 0),
        ('VJ400', 'VJ', '32N', 'HAN', 'DAD', 8, 0, 75, 0),
        ('VJ401', 'VJ', '32N', 'DAD', 'HAN', 11, 30, 75, 0),
        ('QH500', 'QH', '738', 'SGN', 'PQC', 9, 0, 60, 0),
        ('QH501', 'QH', '738', 'PQC', 'SGN', 11, 30, 60, 0),
        ('VN600', 'VN', '789', 'SGN', 'BKK', 7, 30, 90, 0),
        ('VN601', 'VN', '789', 'BKK', 'SGN', 10, 30, 90, 0),
        ('SQ700', 'SQ', '789', 'SGN', 'SIN', 10, 0, 115, 0),
        ('SQ701', 'SQ', '789', 'SIN', 'SGN', 14, 0, 115, 0),
        ('NH800', 'NH', '77W', 'SGN', 'NRT', 0, 30, 360, 0),
        ('NH801', 'NH', '77W', 'NRT', 'SGN', 11, 0, 360, 0),
        # next day flights for round-trip
        ('VN100', 'VN', '321', 'SGN', 'HAN', 6, 0, 130, 3),
        ('VN101', 'VN', '321', 'HAN', 'SGN', 9, 0, 130, 3),
        ('VN200', 'VN', '789', 'SGN', 'HAN', 14, 0, 130, 5),
        ('VN201', 'VN', '789', 'HAN', 'SGN', 17, 30, 130, 5),
        ('VJ300', 'VJ', '321', 'SGN', 'DAD', 7, 0, 75, 2),
        ('VJ301', 'VJ', '321', 'DAD', 'SGN', 10, 30, 75, 4),
        ('SQ700', 'SQ', '789', 'SGN', 'SIN', 10, 0, 115, 2),
        ('SQ701', 'SQ', '789', 'SIN', 'SGN', 14, 0, 115, 5),

        # ---- Additional new flights ----
        # New routes
        ('VN110', 'VN', '738', 'HAN', 'DAD', 6, 30, 85, 0),
        ('VN111', 'VN', '738', 'DAD', 'HAN', 9, 30, 85, 0),
        ('QH520', 'QH', '321', 'HAN', 'PQC', 8, 0, 140, 0),
        ('QH521', 'QH', '321', 'PQC', 'HAN', 11, 30, 140, 0),
        ('VJ320', 'VJ', '32N', 'SGN', 'HPH', 6, 45, 115, 0),
        ('VJ321', 'VJ', '32N', 'HPH', 'SGN', 10, 0, 115, 0),
        ('QH530', 'QH', '738', 'DAD', 'PQC', 13, 0, 90, 0),
        ('QH531', 'QH', '738', 'PQC', 'DAD', 15, 30, 90, 0),
        ('TG900', 'TG', '77W', 'HAN', 'BKK', 9, 0, 120, 0),
        ('TG901', 'TG', '77W', 'BKK', 'HAN', 12, 0, 120, 0),
        ('VN610', 'VN', '789', 'HAN', 'SIN', 8, 0, 220, 0),
        ('VN611', 'VN', '789', 'SIN', 'HAN', 12, 30, 220, 0),

        # More days for existing popular routes (next 7 days)
        ('VN100', 'VN', '321', 'SGN', 'HAN', 6, 0, 130, 1),
        ('VN101', 'VN', '321', 'HAN', 'SGN', 9, 0, 130, 1),
        ('VN100', 'VN', '321', 'SGN', 'HAN', 6, 0, 130, 2),
        ('VN101', 'VN', '321', 'HAN', 'SGN', 9, 0, 130, 2),
        ('VN100', 'VN', '321', 'SGN', 'HAN', 6, 0, 130, 4),
        ('VN101', 'VN', '321', 'HAN', 'SGN', 9, 0, 130, 4),
        ('VN100', 'VN', '321', 'SGN', 'HAN', 6, 0, 130, 5),
        ('VN101', 'VN', '321', 'HAN', 'SGN', 9, 0, 130, 5),
        ('VN100', 'VN', '321', 'SGN', 'HAN', 6, 0, 130, 6),
        ('VN101', 'VN', '321', 'HAN', 'SGN', 9, 0, 130, 6),
        ('VJ300', 'VJ', '321', 'SGN', 'DAD', 7, 0, 75, 1),
        ('VJ301', 'VJ', '321', 'DAD', 'SGN', 10, 30, 75, 1),
        ('VJ300', 'VJ', '321', 'SGN', 'DAD', 7, 0, 75, 3),
        ('VJ301', 'VJ', '321', 'DAD', 'SGN', 10, 30, 75, 3),
        ('VJ300', 'VJ', '321', 'SGN', 'DAD', 7, 0, 75, 5),
        ('VJ301', 'VJ', '321', 'DAD', 'SGN', 10, 30, 75, 6),
        ('QH500', 'QH', '738', 'SGN', 'PQC', 9, 0, 60, 1),
        ('QH501', 'QH', '738', 'PQC', 'SGN', 11, 30, 60, 1),
        ('QH500', 'QH', '738', 'SGN', 'PQC', 9, 0, 60, 3),
        ('QH501', 'QH', '738', 'PQC', 'SGN', 11, 30, 60, 3),
        ('SQ700', 'SQ', '789', 'SGN', 'SIN', 10, 0, 115, 1),
        ('SQ701', 'SQ', '789', 'SIN', 'SGN', 14, 0, 115, 1),
        ('SQ700', 'SQ', '789', 'SGN', 'SIN', 10, 0, 115, 3),
        ('SQ701', 'SQ', '789', 'SIN', 'SGN', 14, 0, 115, 3),
        ('NH800', 'NH', '77W', 'SGN', 'NRT', 0, 30, 360, 2),
        ('NH801', 'NH', '77W', 'NRT', 'SGN', 11, 0, 360, 2),
        ('NH800', 'NH', '77W', 'SGN', 'NRT', 0, 30, 360, 5),
        ('NH801', 'NH', '77W', 'NRT', 'SGN', 11, 0, 360, 5),
        ('VN110', 'VN', '738', 'HAN', 'DAD', 6, 30, 85, 2),
        ('VN111', 'VN', '738', 'DAD', 'HAN', 9, 30, 85, 2),
        ('TG900', 'TG', '77W', 'HAN', 'BKK', 9, 0, 120, 3),
        ('TG901', 'TG', '77W', 'BKK', 'HAN', 12, 0, 120, 3),
    ]

    flight_ids = []
    for row in flight_definitions:
        existing = db.execute(
            "SELECT id FROM flights WHERE flight_number=? AND departure_time LIKE ?",
            (row[0], (datetime.date.today() + datetime.timedelta(days=row[8]+1)).isoformat() + '%')
        ).fetchone()
        if existing:
            flight_ids.append(existing['id'])
        else:
            fid = make_flight(*row)
            flight_ids.append(fid)

    db.commit()
    print(f'Flights seeded ({len(flight_ids)} flights).')

    # ---- Fares ----
    all_flights = db.execute("SELECT id FROM flights").fetchall()
    for frow in all_flights:
        fid = frow['id']
        # Economy fares
        for fare_code, fare_name, base_price, baggage, refundable, changeable, change_fee, cancel_fee in [
            ('ECO_LITE', 'Economy Lite',   1200000, 0, 0, 0, 0, 0),
            ('ECO_FLEX', 'Economy Flex',   1800000, 20, 1, 1, 300000, 150000),
            ('BUS_FULL', 'Business Full',  4500000, 30, 1, 1, 0, 0),
        ]:
            cabin = 'BUSINESS' if 'BUS' in fare_code else 'ECONOMY'
            if not db.execute("SELECT id FROM fares WHERE flight_id=? AND fare_code=?", (fid, fare_code)).fetchone():
                farid = uid()
                n = now_iso()
                db.execute(
                    "INSERT INTO fares(id,flight_id,cabin_class_id,fare_code,fare_name,base_price,tax,fees,currency,baggage_kg,is_refundable,is_changeable,change_fee,cancel_fee,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                    (farid, fid, cabin_ids[cabin], fare_code, fare_name, base_price, int(base_price*0.1), 50000, 'VND', baggage, refundable, changeable, change_fee, cancel_fee, n, n)
                )
                # Inventory
                total = 80 if cabin == 'ECONOMY' else 20
                avail = total - (5 if fare_code == 'ECO_LITE' else 0)
                db.execute(
                    "INSERT INTO fare_inventories(id,fare_id,total_seats,available_seats,updated_at) VALUES(?,?,?,?,?)",
                    (uid(), farid, total, avail, n)
                )
    db.commit()
    print('Fares seeded.')

    # ---- Seats ----
    all_flights2 = db.execute("SELECT id FROM flights").fetchall()
    for frow in all_flights2:
        fid = frow['id']
        if db.execute("SELECT id FROM seats WHERE flight_id=? LIMIT 1", (fid,)).fetchone():
            continue
        n = now_iso()
        # Layout: rows 1-4 Business (A,C,D,F), rows 5-30 Economy (A,B,C,D,E,F)
        for row_num in range(1, 31):
            if row_num <= 4:
                columns = ['A', 'C', 'D', 'F']
                cabin = 'BUSINESS'
            else:
                columns = ['A', 'B', 'C', 'D', 'E', 'F']
                cabin = 'ECONOMY'
            for col in columns:
                seat_num = f"{row_num}{col}"
                stype = 'WINDOW' if col in ('A', 'F') else ('AISLE' if col in ('C', 'D') else 'STANDARD')
                if row_num in (15, 16):
                    stype = 'EXIT'
                extra = 100000 if stype in ('EXIT', 'WINDOW') else 0
                db.execute(
                    "INSERT INTO seats(id,flight_id,seat_number,cabin_class_id,seat_row,column_label,seat_type,status,extra_fee,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)",
                    (uid(), fid, seat_num, cabin_ids[cabin], row_num, col, stype, 'AVAILABLE', extra, n, n)
                )
        # Seat map
        layout = {'business': {'rows': [1,4], 'columns': ['A','C','D','F']},
                  'economy':  {'rows': [5,30], 'columns': ['A','B','C','D','E','F']}}
        db.execute(
            "INSERT INTO seat_maps(id,flight_id,layout_json,created_at,updated_at) VALUES(?,?,?,?,?)",
            (uid(), fid, json.dumps(layout), n, n)
        )
    db.commit()
    print('Seats seeded.')

    # ---- Coupons ----
    coupons = [
        ('DEMO10', 'PERCENT', 10, 500000, 100, '2025-01-01', '2030-12-31'),
        ('SAVE200', 'FIXED', 200000, 1000000, 50, '2025-01-01', '2030-12-31'),
    ]
    for row in coupons:
        if not db.execute('SELECT id FROM coupons WHERE code=?', (row[0],)).fetchone():
            n = now_iso()
            db.execute(
                "INSERT INTO coupons(id,code,discount_type,discount_value,min_amount,max_uses,used_count,valid_from,valid_until,is_active,created_at,updated_at) VALUES(?,?,?,?,?,?,0,?,?,1,?,?)",
                (uid(), *row, n, n)
            )
    db.commit()
    print('Coupons seeded.')

    # ---- Contents ----
    contents_data = [
        ('about-us', 'About Us', 'This is a demo flight booking system.', 'PAGE', 1),
        ('faq', 'Frequently Asked Questions', 'Q: How do I book? A: Search and click book.', 'FAQ', 1),
    ]
    for row in contents_data:
        if not db.execute('SELECT id FROM contents WHERE slug=?', (row[0],)).fetchone():
            n = now_iso()
            db.execute(
                "INSERT INTO contents(id,slug,title,body,content_type,is_published,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)",
                (uid(), *row, n, n)
            )
    db.commit()
    print('Contents seeded.')

    print('\nSeed complete!')
    print('Demo accounts:')
    print('  customer@example.com / Customer@123')
    print('  staff@example.com    / Staff@123')
    print('  admin@example.com    / Admin@123')


if __name__ == '__main__':
    main()
