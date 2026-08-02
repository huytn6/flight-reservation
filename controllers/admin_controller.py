import uuid
import datetime
import json
from core.router import route
from core import response, request as req, authentication as auth, validation as val
from database.connection import get_db
from utils.pagination import paginate


def _a(db):
    """Shorthand: require admin role."""
    import inspect
    frame = inspect.stack()[1]
    # Can't easily get handler here, so this is called inline
    pass


@route('GET', '/admin/customers')
def admin_list_customers(handler):
    db = get_db()
    auth.require_admin(handler, db)
    page, size = req.get_pagination(handler)
    q = req.get_query_param(handler, 'q', '')
    rows = db.execute("SELECT id,email,full_name,phone,role,status,created_at FROM users WHERE role='CUSTOMER' ORDER BY created_at DESC").fetchall()
    items = [dict(r) for r in rows]
    if q:
        q_l = q.lower()
        items = [i for i in items if q_l in i.get('email','').lower() or q_l in i.get('full_name','').lower()]
    response.success(handler, paginate(items, page, size))


@route('GET', '/admin/customers/{user_id}')
def admin_get_customer(handler, user_id):
    db = get_db()
    auth.require_admin(handler, db)
    row = db.execute("SELECT * FROM users WHERE id=? AND role='CUSTOMER'", (user_id,)).fetchone()
    if not row:
        from core.exceptions import NotFoundError
        raise NotFoundError('Customer')
    response.success(handler, dict(row))


@route('PATCH', '/admin/customers/{user_id}/status')
def admin_update_customer_status(handler, user_id):
    db = get_db()
    auth.require_admin(handler, db)
    data = req.parse_json_body(handler)
    val.require_fields(data, 'status')
    if data['status'] not in ('ACTIVE', 'INACTIVE', 'BANNED'):
        from core.exceptions import ValidationError
        raise ValidationError('Invalid status')
    now = datetime.datetime.utcnow().isoformat()
    db.execute("UPDATE users SET status=?, updated_at=? WHERE id=?", (data['status'], now, user_id))
    db.commit()
    response.success(handler, None, 'Status updated')


@route('GET', '/admin/staff')
def admin_list_staff(handler):
    db = get_db()
    auth.require_admin(handler, db)
    page, size = req.get_pagination(handler)
    rows = db.execute("SELECT id,email,full_name,role,status,created_at FROM users WHERE role IN ('STAFF','ADMIN') ORDER BY created_at DESC").fetchall()
    response.success(handler, paginate([dict(r) for r in rows], page, size))


@route('POST', '/admin/staff')
def admin_create_staff(handler):
    db = get_db()
    auth.require_admin(handler, db)
    data = req.parse_json_body(handler)
    val.require_fields(data, 'email', 'password', 'full_name')
    from core.authentication import hash_password
    email = val.validate_email(data['email'])
    if db.execute("SELECT id FROM users WHERE email=?", (email,)).fetchone():
        from core.exceptions import ConflictError
        raise ConflictError('Email already exists', 'EMAIL_TAKEN')
    uid = str(uuid.uuid4())
    now = datetime.datetime.utcnow().isoformat()
    role = data.get('role', 'STAFF')
    if role not in ('STAFF', 'ADMIN'):
        role = 'STAFF'
    db.execute(
        "INSERT INTO users(id,email,password,full_name,role,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)",
        (uid, email, hash_password(data['password']), data['full_name'], role, 'ACTIVE', now, now)
    )
    db.commit()
    response.created(handler, {'id': uid, 'email': email, 'role': role})


@route('GET', '/admin/staff/{user_id}')
def admin_get_staff(handler, user_id):
    db = get_db()
    auth.require_admin(handler, db)
    row = db.execute("SELECT id,email,full_name,role,status,created_at FROM users WHERE id=? AND role IN ('STAFF','ADMIN')", (user_id,)).fetchone()
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
    now = datetime.datetime.utcnow().isoformat()
    updates['updated_at'] = now
    set_clause = ', '.join(f'{k}=?' for k in updates)
    db.execute(f"UPDATE users SET {set_clause} WHERE id=?", (*updates.values(), user_id))
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
    now = datetime.datetime.utcnow().isoformat()
    db.execute("UPDATE users SET role=?, updated_at=? WHERE id=?", (data['role'], now, user_id))
    db.commit()
    response.success(handler, None, 'Role updated')


# Airport CRUD
@route('GET', '/admin/airports')
def admin_list_airports(handler):
    db = get_db()
    auth.require_admin(handler, db)
    rows = db.execute("SELECT * FROM airports ORDER BY city").fetchall()
    response.success(handler, [dict(r) for r in rows])


@route('POST', '/admin/airports')
def admin_create_airport(handler):
    db = get_db()
    auth.require_admin(handler, db)
    data = req.parse_json_body(handler)
    val.require_fields(data, 'iata_code', 'name', 'city', 'country', 'country_code', 'timezone')
    aid = str(uuid.uuid4())
    now = datetime.datetime.utcnow().isoformat()
    db.execute(
        "INSERT INTO airports(id,iata_code,icao_code,name,city,country,country_code,timezone,latitude,longitude,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)",
        (aid, data['iata_code'].upper(), data.get('icao_code'), data['name'], data['city'],
         data['country'], data['country_code'].upper(), data['timezone'],
         data.get('latitude'), data.get('longitude'), now, now)
    )
    db.commit()
    response.created(handler, {'id': aid})


@route('PATCH', '/admin/airports/{airport_id}')
def admin_update_airport(handler, airport_id):
    db = get_db()
    auth.require_admin(handler, db)
    data = req.parse_json_body(handler)
    allowed = {'name', 'city', 'country', 'timezone', 'latitude', 'longitude'}
    updates = {k: v for k, v in data.items() if k in allowed}
    now = datetime.datetime.utcnow().isoformat()
    updates['updated_at'] = now
    set_clause = ', '.join(f'{k}=?' for k in updates)
    db.execute(f"UPDATE airports SET {set_clause} WHERE id=?", (*updates.values(), airport_id))
    db.commit()
    response.success(handler, None, 'Airport updated')


@route('DELETE', '/admin/airports/{airport_id}')
def admin_delete_airport(handler, airport_id):
    db = get_db()
    auth.require_admin(handler, db)
    db.execute("DELETE FROM airports WHERE id=?", (airport_id,))
    db.commit()
    response.no_content(handler)


# Airline CRUD
@route('GET', '/admin/airlines')
def admin_list_airlines(handler):
    db = get_db()
    auth.require_admin(handler, db)
    rows = db.execute("SELECT * FROM airlines ORDER BY name").fetchall()
    response.success(handler, [dict(r) for r in rows])


@route('POST', '/admin/airlines')
def admin_create_airline(handler):
    db = get_db()
    auth.require_admin(handler, db)
    data = req.parse_json_body(handler)
    val.require_fields(data, 'iata_code', 'name')
    alid = str(uuid.uuid4())
    now = datetime.datetime.utcnow().isoformat()
    db.execute(
        "INSERT INTO airlines(id,iata_code,icao_code,name,country,logo_url,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)",
        (alid, data['iata_code'].upper(), data.get('icao_code'), data['name'], data.get('country'), data.get('logo_url'), now, now)
    )
    db.commit()
    response.created(handler, {'id': alid})


@route('PATCH', '/admin/airlines/{airline_id}')
def admin_update_airline(handler, airline_id):
    db = get_db()
    auth.require_admin(handler, db)
    data = req.parse_json_body(handler)
    allowed = {'name', 'country', 'logo_url'}
    updates = {k: v for k, v in data.items() if k in allowed}
    now = datetime.datetime.utcnow().isoformat()
    updates['updated_at'] = now
    set_clause = ', '.join(f'{k}=?' for k in updates)
    db.execute(f"UPDATE airlines SET {set_clause} WHERE id=?", (*updates.values(), airline_id))
    db.commit()
    response.success(handler, None, 'Airline updated')


@route('DELETE', '/admin/airlines/{airline_id}')
def admin_delete_airline(handler, airline_id):
    db = get_db()
    auth.require_admin(handler, db)
    db.execute("DELETE FROM airlines WHERE id=?", (airline_id,))
    db.commit()
    response.no_content(handler)


# Aircraft types
@route('GET', '/admin/aircraft-types')
def admin_list_aircraft(handler):
    db = get_db()
    auth.require_admin(handler, db)
    rows = db.execute("SELECT * FROM aircraft_types ORDER BY name").fetchall()
    response.success(handler, [dict(r) for r in rows])


@route('POST', '/admin/aircraft-types')
def admin_create_aircraft(handler):
    db = get_db()
    auth.require_admin(handler, db)
    data = req.parse_json_body(handler)
    val.require_fields(data, 'iata_code', 'name')
    atid = str(uuid.uuid4())
    now = datetime.datetime.utcnow().isoformat()
    db.execute(
        "INSERT INTO aircraft_types(id,iata_code,name,manufacturer,seat_capacity,created_at,updated_at) VALUES(?,?,?,?,?,?,?)",
        (atid, data['iata_code'], data['name'], data.get('manufacturer'), data.get('seat_capacity'), now, now)
    )
    db.commit()
    response.created(handler, {'id': atid})


@route('PATCH', '/admin/aircraft-types/{at_id}')
def admin_update_aircraft(handler, at_id):
    db = get_db()
    auth.require_admin(handler, db)
    data = req.parse_json_body(handler)
    allowed = {'name', 'manufacturer', 'seat_capacity'}
    updates = {k: v for k, v in data.items() if k in allowed}
    now = datetime.datetime.utcnow().isoformat()
    updates['updated_at'] = now
    set_clause = ', '.join(f'{k}=?' for k in updates)
    db.execute(f"UPDATE aircraft_types SET {set_clause} WHERE id=?", (*updates.values(), at_id))
    db.commit()
    response.success(handler, None, 'Aircraft type updated')


@route('DELETE', '/admin/aircraft-types/{at_id}')
def admin_delete_aircraft(handler, at_id):
    db = get_db()
    auth.require_admin(handler, db)
    db.execute("DELETE FROM aircraft_types WHERE id=?", (at_id,))
    db.commit()
    response.no_content(handler)


# Flights
@route('GET', '/admin/flights')
def admin_list_flights(handler):
    db = get_db()
    auth.require_admin(handler, db)
    page, size = req.get_pagination(handler)
    date_filter = req.get_query_param(handler, 'date', '')
    query = "SELECT f.*, al.name as airline_name FROM flights f JOIN airlines al ON al.id=f.airline_id"
    params = []
    if date_filter:
        query += " WHERE DATE(f.departure_time)=?"
        params.append(date_filter)
    query += " ORDER BY f.departure_time DESC"
    rows = db.execute(query, params).fetchall()
    response.success(handler, paginate([dict(r) for r in rows], page, size))


@route('POST', '/admin/flights')
def admin_create_flight(handler):
    db = get_db()
    auth.require_admin(handler, db)
    data = req.parse_json_body(handler)
    val.require_fields(data, 'flight_number', 'airline_id', 'departure_airport_id', 'arrival_airport_id', 'departure_time', 'arrival_time', 'duration_minutes')
    fid = str(uuid.uuid4())
    now = datetime.datetime.utcnow().isoformat()
    db.execute(
        "INSERT INTO flights(id,flight_number,airline_id,aircraft_type_id,departure_airport_id,arrival_airport_id,departure_time,arrival_time,duration_minutes,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)",
        (fid, data['flight_number'], data['airline_id'], data.get('aircraft_type_id'),
         data['departure_airport_id'], data['arrival_airport_id'],
         data['departure_time'], data['arrival_time'], int(data['duration_minutes']),
         data.get('status', 'SCHEDULED'), now, now)
    )
    db.commit()
    response.created(handler, {'id': fid})


@route('PATCH', '/admin/flights/{flight_id}')
def admin_update_flight(handler, flight_id):
    db = get_db()
    auth.require_admin(handler, db)
    data = req.parse_json_body(handler)
    allowed = {'flight_number', 'departure_time', 'arrival_time', 'duration_minutes', 'status', 'aircraft_type_id'}
    updates = {k: v for k, v in data.items() if k in allowed}
    now = datetime.datetime.utcnow().isoformat()
    updates['updated_at'] = now
    set_clause = ', '.join(f'{k}=?' for k in updates)
    db.execute(f"UPDATE flights SET {set_clause} WHERE id=?", (*updates.values(), flight_id))
    db.commit()
    response.success(handler, None, 'Flight updated')


@route('DELETE', '/admin/flights/{flight_id}')
def admin_delete_flight(handler, flight_id):
    db = get_db()
    auth.require_admin(handler, db)
    db.execute("UPDATE flights SET status='CANCELLED', updated_at=? WHERE id=?", (datetime.datetime.utcnow().isoformat(), flight_id))
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
    now = datetime.datetime.utcnow().isoformat()
    db.execute("UPDATE flights SET status=?, updated_at=? WHERE id=?", (data['status'], now, flight_id))
    db.commit()
    response.success(handler, None, 'Status updated')


# Fares
@route('GET', '/admin/flights/{flight_id}/fares')
def admin_list_fares(handler, flight_id):
    db = get_db()
    auth.require_admin(handler, db)
    rows = db.execute(
        "SELECT fa.*, fi.available_seats, fi.total_seats FROM fares fa JOIN fare_inventories fi ON fi.fare_id=fa.id WHERE fa.flight_id=?",
        (flight_id,)
    ).fetchall()
    response.success(handler, [dict(r) for r in rows])


@route('POST', '/admin/flights/{flight_id}/fares')
def admin_create_fare(handler, flight_id):
    db = get_db()
    auth.require_admin(handler, db)
    data = req.parse_json_body(handler)
    val.require_fields(data, 'cabin_class_id', 'fare_code', 'fare_name', 'base_price')
    farid = str(uuid.uuid4())
    now = datetime.datetime.utcnow().isoformat()
    db.execute(
        "INSERT INTO fares(id,flight_id,cabin_class_id,fare_code,fare_name,base_price,tax,fees,currency,baggage_kg,is_refundable,is_changeable,change_fee,cancel_fee,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
        (farid, flight_id, data['cabin_class_id'], data['fare_code'], data['fare_name'],
         int(data['base_price']), int(data.get('tax', 0)), int(data.get('fees', 0)),
         data.get('currency', 'VND'), int(data.get('baggage_kg', 0)),
         1 if data.get('is_refundable') else 0, 1 if data.get('is_changeable') else 0,
         int(data.get('change_fee', 0)), int(data.get('cancel_fee', 0)), now, now)
    )
    total = int(data.get('total_seats', 100))
    db.execute("INSERT INTO fare_inventories(id,fare_id,total_seats,available_seats,updated_at) VALUES(?,?,?,?,?)",
               (str(uuid.uuid4()), farid, total, total, now))
    db.commit()
    response.created(handler, {'id': farid})


@route('PATCH', '/admin/fares/{fare_id}')
def admin_update_fare(handler, fare_id):
    db = get_db()
    auth.require_admin(handler, db)
    data = req.parse_json_body(handler)
    allowed = {'fare_name', 'base_price', 'tax', 'fees', 'baggage_kg', 'is_refundable', 'is_changeable', 'change_fee', 'cancel_fee'}
    updates = {k: v for k, v in data.items() if k in allowed}
    now = datetime.datetime.utcnow().isoformat()
    updates['updated_at'] = now
    set_clause = ', '.join(f'{k}=?' for k in updates)
    db.execute(f"UPDATE fares SET {set_clause} WHERE id=?", (*updates.values(), fare_id))
    if 'available_seats' in data:
        db.execute("UPDATE fare_inventories SET available_seats=?, updated_at=? WHERE fare_id=?", (int(data['available_seats']), now, fare_id))
    db.commit()
    response.success(handler, None, 'Fare updated')


@route('DELETE', '/admin/fares/{fare_id}')
def admin_delete_fare(handler, fare_id):
    db = get_db()
    auth.require_admin(handler, db)
    db.execute("DELETE FROM fares WHERE id=?", (fare_id,))
    db.commit()
    response.no_content(handler)


# Seat map
@route('GET', '/admin/flights/{flight_id}/seat-map')
def admin_get_seat_map(handler, flight_id):
    db = get_db()
    auth.require_admin(handler, db)
    seat_map = db.execute("SELECT * FROM seat_maps WHERE flight_id=?", (flight_id,)).fetchone()
    seats = db.execute("SELECT * FROM seats WHERE flight_id=? ORDER BY row_number, column_label", (flight_id,)).fetchall()
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
    now = datetime.datetime.utcnow().isoformat()
    existing = db.execute("SELECT id FROM seat_maps WHERE flight_id=?", (flight_id,)).fetchone()
    if existing:
        db.execute("UPDATE seat_maps SET layout_json=?, updated_at=? WHERE flight_id=?", (json.dumps(data['layout']), now, flight_id))
    else:
        db.execute("INSERT INTO seat_maps(id,flight_id,layout_json,created_at,updated_at) VALUES(?,?,?,?,?)",
                   (str(uuid.uuid4()), flight_id, json.dumps(data['layout']), now, now))
    db.commit()
    response.success(handler, None, 'Seat map updated')


@route('PATCH', '/admin/flights/{flight_id}/seats/{seat_id}')
def admin_update_seat(handler, flight_id, seat_id):
    db = get_db()
    auth.require_admin(handler, db)
    data = req.parse_json_body(handler)
    allowed = {'status', 'extra_fee', 'seat_type'}
    updates = {k: v for k, v in data.items() if k in allowed}
    now = datetime.datetime.utcnow().isoformat()
    updates['updated_at'] = now
    set_clause = ', '.join(f'{k}=?' for k in updates)
    db.execute(f"UPDATE seats SET {set_clause} WHERE id=? AND flight_id=?", (*updates.values(), seat_id, flight_id))
    db.commit()
    response.success(handler, None, 'Seat updated')


# Bookings admin
@route('GET', '/admin/bookings')
def admin_list_bookings(handler):
    db = get_db()
    auth.require_admin(handler, db)
    page, size = req.get_pagination(handler)
    status = req.get_query_param(handler, 'status', '')
    query = "SELECT * FROM bookings"
    params = []
    if status:
        query += " WHERE status=?"
        params.append(status)
    query += " ORDER BY created_at DESC"
    rows = db.execute(query, params).fetchall()
    response.success(handler, paginate([dict(r) for r in rows], page, size))


@route('GET', '/admin/bookings/{booking_id}')
def admin_get_booking(handler, booking_id):
    db = get_db()
    auth.require_admin(handler, db)
    booking = db.execute("SELECT * FROM bookings WHERE id=?", (booking_id,)).fetchone()
    if not booking:
        from core.exceptions import NotFoundError
        raise NotFoundError('Booking')
    response.success(handler, dict(booking))


@route('PATCH', '/admin/bookings/{booking_id}/status')
def admin_update_booking_status(handler, booking_id):
    db = get_db()
    user = auth.require_admin(handler, db)
    data = req.parse_json_body(handler)
    val.require_fields(data, 'status')
    now = datetime.datetime.utcnow().isoformat()
    booking = db.execute("SELECT status FROM bookings WHERE id=?", (booking_id,)).fetchone()
    if not booking:
        from core.exceptions import NotFoundError
        raise NotFoundError('Booking')
    db.execute("UPDATE bookings SET status=?, updated_at=? WHERE id=?", (data['status'], now, booking_id))
    db.execute(
        "INSERT INTO booking_status_histories(id,booking_id,from_status,to_status,reason,changed_by,created_at) VALUES(?,?,?,?,?,?,?)",
        (str(uuid.uuid4()), booking_id, booking['status'], data['status'], data.get('reason'), user['user_id'], now)
    )
    db.commit()
    response.success(handler, None, 'Status updated')


@route('POST', '/admin/bookings/{booking_id}/cancel')
def admin_cancel_booking(handler, booking_id):
    db = get_db()
    user = auth.require_admin(handler, db)
    from controllers.staff_controller import staff_cancel_booking
    staff_cancel_booking(handler, booking_id)


# Payments admin
@route('GET', '/admin/payments')
def admin_list_payments(handler):
    db = get_db()
    auth.require_admin(handler, db)
    page, size = req.get_pagination(handler)
    rows = db.execute("SELECT * FROM payments ORDER BY created_at DESC").fetchall()
    response.success(handler, paginate([dict(r) for r in rows], page, size))


@route('GET', '/admin/payments/{payment_id}')
def admin_get_payment(handler, payment_id):
    db = get_db()
    auth.require_admin(handler, db)
    row = db.execute("SELECT * FROM payments WHERE id=?", (payment_id,)).fetchone()
    if not row:
        from core.exceptions import NotFoundError
        raise NotFoundError('Payment')
    response.success(handler, dict(row))


@route('PATCH', '/admin/payments/{payment_id}/status')
def admin_update_payment_status(handler, payment_id):
    db = get_db()
    auth.require_admin(handler, db)
    data = req.parse_json_body(handler)
    val.require_fields(data, 'status')
    now = datetime.datetime.utcnow().isoformat()
    db.execute("UPDATE payments SET status=?, updated_at=? WHERE id=?", (data['status'], now, payment_id))
    db.commit()
    response.success(handler, None, 'Payment status updated')


# Refunds admin
@route('GET', '/admin/refunds')
def admin_list_refunds(handler):
    db = get_db()
    auth.require_admin(handler, db)
    page, size = req.get_pagination(handler)
    rows = db.execute("SELECT * FROM refunds ORDER BY created_at DESC").fetchall()
    response.success(handler, paginate([dict(r) for r in rows], page, size))


@route('GET', '/admin/refunds/{refund_id}')
def admin_get_refund(handler, refund_id):
    db = get_db()
    auth.require_admin(handler, db)
    row = db.execute("SELECT * FROM refunds WHERE id=?", (refund_id,)).fetchone()
    if not row:
        from core.exceptions import NotFoundError
        raise NotFoundError('Refund')
    response.success(handler, dict(row))


@route('PATCH', '/admin/refunds/{refund_id}')
def admin_update_refund(handler, refund_id):
    db = get_db()
    auth.require_admin(handler, db)
    data = req.parse_json_body(handler)
    val.require_fields(data, 'status')
    now = datetime.datetime.utcnow().isoformat()
    db.execute("UPDATE refunds SET status=?, updated_at=? WHERE id=?", (data['status'], now, refund_id))
    db.commit()
    response.success(handler, None, 'Refund updated')


# Coupons
@route('GET', '/admin/coupons')
def admin_list_coupons(handler):
    db = get_db()
    auth.require_admin(handler, db)
    rows = db.execute("SELECT * FROM coupons ORDER BY created_at DESC").fetchall()
    response.success(handler, [dict(r) for r in rows])


@route('POST', '/admin/coupons')
def admin_create_coupon(handler):
    db = get_db()
    auth.require_admin(handler, db)
    data = req.parse_json_body(handler)
    val.require_fields(data, 'code', 'discount_type', 'discount_value', 'valid_from', 'valid_until')
    cid = str(uuid.uuid4())
    now = datetime.datetime.utcnow().isoformat()
    db.execute(
        "INSERT INTO coupons(id,code,discount_type,discount_value,min_amount,max_uses,used_count,valid_from,valid_until,is_active,created_at,updated_at) VALUES(?,?,?,?,?,?,0,?,?,1,?,?)",
        (cid, data['code'].upper(), data['discount_type'], int(data['discount_value']),
         data.get('min_amount'), data.get('max_uses'), data['valid_from'], data['valid_until'], now, now)
    )
    db.commit()
    response.created(handler, {'id': cid})


@route('GET', '/admin/coupons/{coupon_id}')
def admin_get_coupon(handler, coupon_id):
    db = get_db()
    auth.require_admin(handler, db)
    row = db.execute("SELECT * FROM coupons WHERE id=? OR code=?", (coupon_id, coupon_id.upper())).fetchone()
    if not row:
        from core.exceptions import NotFoundError
        raise NotFoundError('Coupon')
    response.success(handler, dict(row))


@route('PATCH', '/admin/coupons/{coupon_id}')
def admin_update_coupon(handler, coupon_id):
    db = get_db()
    auth.require_admin(handler, db)
    data = req.parse_json_body(handler)
    allowed = {'discount_value', 'min_amount', 'max_uses', 'valid_from', 'valid_until', 'is_active'}
    updates = {k: v for k, v in data.items() if k in allowed}
    now = datetime.datetime.utcnow().isoformat()
    updates['updated_at'] = now
    set_clause = ', '.join(f'{k}=?' for k in updates)
    db.execute(f"UPDATE coupons SET {set_clause} WHERE id=?", (*updates.values(), coupon_id))
    db.commit()
    response.success(handler, None, 'Coupon updated')


@route('DELETE', '/admin/coupons/{coupon_id}')
def admin_delete_coupon(handler, coupon_id):
    db = get_db()
    auth.require_admin(handler, db)
    db.execute("UPDATE coupons SET is_active=0, updated_at=? WHERE id=?", (datetime.datetime.utcnow().isoformat(), coupon_id))
    db.commit()
    response.no_content(handler)


# Content
@route('GET', '/admin/contents')
def admin_list_contents(handler):
    db = get_db()
    auth.require_admin(handler, db)
    rows = db.execute("SELECT * FROM contents ORDER BY created_at DESC").fetchall()
    response.success(handler, [dict(r) for r in rows])


@route('POST', '/admin/contents')
def admin_create_content(handler):
    db = get_db()
    auth.require_admin(handler, db)
    data = req.parse_json_body(handler)
    val.require_fields(data, 'key', 'title', 'body')
    cid = str(uuid.uuid4())
    now = datetime.datetime.utcnow().isoformat()
    db.execute(
        "INSERT INTO contents(id,key,title,body,content_type,is_published,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)",
        (cid, data['key'], data['title'], data['body'], data.get('content_type', 'PAGE'), 1 if data.get('is_published') else 0, now, now)
    )
    db.commit()
    response.created(handler, {'id': cid})


@route('GET', '/admin/contents/{content_id}')
def admin_get_content(handler, content_id):
    db = get_db()
    auth.require_admin(handler, db)
    row = db.execute("SELECT * FROM contents WHERE id=? OR key=?", (content_id, content_id)).fetchone()
    if not row:
        from core.exceptions import NotFoundError
        raise NotFoundError('Content')
    response.success(handler, dict(row))


@route('PATCH', '/admin/contents/{content_id}')
def admin_update_content(handler, content_id):
    db = get_db()
    auth.require_admin(handler, db)
    data = req.parse_json_body(handler)
    allowed = {'title', 'body', 'is_published'}
    updates = {k: v for k, v in data.items() if k in allowed}
    now = datetime.datetime.utcnow().isoformat()
    updates['updated_at'] = now
    set_clause = ', '.join(f'{k}=?' for k in updates)
    db.execute(f"UPDATE contents SET {set_clause} WHERE id=?", (*updates.values(), content_id))
    db.commit()
    response.success(handler, None, 'Content updated')


@route('DELETE', '/admin/contents/{content_id}')
def admin_delete_content(handler, content_id):
    db = get_db()
    auth.require_admin(handler, db)
    db.execute("DELETE FROM contents WHERE id=?", (content_id,))
    db.commit()
    response.no_content(handler)


# Dashboard
@route('GET', '/admin/dashboard/summary')
def admin_dashboard_summary(handler):
    db = get_db()
    auth.require_admin(handler, db)
    total_bookings = db.execute("SELECT COUNT(*) as cnt FROM bookings").fetchone()['cnt']
    confirmed = db.execute("SELECT COUNT(*) as cnt FROM bookings WHERE status='CONFIRMED'").fetchone()['cnt']
    revenue = db.execute("SELECT COALESCE(SUM(amount),0) as total FROM payments WHERE status='SUCCESS'").fetchone()['total']
    customers = db.execute("SELECT COUNT(*) as cnt FROM users WHERE role='CUSTOMER'").fetchone()['cnt']
    response.success(handler, {
        'total_bookings': total_bookings,
        'confirmed_bookings': confirmed,
        'total_revenue': revenue,
        'total_customers': customers,
        'currency': 'VND',
    })


@route('GET', '/admin/dashboard/bookings')
def admin_dashboard_bookings(handler):
    db = get_db()
    auth.require_admin(handler, db)
    rows = db.execute(
        "SELECT DATE(created_at) as date, COUNT(*) as count, SUM(total_amount) as revenue FROM bookings GROUP BY DATE(created_at) ORDER BY date DESC LIMIT 30"
    ).fetchall()
    response.success(handler, [dict(r) for r in rows])


@route('GET', '/admin/dashboard/revenue')
def admin_dashboard_revenue(handler):
    db = get_db()
    auth.require_admin(handler, db)
    rows = db.execute(
        "SELECT DATE(created_at) as date, SUM(amount) as revenue FROM payments WHERE status='SUCCESS' GROUP BY DATE(created_at) ORDER BY date DESC LIMIT 30"
    ).fetchall()
    response.success(handler, [dict(r) for r in rows])


@route('GET', '/admin/dashboard/flights')
def admin_dashboard_flights(handler):
    db = get_db()
    auth.require_admin(handler, db)
    rows = db.execute(
        "SELECT status, COUNT(*) as count FROM flights GROUP BY status"
    ).fetchall()
    response.success(handler, [dict(r) for r in rows])


@route('GET', '/admin/audit-logs')
def admin_audit_logs(handler):
    db = get_db()
    auth.require_admin(handler, db)
    page, size = req.get_pagination(handler)
    resource = req.get_query_param(handler, 'resource', '')
    query = "SELECT * FROM audit_logs"
    params = []
    if resource:
        query += " WHERE resource=?"
        params.append(resource)
    query += " ORDER BY created_at DESC"
    rows = db.execute(query, params).fetchall()
    response.success(handler, paginate([dict(r) for r in rows], page, size))
