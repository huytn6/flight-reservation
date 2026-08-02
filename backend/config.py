import configparser
import os

_config = configparser.ConfigParser()
BASE_DIR = os.path.dirname(__file__)
_config.read(os.path.join(BASE_DIR, 'config.ini'))

def _get(section, key, fallback):
    return _config.get(section, key, fallback=fallback)

# Server
HOST = _get('server', 'host', '0.0.0.0')
PORT = int(_get('server', 'port', '8000'))
BASE_URL = _get('server', 'base_url', '/api/v1')

# Database (MySQL)
DB_HOST = _get('database', 'host', 'localhost')
DB_PORT = int(_get('database', 'port', '3307'))
DB_USER = _get('database', 'user', 'root')
DB_PASSWORD = _get('database', 'password', 'root')
DB_NAME = _get('database', 'name', 'flight_booking')

# Security
TOKEN_LENGTH = 32
SESSION_EXPIRE_HOURS = int(_get('security', 'session_expire_hours', '24'))
RESET_TOKEN_EXPIRE_MINUTES = int(_get('security', 'reset_token_expire_minutes', '60'))
PBKDF2_ITERATIONS = int(_get('security', 'pbkdf2_iterations', '260000'))

# Seat hold
SEAT_HOLD_MINUTES = 15
DRAFT_EXPIRE_MINUTES = 30

# Rate limiting (requests per window)
RATE_LIMIT_LOGIN = int(_get('rate_limit', 'login', '10'))
RATE_LIMIT_WINDOW = int(_get('rate_limit', 'window_seconds', '300'))

# CORS
CORS_ORIGINS = _get('cors', 'origins', '*')

# Email (simulated)
EMAIL_ENABLED = _config.getboolean('email', 'enabled', fallback=False)
EMAIL_FROM = _get('email', 'from', 'noreply@flightbooking.demo')

# Logging
LOG_LEVEL = _get('logging', 'level', 'INFO')
LOG_FILE = _get('logging', 'file', '')
