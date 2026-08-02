import uuid
import datetime

from core.exceptions import NotFoundError, AuthorizationError, BusinessError
from database.connection import get_db, transaction
from repositories import booking_repo, payment_repo, flight_repo, audit_repo
from utils.code_generator import generate_pnr, generate_ticket_number


def _assert_booking_access(db, booking_id: str, user_ctx: dict):
    booking = booking_repo.find_booking(db, booking_id)
    if not booking:
        raise NotFoundError('Booking')
    if user_ctx['role'] == 'CUSTOMER' and booking['user_id'] != user_ctx['user_id']:
        raise AuthorizationError()
    return booking


def _confirm_booking(db, booking_id: str, user_id: str) -> str:
    """Issue PNR, mark seats BOOKED, reduce inventory, generate e-tickets, send notification."""
    pnr = generate_pnr()
    while booking_repo.find_booking_by_pnr(db, pnr):
        pnr = generate_pnr()

    booking_repo.update_booking_pnr_and_status(db, booking_id, pnr, 'CONFIRMED')
    booking_repo.add_status_history(db, booking_id, 'PAYMENT_PROCESSING', 'CONFIRMED', changed_by=user_id)

    seat_assigns = booking_repo.get_seat_assignments(db, booking_id)
    for sa in seat_assigns:
        flight_repo.update_seat_status(db, sa['seat_id'], 'BOOKED')

    segs = booking_repo.get_booking_segments_simple(db, booking_id)
    pax_count = booking_repo.count_booking_passengers(db, booking_id)
    for seg in segs:
        flight_repo.reduce_fare_inventory(db, seg['fare_id'], pax_count)

    pax_list = booking_repo.get_booking_passengers(db, booking_id)
    for pax in pax_list:
        ticket_num = generate_ticket_number(pnr, pax['passenger_index'])
        booking_repo.create_e_ticket(db, str(uuid.uuid4()), booking_id, pax['id'], ticket_num)

    booking = booking_repo.find_booking(db, booking_id)
    if booking and booking['user_id']:
        from repositories import notification_repo
        notification_repo.create_notification(
            db, booking['user_id'], 'SUCCESS', 'Booking Confirmed',
            f'Your booking {pnr} has been confirmed. Have a great flight!',
            'BOOKING', booking_id
        )

    return pnr


def create_payment(booking_id: str, user_ctx: dict, payment_method: str,
                   idempotency_key: str | None, ip: str) -> dict:
    db = get_db()
    if idempotency_key:
        existing = payment_repo.find_payment_by_idempotency(db, idempotency_key)
        if existing:
            return dict(existing)

    booking = _assert_booking_access(db, booking_id, user_ctx)
    if booking['status'] != 'PENDING_PAYMENT':
        raise BusinessError('PAYMENT_NOT_ALLOWED', f'Booking status is {booking["status"]}')
    if payment_method not in ('CARD', 'MOMO', 'BANK_TRANSFER'):
        from core.exceptions import ValidationError
        raise ValidationError('Invalid payment method')

    pid = str(uuid.uuid4())

    with transaction(db):
        booking_repo.update_booking_status(db, booking_id, 'PAYMENT_PROCESSING')
        booking_repo.add_status_history(db, booking_id, 'PENDING_PAYMENT', 'PAYMENT_PROCESSING',
                                        changed_by=user_ctx['user_id'])
        payment_repo.create_payment(db, pid, booking_id, booking['total_amount'],
                                    booking['currency'], payment_method, idempotency_key)
        payment_repo.add_transaction(db, pid, 'INITIATED', booking['total_amount'])
        audit_repo.log(db, user_ctx['user_id'], 'CREATE_PAYMENT', 'payments', pid, ip=ip)

    return {'id': pid, 'status': 'PENDING',
            'amount': booking['total_amount'], 'currency': booking['currency']}


def get_payment(payment_id: str, user_ctx: dict) -> dict:
    db = get_db()
    payment = payment_repo.find_payment(db, payment_id)
    if not payment:
        raise NotFoundError('Payment')
    booking = booking_repo.find_booking(db, payment['booking_id'])
    if user_ctx['role'] == 'CUSTOMER' and booking['user_id'] != user_ctx['user_id']:
        raise AuthorizationError()
    return dict(payment)


def simulate_success(payment_id: str, user_ctx: dict, ip: str) -> dict:
    db = get_db()
    payment = payment_repo.find_payment(db, payment_id)
    if not payment:
        raise NotFoundError('Payment')
    _assert_booking_access(db, payment['booking_id'], user_ctx)
    if payment['status'] != 'PENDING':
        raise BusinessError('PAYMENT_ALREADY_PROCESSED', f'Payment status is {payment["status"]}')

    with transaction(db):
        payment_repo.update_payment_status(db, payment_id, 'SUCCESS')
        payment_repo.add_transaction(db, payment_id, 'SUCCESS', payment['amount'])
        pnr = _confirm_booking(db, payment['booking_id'], user_ctx['user_id'])
        audit_repo.log(db, user_ctx['user_id'], 'PAYMENT_SUCCESS', 'payments', payment_id, ip=ip)

    return {'status': 'SUCCESS', 'pnr': pnr, 'message': 'Payment simulated successfully'}


def simulate_failure(payment_id: str, user_ctx: dict, ip: str) -> dict:
    db = get_db()
    payment = payment_repo.find_payment(db, payment_id)
    if not payment:
        raise NotFoundError('Payment')
    booking = _assert_booking_access(db, payment['booking_id'], user_ctx)
    if payment['status'] != 'PENDING':
        raise BusinessError('PAYMENT_ALREADY_PROCESSED', 'Payment already processed')

    with transaction(db):
        payment_repo.update_payment_status(db, payment_id, 'FAILED')
        booking_repo.update_booking_status(db, payment['booking_id'], 'PAYMENT_FAILED')
        payment_repo.add_transaction(db, payment_id, 'FAILED', payment['amount'])
        booking_repo.add_status_history(db, payment['booking_id'], 'PAYMENT_PROCESSING', 'PAYMENT_FAILED')
        audit_repo.log(db, user_ctx['user_id'], 'PAYMENT_FAILED', 'payments', payment_id, ip=ip)

    return {'status': 'FAILED'}


def retry_payment(payment_id: str, user_ctx: dict) -> dict:
    db = get_db()
    payment = payment_repo.find_payment(db, payment_id)
    if not payment:
        raise NotFoundError('Payment')
    if payment['status'] not in ('FAILED',):
        raise BusinessError('CANNOT_RETRY', f'Payment in status {payment["status"]} cannot be retried')

    booking = booking_repo.find_booking(db, payment['booking_id'])

    with transaction(db):
        payment_repo.update_payment_status(db, payment_id, 'PENDING')
        booking_repo.update_booking_status(db, payment['booking_id'], 'PAYMENT_PROCESSING')
        payment_repo.add_transaction(db, payment_id, 'RETRY', payment['amount'])
        booking_repo.add_status_history(db, payment['booking_id'], booking['status'], 'PAYMENT_PROCESSING')

    return {'id': payment_id, 'status': 'PENDING', 'message': 'Payment retried'}


def get_transactions(payment_id: str, user_ctx: dict) -> list:
    db = get_db()
    payment = payment_repo.find_payment(db, payment_id)
    if not payment:
        raise NotFoundError('Payment')
    rows = payment_repo.get_transactions(db, payment_id)
    return [dict(r) for r in rows]
