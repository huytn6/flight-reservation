#!/usr/bin/env python3
"""Main entry point for the flight booking backend."""
import logging
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

import config
from database.connection import init_schema
from core import router, middleware

# Configure logging
log_handlers = [logging.StreamHandler()]
if config.LOG_FILE:
    log_handlers.append(logging.FileHandler(config.LOG_FILE))

logging.basicConfig(
    level=getattr(logging, config.LOG_LEVEL.upper(), logging.INFO),
    format='%(asctime)s %(levelname)s %(name)s %(message)s',
    handlers=log_handlers
)
logger = logging.getLogger(__name__)

# Import all controllers to register routes
import controllers.auth_controller       # noqa: F401
import controllers.user_controller       # noqa: F401
import controllers.airport_controller    # noqa: F401
import controllers.flight_controller     # noqa: F401
import controllers.price_alert_controller # noqa: F401
import controllers.draft_controller      # noqa: F401
import controllers.booking_controller    # noqa: F401
import controllers.payment_controller    # noqa: F401
import controllers.support_controller    # noqa: F401
import controllers.review_controller     # noqa: F401
import controllers.notification_controller # noqa: F401
import controllers.staff_controller      # noqa: F401
import controllers.admin_controller      # noqa: F401
import controllers.health_controller     # noqa: F401


class RequestHandler(BaseHTTPRequestHandler):

    def log_message(self, format, *args):
        # Suppress default access log; we handle it ourselves
        pass

    def _dispatch(self):
        middleware.assign_request_id(self)
        middleware.log_request(self)
        router.dispatch(self)

    def do_GET(self):    self._dispatch()
    def do_POST(self):   self._dispatch()
    def do_PUT(self):    self._dispatch()
    def do_PATCH(self):  self._dispatch()
    def do_DELETE(self): self._dispatch()
    def do_OPTIONS(self): self._dispatch()


def setup_scheduler():
    from core.scheduler import register, start
    from services.background_jobs import (
        release_expired_seats, expire_drafts, price_alert_checker,
        update_flight_status, mark_bookings_completed, notification_dispatcher,
        extend_flight_schedule
    )
    register('release_expired_seats', 30, release_expired_seats)
    register('expire_drafts', 60, expire_drafts)
    register('price_alert_checker', 300, price_alert_checker)
    register('update_flight_status', 60, update_flight_status)
    register('mark_bookings_completed', 300, mark_bookings_completed)
    register('notification_dispatcher', 15, notification_dispatcher)
    # Runs immediately on startup (scheduler fires any job whose last_run is 0
    # right away), then every 6h — keeps the schedule topped up automatically.
    register('extend_flight_schedule', 6 * 3600, extend_flight_schedule)
    start()


def main():
    if config.RUN_SCHEMA_INIT:
        logger.info('Initializing database schema...')
        init_schema()

    if config.RUN_SCHEDULER:
        logger.info('Starting scheduler...')
        setup_scheduler()

    addr = (config.HOST, config.PORT)
    server = ThreadingHTTPServer(addr, RequestHandler)
    logger.info('Server running at http://%s:%d%s', config.HOST, config.PORT, config.BASE_URL)
    print(f'\n  Flight Booking API')
    print(f'  ==================')
    print(f'  Base URL : http://localhost:{config.PORT}{config.BASE_URL}')
    print(f'  Health   : http://localhost:{config.PORT}{config.BASE_URL}/airports')
    print(f'\n  Demo accounts:')
    print(f'    customer@example.com / Customer@123')
    print(f'    staff@example.com    / Staff@123')
    print(f'    admin@example.com    / Admin@123')
    print(f'\n  Press Ctrl+C to stop.\n')

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\nShutting down...')
        server.shutdown()


if __name__ == '__main__':
    main()
