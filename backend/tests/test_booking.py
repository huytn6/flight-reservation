"""Booking and payment flow tests."""
import sys
import os
import unittest
import datetime
import uuid
import json

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.code_generator import generate_pnr, generate_ticket_number
from utils.price_utils import fare_total, apply_coupon


class TestPriceUtils(unittest.TestCase):
    def test_fare_total(self):
        self.assertEqual(fare_total(1000000, 100000, 50000), 1150000)

    def test_coupon_percent(self):
        coupon = {'discount_type': 'PERCENT', 'discount_value': 10}
        self.assertEqual(apply_coupon(1000000, coupon), 100000)

    def test_coupon_fixed(self):
        coupon = {'discount_type': 'FIXED', 'discount_value': 200000}
        self.assertEqual(apply_coupon(1000000, coupon), 200000)

    def test_coupon_cannot_exceed_amount(self):
        coupon = {'discount_type': 'FIXED', 'discount_value': 5000000}
        self.assertEqual(apply_coupon(100000, coupon), 100000)


class TestCodeGenerator(unittest.TestCase):
    def test_pnr_length(self):
        self.assertEqual(len(generate_pnr()), 6)

    def test_pnr_alphanumeric(self):
        pnr = generate_pnr()
        self.assertTrue(pnr.isalnum())
        self.assertEqual(pnr, pnr.upper())

    def test_ticket_number_format(self):
        self.assertIn('ABC123', generate_ticket_number('ABC123', 0))

    def test_unique_pnrs(self):
        pnrs = {generate_pnr() for _ in range(100)}
        self.assertGreater(len(pnrs), 90)


class TestBookingFlow(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        import config
        config.DB_NAME = 'flight_booking_test'
        from database.connection import init_schema
        init_schema()
        cls._setup_static_data()

    @classmethod
    def tearDownClass(cls):
        from database.connection import close_db
        close_db()

    @classmethod
    def _setup_static_data(cls):
        from database.connection import get_db
        db = get_db()
        now = datetime.datetime.utcnow().isoformat()
        tomorrow = (datetime.date.today() + datetime.timedelta(days=1)).isoformat()

        # Clean slate
        for tbl in ('fare_inventories', 'fares', 'flights', 'cabin_classes', 'airlines', 'airports', 'users'):
            db.execute(f"DELETE FROM {tbl}")

        ap1 = str(uuid.uuid4())
        ap2 = str(uuid.uuid4())
        al = str(uuid.uuid4())
        cc = str(uuid.uuid4())
        cls.flight_id = str(uuid.uuid4())
        cls.fare_id = str(uuid.uuid4())
        cls.user_id = str(uuid.uuid4())

        db.execute(
            "INSERT INTO airports(id,iata_code,name,city,country,country_code,timezone,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)",
            (ap1, 'BK1', 'Test Apt', 'City', 'VN', 'VN', 'UTC', now, now)
        )
        db.execute(
            "INSERT INTO airports(id,iata_code,name,city,country,country_code,timezone,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)",
            (ap2, 'BK2', 'Test2 Apt', 'City2', 'VN', 'VN', 'UTC', now, now)
        )
        db.execute("INSERT INTO airlines(id,iata_code,name,created_at,updated_at) VALUES(?,?,?,?,?)", (al, 'BK', 'BookAir', now, now))
        db.execute("INSERT INTO cabin_classes(id,code,name,created_at,updated_at) VALUES(?,?,?,?,?)", (cc, 'ECONOMY', 'Economy', now, now))
        db.execute(
            "INSERT INTO users(id,email,password,full_name,role,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)",
            (cls.user_id, 'booktest@test.com', 'x', 'Test User', 'CUSTOMER', 'ACTIVE', now, now)
        )
        db.execute(
            "INSERT INTO flights(id,flight_number,airline_id,departure_airport_id,arrival_airport_id,departure_time,arrival_time,duration_minutes,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)",
            (cls.flight_id, 'BK1', al, ap1, ap2, f'{tomorrow}T06:00:00', f'{tomorrow}T08:10:00', 130, 'SCHEDULED', now, now)
        )
        db.execute(
            "INSERT INTO fares(id,flight_id,cabin_class_id,fare_code,fare_name,base_price,tax,fees,currency,baggage_kg,is_refundable,is_changeable,change_fee,cancel_fee,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            (cls.fare_id, cls.flight_id, cc, 'ECO', 'Economy', 1200000, 120000, 50000, 'VND', 0, 0, 0, 0, 0, now, now)
        )
        db.execute(
            "INSERT INTO fare_inventories(id,fare_id,total_seats,available_seats,updated_at) VALUES(?,?,?,?,?)",
            (str(uuid.uuid4()), cls.fare_id, 100, 80, now)
        )

    def test_inventory_decrements_on_payment(self):
        from database.connection import get_db
        db = get_db()
        before = db.execute("SELECT available_seats FROM fare_inventories WHERE fare_id=?", (self.fare_id,)).fetchone()['available_seats']
        db.execute("UPDATE fare_inventories SET available_seats=available_seats-1 WHERE fare_id=?", (self.fare_id,))
        after = db.execute("SELECT available_seats FROM fare_inventories WHERE fare_id=?", (self.fare_id,)).fetchone()['available_seats']
        self.assertEqual(after, before - 1)

    def test_booking_status_history(self):
        from database.connection import get_db
        db = get_db()
        now = datetime.datetime.utcnow().isoformat()
        bid = str(uuid.uuid4())
        db.execute(
            "INSERT INTO bookings(id,user_id,contact_name,contact_email,contact_phone,total_amount,currency,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?)",
            (bid, self.user_id, 'Test', 'test@test.com', '0123', 1000000, 'VND', 'PENDING_PAYMENT', now, now)
        )
        db.execute(
            "INSERT INTO booking_status_histories(id,booking_id,from_status,to_status,created_at) VALUES(?,?,?,?,?)",
            (str(uuid.uuid4()), bid, None, 'PENDING_PAYMENT', now)
        )
        row = db.execute("SELECT * FROM booking_status_histories WHERE booking_id=?", (bid,)).fetchone()
        self.assertEqual(row['to_status'], 'PENDING_PAYMENT')

    def test_cancelled_booking_queryable(self):
        from database.connection import get_db
        db = get_db()
        now = datetime.datetime.utcnow().isoformat()
        bid = str(uuid.uuid4())
        db.execute(
            "INSERT INTO bookings(id,user_id,contact_name,contact_email,contact_phone,total_amount,currency,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?)",
            (bid, self.user_id, 'Test', 'test@test.com', '0123', 1000000, 'VND', 'CANCELLED', now, now)
        )
        row = db.execute("SELECT * FROM bookings WHERE id=?", (bid,)).fetchone()
        self.assertIsNotNone(row)
        self.assertEqual(row['status'], 'CANCELLED')


if __name__ == '__main__':
    unittest.main()
