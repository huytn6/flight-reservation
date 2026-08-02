import json
import uuid
import datetime
from core.router import route
from core import response, request as req, authentication as auth, validation as val
from database.connection import get_db, transaction
from utils.code_generator import generate_pnr, generate_ticket_number


def _audit(db, user_id, action, resource, resource_id=None, details=None, ip=None):
    db.execute(
        "INSERT INTO audit_logs(id,user_id,action,resource,resource_id,details_json,ip_address,created_at) VALUES(?,?,?,?,?,?,?,?)",
        (str(uuid.uuid4()), user_id, action, resource, resource_id,
         json.dumps(details) if details else None, ip, datetime.datetime.utcnow().isoformat())
    )


def _booking_status_history(db, booking_id, from_status, to_status, changed_by=None, reason=None):
    db.execute(
        "INSERT INTO booking_status_histories(id,booking_id,from_status,to_status,reason,changed_by,created_at) VALUES(?,?,?,?,?,?,?)",
        (str(uuid.uuid4()), booking_id, from_status, to_status, reason, changed_by, datetime.datetime.utcnow().isoformat())
    )


def _confirm_booking(db, booking_id, user_id):
    """Issue PNR, BOOKED seats, generate e-tickets after payment success."""
    now = datetime.datetime.utcnow().isoformat()
    booking = db.execute("SELECT * FROM bookings WHERE id=?", (booking_id,)).fetchone()

    # Generate PNR
    pnr = generate_pnr()
    # Ensure unique
    while db.execute("SELECT id FROM bookings WHERE pnr=?", (pnr,)).fetchone():
        pnr = generate_pnr()

    db.execute("UPDATE bookings SET pnr=?, status='CONFIRMED', updated_at=? WHERE id=?", (pnr, now, booking_id))
    _booking_status_history(db, booking_id, 'PAYMENT_PROCESSING', 'CONFIRMED', changed_by=user_id)

    # Book seats
    seat_assigns = db.execute("SELECT seat_id FROM seat_assignments WHERE booking_id=?", (booking_id,)).fetchall()
    for sa in seat_assigns:
        db.execute("UPDATE seats SET status='BOOKED', updated_at=? WHERE id=?", (now, sa['seat_id']))

    # Reduce fare inventory
    segments = db.execute("SELECT fare_id FROM booking_segments WHERE booking_id=?", (booking_id,)).fetchall()
    passengers = db.execute("SELECT count(*) as cnt FROM booking_passengers WHERE booking_id=?", (booking_id,)).fetchone()
    pax_count = passengers['cnt']
    for seg in segments:
        db.execute(
            "UPDATE fare_inventories SET available_seats=MAX(0,available_seats-?), updated_at=? WHERE fare_id=?",
            (pax_count, now, seg['fare_id'])
        )

    # Generate e-tickets
    pax_list = db.execute("SELECT * FROM booking_passengers WHERE booking_id=?", (booking_id,)).fetchall()
    for pax in pax_list:
        ticket_num = generate_ticket_number(pnr, pax['passenger_index'])
        db.execute(
            "INSERT INTO e_tickets(id,booking_id,passenger_id,ticket_number,status,issued_at,created_at) VALUES(?,?,?,?,?,?,?)",
            (str(uuid.uuid4()), booking_id, pax['id'], ticket_num, 'ISSUED', now, now)
        )

    # Notification
    if booking['user_id']:
        db.execute(
            "INSERT INTO notifications(id,user_id,title,body,type,reference_id,reference_type,created_at) VALUES(?,?,?,?,?,?,?,?)",
            (str(uuid.uuid4()), booking['user_id'], 'Booking Confirmed',
             f'Your booking {pnr} has been confirmed. Have a great flight!',
             'SUCCESS', booking_id, 'BOOKING', now)
        )

    return pnr


@route('POST', '/bookings/{booking_id}/payments')
def create_payment(handler, booking_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    idempotency_key = req.get_idempotency_key(handler)

    if idempotency_key:
        existing = db.execute("SELECT * FROM payments WHERE idempotency_key=?", (idempotency_key,)).fetchone()
        if existing:
            response.success(handler, dict(existing))
            return

    booking = db.execute("SELECT * FROM bookings WHERE id=?", (booking_id,)).fetchone()
    if not booking:
        from core.exceptions import NotFoundError
        raise NotFoundError('Booking')
    if user['role'] == 'CUSTOMER' and booking['user_id'] != user['user_id']:
        from core.exceptions import AuthorizationError
        raise AuthorizationError()
    if booking['status'] != 'PENDING_PAYMENT':
        from core.exceptions import BusinessError
        raise BusinessError('PAYMENT_NOT_ALLOWED', f'Booking status is {booking["status"]}')

    data = req.parse_json_body(handler)
    val.require_fields(data, 'payment_method')
    if data['payment_method'] not in ('CARD', 'MOMO', 'BANK_TRANSFER'):
        from core.exceptions import ValidationError
        raise ValidationError('Invalid payment method')

    pid = str(uuid.uuid4())
    now = datetime.datetime.utcnow().isoformat()

    with transaction(db):
        db.execute("UPDATE bookings SET status='PAYMENT_PROCESSING', updated_at=? WHERE id=?", (now, booking_id))
        _booking_status_history(db, booking_id, 'PENDING_PAYMENT', 'PAYMENT_PROCESSING', changed_by=user['user_id'])
        db.execute(
            "INSERT INTO payments(id,booking_id,amount,currency,payment_method,status,idempotency_key,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)",
            (pid, booking_id, booking['total_amount'], booking['currency'], data['payment_method'], 'PENDING', idempotency_key, now, now)
        )
        db.execute(
            "INSERT INTO payment_transactions(id,payment_id,event_type,amount,created_at) VALUES(?,?,?,?,?)",
            (str(uuid.uuid4()), pid, 'INITIATED', booking['total_amount'], now)
        )
        _audit(db, user['user_id'], 'CREATE_PAYMENT', 'payments', pid, ip=handler.client_address[0])

    response.created(handler, {'id': pid, 'status': 'PENDING', 'amount': booking['total_amount'], 'currency': booking['currency']})


@route('GET', '/payments/{payment_id}')
def get_payment(handler, payment_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    payment = db.execute("SELECT * FROM payments WHERE id=?", (payment_id,)).fetchone()
    if not payment:
        from core.exceptions import NotFoundError
        raise NotFoundError('Payment')
    # Authorization check
    booking = db.execute("SELECT user_id FROM bookings WHERE id=?", (payment['booking_id'],)).fetchone()
    if user['role'] == 'CUSTOMER' and booking['user_id'] != user['user_id']:
        from core.exceptions import AuthorizationError
        raise AuthorizationError()
    response.success(handler, dict(payment))


@route('POST', '/payments/{payment_id}/simulate-success')
def simulate_success(handler, payment_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    payment = db.execute("SELECT * FROM payments WHERE id=?", (payment_id,)).fetchone()
    if not payment:
        from core.exceptions import NotFoundError
        raise NotFoundError('Payment')
    booking = db.execute("SELECT * FROM bookings WHERE id=?", (payment['booking_id'],)).fetchone()
    if user['role'] == 'CUSTOMER' and booking['user_id'] != user['user_id']:
        from core.exceptions import AuthorizationError
        raise AuthorizationError()
    if payment['status'] != 'PENDING':
        from core.exceptions import BusinessError
        raise BusinessError('PAYMENT_ALREADY_PROCESSED', f'Payment status is {payment["status"]}')

    now = datetime.datetime.utcnow().isoformat()
    with transaction(db):
        db.execute("UPDATE payments SET status='SUCCESS', updated_at=? WHERE id=?", (now, payment_id))
        db.execute(
            "INSERT INTO payment_transactions(id,payment_id,event_type,amount,created_at) VALUES(?,?,?,?,?)",
            (str(uuid.uuid4()), payment_id, 'SUCCESS', payment['amount'], now)
        )
        pnr = _confirm_booking(db, payment['booking_id'], user['user_id'])
        _audit(db, user['user_id'], 'PAYMENT_SUCCESS', 'payments', payment_id, ip=handler.client_address[0])

    response.success(handler, {'status': 'SUCCESS', 'pnr': pnr, 'message': 'Payment simulated successfully'})


@route('POST', '/payments/{payment_id}/simulate-failure')
def simulate_failure(handler, payment_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    payment = db.execute("SELECT * FROM payments WHERE id=?", (payment_id,)).fetchone()
    if not payment:
        from core.exceptions import NotFoundError
        raise NotFoundError('Payment')
    booking = db.execute("SELECT * FROM bookings WHERE id=?", (payment['booking_id'],)).fetchone()
    if user['role'] == 'CUSTOMER' and booking['user_id'] != user['user_id']:
        from core.exceptions import AuthorizationError
        raise AuthorizationError()
    if payment['status'] != 'PENDING':
        from core.exceptions import BusinessError
        raise BusinessError('PAYMENT_ALREADY_PROCESSED', 'Payment already processed')

    now = datetime.datetime.utcnow().isoformat()
    with transaction(db):
        db.execute("UPDATE payments SET status='FAILED', updated_at=? WHERE id=?", (now, payment_id))
        db.execute("UPDATE bookings SET status='PAYMENT_FAILED', updated_at=? WHERE id=?", (now, payment['booking_id']))
        db.execute(
            "INSERT INTO payment_transactions(id,payment_id,event_type,amount,created_at) VALUES(?,?,?,?,?)",
            (str(uuid.uuid4()), payment_id, 'FAILED', payment['amount'], now)
        )
        _booking_status_history(db, payment['booking_id'], 'PAYMENT_PROCESSING', 'PAYMENT_FAILED')
        _audit(db, user['user_id'], 'PAYMENT_FAILED', 'payments', payment_id, ip=handler.client_address[0])

    response.success(handler, {'status': 'FAILED'})


@route('POST', '/payments/{payment_id}/retry')
def retry_payment(handler, payment_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    payment = db.execute("SELECT * FROM payments WHERE id=?", (payment_id,)).fetchone()
    if not payment:
        from core.exceptions import NotFoundError
        raise NotFoundError('Payment')
    if payment['status'] not in ('FAILED',):
        from core.exceptions import BusinessError
        raise BusinessError('CANNOT_RETRY', f'Payment in status {payment["status"]} cannot be retried')

    now = datetime.datetime.utcnow().isoformat()
    booking = db.execute("SELECT * FROM bookings WHERE id=?", (payment['booking_id'],)).fetchone()

    with transaction(db):
        db.execute("UPDATE payments SET status='PENDING', updated_at=? WHERE id=?", (now, payment_id))
        db.execute("UPDATE bookings SET status='PAYMENT_PROCESSING', updated_at=? WHERE id=?", (now, payment['booking_id']))
        db.execute(
            "INSERT INTO payment_transactions(id,payment_id,event_type,amount,created_at) VALUES(?,?,?,?,?)",
            (str(uuid.uuid4()), payment_id, 'RETRY', payment['amount'], now)
        )
        _booking_status_history(db, payment['booking_id'], booking['status'], 'PAYMENT_PROCESSING')

    response.success(handler, {'id': payment_id, 'status': 'PENDING', 'message': 'Payment retried'})


@route('GET', '/payments/{payment_id}/transactions')
def get_transactions(handler, payment_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    payment = db.execute("SELECT * FROM payments WHERE id=?", (payment_id,)).fetchone()
    if not payment:
        from core.exceptions import NotFoundError
        raise NotFoundError('Payment')
    rows = db.execute("SELECT * FROM payment_transactions WHERE payment_id=? ORDER BY created_at", (payment_id,)).fetchall()
    response.success(handler, [dict(r) for r in rows])
