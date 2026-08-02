"""Background scheduler jobs."""
import datetime
import logging
import uuid

logger = logging.getLogger(__name__)


def release_expired_seats():
    from database.connection import get_db
    db = get_db()
    now = datetime.datetime.utcnow().isoformat()
    expired = db.execute(
        "SELECT seat_id FROM seat_holds WHERE expires_at < ? AND released_at IS NULL",
        (now,)
    ).fetchall()
    if not expired:
        return
    db.execute("UPDATE seat_holds SET released_at=? WHERE expires_at < ? AND released_at IS NULL", (now, now))
    for row in expired:
        db.execute("UPDATE seats SET status='AVAILABLE', updated_at=? WHERE id=?", (now, row['seat_id']))
    db.commit()
    if expired:
        logger.info('Released %d expired seat holds', len(expired))


def expire_drafts():
    from database.connection import get_db
    db = get_db()
    now = datetime.datetime.utcnow().isoformat()
    db.execute(
        "UPDATE booking_drafts SET status='EXPIRED', updated_at=? WHERE status='ACTIVE' AND expires_at < ?",
        (now, now)
    )
    db.commit()


def price_alert_checker():
    from database.connection import get_db
    import random
    db = get_db()
    now = datetime.datetime.utcnow().isoformat()
    alerts = db.execute("SELECT * FROM price_alerts WHERE is_active=1").fetchall()
    for alert in alerts:
        # Simulate price check
        row = db.execute(
            """SELECT MIN(fa.base_price + fa.tax + fa.fees) as min_price
               FROM airports dep, airports arr
               JOIN flights f ON f.departure_airport_id=dep.id AND f.arrival_airport_id=arr.id
               JOIN fares fa ON fa.flight_id=f.id
               JOIN fare_inventories fi ON fi.fare_id=fa.id
               WHERE dep.iata_code=? AND arr.iata_code=? AND DATE(f.departure_time)=? AND fi.available_seats>0""",
            (alert['origin_iata'], alert['destination_iata'], alert['departure_date'])
        ).fetchone()
        price = row['min_price'] if row and row['min_price'] else None
        if price:
            db.execute(
                "INSERT INTO price_alert_histories(id,alert_id,price,recorded_at) VALUES(?,?,?,?)",
                (str(uuid.uuid4()), alert['id'], price, now)
            )
            if alert['max_price'] and price <= alert['max_price']:
                db.execute(
                    "INSERT INTO notifications(id,user_id,title,body,type,reference_id,reference_type,created_at) VALUES(?,?,?,?,?,?,?,?)",
                    (str(uuid.uuid4()), alert['user_id'],
                     'Price Alert: Price Drop!',
                     f'Flight {alert["origin_iata"]}→{alert["destination_iata"]} on {alert["departure_date"]} is now {price:,} VND',
                     'ALERT', alert['id'], 'PRICE_ALERT', now)
                )
    db.commit()


def update_flight_status():
    from database.connection import get_db
    db = get_db()
    now_dt = datetime.datetime.utcnow()
    now = now_dt.isoformat()
    # Auto-transition flights based on time
    # DEPARTED: departed in past
    db.execute(
        "UPDATE flights SET status='DEPARTED', updated_at=? WHERE status='SCHEDULED' AND departure_time < ?",
        (now, now)
    )
    # ARRIVED: arrived in past
    db.execute(
        "UPDATE flights SET status='ARRIVED', updated_at=? WHERE status='DEPARTED' AND arrival_time < ?",
        (now, now)
    )
    db.commit()


def mark_bookings_completed():
    from database.connection import get_db
    db = get_db()
    now = datetime.datetime.utcnow().isoformat()
    # Bookings where all flights have ARRIVED
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
        db.execute("UPDATE bookings SET status='COMPLETED', updated_at=? WHERE id=?", (now, row['id']))
        db.execute(
            "INSERT INTO booking_status_histories(id,booking_id,from_status,to_status,changed_by,created_at) VALUES(?,?,?,?,?,?)",
            (str(uuid.uuid4()), row['id'], 'CONFIRMED', 'COMPLETED', 'SYSTEM', now)
        )
    if completed:
        db.commit()
        logger.info('Marked %d bookings as COMPLETED', len(completed))


def notification_dispatcher():
    # Notification dispatcher is a no-op in this demo — notifications are stored in DB
    pass
