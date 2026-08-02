"""Authentication tests."""
import sys
import os
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.authentication import hash_password, verify_password, generate_token, hash_token
from database.connection import IntegrityError


class TestPasswordHashing(unittest.TestCase):
    def test_hash_and_verify(self):
        pw = 'MyPassword@1'
        stored = hash_password(pw)
        self.assertTrue(verify_password(pw, stored))

    def test_wrong_password_fails(self):
        stored = hash_password('Correct@1')
        self.assertFalse(verify_password('Wrong@1', stored))

    def test_no_plain_text_in_hash(self):
        pw = 'Secret@123'
        stored = hash_password(pw)
        self.assertNotIn(pw, stored)

    def test_different_salts(self):
        pw = 'Same@Pw1'
        h1 = hash_password(pw)
        h2 = hash_password(pw)
        self.assertNotEqual(h1, h2)


class TestTokenGeneration(unittest.TestCase):
    def test_token_length(self):
        token = generate_token()
        self.assertGreater(len(token), 20)

    def test_token_hash_deterministic(self):
        token = generate_token()
        self.assertEqual(hash_token(token), hash_token(token))

    def test_different_tokens_different_hashes(self):
        t1 = generate_token()
        t2 = generate_token()
        self.assertNotEqual(hash_token(t1), hash_token(t2))


class TestDatabase(unittest.TestCase):
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
        db.execute("DELETE FROM sessions")
        db.execute("DELETE FROM users")

    def test_user_creation(self):
        from database.connection import get_db
        import uuid, datetime
        db = get_db()
        uid = str(uuid.uuid4())
        now = datetime.datetime.utcnow().isoformat()
        db.execute(
            "INSERT INTO users(id,email,password,full_name,role,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)",
            (uid, 'test@example.com', hash_password('Test@1234'), 'Test User', 'CUSTOMER', 'ACTIVE', now, now)
        )
        row = db.execute("SELECT * FROM users WHERE email='test@example.com'").fetchone()
        self.assertIsNotNone(row)
        self.assertEqual(row['role'], 'CUSTOMER')

    def test_duplicate_email_fails(self):
        from database.connection import get_db
        import uuid, datetime
        db = get_db()
        now = datetime.datetime.utcnow().isoformat()
        uid1, uid2 = str(uuid.uuid4()), str(uuid.uuid4())
        db.execute(
            "INSERT INTO users(id,email,password,full_name,role,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)",
            (uid1, 'dup@example.com', 'x', 'User 1', 'CUSTOMER', 'ACTIVE', now, now)
        )
        with self.assertRaises(IntegrityError):
            db.execute(
                "INSERT INTO users(id,email,password,full_name,role,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)",
                (uid2, 'dup@example.com', 'x', 'User 2', 'CUSTOMER', 'ACTIVE', now, now)
            )

    def test_password_not_plaintext(self):
        stored = hash_password('PlainText@1')
        self.assertNotIn('PlainText@1', stored)


if __name__ == '__main__':
    unittest.main()
