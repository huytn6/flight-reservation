"""Flight search tests."""
import sys
import os
import unittest
import datetime
import uuid

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.validation import validate_date
from core.exceptions import ValidationError


class TestValidation(unittest.TestCase):
    def test_valid_date(self):
        self.assertEqual(validate_date('2025-01-15'), '2025-01-15')

    def test_invalid_date_format(self):
        with self.assertRaises(ValidationError):
            validate_date('01/15/2025')

    def test_invalid_date_string(self):
        with self.assertRaises(ValidationError):
            validate_date('not-a-date')


class TestFlightSearch(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        import config
        config.DB_NAME = 'flight_booking_test'
        from database.connection import init_schema
        init_schema()

    @classmethod
    def tearDownClass(cls):
        from database.connection import close_db
        close_db()

    def setUp(self):
        from database.connection import get_db
        db = get_db()
        for tbl in ('fare_inventories', 'fare_rules', 'fares', 'seats', 'seat_maps',
                    'flight_segments', 'flights', 'cabin_classes', 'airlines', 'airports'):
            db.execute(f"DELETE FROM {tbl}")
        self._seed()

    def _seed(self):
        from database.connection import get_db
        db = get_db()
        now = datetime.datetime.utcnow().isoformat()
        tomorrow = (datetime.date.today() + datetime.timedelta(days=1)).isoformat()

        self.sgn_id = str(uuid.uuid4())
        self.han_id = str(uuid.uuid4())
        for aid, iata, city in [(self.sgn_id, 'SGN', 'Ho Chi Minh'), (self.han_id, 'HAN', 'Hanoi')]:
            db.execute(
                "INSERT INTO airports(id,iata_code,name,city,country,country_code,timezone,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)",
                (aid, iata, f'{city} Airport', city, 'Vietnam', 'VN', 'Asia/Ho_Chi_Minh', now, now)
            )
        self.airline_id = str(uuid.uuid4())
        db.execute(
            "INSERT INTO airlines(id,iata_code,name,created_at,updated_at) VALUES(?,?,?,?,?)",
            (self.airline_id, 'VN', 'Vietnam Airlines', now, now)
        )
        self.cabin_id = str(uuid.uuid4())
        db.execute(
            "INSERT INTO cabin_classes(id,code,name,created_at,updated_at) VALUES(?,?,?,?,?)",
            (self.cabin_id, 'ECONOMY', 'Economy', now, now)
        )
        self.flight_id = str(uuid.uuid4())
        dep = f'{tomorrow}T06:00:00'
        arr = f'{tomorrow}T08:10:00'
        db.execute(
            "INSERT INTO flights(id,flight_number,airline_id,departure_airport_id,arrival_airport_id,departure_time,arrival_time,duration_minutes,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)",
            (self.flight_id, 'VN100', self.airline_id, self.sgn_id, self.han_id, dep, arr, 130, 'SCHEDULED', now, now)
        )
        self.fare_id = str(uuid.uuid4())
        db.execute(
            "INSERT INTO fares(id,flight_id,cabin_class_id,fare_code,fare_name,base_price,tax,fees,currency,baggage_kg,is_refundable,is_changeable,change_fee,cancel_fee,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            (self.fare_id, self.flight_id, self.cabin_id, 'ECO', 'Economy', 1200000, 120000, 50000, 'VND', 0, 0, 0, 0, 0, now, now)
        )
        db.execute(
            "INSERT INTO fare_inventories(id,fare_id,total_seats,available_seats,updated_at) VALUES(?,?,?,?,?)",
            (str(uuid.uuid4()), self.fare_id, 100, 50, now)
        )

    def test_airports_exist(self):
        from database.connection import get_db
        db = get_db()
        row = db.execute("SELECT id FROM airports WHERE iata_code='SGN'").fetchone()
        self.assertIsNotNone(row)

    def test_flight_exists(self):
        from database.connection import get_db
        db = get_db()
        row = db.execute("SELECT id FROM flights WHERE flight_number='VN100'").fetchone()
        self.assertIsNotNone(row)

    def test_fare_inventory_exists(self):
        from database.connection import get_db
        db = get_db()
        row = db.execute("SELECT available_seats FROM fare_inventories WHERE fare_id=?", (self.fare_id,)).fetchone()
        self.assertEqual(row['available_seats'], 50)

    def test_fare_total_calculation(self):
        from utils.price_utils import fare_total
        total = fare_total(1200000, 120000, 50000)
        self.assertEqual(total, 1370000)


if __name__ == '__main__':
    unittest.main()
