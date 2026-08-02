from core.router import route
from core import response, request as req, authentication as auth, validation as val
from database.connection import get_db
from services import payment_service


@route('POST', '/bookings/{booking_id}/payments')
def create_payment(handler, booking_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    idempotency_key = req.get_idempotency_key(handler)
    data = req.parse_json_body(handler)
    val.require_fields(data, 'payment_method')
    result = payment_service.create_payment(booking_id, user, data['payment_method'],
                                            idempotency_key, handler.client_address[0])
    response.created(handler, result)


@route('GET', '/payments/{payment_id}')
def get_payment(handler, payment_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    result = payment_service.get_payment(payment_id, user)
    response.success(handler, result)


@route('POST', '/payments/{payment_id}/simulate-success')
def simulate_success(handler, payment_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    result = payment_service.simulate_success(payment_id, user, handler.client_address[0])
    response.success(handler, result)


@route('POST', '/payments/{payment_id}/simulate-failure')
def simulate_failure(handler, payment_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    result = payment_service.simulate_failure(payment_id, user, handler.client_address[0])
    response.success(handler, result)


@route('POST', '/payments/{payment_id}/retry')
def retry_payment(handler, payment_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    result = payment_service.retry_payment(payment_id, user)
    response.success(handler, result)


@route('GET', '/payments/{payment_id}/transactions')
def get_transactions(handler, payment_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    result = payment_service.get_transactions(payment_id, user)
    response.success(handler, result)
