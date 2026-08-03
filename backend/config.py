import configparser
import os

_config = configparser.ConfigParser()
BASE_DIR = os.path.dirname(__file__)
CONFIG_FILE = os.environ.get('APP_CONFIG_FILE', 'config.local.ini')
if not os.path.isabs(CONFIG_FILE):
    CONFIG_FILE = os.path.join(BASE_DIR, CONFIG_FILE)
_config.read(CONFIG_FILE)

def _get(section, key, fallback, env_name=None):
    if env_name and env_name in os.environ:
        return os.environ[env_name]
    return _config.get(section, key, fallback=fallback)

# Server
HOST = _get('server', 'host', '0.0.0.0', 'APP_HOST')
PORT = int(_get('server', 'port', '8000', 'APP_PORT'))
BASE_URL = _get('server', 'base_url', '/api/v1', 'APP_BASE_URL')
RUN_SCHEMA_INIT = _get('server', 'run_schema_init', 'true', 'RUN_SCHEMA_INIT').lower() in ('1', 'true', 'yes')
RUN_SCHEDULER = _get('server', 'run_scheduler', 'true', 'RUN_SCHEDULER').lower() in ('1', 'true', 'yes')

# Database (MySQL)
DB_HOST = _get('database', 'host', 'localhost', 'DB_HOST')
DB_PORT = int(_get('database', 'port', '3308', 'DB_PORT'))
DB_USER = _get('database', 'user', 'root', 'DB_USER')
DB_PASSWORD = _get('database', 'password', 'root', 'DB_PASSWORD')
DB_NAME = _get('database', 'name', 'flight_booking', 'DB_NAME')

# Security
TOKEN_LENGTH = 32
SESSION_EXPIRE_HOURS = int(_get('security', 'session_expire_hours', '24', 'SESSION_EXPIRE_HOURS'))
RESET_TOKEN_EXPIRE_MINUTES = int(_get('security', 'reset_token_expire_minutes', '60', 'RESET_TOKEN_EXPIRE_MINUTES'))
PBKDF2_ITERATIONS = int(_get('security', 'pbkdf2_iterations', '260000', 'PBKDF2_ITERATIONS'))

# Seat hold
SEAT_HOLD_MINUTES = 15
DRAFT_EXPIRE_MINUTES = 30

# Rate limiting (requests per window)
RATE_LIMIT_LOGIN = int(_get('rate_limit', 'login', '10'))
RATE_LIMIT_WINDOW = int(_get('rate_limit', 'window_seconds', '300'))

# CORS
CORS_ORIGINS = _get('cors', 'origins', '*', 'CORS_ORIGINS')

# Email (simulated)
EMAIL_ENABLED = _config.getboolean('email', 'enabled', fallback=False)
EMAIL_FROM = _get('email', 'from', 'noreply@flightbooking.demo')

# Logging
LOG_LEVEL = _get('logging', 'level', 'INFO', 'LOG_LEVEL')
LOG_FILE = _get('logging', 'file', '', 'LOG_FILE')
