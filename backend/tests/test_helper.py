"""Shared test helper for clean database setup."""
import tempfile
import os
import sqlite3


def fresh_db_path():
    """Return a temp file path for a fresh test database."""
    f = tempfile.NamedTemporaryFile(suffix='.db', delete=False)
    f.close()
    return f.name


def setup_test_db(db_path):
    """Close any existing connection and reinitialize schema."""
    from database.connection import close_db
    close_db()
    # Just delete the file and let init_schema recreate it
    if os.path.exists(db_path):
        try:
            os.unlink(db_path)
        except Exception:
            # If file is locked, truncate it by overwriting
            conn = sqlite3.connect(db_path)
            # Drop all tables
            conn.execute("PRAGMA writable_schema=ON")
            conn.executescript("DELETE FROM sqlite_master WHERE type IN ('table','index','trigger');")
            conn.execute("PRAGMA writable_schema=OFF")
            conn.commit()
            conn.close()
    from database.connection import init_schema
    init_schema()
