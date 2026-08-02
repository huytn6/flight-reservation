"""Permission and authorization tests."""
import sys
import os
import unittest
import datetime
import uuid

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.authentication import hash_password, generate_token, hash_token
from core.exceptions import AuthenticationError, AuthorizationError


def _create_user_and_session(db, email, role):
    uid = str(uuid.uuid4())
    now = datetime.datetime.utcnow()
    pw = hash_password('Test@1234')
    db.execute(
        "INSERT INTO users(id,email,password,full_name,role,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)",
        (uid, email, pw, 'Test User', role, 'ACTIVE', now.isoformat(), now.isoformat())
    )
    token = generate_token()
    token_hash = hash_token(token)
    session_id = str(uuid.uuid4())
    expires = (now + datetime.timedelta(hours=24)).isoformat()
    db.execute(
        "INSERT INTO sessions(id,user_id,token_hash,created_at,expires_at,last_seen_at) VALUES(?,?,?,?,?,?)",
        (session_id, uid, token_hash, now.isoformat(), expires, now.isoformat())
    )
    return token, uid


class MockHandler:
    def __init__(self, token):
        self.headers = {'Authorization': f'Bearer {token}'}
        self.client_address = ['127.0.0.1']

    def get(self, key, default=None):
        return self.headers.get(key, default)


class TestPermissions(unittest.TestCase):
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
        self.customer_token, self.customer_id = _create_user_and_session(db, 'customer@t.com', 'CUSTOMER')
        self.staff_token, self.staff_id = _create_user_and_session(db, 'staff@t.com', 'STAFF')
        self.admin_token, self.admin_id = _create_user_and_session(db, 'admin@t.com', 'ADMIN')

    def test_valid_customer_token(self):
        from core.authentication import get_current_user
        from database.connection import get_db
        db = get_db()
        handler = MockHandler(self.customer_token)
        user = get_current_user(handler, db)
        self.assertEqual(user['role'], 'CUSTOMER')

    def test_valid_staff_token(self):
        from core.authentication import get_current_user
        from database.connection import get_db
        db = get_db()
        handler = MockHandler(self.staff_token)
        user = get_current_user(handler, db)
        self.assertEqual(user['role'], 'STAFF')

    def test_valid_admin_token(self):
        from core.authentication import get_current_user
        from database.connection import get_db
        db = get_db()
        handler = MockHandler(self.admin_token)
        user = get_current_user(handler, db)
        self.assertEqual(user['role'], 'ADMIN')

    def test_invalid_token_raises(self):
        from core.authentication import get_current_user
        from database.connection import get_db
        db = get_db()
        handler = MockHandler('invalid_token')
        with self.assertRaises(AuthenticationError):
            get_current_user(handler, db)

    def test_customer_cannot_access_admin(self):
        from core.authentication import require_admin
        from database.connection import get_db
        db = get_db()
        handler = MockHandler(self.customer_token)
        with self.assertRaises(AuthorizationError):
            require_admin(handler, db)

    def test_staff_cannot_access_admin(self):
        from core.authentication import require_admin
        from database.connection import get_db
        db = get_db()
        handler = MockHandler(self.staff_token)
        with self.assertRaises(AuthorizationError):
            require_admin(handler, db)

    def test_admin_can_access_admin(self):
        from core.authentication import require_admin
        from database.connection import get_db
        db = get_db()
        handler = MockHandler(self.admin_token)
        user = require_admin(handler, db)
        self.assertEqual(user['role'], 'ADMIN')

    def test_customer_cannot_access_staff(self):
        from core.authentication import require_staff
        from database.connection import get_db
        db = get_db()
        handler = MockHandler(self.customer_token)
        with self.assertRaises(AuthorizationError):
            require_staff(handler, db)

    def test_staff_can_access_staff(self):
        from core.authentication import require_staff
        from database.connection import get_db
        db = get_db()
        handler = MockHandler(self.staff_token)
        user = require_staff(handler, db)
        self.assertEqual(user['role'], 'STAFF')

    def test_revoked_token_rejected(self):
        from core.authentication import get_current_user
        from database.connection import get_db
        db = get_db()
        now = datetime.datetime.utcnow().isoformat()
        token_hash = hash_token(self.customer_token)
        db.execute("UPDATE sessions SET revoked_at=? WHERE token_hash=?", (now, token_hash))
        handler = MockHandler(self.customer_token)
        with self.assertRaises(AuthenticationError):
            get_current_user(handler, db)

    def test_banned_user_rejected(self):
        from core.authentication import get_current_user
        from database.connection import get_db
        db = get_db()
        db.execute("UPDATE users SET status='BANNED' WHERE id=?", (self.customer_id,))
        handler = MockHandler(self.customer_token)
        with self.assertRaises(AuthenticationError):
            get_current_user(handler, db)


if __name__ == '__main__':
    unittest.main()
