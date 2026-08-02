"""Seat hold concurrency tests."""
import sys
import os
import unittest
import datetime
import uuid
import threading
import json

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


class TestSeatHolds(unittest.TestCase):
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
        for tbl in ('seat_holds', 'booking_passengers', 'booking_segments', 'booking_status_histories',
                    'bookings', 'booking_drafts', 'fare_inventories', 'fares', 'seats',
                    'seat_maps', 'flights', 'cabin_classes', 'airlines', 'airports'):
            db.execute(f"DELETE FROM {tbl}")
        self._seed()

    def _seed(self):
        from database.connection import get_db
        import config
        db = get_db()
        now = datetime.datetime.utcnow().isoformat()

        ap1 = str(uuid.uuid4())
        ap2 = str(uuid.uuid4())
        al = str(uuid.uuid4())
        cc = str(uuid.uuid4())
        self.flight_id = str(uuid.uuid4())
        self.seat_id = str(uuid.uuid4())
        self.fare_id = str(uuid.uuid4())

        db.execute("INSERT INTO airports(id,iata_code,name,city,country,country_code,timezone,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)", (ap1,'SH1','S Apt','City','VN','VN','UTC',now,now))
        db.execute("INSERT INTO airports(id,iata_code,name,city,country,country_code,timezone,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)", (ap2,'SH2','S2 Apt','City2','VN','VN','UTC',now,now))
        db.execute("INSERT INTO airlines(id,iata_code,name,created_at,updated_at) VALUES(?,?,?,?,?)", (al,'SH','SeatAir',now,now))
        db.execute("INSERT INTO cabin_classes(id,code,name,created_at,updated_at) VALUES(?,?,?,?,?)", (cc,'ECONOMY','Economy',now,now))
        db.execute("INSERT INTO flights(id,flight_number,airline_id,departure_airport_id,arrival_airport_id,departure_time,arrival_time,duration_minutes,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)", (self.flight_id,'SH1',al,ap1,ap2,'2030-01-01T10:00:00','2030-01-01T12:00:00',120,'SCHEDULED',now,now))
        db.execute("INSERT INTO fares(id,flight_id,cabin_class_id,fare_code,fare_name,base_price,tax,fees,currency,baggage_kg,is_refundable,is_changeable,change_fee,cancel_fee,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", (self.fare_id,self.flight_id,cc,'ECO','Economy',1000000,100000,50000,'VND',0,0,0,0,0,now,now))
        db.execute("INSERT INTO fare_inventories(id,fare_id,total_seats,available_seats,updated_at) VALUES(?,?,?,?,?)", (str(uuid.uuid4()),self.fare_id,100,100,now))
        db.execute("INSERT INTO seats(id,flight_id,seat_number,cabin_class_id,seat_row,column_label,seat_type,status,extra_fee,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)", (self.seat_id,self.flight_id,'10A',cc,10,'A','WINDOW','AVAILABLE',0,now,now))

        self.draft_id = str(uuid.uuid4())
        expires = (datetime.datetime.utcnow() + datetime.timedelta(minutes=30)).isoformat()
        db.execute("INSERT INTO booking_drafts(id,user_id,flight_offer_json,status,expires_at,created_at,updated_at) VALUES(?,?,?,?,?,?,?)", (self.draft_id, None, json.dumps([{'id': self.fare_id, 'flight_id': self.flight_id, 'base_price': 1000000, 'tax': 100000, 'fees': 50000}]), 'ACTIVE', expires, now, now))

    def test_seat_starts_available(self):
        from database.connection import get_db
        db = get_db()
        seat = db.execute("SELECT status FROM seats WHERE id=?", (self.seat_id,)).fetchone()
        self.assertEqual(seat['status'], 'AVAILABLE')

    def test_hold_seat(self):
        from database.connection import get_db, transaction
        db = get_db()
        now = datetime.datetime.utcnow()
        expires = (now + datetime.timedelta(minutes=15)).isoformat()
        with transaction(db):
            seat = db.execute("SELECT * FROM seats WHERE id=? FOR UPDATE", (self.seat_id,)).fetchone()
            self.assertEqual(seat['status'], 'AVAILABLE')
            db.execute(
                "INSERT INTO seat_holds(id,draft_id,seat_id,passenger_index,expires_at,created_at) VALUES(?,?,?,?,?,?)",
                (str(uuid.uuid4()), self.draft_id, self.seat_id, 0, expires, now.isoformat())
            )
            db.execute("UPDATE seats SET status='HELD', updated_at=? WHERE id=?", (now.isoformat(), self.seat_id))
        seat = db.execute("SELECT status FROM seats WHERE id=?", (self.seat_id,)).fetchone()
        self.assertEqual(seat['status'], 'HELD')

    def test_concurrent_seat_hold_only_one_wins(self):
        """10 concurrent threads try to hold the same seat; exactly one should succeed."""
        import mysql.connector
        import config

        success_count = [0]
        lock = threading.Lock()

        # Seed 10 draft IDs
        from database.connection import get_db
        db = get_db()
        now = datetime.datetime.utcnow().isoformat()
        expires = (datetime.datetime.utcnow() + datetime.timedelta(minutes=30)).isoformat()
        draft_ids = []
        for _ in range(10):
            did = str(uuid.uuid4())
            draft_ids.append(did)
            db.execute(
                "INSERT INTO booking_drafts(id,user_id,flight_offer_json,status,expires_at,created_at,updated_at) VALUES(?,?,?,?,?,?,?)",
                (did, None, '[]', 'ACTIVE', expires, now, now)
            )

        def try_hold(draft_id):
            try:
                conn = mysql.connector.connect(
                    host=config.DB_HOST,
                    port=config.DB_PORT,
                    user=config.DB_USER,
                    password=config.DB_PASSWORD,
                    database=config.DB_NAME,
                    autocommit=False,
                    charset='utf8mb4',
                    connection_timeout=10,
                )
                cur = conn.cursor(dictionary=True, buffered=True)
                now_str = datetime.datetime.utcnow().isoformat()
                exp = (datetime.datetime.utcnow() + datetime.timedelta(minutes=15)).isoformat()
                try:
                    conn.start_transaction()
                    # FOR UPDATE acquires a row-level lock; only one thread can hold it
                    cur.execute("SELECT * FROM seats WHERE id=%s FOR UPDATE", (self.seat_id,))
                    seat = cur.fetchone()
                    if seat['status'] != 'AVAILABLE':
                        conn.rollback()
                        return
                    cur.execute(
                        "INSERT INTO seat_holds(id,draft_id,seat_id,passenger_index,expires_at,created_at) VALUES(%s,%s,%s,%s,%s,%s)",
                        (str(uuid.uuid4()), draft_id, self.seat_id, 0, exp, now_str)
                    )
                    cur.execute("UPDATE seats SET status='HELD', updated_at=%s WHERE id=%s", (now_str, self.seat_id))
                    conn.commit()
                    with lock:
                        success_count[0] += 1
                except Exception:
                    try:
                        conn.rollback()
                    except Exception:
                        pass
                finally:
                    cur.close()
                    conn.close()
            except Exception:
                pass

        threads = [threading.Thread(target=try_hold, args=(did,)) for did in draft_ids]
        for t in threads:
            t.start()
        for t in threads:
            t.join(timeout=30)

        self.assertEqual(success_count[0], 1)

    def test_expired_seat_released(self):
        from database.connection import get_db
        db = get_db()
        now = datetime.datetime.utcnow()
        expired_time = (now - datetime.timedelta(minutes=20)).isoformat()
        now_str = now.isoformat()

        db.execute(
            "INSERT INTO seat_holds(id,draft_id,seat_id,passenger_index,expires_at,created_at) VALUES(?,?,?,?,?,?)",
            (str(uuid.uuid4()), self.draft_id, self.seat_id, 0, expired_time, expired_time)
        )
        db.execute("UPDATE seats SET status='HELD', updated_at=? WHERE id=?", (now_str, self.seat_id))

        from services.background_jobs import release_expired_seats
        release_expired_seats()

        seat = db.execute("SELECT status FROM seats WHERE id=?", (self.seat_id,)).fetchone()
        self.assertEqual(seat['status'], 'AVAILABLE')


if __name__ == '__main__':
    unittest.main()
