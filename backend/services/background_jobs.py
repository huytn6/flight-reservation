"""Background scheduler jobs."""
import datetime
import logging

logger = logging.getLogger(__name__)


def _now():
    return datetime.datetime.utcnow().isoformat()


def release_expired_seats():
    from database.connection import get_db
    from repositories import booking_repo, flight_repo
    db = get_db()
    now = _now()
    expired = booking_repo.get_expired_seat_holds(db, now)
    if not expired:
        return
    booking_repo.release_expired_seat_holds(db, now)
    for row in expired:
        flight_repo.update_seat_status(db, row['seat_id'], 'AVAILABLE')
    db.commit()
    logger.info('Released %d expired seat holds', len(expired))


def expire_drafts():
    from database.connection import get_db
    db = get_db()
    now = _now()
    db.execute(
        "UPDATE booking_drafts SET status='EXPIRED', updated_at=? WHERE status='ACTIVE' AND expires_at < ?",
        (now, now)
    )
    db.commit()


def price_alert_checker():
    from database.connection import get_db
    from repositories import price_alert_repo, notification_repo
    db = get_db()
    alerts = price_alert_repo.list_active_alerts(db)
    for alert in alerts:
        row = db.execute(
            """SELECT MIN(fa.base_price + fa.tax + fa.fees) as min_price
               FROM airports dep JOIN airports arr ON 1=1
               JOIN flights f ON f.departure_airport_id=dep.id AND f.arrival_airport_id=arr.id
               JOIN fares fa ON fa.flight_id=f.id
               JOIN fare_inventories fi ON fi.fare_id=fa.id
               WHERE dep.iata_code=? AND arr.iata_code=? AND DATE(f.departure_time)=? AND fi.available_seats>0""",
            (alert['origin_iata'], alert['destination_iata'], alert['departure_date'])
        ).fetchone()
        price = row['min_price'] if row else None
        if price is not None:
            max_price = alert.get('max_price')
            price_alert_repo.add_history_entry(db, alert['id'], price)
            if max_price and price <= max_price:
                origin = alert['origin_iata']
                dest = alert['destination_iata']
                dep_date = alert['departure_date']
                notification_repo.create_notification(
                    db, alert['user_id'], 'ALERT',
                    'Price Alert: Price Drop!',
                    f'Flight {origin}→{dest} on {dep_date} is now {price:,} VND',
                    'PRICE_ALERT', alert['id']
                )
    db.commit()


def update_flight_status():
    from database.connection import get_db
    db = get_db()
    now = _now()
    db.execute(
        "UPDATE flights SET status='DEPARTED', updated_at=? WHERE status='SCHEDULED' AND departure_time < ?",
        (now, now)
    )
    db.execute(
        "UPDATE flights SET status='ARRIVED', updated_at=? WHERE status='DEPARTED' AND arrival_time < ?",
        (now, now)
    )
    db.commit()


def mark_bookings_completed():
    from database.connection import get_db
    from repositories import booking_repo
    db = get_db()
    now = _now()
    completed = db.execute(
        """SELECT DISTINCT b.id
           FROM bookings b
           JOIN booking_segments bs ON bs.booking_id=b.id
           JOIN flights f ON f.id=bs.flight_id
           WHERE b.status='CONFIRMED'
           GROUP BY b.id
           HAVING COUNT(f.id) = COUNT(CASE WHEN f.status='ARRIVED' THEN 1 END)"""
    ).fetchall()
    for row in completed:
        booking_repo.update_booking_status(db, row['id'], 'COMPLETED')
        booking_repo.add_status_history(db, row['id'], 'CONFIRMED', 'COMPLETED',
                                        changed_by='SYSTEM', reason=None)
    if completed:
        db.commit()
        logger.info('Marked %d bookings as COMPLETED', len(completed))


def notification_dispatcher():
    pass
