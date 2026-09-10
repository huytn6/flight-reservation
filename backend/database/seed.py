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

    # ---- Flights, fares & seats ----
    # Every route in the schedule flies daily, so seeding is just "make sure the
    # next 7 days are covered" (see services/flight_schedule_service.py). The same
    # function is used by the background job that keeps topping up the schedule in
    # production so it never runs out of future flights (FIX.ipynb #15/#16).
    from services.flight_schedule_service import ensure_schedule_range
    start_date = datetime.date.today() + datetime.timedelta(days=1)
    end_date = start_date + datetime.timedelta(days=6)
    created = ensure_schedule_range(db, start_date, end_date)
    print(f'Flights/fares/seats seeded ({created} new flights, {start_date} to {end_date}).')

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
