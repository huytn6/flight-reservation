import logging
from core.router import route
from core import response, request as req, authentication as auth, validation as val, middleware
from database.connection import get_db
from services import booking_service, flight_service

logger = logging.getLogger(__name__)


@route('POST', '/bookings')
def create_booking(handler):
    db = get_db()
    user = auth.require_auth(handler, db)
    idempotency_key = req.get_idempotency_key(handler)
    data = req.parse_json_body(handler)
    val.require_fields(data, 'draft_id')
    result = booking_service.create_booking(user, data['draft_id'], idempotency_key,
                                            handler.client_address[0])
    response.created(handler, result, 'Booking created')


@route('GET', '/bookings/{booking_id}')
def get_booking(handler, booking_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    result = booking_service.get_booking(booking_id, user)
    response.success(handler, result)


@route('GET', '/users/me/bookings')
def my_bookings(handler):
    db = get_db()
    user = auth.require_auth(handler, db)
    page, size = req.get_pagination(handler)
    status_filter = req.get_query_param(handler, 'status')
    result = booking_service.list_my_bookings(user['user_id'], status_filter, page, size)
    response.success(handler, result)


@route('GET', '/users/me/bookings/{booking_id}')
def my_booking_detail(handler, booking_id):
    return get_booking(handler, booking_id)


@route('GET', '/users/me/bookings/{booking_id}/history')
def my_booking_history(handler, booking_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    result = booking_service.get_status_history(booking_id, user)
    response.success(handler, result)


@route('GET', '/users/me/bookings/{booking_id}/printable')
def my_booking_printable(handler, booking_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    result = booking_service.get_printable(booking_id, user)
    response.success(handler, result)


@route('POST', '/users/me/bookings/{booking_id}/resend-confirmation')
def resend_confirmation(handler, booking_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    booking = booking_service.get_booking(booking_id, user)
    logger.info('Resend confirmation for booking %s to %s', booking_id,
                booking['booking'].get('contact_email'))
    response.success(handler, None, 'Confirmation email sent (simulated)')


@route('POST', '/bookings/lookup')
def lookup_booking(handler):
    ip = handler.client_address[0]
    middleware.check_rate_limit(f'pnr_lookup:{ip}', 10, 300)
    data = req.parse_json_body(handler)
    val.require_fields(data, 'pnr', 'last_name')
    result = booking_service.lookup_booking(data['pnr'], data['last_name'])
    response.success(handler, result)


@route('GET', '/bookings/{booking_id}/itinerary')
def get_itinerary(handler, booking_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    result = booking_service.get_itinerary(booking_id, user)
    response.success(handler, result)


@route('GET', '/bookings/{booking_id}/e-tickets')
def get_etickets(handler, booking_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    result = booking_service.get_etickets(booking_id, user)
    response.success(handler, result)


@route('GET', '/bookings/{booking_id}/e-tickets/{ticket_id}')
def get_eticket(handler, booking_id, ticket_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    result = booking_service.get_eticket(booking_id, ticket_id, user)
    response.success(handler, result)


@route('GET', '/bookings/{booking_id}/receipt')
def get_receipt(handler, booking_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    result = booking_service.get_receipt(booking_id, user)
    response.success(handler, result)


@route('POST', '/bookings/{booking_id}/documents/send-email')
def send_documents_email(handler, booking_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    booking_service.get_booking(booking_id, user)  # verify access
    logger.info('Sending documents for booking %s', booking_id)
    response.success(handler, None, 'Documents sent by email (simulated)')


@route('POST', '/users/me/bookings/{booking_id}/cancellation-preview')
def cancellation_preview(handler, booking_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    result = booking_service.cancellation_preview(booking_id, user)
    response.success(handler, result)


@route('POST', '/users/me/bookings/{booking_id}/cancel')
def cancel_booking(handler, booking_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    data = req.parse_json_body(handler)
    result = booking_service.cancel_booking(booking_id, user, data.get('reason', 'Customer request'),
                                            handler.client_address[0])
    response.success(handler, result)


@route('GET', '/users/me/bookings/{booking_id}/cancellation')
def get_cancellation(handler, booking_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    result = booking_service.get_cancellation(booking_id, user)
    response.success(handler, result)


@route('GET', '/bookings/{booking_id}/refund-preview')
def refund_preview(handler, booking_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    result = booking_service.cancellation_preview(booking_id, user)
    response.success(handler, {'refund_amount': result['refund_amount'], 'currency': 'VND',
                               'fee': result['cancellation_fee']})


@route('POST', '/bookings/{booking_id}/refunds')
def create_refund(handler, booking_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    data = req.parse_json_body(handler)
    result = booking_service.create_refund(booking_id, user, data.get('amount'), data.get('reason'))
    response.created(handler, result)


@route('GET', '/bookings/{booking_id}/refunds')
def get_refunds(handler, booking_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    result = booking_service.get_refunds(booking_id, user)
    response.success(handler, result)


@route('GET', '/refunds/{refund_id}')
def get_refund(handler, refund_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    result = booking_service.get_refund(refund_id, user)
    response.success(handler, result)


@route('GET', '/bookings/{booking_id}/check-in')
def check_in_link(handler, booking_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    result = booking_service.get_booking(booking_id, user)
    booking = result['booking']
    if booking['status'] != 'CONFIRMED':
        from core.exceptions import BusinessError
        raise BusinessError('NOT_CONFIRMED', 'Booking must be confirmed for check-in')
    response.success(handler, {
        'check_in_url': f'https://demo-airline.example.com/check-in/{booking["pnr"]}',
        'opens_at': '24 hours before departure',
        'note': 'Simulated check-in link',
    })


@route('GET', '/bookings/{booking_id}/flight-status')
def flight_status(handler, booking_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    result = booking_service.get_flight_status(booking_id, user)
    response.success(handler, result)


@route('GET', '/bookings/{booking_id}/travel-alerts')
def travel_alerts(handler, booking_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    booking_service.get_booking(booking_id, user)  # verify access
    response.success(handler, [
        {'type': 'INFO', 'title': 'Check-in Open',
         'message': 'Online check-in opens 24 hours before departure'},
    ])


@route('POST', '/users/me/bookings/{booking_id}/change-search')
def change_search(handler, booking_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    booking_result = booking_service.get_booking(booking_id, user)
    if booking_result['booking']['status'] != 'CONFIRMED':
        from core.exceptions import BusinessError
        raise BusinessError('CANNOT_CHANGE', 'Booking must be confirmed to change')
    data = req.parse_json_body(handler)
    result = flight_service.search_flights(data)
    response.success(handler, result)


@route('POST', '/users/me/bookings/{booking_id}/change-quote')
def change_quote(handler, booking_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    data = req.parse_json_body(handler)
    val.require_fields(data, 'new_fare_id')
    result = booking_service.change_quote(booking_id, user, data['new_fare_id'])
    response.success(handler, result)


@route('POST', '/users/me/bookings/{booking_id}/change-confirm')
def change_confirm(handler, booking_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    data = req.parse_json_body(handler)
    val.require_fields(data, 'new_fare_id', 'new_flight_id')
    result = booking_service.change_confirm(booking_id, user, data['new_fare_id'],
                                            data['new_flight_id'], data.get('old_flight_id'),
                                            handler.client_address[0])
    response.success(handler, result)


@route('GET', '/users/me/bookings/{booking_id}/change-status')
def change_status(handler, booking_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    result = booking_service.get_change_status(booking_id, user)
    response.success(handler, result)


@route('GET', '/users/me/bookings/{booking_id}/segments/{segment_id}/seat-map')
def post_booking_seat_map(handler, booking_id, segment_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    result = booking_service.get_post_booking_seat_map(booking_id, segment_id, user)
    response.success(handler, result)


@route('POST', '/users/me/bookings/{booking_id}/seat-change-preview')
def seat_change_preview(handler, booking_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    data = req.parse_json_body(handler)
    result = booking_service.seat_change_preview(booking_id, user, data.get('seat_id'))
    response.success(handler, result)


@route('POST', '/users/me/bookings/{booking_id}/seat-change-confirm')
def seat_change_confirm(handler, booking_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    data = req.parse_json_body(handler)
    val.require_fields(data, 'segment_id', 'passenger_id', 'new_seat_id')
    booking_service.seat_change_confirm(booking_id, user, data['segment_id'],
                                        data['passenger_id'], data['new_seat_id'],
                                        handler.client_address[0])
    response.success(handler, None, 'Seat changed successfully')
