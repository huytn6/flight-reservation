from core.router import route
from core import response, request as req, authentication as auth, validation as val, middleware
from database.connection import get_db
from services import draft_service


@route('POST', '/booking-drafts')
def create_draft(handler):
    db = get_db()
    user = auth.require_auth(handler, db)
    data = req.parse_json_body(handler)
    val.require_fields(data, 'flights')
    result = draft_service.create_draft(user['user_id'], data['flights'])
    response.created(handler, result)


@route('GET', '/booking-drafts/{draft_id}')
def get_draft(handler, draft_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    result = draft_service.get_draft(draft_id, user['user_id'], user['role'])
    response.success(handler, result)


@route('DELETE', '/booking-drafts/{draft_id}')
def cancel_draft(handler, draft_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    draft_service.cancel_draft(draft_id, user['user_id'], user['role'])
    response.no_content(handler)


@route('POST', '/booking-drafts/{draft_id}/reprice')
def reprice_draft(handler, draft_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    result = draft_service.reprice_draft(draft_id, user['user_id'], user['role'])
    response.success(handler, result)


@route('GET', '/booking-drafts/{draft_id}/summary')
def draft_summary(handler, draft_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    result = draft_service.get_price_breakdown(draft_id, user['user_id'], user['role'])
    response.success(handler, result)


@route('PUT', '/booking-drafts/{draft_id}/contact')
def save_contact(handler, draft_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    data = req.parse_json_body(handler)
    val.require_fields(data, 'full_name', 'email', 'phone')
    email = val.validate_email(data['email'])
    phone = val.validate_phone(data['phone'])
    draft_service.save_contact(draft_id, user['user_id'], user['role'], data['full_name'], email, phone)
    response.success(handler, None, 'Contact saved')


@route('GET', '/booking-drafts/{draft_id}/passengers')
def get_passengers(handler, draft_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    result = draft_service.get_passengers(draft_id, user['user_id'], user['role'])
    response.success(handler, result)


@route('PUT', '/booking-drafts/{draft_id}/passengers')
def save_passengers(handler, draft_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    data = req.parse_json_body(handler)
    passengers = data if isinstance(data, list) else data.get('passengers', [])
    draft_service.save_passengers(draft_id, user['user_id'], user['role'], passengers)
    response.success(handler, None, 'Passengers saved')


@route('GET', '/booking-drafts/{draft_id}/segments/{segment_id}/seat-map')
def get_seat_map(handler, draft_id, segment_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    result = draft_service.get_seat_map(draft_id, segment_id, user['user_id'], user['role'])
    response.success(handler, result)


@route('GET', '/booking-drafts/{draft_id}/seat-holds')
def get_seat_holds(handler, draft_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    result = draft_service.get_seat_holds(draft_id, user['user_id'], user['role'])
    response.success(handler, result)


@route('POST', '/booking-drafts/{draft_id}/seat-holds')
def hold_seat(handler, draft_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    middleware.check_rate_limit(f'seat-hold:{handler.client_address[0]}', 30, 60)
    data = req.parse_json_body(handler)
    val.require_fields(data, 'seat_id', 'passenger_index')
    result = draft_service.hold_seat(draft_id, user['user_id'], user['role'],
                                     data['seat_id'], data['passenger_index'])
    response.created(handler, result)


@route('PATCH', '/booking-drafts/{draft_id}/seat-holds/{hold_id}')
def change_seat_hold(handler, draft_id, hold_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    data = req.parse_json_body(handler)
    if not data.get('seat_id'):
        from core.exceptions import ValidationError
        raise ValidationError('seat_id required')
    result = draft_service.change_seat_hold(draft_id, user['user_id'], user['role'],
                                            hold_id, data['seat_id'])
    response.success(handler, result)


@route('DELETE', '/booking-drafts/{draft_id}/seat-holds/{hold_id}')
def release_seat_hold(handler, draft_id, hold_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    draft_service.release_seat_hold(draft_id, user['user_id'], user['role'], hold_id)
    response.no_content(handler)


@route('GET', '/booking-drafts/{draft_id}/ancillaries')
def get_ancillaries(handler, draft_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    result = draft_service.get_ancillaries(draft_id, user['user_id'], user['role'])
    response.success(handler, result)


@route('POST', '/booking-drafts/{draft_id}/ancillaries')
def add_ancillary(handler, draft_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    data = req.parse_json_body(handler)
    result = draft_service.add_ancillary(draft_id, user['user_id'], user['role'], data)
    response.created(handler, result)


@route('PATCH', '/booking-drafts/{draft_id}/ancillaries/{item_id}')
def update_ancillary(handler, draft_id, item_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    data = req.parse_json_body(handler)
    if 'quantity' in data:
        draft_service.update_ancillary_quantity(draft_id, user['user_id'], user['role'],
                                                item_id, int(data['quantity']))
    response.success(handler, None, 'Updated')


@route('DELETE', '/booking-drafts/{draft_id}/ancillaries/{item_id}')
def delete_ancillary(handler, draft_id, item_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    draft_service.delete_ancillary(draft_id, user['user_id'], user['role'], item_id)
    response.no_content(handler)


@route('GET', '/booking-drafts/{draft_id}/insurance-options')
def insurance_options(handler, draft_id):
    db = get_db()
    auth.require_auth(handler, db)
    options = [
        {'code': 'BASIC', 'name': 'Basic', 'price': 150000, 'covers': ['Trip cancellation', 'Medical emergency']},
        {'code': 'FULL', 'name': 'Comprehensive', 'price': 350000,
         'covers': ['Trip cancellation', 'Medical emergency', 'Baggage loss', 'Flight delay']},
    ]
    response.success(handler, options)


@route('POST', '/booking-drafts/{draft_id}/insurance')
def add_insurance(handler, draft_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    data = req.parse_json_body(handler)
    val.require_fields(data, 'plan_code')
    result = draft_service.add_insurance(draft_id, user['user_id'], user['role'], data['plan_code'])
    response.created(handler, result)


@route('DELETE', '/booking-drafts/{draft_id}/insurance')
def remove_insurance(handler, draft_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    draft_service.remove_insurance(draft_id, user['user_id'], user['role'])
    response.no_content(handler)


@route('GET', '/booking-drafts/{draft_id}/price-breakdown')
def price_breakdown(handler, draft_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    result = draft_service.get_price_breakdown(draft_id, user['user_id'], user['role'])
    response.success(handler, result)


@route('POST', '/booking-drafts/{draft_id}/coupons')
def apply_coupon(handler, draft_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    data = req.parse_json_body(handler)
    val.require_fields(data, 'code')
    result = draft_service.apply_coupon(draft_id, user['user_id'], user['role'], data['code'])
    response.success(handler, result)


@route('DELETE', '/booking-drafts/{draft_id}/coupons/{code}')
def remove_coupon(handler, draft_id, code):
    db = get_db()
    user = auth.require_auth(handler, db)
    draft_service.remove_coupon(draft_id, user['user_id'], user['role'], code)
    response.no_content(handler)
