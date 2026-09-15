import threading

import mysql.connector
from mysql.connector import IntegrityError  # re-exported for callers

import config

_local = threading.local()


def _ensure_database():
    """Create the database if it does not exist."""
    conn = mysql.connector.connect(
        host=config.DB_HOST,
        port=config.DB_PORT,
        user=config.DB_USER,
        password=config.DB_PASSWORD,
        charset='utf8mb4',
        use_pure=True,
    )
    try:
        cur = conn.cursor()
        cur.execute(
            f"CREATE DATABASE IF NOT EXISTS `{config.DB_NAME}` "
            f"CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
        )
        conn.commit()
        cur.close()
    finally:
        conn.close()


class _Connection:
    """Thin wrapper over mysql.connector connection.

    Converts SQLite-style ? placeholders to MySQL %s so that all existing
    SQL queries work without modification.  Cursors are opened with
    dictionary=True so rows are accessed as row['column_name'].
    """

    def __init__(self, raw):
        self._raw = raw

    def execute(self, sql, params=None):
        sql = sql.replace('?', '%s')
        cur = self._raw.cursor(dictionary=True, buffered=True)
        cur.execute(sql, params if params is not None else ())
        return cur

    def begin(self):
        self._raw.start_transaction()

    def commit(self):
        self._raw.commit()

    def rollback(self):
        self._raw.rollback()

    def close(self):
        self._raw.close()


def get_db() -> _Connection:
    if not hasattr(_local, 'conn') or _local.conn is None:
        raw = mysql.connector.connect(
            host=config.DB_HOST,
            port=config.DB_PORT,
            user=config.DB_USER,
            password=config.DB_PASSWORD,
            database=config.DB_NAME,
            autocommit=True,
            charset='utf8mb4',
            use_pure=True,
        )
        _local.conn = _Connection(raw)
    return _local.conn


def close_db():
    if hasattr(_local, 'conn') and _local.conn is not None:
        try:
            _local.conn.close()
        except Exception:
            pass
        _local.conn = None


class transaction:
    """Context manager for explicit transactions.

    Uses start_transaction() / commit() / rollback() on the underlying
    MySQL connection.  autocommit is suspended for the duration and
    restored on exit.

    Usage:
        with transaction(db) as db:
            db.execute(...)
    """

    def __init__(self, db=None):
        self.db = db or get_db()

    def __enter__(self):
        self.db.begin()
        return self.db

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type:
            self.db.rollback()
        else:
            self.db.commit()
        return False


def _split_sql(sql: str):
    """Yield individual SQL statements from a script."""
    lines = []
    for line in sql.split('\n'):
        stripped = line.lstrip()
        if stripped.startswith('--'):
            continue
        if '--' in line:
            line = line[:line.index('--')]
        lines.append(line)
    for stmt in '\n'.join(lines).split(';'):
        stmt = stmt.strip()
        if stmt:
            yield stmt


def init_schema():
    """Create database and apply local migrations in filename order.

    Docker/Flyway remains the primary migration runner. This keeps direct
    Python startup and tests aligned by applying every checked-in migration,
    not only the first schema file. Versions already recorded successfully by
    Flyway are not executed again. Data-heavy ``__seed_`` migrations are also
    skipped for databases whose names end in ``_test``; unit tests create the
    small fixtures they need and should not load the full demo catalogue.
    """
    import os
    _ensure_database()
    close_db()  # reconnect to the now-existing database

    migration_dir = os.path.join(os.path.dirname(__file__), 'migrations')
    db = get_db()
    applied_versions = set()
    history_exists = db.execute(
        "SELECT COUNT(*) AS count FROM information_schema.tables "
        "WHERE table_schema=? AND table_name='flyway_schema_history'",
        (config.DB_NAME,)
    ).fetchone()
    if history_exists and history_exists['count']:
        rows = db.execute(
            "SELECT version FROM flyway_schema_history WHERE success=1 AND version IS NOT NULL"
        ).fetchall()
        applied_versions = {str(row['version']) for row in rows}

    for filename in sorted(os.listdir(migration_dir)):
        if not filename.endswith('.sql'):
            continue
        if config.DB_NAME.lower().endswith('_test') and '__seed_' in filename.lower():
            continue
        version = filename.split('__', 1)[0].lstrip('Vv')
        if version in applied_versions:
            continue
        path = os.path.join(migration_dir, filename)
        with open(path, encoding='utf-8') as f:
            sql = f.read()
        for stmt in _split_sql(sql):
            try:
                db.execute(stmt)
            except mysql.connector.Error as exc:
                if exc.errno in (1050, 1060, 1061):  # table exists, duplicate column, duplicate key name
                    continue
                raise
