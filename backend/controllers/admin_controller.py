import uuid
import json
from core.router import route
from core import response, request as req, authentication as auth, validation as val
from database.connection import get_db
from repositories import (
    user_repo, airport_repo, flight_repo, booking_repo, payment_repo,
    coupon_repo, audit_repo, content_repo
)
from utils.pagination import paginate
from utils.date_utils import utcnow_iso


# ── Users / Customers ─────────────────────────────────────────────────────────

@route('GET', '/admin/customers')
def admin_list_customers(handler):
    db = get_db()
    auth.require_admin(handler, db)
    page, size = req.get_pagination(handler)
    q = req.get_query_param(handler, 'q', '')
    rows = user_repo.list_customers(db)
    items = [dict(r) for r in rows]
    if q:
        q_l = q.lower()
        items = [i for i in items if q_l in i.get('email', '').lower() or
                 q_l in i.get('full_name', '').lower()]
    response.success(handler, paginate(items, page, size))


@route('GET', '/admin/customers/{user_id}')
def admin_get_customer(handler, user_id):
    db = get_db()
    auth.require_admin(handler, db)
    row = db.execute(
        "SELECT id,email,full_name,phone,date_of_birth,nationality,passport_number,passport_expiry,"
        "role,status,created_at,updated_at FROM users WHERE id=? AND role='CUSTOMER'",
        (user_id,)
    ).fetchone()
    if not row:
        from core.exceptions import NotFoundError
        raise NotFoundError('Customer')
    response.success(handler, dict(row))


@route('PATCH', '/admin/customers/{user_id}/status')
def admin_update_customer_status(handler, user_id):
    db = get_db()
    admin = auth.require_admin(handler, db)
    data = req.parse_json_body(handler)
    val.require_fields(data, 'status')
    if data['status'] not in ('ACTIVE', 'INACTIVE', 'BANNED'):
        from core.exceptions import ValidationError
        raise ValidationError('Invalid status')
    user_repo.update_status(db, user_id, data['status'])
    audit_repo.log(db, admin['user_id'], 'UPDATE_STATUS', 'users', user_id,
                   details={'status': data['status']})
    db.commit()
    response.success(handler, None, 'Status updated')


# ── Staff ─────────────────────────────────────────────────────────────────────

@route('GET', '/admin/staff')
def admin_list_staff(handler):
    db = get_db()
    auth.require_admin(handler, db)
    page, size = req.get_pagination(handler)
    rows = user_repo.list_staff(db)
    response.success(handler, paginate([dict(r) for r in rows], page, size))


@route('POST', '/admin/staff')
def admin_create_staff(handler):
    db = get_db()
    admin = auth.require_admin(handler, db)
    data = req.parse_json_body(handler)
    val.require_fields(data, 'email', 'password', 'full_name')
    from core.authentication import hash_password
    email = val.validate_email(data['email'])
    val.validate_password(data['password'])
    full_name = val.sanitize_str(data['full_name'], 100, 'full_name')
    if not full_name:
        from core.exceptions import ValidationError
        raise ValidationError('full_name cannot be empty')
    if user_repo.find_by_email(db, email):
        from core.exceptions import ConflictError
        raise ConflictError('Email already exists', 'EMAIL_TAKEN')
    uid = str(uuid.uuid4())
    role = data.get('role', 'STAFF')
    if role not in ('STAFF', 'ADMIN'):
        role = 'STAFF'
    user_repo.create(db, uid, email, hash_password(data['password']), full_name, role)
    audit_repo.log(db, admin['user_id'], 'CREATE_STAFF', 'users', uid, details={'role': role})
    db.commit()
    response.created(handler, {'id': uid, 'email': email, 'role': role})


@route('GET', '/admin/staff/{user_id}')
def admin_get_staff(handler, user_id):
    db = get_db()
    auth.require_admin(handler, db)
    row = db.execute(
        "SELECT id,email,full_name,role,status,created_at FROM users WHERE id=? AND role IN ('STAFF','ADMIN')",
        (user_id,)
    ).fetchone()
    if not row:
        from core.exceptions import NotFoundError
        raise NotFoundError('Staff')
    response.success(handler, dict(row))


@route('PATCH', '/admin/staff/{user_id}')
def admin_update_staff(handler, user_id):
    db = get_db()
    auth.require_admin(handler, db)
    data = req.parse_json_body(handler)
    allowed = {'full_name', 'phone', 'status'}
    updates = {k: v for k, v in data.items() if k in allowed}
    user_repo.update(db, user_id, updates)
    db.commit()
    response.success(handler, None, 'Staff updated')


@route('PATCH', '/admin/staff/{user_id}/status')
def admin_update_staff_status(handler, user_id):
    return admin_update_customer_status(handler, user_id)


@route('PUT', '/admin/staff/{user_id}/roles')
def admin_update_staff_role(handler, user_id):
    db = get_db()
    auth.require_admin(handler, db)
    data = req.parse_json_body(handler)
    val.require_fields(data, 'role')
    if data['role'] not in ('STAFF', 'ADMIN'):
        from core.exceptions import ValidationError
        raise ValidationError('Role must be STAFF or ADMIN')
    user_repo.update_role(db, user_id, data['role'])
    db.commit()
    response.success(handler, None, 'Role updated')


# ── Airports ──────────────────────────────────────────────────────────────────

@route('GET', '/admin/airports')
def admin_list_airports(handler):
    db = get_db()
    auth.require_admin(handler, db)
    rows = airport_repo.list_airports(db)
    response.success(handler, [dict(r) for r in rows])


@route('POST', '/admin/airports')
def admin_create_airport(handler):
    db = get_db()
    admin = auth.require_admin(handler, db)
    data = req.parse_json_body(handler)
    val.require_fields(data, 'iata_code', 'name', 'city', 'country', 'country_code', 'timezone')
    if len(data['iata_code'].strip()) != 3:
        from core.exceptions import ValidationError
        raise ValidationError('iata_code must be exactly 3 letters')
    if len(data['country_code'].strip()) != 2:
        from core.exceptions import ValidationError
        raise ValidationError('country_code must be exactly 2 letters')
    if airport_repo.find_airport_by_iata(db, data['iata_code']):
        from core.exceptions import ConflictError
        raise ConflictError('An airport with this IATA code already exists', 'IATA_TAKEN')
    aid = str(uuid.uuid4())
    airport_repo.create_airport(db, aid, data)
    audit_repo.log(db, admin['user_id'], 'CREATE_AIRPORT', 'airports', aid)
    db.commit()
    response.created(handler, {'id': aid})


@route('PATCH', '/admin/airports/{airport_id}')
def admin_update_airport(handler, airport_id):
    db = get_db()
    admin = auth.require_admin(handler, db)
    if not airport_repo.find_airport(db, airport_id):
        from core.exceptions import NotFoundError
        raise NotFoundError('Airport')
    data = req.parse_json_body(handler)
    allowed = {'name', 'city', 'country', 'country_code', 'timezone', 'latitude', 'longitude'}
    updates = {k: v for k, v in data.items() if k in allowed}
    airport_repo.update_airport(db, airport_id, updates)
    audit_repo.log(db, admin['user_id'], 'UPDATE_AIRPORT', 'airports', airport_id)
    db.commit()
    response.success(handler, None, 'Airport updated')


@route('DELETE', '/admin/airports/{airport_id}')
def admin_delete_airport(handler, airport_id):
    db = get_db()
    admin = auth.require_admin(handler, db)
    if not airport_repo.find_airport(db, airport_id):
        from core.exceptions import NotFoundError
        raise NotFoundError('Airport')
    in_use = db.execute(
        "SELECT COUNT(*) as cnt FROM flights WHERE departure_airport_id=? OR arrival_airport_id=?",
        (airport_id, airport_id)
    ).fetchone()['cnt']
    if in_use:
        from core.exceptions import ConflictError
        raise ConflictError(f'Airport is referenced by {in_use} flight(s) and cannot be deleted', 'AIRPORT_IN_USE')
    airport_repo.delete_airport(db, airport_id)
    audit_repo.log(db, admin['user_id'], 'DELETE_AIRPORT', 'airports', airport_id)
    db.commit()
    response.no_content(handler)


# ── Airlines ──────────────────────────────────────────────────────────────────

@route('GET', '/admin/airlines')
def admin_list_airlines(handler):
    db = get_db()
    auth.require_admin(handler, db)
    rows = airport_repo.list_airlines(db)
    response.success(handler, [dict(r) for r in rows])


@route('POST', '/admin/airlines')
def admin_create_airline(handler):
    db = get_db()
    admin = auth.require_admin(handler, db)
    data = req.parse_json_body(handler)
    val.require_fields(data, 'iata_code', 'name')
    if len(data['iata_code'].strip()) != 2:
        from core.exceptions import ValidationError
        raise ValidationError('iata_code must be exactly 2 letters')
    if airport_repo.find_airline(db, data['iata_code']):
        from core.exceptions import ConflictError
        raise ConflictError('An airline with this IATA code already exists', 'IATA_TAKEN')
    alid = str(uuid.uuid4())
    airport_repo.create_airline(db, alid, data)
    audit_repo.log(db, admin['user_id'], 'CREATE_AIRLINE', 'airlines', alid)
    db.commit()
    response.created(handler, {'id': alid})


@route('PATCH', '/admin/airlines/{airline_id}')
def admin_update_airline(handler, airline_id):
    db = get_db()
    admin = auth.require_admin(handler, db)
    if not airport_repo.find_airline(db, airline_id):
        from core.exceptions import NotFoundError
        raise NotFoundError('Airline')
    data = req.parse_json_body(handler)
    allowed = {'name', 'country', 'logo_url'}
    updates = {k: v for k, v in data.items() if k in allowed}
    airport_repo.update_airline(db, airline_id, updates)
    audit_repo.log(db, admin['user_id'], 'UPDATE_AIRLINE', 'airlines', airline_id)
    db.commit()
    response.success(handler, None, 'Airline updated')


@route('DELETE', '/admin/airlines/{airline_id}')
def admin_delete_airline(handler, airline_id):
    db = get_db()
    admin = auth.require_admin(handler, db)
    if not airport_repo.find_airline(db, airline_id):
        from core.exceptions import NotFoundError
        raise NotFoundError('Airline')
    in_use = db.execute(
        "SELECT COUNT(*) as cnt FROM flights WHERE airline_id=?", (airline_id,)
    ).fetchone()['cnt']
    if in_use:
        from core.exceptions import ConflictError
        raise ConflictError(f'Airline is referenced by {in_use} flight(s) and cannot be deleted', 'AIRLINE_IN_USE')
    airport_repo.delete_airline(db, airline_id)
    audit_repo.log(db, admin['user_id'], 'DELETE_AIRLINE', 'airlines', airline_id)
    db.commit()
    response.no_content(handler)


# ── Aircraft types ────────────────────────────────────────────────────────────

@route('GET', '/admin/aircraft-types')
def admin_list_aircraft(handler):
    db = get_db()
    auth.require_admin(handler, db)
    rows = airport_repo.list_aircraft_types(db)
    response.success(handler, [dict(r) for r in rows])


@route('POST', '/admin/aircraft-types')
def admin_create_aircraft(handler):
    db = get_db()
    admin = auth.require_admin(handler, db)
    data = req.parse_json_body(handler)
    val.require_fields(data, 'iata_code', 'name')
    existing = db.execute(
        "SELECT id FROM aircraft_types WHERE iata_code=?", (data['iata_code'].upper(),)
    ).fetchone()
    if existing:
        from core.exceptions import ConflictError
        raise ConflictError('An aircraft type with this code already exists', 'CODE_TAKEN')
    atid = str(uuid.uuid4())
    airport_repo.create_aircraft_type(db, atid, data)
    audit_repo.log(db, admin['user_id'], 'CREATE_AIRCRAFT_TYPE', 'aircraft_types', atid)
    db.commit()
    response.created(handler, {'id': atid})


@route('PATCH', '/admin/aircraft-types/{at_id}')
def admin_update_aircraft(handler, at_id):
    db = get_db()
    admin = auth.require_admin(handler, db)
    if not db.execute("SELECT id FROM aircraft_types WHERE id=?", (at_id,)).fetchone():
        from core.exceptions import NotFoundError
        raise NotFoundError('Aircraft type')
    data = req.parse_json_body(handler)
    allowed = {'name', 'manufacturer', 'seat_capacity'}
    updates = {k: v for k, v in data.items() if k in allowed}
    airport_repo.update_aircraft_type(db, at_id, updates)
    audit_repo.log(db, admin['user_id'], 'UPDATE_AIRCRAFT_TYPE', 'aircraft_types', at_id)
    db.commit()
    response.success(handler, None, 'Aircraft type updated')


@route('DELETE', '/admin/aircraft-types/{at_id}')
def admin_delete_aircraft(handler, at_id):
    db = get_db()
    admin = auth.require_admin(handler, db)
    if not db.execute("SELECT id FROM aircraft_types WHERE id=?", (at_id,)).fetchone():
        from core.exceptions import NotFoundError
        raise NotFoundError('Aircraft type')
    in_use = db.execute(
        "SELECT COUNT(*) as cnt FROM flights WHERE aircraft_type_id=?", (at_id,)
    ).fetchone()['cnt']
    if in_use:
        from core.exceptions import ConflictError
        raise ConflictError(f'Aircraft type is used by {in_use} flight(s) and cannot be deleted', 'AIRCRAFT_TYPE_IN_USE')
    airport_repo.delete_aircraft_type(db, at_id)
    audit_repo.log(db, admin['user_id'], 'DELETE_AIRCRAFT_TYPE', 'aircraft_types', at_id)
    db.commit()
    response.no_content(handler)


# ── Flights ───────────────────────────────────────────────────────────────────

@route('GET', '/admin/flights')
def admin_list_flights(handler):
    db = get_db()
    auth.require_staff(handler, db)
    page, size = req.get_pagination(handler)
    date_filter = req.get_query_param(handler, 'date', '')
    q = req.get_query_param(handler, 'q', '')
    rows = flight_repo.list_flights_admin(db, date_filter, q)
    response.success(handler, paginate([dict(r) for r in rows], page, size))


@route('GET', '/admin/flights/{flight_id}')
def admin_get_flight(handler, flight_id):
    db = get_db()
    auth.require_staff(handler, db)
    flight = flight_repo.get_flight_admin(db, flight_id)
    if not flight:
        from core.exceptions import NotFoundError
        raise NotFoundError('Flight')
    response.success(handler, dict(flight))


@route('POST', '/admin/flights')
def admin_create_flight(handler):
    db = get_db()
    admin = auth.require_admin(handler, db)
    data = req.parse_json_body(handler)
    val.require_fields(data, 'flight_number', 'airline_id', 'departure_airport_id',
                       'arrival_airport_id', 'departure_time', 'arrival_time', 'duration_minutes')
    from core.exceptions import ValidationError, NotFoundError, ConflictError
    if data['departure_airport_id'] == data['arrival_airport_id']:
        raise ValidationError('Departure and arrival airport must be different')
    if not airport_repo.find_airport(db, data['departure_airport_id']):
        raise NotFoundError('Departure airport')
    if not airport_repo.find_airport(db, data['arrival_airport_id']):
        raise NotFoundError('Arrival airport')
    if not airport_repo.find_airline(db, data['airline_id']):
        raise NotFoundError('Airline')
    if data.get('aircraft_type_id') and not db.execute(
        "SELECT id FROM aircraft_types WHERE id=?", (data['aircraft_type_id'],)
    ).fetchone():
        raise NotFoundError('Aircraft type')
    if data['arrival_time'] <= data['departure_time']:
        raise ValidationError('arrival_time must be after departure_time')
    duration = val.validate_positive_int(data['duration_minutes'], 'duration_minutes')
    dup = db.execute(
        "SELECT id FROM flights WHERE flight_number=? AND departure_time=?",
        (data['flight_number'], data['departure_time'])
    ).fetchone()
    if dup:
        raise ConflictError('A flight with this number and departure time already exists', 'FLIGHT_DUPLICATE')
    fid = str(uuid.uuid4())
    flight_repo.create_flight(db, fid, data)
    audit_repo.log(db, admin['user_id'], 'CREATE_FLIGHT', 'flights', fid)
    db.commit()
    response.created(handler, {'id': fid})


@route('PATCH', '/admin/flights/{flight_id}')
def admin_update_flight(handler, flight_id):
    db = get_db()
    admin = auth.require_admin(handler, db)
    if not flight_repo.find_flight(db, flight_id):
        from core.exceptions import NotFoundError
        raise NotFoundError('Flight')
    data = req.parse_json_body(handler)
    allowed = {'flight_number', 'departure_time', 'arrival_time', 'duration_minutes', 'status', 'aircraft_type_id'}
    updates = {k: v for k, v in data.items() if k in allowed}
    if updates.get('departure_time') and updates.get('arrival_time') and updates['arrival_time'] <= updates['departure_time']:
        from core.exceptions import ValidationError
        raise ValidationError('arrival_time must be after departure_time')
    flight_repo.update_flight(db, flight_id, updates)
    audit_repo.log(db, admin['user_id'], 'UPDATE_FLIGHT', 'flights', flight_id)
    db.commit()
    response.success(handler, None, 'Flight updated')


@route('DELETE', '/admin/flights/{flight_id}')
def admin_delete_flight(handler, flight_id):
    db = get_db()
    admin = auth.require_admin(handler, db)
    if not flight_repo.find_flight(db, flight_id):
        from core.exceptions import NotFoundError
        raise NotFoundError('Flight')
    flight_repo.cancel_flight(db, flight_id)
    audit_repo.log(db, admin['user_id'], 'CANCEL_FLIGHT', 'flights', flight_id)
    db.commit()
    response.no_content(handler)


@route('PATCH', '/admin/flights/{flight_id}/status')
def admin_update_flight_status(handler, flight_id):
    db = get_db()
    auth.require_admin(handler, db)
    data = req.parse_json_body(handler)
    val.require_fields(data, 'status')
    valid_statuses = ('SCHEDULED', 'BOARDING', 'DELAYED', 'DEPARTED', 'ARRIVED', 'CANCELLED')
    if data['status'] not in valid_statuses:
        from core.exceptions import ValidationError
        raise ValidationError(f'Invalid status. Must be one of: {", ".join(valid_statuses)}')
    flight_repo.update_flight_status(db, flight_id, data['status'])
    db.commit()
    response.success(handler, None, 'Status updated')


# ── Fares ─────────────────────────────────────────────────────────────────────

@route('GET', '/admin/flights/{flight_id}/fares')
def admin_list_fares(handler, flight_id):
    db = get_db()
    auth.require_admin(handler, db)
    rows = flight_repo.list_fares_admin(db, flight_id)
    response.success(handler, [dict(r) for r in rows])


@route('POST', '/admin/flights/{flight_id}/fares')
def admin_create_fare(handler, flight_id):
    db = get_db()
    auth.require_admin(handler, db)
    data = req.parse_json_body(handler)
    val.require_fields(data, 'cabin_class_id', 'fare_code', 'fare_name', 'base_price')
    farid = str(uuid.uuid4())
    flight_repo.create_fare(db, farid, flight_id, data)
    total = int(data.get('total_seats', 100))
    flight_repo.create_fare_inventory(db, str(uuid.uuid4()), farid, total)
    db.commit()
    response.created(handler, {'id': farid})


@route('PATCH', '/admin/fares/{fare_id}')
def admin_update_fare(handler, fare_id):
    db = get_db()
    auth.require_admin(handler, db)
    data = req.parse_json_body(handler)
    allowed = {'fare_name', 'base_price', 'tax', 'fees', 'baggage_kg',
               'is_refundable', 'is_changeable', 'change_fee', 'cancel_fee'}
    updates = {k: v for k, v in data.items() if k in allowed}
    available_seats = data.get('available_seats')
    flight_repo.update_fare(db, fare_id, updates, available_seats)
    db.commit()
    response.success(handler, None, 'Fare updated')


@route('DELETE', '/admin/fares/{fare_id}')
def admin_delete_fare(handler, fare_id):
    db = get_db()
    auth.require_admin(handler, db)
    flight_repo.delete_fare(db, fare_id)
    db.commit()
    response.no_content(handler)


# ── Seat maps ─────────────────────────────────────────────────────────────────

@route('GET', '/admin/flights/{flight_id}/seat-map')
def admin_get_seat_map(handler, flight_id):
    db = get_db()
    auth.require_admin(handler, db)
    seat_map = flight_repo.get_seat_map(db, flight_id)
    seats = flight_repo.list_seats(db, flight_id)
    response.success(handler, {
        'seat_map': dict(seat_map) if seat_map else None,
        'seats': [dict(s) for s in seats],
    })


@route('PUT', '/admin/flights/{flight_id}/seat-map')
def admin_update_seat_map(handler, flight_id):
    db = get_db()
    auth.require_admin(handler, db)
    data = req.parse_json_body(handler)
    val.require_fields(data, 'layout')
    flight_repo.upsert_seat_map(db, flight_id, json.dumps(data['layout']))
    db.commit()
    response.success(handler, None, 'Seat map updated')


@route('PATCH', '/admin/flights/{flight_id}/seats/{seat_id}')
def admin_update_seat(handler, flight_id, seat_id):
    db = get_db()
    auth.require_admin(handler, db)
    data = req.parse_json_body(handler)
    allowed = {'status', 'extra_fee', 'seat_type'}
    updates = {k: v for k, v in data.items() if k in allowed}
    flight_repo.update_seat(db, seat_id, flight_id, updates)
    db.commit()
    response.success(handler, None, 'Seat updated')


# ── Bookings ──────────────────────────────────────────────────────────────────

@route('GET', '/admin/bookings')
def admin_list_bookings(handler):
    db = get_db()
    auth.require_staff(handler, db)
    page, size = req.get_pagination(handler)
    status = req.get_query_param(handler, 'status', '')
    q = req.get_query_param(handler, 'q', '')
    rows = booking_repo.list_all_bookings(db, status or None, q)
    response.success(handler, paginate([dict(r) for r in rows], page, size))


@route('GET', '/admin/bookings/{booking_id}')
def admin_get_booking(handler, booking_id):
    db = get_db()
    auth.require_staff(handler, db)
    booking = booking_repo.find_booking(db, booking_id)
    if not booking:
        from core.exceptions import NotFoundError
        raise NotFoundError('Booking')
    segments = booking_repo.get_booking_segments(db, booking_id)
    passengers = booking_repo.get_booking_passengers(db, booking_id)
    seat_assignments = booking_repo.get_seat_assignments_detailed(db, booking_id)
    from repositories import payment_repo
    payments = payment_repo.list_payments_for_booking(db, booking_id)
    response.success(handler, {
        'booking': dict(booking),
        'segments': [dict(s) for s in segments],
        'passengers': [dict(p) for p in passengers],
        'seat_assignments': [dict(sa) for sa in seat_assignments],
        'payments': [dict(p) for p in payments],
    })


BOOKING_STATUSES = ('PENDING_PAYMENT', 'PAYMENT_PROCESSING', 'CONFIRMED', 'PAYMENT_FAILED',
                    'CANCELLED', 'COMPLETED', 'CHANGE_PENDING')


BOOKING_STATUSES = ('PENDING_PAYMENT', 'PAYMENT_PROCESSING', 'CONFIRMED', 'PAYMENT_FAILED',
                    'CANCELLED', 'COMPLETED', 'CHANGE_PENDING')


@route('PATCH', '/admin/bookings/{booking_id}/status')
def admin_update_booking_status(handler, booking_id):
    db = get_db()
    user = auth.require_staff(handler, db)
    data = req.parse_json_body(handler)
    val.require_fields(data, 'status')
    if data['status'] not in BOOKING_STATUSES:
        from core.exceptions import ValidationError
        raise ValidationError(f'Invalid status. Must be one of: {", ".join(BOOKING_STATUSES)}')
    booking = booking_repo.find_booking(db, booking_id)
    if not booking:
        from core.exceptions import NotFoundError
        raise NotFoundError('Booking')
    old_status = booking['status']
    booking_repo.update_booking_status(db, booking_id, data['status'])
    booking_repo.add_status_history(db, booking_id, old_status, data['status'],
                                    changed_by=user['user_id'], reason=data.get('reason'))
    if data['status'] == 'CANCELLED' and old_status != 'CANCELLED':
        for a in booking_repo.get_seat_assignments(db, booking_id):
            flight_repo.update_seat_status(db, a['seat_id'], 'AVAILABLE')
    audit_repo.log(db, user['user_id'], 'UPDATE_BOOKING_STATUS', 'bookings', booking_id,
                   details={'from': old_status, 'to': data['status']})
    db.commit()
    response.success(handler, None, 'Status updated')


@route('POST', '/admin/bookings/{booking_id}/cancel')
def admin_cancel_booking(handler, booking_id):
    from controllers.staff_controller import staff_cancel_booking
    staff_cancel_booking(handler, booking_id)


# ── Payments ──────────────────────────────────────────────────────────────────

@route('GET', '/admin/payments')
def admin_list_payments(handler):
    db = get_db()
    auth.require_admin(handler, db)
    page, size = req.get_pagination(handler)
    rows = payment_repo.list_all_payments(db)
    response.success(handler, paginate([dict(r) for r in rows], page, size))


@route('GET', '/admin/payments/{payment_id}')
def admin_get_payment(handler, payment_id):
    db = get_db()
    auth.require_admin(handler, db)
    row = payment_repo.find_payment(db, payment_id)
    if not row:
        from core.exceptions import NotFoundError
        raise NotFoundError('Payment')
    response.success(handler, dict(row))


PAYMENT_STATUSES = ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED')


@route('PATCH', '/admin/payments/{payment_id}/status')
def admin_update_payment_status(handler, payment_id):
    db = get_db()
    admin = auth.require_admin(handler, db)
    if not payment_repo.find_payment(db, payment_id):
        from core.exceptions import NotFoundError
        raise NotFoundError('Payment')
    data = req.parse_json_body(handler)
    val.require_fields(data, 'status')
    if data['status'] not in PAYMENT_STATUSES:
        from core.exceptions import ValidationError
        raise ValidationError(f'Invalid status. Must be one of: {", ".join(PAYMENT_STATUSES)}')
    payment_repo.update_payment_status(db, payment_id, data['status'])
    audit_repo.log(db, admin['user_id'], 'UPDATE_PAYMENT_STATUS', 'payments', payment_id,
                   details={'status': data['status']})
    db.commit()
    response.success(handler, None, 'Payment status updated')


# ── Refunds ───────────────────────────────────────────────────────────────────

@route('GET', '/admin/refunds')
def admin_list_refunds(handler):
    db = get_db()
    auth.require_admin(handler, db)
    page, size = req.get_pagination(handler)
    rows = payment_repo.list_all_refunds(db)
    response.success(handler, paginate([dict(r) for r in rows], page, size))


@route('GET', '/admin/refunds/{refund_id}')
def admin_get_refund(handler, refund_id):
    db = get_db()
    auth.require_admin(handler, db)
    row = payment_repo.find_refund(db, refund_id)
    if not row:
        from core.exceptions import NotFoundError
        raise NotFoundError('Refund')
    response.success(handler, dict(row))


REFUND_STATUSES = ('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED')


@route('PATCH', '/admin/refunds/{refund_id}')
def admin_update_refund(handler, refund_id):
    db = get_db()
    admin = auth.require_admin(handler, db)
    if not payment_repo.find_refund(db, refund_id):
        from core.exceptions import NotFoundError
        raise NotFoundError('Refund')
    data = req.parse_json_body(handler)
    val.require_fields(data, 'status')
    if data['status'] not in REFUND_STATUSES:
        from core.exceptions import ValidationError
        raise ValidationError(f'Invalid status. Must be one of: {", ".join(REFUND_STATUSES)}')
    payment_repo.update_refund_status(db, refund_id, data['status'])
    audit_repo.log(db, admin['user_id'], 'UPDATE_REFUND_STATUS', 'refunds', refund_id,
                   details={'status': data['status']})
    db.commit()
    response.success(handler, None, 'Refund updated')


# ── Coupons ───────────────────────────────────────────────────────────────────

@route('GET', '/admin/coupons')
def admin_list_coupons(handler):
    db = get_db()
    auth.require_admin(handler, db)
    rows = coupon_repo.list_coupons(db)
    response.success(handler, [dict(r) for r in rows])


def _validate_coupon_fields(data, require_type=True):
    from core.exceptions import ValidationError
    if require_type and data.get('discount_type') not in ('PERCENT', 'FIXED'):
        raise ValidationError("discount_type must be 'PERCENT' or 'FIXED'")
    if 'discount_value' in data:
        value = int(data['discount_value'])
        if value < 0:
            raise ValidationError('discount_value cannot be negative')
        if data.get('discount_type') == 'PERCENT' and value > 100:
            raise ValidationError('discount_value cannot exceed 100 for a PERCENT coupon')
    if data.get('valid_from') and data.get('valid_until') and data['valid_until'] <= data['valid_from']:
        raise ValidationError('valid_until must be after valid_from')


@route('POST', '/admin/coupons')
def admin_create_coupon(handler):
    db = get_db()
    admin = auth.require_admin(handler, db)
    data = req.parse_json_body(handler)
    val.require_fields(data, 'code', 'discount_type', 'discount_value', 'valid_from', 'valid_until')
    _validate_coupon_fields(data)
    code = data['code'].upper()
    if db.execute("SELECT id FROM coupons WHERE code=?", (code,)).fetchone():
        from core.exceptions import ConflictError
        raise ConflictError('A coupon with this code already exists', 'CODE_TAKEN')
    now = utcnow_iso()
    cid = str(uuid.uuid4())
    db.execute(
        "INSERT INTO coupons(id,code,discount_type,discount_value,min_amount,max_uses,used_count,"
        "valid_from,valid_until,is_active,created_at,updated_at) VALUES(?,?,?,?,?,?,0,?,?,1,?,?)",
        (cid, code, data['discount_type'], int(data['discount_value']),
         data.get('min_amount'), data.get('max_uses'),
         data['valid_from'], data['valid_until'], now, now)
    )
    audit_repo.log(db, admin['user_id'], 'CREATE_COUPON', 'coupons', cid)
    db.commit()
    response.created(handler, {'id': cid})


@route('GET', '/admin/coupons/{coupon_id}')
def admin_get_coupon(handler, coupon_id):
    db = get_db()
    auth.require_admin(handler, db)
    row = db.execute(
        "SELECT * FROM coupons WHERE id=? OR code=?", (coupon_id, coupon_id.upper())
    ).fetchone()
    if not row:
        from core.exceptions import NotFoundError
        raise NotFoundError('Coupon')
    response.success(handler, dict(row))


@route('PATCH', '/admin/coupons/{coupon_id}')
def admin_update_coupon(handler, coupon_id):
    db = get_db()
    admin = auth.require_admin(handler, db)
    existing = coupon_repo.find_coupon_by_id(db, coupon_id)
    if not existing:
        from core.exceptions import NotFoundError
        raise NotFoundError('Coupon')
    data = req.parse_json_body(handler)
    allowed = {'discount_type', 'discount_value', 'min_amount', 'max_uses', 'valid_from', 'valid_until', 'is_active'}
    updates = {k: v for k, v in data.items() if k in allowed}
    merged = {**dict(existing), **updates}
    _validate_coupon_fields(merged)
    coupon_repo.update_coupon(db, coupon_id, updates)
    audit_repo.log(db, admin['user_id'], 'UPDATE_COUPON', 'coupons', coupon_id)
    db.commit()
    response.success(handler, None, 'Coupon updated')


@route('DELETE', '/admin/coupons/{coupon_id}')
def admin_delete_coupon(handler, coupon_id):
    db = get_db()
    admin = auth.require_admin(handler, db)
    if not coupon_repo.find_coupon_by_id(db, coupon_id):
        from core.exceptions import NotFoundError
        raise NotFoundError('Coupon')
    coupon_repo.update_coupon(db, coupon_id, {'is_active': 0})
    audit_repo.log(db, admin['user_id'], 'DEACTIVATE_COUPON', 'coupons', coupon_id)
    db.commit()
    response.no_content(handler)


# ── Content ───────────────────────────────────────────────────────────────────

@route('GET', '/contents/{slug}')
def public_get_content(handler, slug):
    """Public, unauthenticated read of a single published CMS page by slug."""
    db = get_db()
    row = content_repo.find_content_by_slug(db, slug)
    if not row or not row['is_published']:
        from core.exceptions import NotFoundError
        raise NotFoundError('Page')
    response.success(handler, dict(row))


@route('GET', '/admin/contents')
def admin_list_contents(handler):
    db = get_db()
    auth.require_admin(handler, db)
    rows = db.execute("SELECT * FROM contents ORDER BY created_at DESC").fetchall()
    response.success(handler, [dict(r) for r in rows])


@route('POST', '/admin/contents')
def admin_create_content(handler):
    db = get_db()
    admin = auth.require_admin(handler, db)
    data = req.parse_json_body(handler)
    val.require_fields(data, 'key', 'title', 'body')
    import re
    if not re.match(r'^[a-z0-9]+(-[a-z0-9]+)*$', data['key']):
        from core.exceptions import ValidationError
        raise ValidationError('slug must be lowercase letters, numbers and hyphens only (e.g. "about-us")')
    if db.execute("SELECT id FROM contents WHERE slug=?", (data['key'],)).fetchone():
        from core.exceptions import ConflictError
        raise ConflictError('A page with this slug already exists', 'SLUG_TAKEN')
    cid = str(uuid.uuid4())
    now = utcnow_iso()
    db.execute(
        "INSERT INTO contents(id,slug,title,body,content_type,is_published,created_at,updated_at) "
        "VALUES(?,?,?,?,?,?,?,?)",
        (cid, data['key'], data['title'], data['body'],
         data.get('content_type', 'PAGE'), 1 if data.get('is_published') else 0, now, now)
    )
    audit_repo.log(db, admin['user_id'], 'CREATE_CONTENT', 'contents', cid)
    db.commit()
    response.created(handler, {'id': cid})


@route('GET', '/admin/contents/{content_id}')
def admin_get_content(handler, content_id):
    db = get_db()
    auth.require_admin(handler, db)
    row = db.execute(
        "SELECT * FROM contents WHERE id=? OR slug=?", (content_id, content_id)
    ).fetchone()
    if not row:
        from core.exceptions import NotFoundError
        raise NotFoundError('Content')
    response.success(handler, dict(row))


@route('PATCH', '/admin/contents/{content_id}')
def admin_update_content(handler, content_id):
    db = get_db()
    admin = auth.require_admin(handler, db)
    if not db.execute("SELECT id FROM contents WHERE id=? OR slug=?", (content_id, content_id)).fetchone():
        from core.exceptions import NotFoundError
        raise NotFoundError('Content')
    data = req.parse_json_body(handler)
    allowed = {'title', 'body', 'is_published'}
    updates = {k: v for k, v in data.items() if k in allowed}
    now = utcnow_iso()
    updates['updated_at'] = now
    set_clause = ', '.join(f'{k}=?' for k in updates)
    db.execute(f"UPDATE contents SET {set_clause} WHERE id=?", (*updates.values(), content_id))
    audit_repo.log(db, admin['user_id'], 'UPDATE_CONTENT', 'contents', content_id)
    db.commit()
    response.success(handler, None, 'Content updated')


@route('DELETE', '/admin/contents/{content_id}')
def admin_delete_content(handler, content_id):
    db = get_db()
    admin = auth.require_admin(handler, db)
    if not db.execute("SELECT id FROM contents WHERE id=?", (content_id,)).fetchone():
        from core.exceptions import NotFoundError
        raise NotFoundError('Content')
    db.execute("DELETE FROM contents WHERE id=?", (content_id,))
    audit_repo.log(db, admin['user_id'], 'DELETE_CONTENT', 'contents', content_id)
    db.commit()
    response.no_content(handler)


# ── Dashboard ─────────────────────────────────────────────────────────────────

@route('GET', '/admin/dashboard/summary')
def admin_dashboard_summary(handler):
    db = get_db()
    auth.require_staff(handler, db)
    total_bookings = db.execute("SELECT COUNT(*) as cnt FROM bookings").fetchone()['cnt']
    confirmed = db.execute(
        "SELECT COUNT(*) as cnt FROM bookings WHERE status IN ('CONFIRMED','COMPLETED')"
    ).fetchone()['cnt']
    pending = db.execute(
        "SELECT COUNT(*) as cnt FROM bookings WHERE status IN ('PENDING_PAYMENT','PAYMENT_PROCESSING','CHANGE_PENDING')"
    ).fetchone()['cnt']
    cancelled = db.execute(
        "SELECT COUNT(*) as cnt FROM bookings WHERE status IN ('CANCELLED','PAYMENT_FAILED')"
    ).fetchone()['cnt']
    revenue = db.execute(
        "SELECT COALESCE(SUM(amount),0) as total FROM payments WHERE status='SUCCESS'"
    ).fetchone()['total']
    response.success(handler, {
        'total_bookings': total_bookings,
        'confirmed_bookings': confirmed,
        'pending_bookings': pending,
        'cancelled_bookings': cancelled,
        'total_revenue': revenue,
        'currency': 'VND',
    })


@route('GET', '/admin/dashboard/bookings')
def admin_dashboard_bookings(handler):
    db = get_db()
    auth.require_staff(handler, db)
    rows = db.execute(
        "SELECT DATE(created_at) as date, COUNT(*) as count, SUM(total_amount) as revenue "
        "FROM bookings GROUP BY DATE(created_at) ORDER BY date DESC LIMIT 30"
    ).fetchall()
    response.success(handler, [dict(r) for r in rows])


@route('GET', '/admin/dashboard/revenue')
def admin_dashboard_revenue(handler):
    db = get_db()
    auth.require_staff(handler, db)
    rows = db.execute(
        "SELECT DATE(created_at) as date, SUM(amount) as revenue "
        "FROM payments WHERE status='SUCCESS' GROUP BY DATE(created_at) ORDER BY date DESC LIMIT 30"
    ).fetchall()
    response.success(handler, [dict(r) for r in rows])


@route('GET', '/admin/dashboard/flights')
def admin_dashboard_flights(handler):
    db = get_db()
    auth.require_staff(handler, db)
    rows = db.execute("SELECT status, COUNT(*) as count FROM flights GROUP BY status").fetchall()
    response.success(handler, [dict(r) for r in rows])


@route('GET', '/admin/dashboard/booking-status')
def admin_dashboard_booking_status(handler):
    db = get_db()
    auth.require_staff(handler, db)
    rows = db.execute("SELECT status, COUNT(*) as count FROM bookings GROUP BY status").fetchall()
    response.success(handler, [dict(r) for r in rows])


@route('GET', '/admin/dashboard/top-routes')
def admin_dashboard_top_routes(handler):
    db = get_db()
    auth.require_staff(handler, db)
    rows = db.execute(
        "SELECT dep.iata_code as departure, arr.iata_code as arrival, COUNT(*) as count "
        "FROM booking_segments bs "
        "JOIN flights f ON f.id = bs.flight_id "
        "JOIN airports dep ON dep.id = f.departure_airport_id "
        "JOIN airports arr ON arr.id = f.arrival_airport_id "
        "WHERE bs.segment_order = 0 "
        "GROUP BY dep.iata_code, arr.iata_code "
        "ORDER BY count DESC LIMIT 5"
    ).fetchall()
    response.success(handler, [dict(r) for r in rows])


@route('GET', '/admin/dashboard/recent-bookings')
def admin_dashboard_recent_bookings(handler):
    db = get_db()
    auth.require_staff(handler, db)
    rows = db.execute(
        "SELECT b.id, b.pnr, b.contact_name, b.status, b.total_amount, b.created_at, "
        "f.flight_number, f.departure_time, dep.iata_code as dep_iata, arr.iata_code as arr_iata "
        "FROM bookings b "
        "LEFT JOIN booking_segments bs ON bs.booking_id = b.id AND bs.segment_order = 0 "
        "LEFT JOIN flights f ON f.id = bs.flight_id "
        "LEFT JOIN airports dep ON dep.id = f.departure_airport_id "
        "LEFT JOIN airports arr ON arr.id = f.arrival_airport_id "
        "ORDER BY b.created_at DESC LIMIT 10"
    ).fetchall()
    response.success(handler, [dict(r) for r in rows])


@route('GET', '/admin/audit-logs')
def admin_audit_logs(handler):
    db = get_db()
    auth.require_admin(handler, db)
    page, size = req.get_pagination(handler)
    resource = req.get_query_param(handler, 'resource', '')
    rows = audit_repo.list_logs(db, resource or None)
    response.success(handler, paginate([dict(r) for r in rows], page, size))
