import json
import uuid
import datetime
from core.router import route
from core import response, request as req, authentication as auth, validation as val, middleware
from database.connection import get_db, transaction
from utils.code_generator import generate_pnr, generate_ticket_number
import config


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


def _require_booking_owner(db, booking_id, user):
    row = db.execute("SELECT * FROM bookings WHERE id=?", (booking_id,)).fetchone()
    if not row:
        from core.exceptions import NotFoundError
        raise NotFoundError('Booking')
    if user['role'] == 'CUSTOMER' and row['user_id'] != user['user_id']:
        from core.exceptions import AuthorizationError
        raise AuthorizationError()
    return row


@route('POST', '/bookings')
def create_booking(handler):
    db = get_db()
    user = auth.require_auth(handler, db)
    idempotency_key = req.get_idempotency_key(handler)

    # Idempotency check
    if idempotency_key:
        existing = db.execute("SELECT * FROM bookings WHERE idempotency_key=?", (idempotency_key,)).fetchone()
        if existing:
            response.success(handler, dict(existing), 'Booking already exists')
            return

    data = req.parse_json_body(handler)
    val.require_fields(data, 'draft_id')
    draft_id = data['draft_id']

    draft = db.execute("SELECT * FROM booking_drafts WHERE id=?", (draft_id,)).fetchone()
    if not draft:
        from core.exceptions import NotFoundError
        raise NotFoundError('Booking draft')
    if draft['status'] != 'ACTIVE':
        from core.exceptions import BusinessError
        raise BusinessError('DRAFT_NOT_ACTIVE', 'Draft is no longer active')
    now_dt = datetime.datetime.utcnow()
    if now_dt.isoformat() > draft['expires_at']:
        from core.exceptions import BusinessError
        raise BusinessError('DRAFT_EXPIRED', 'Draft has expired')

    contact = db.execute("SELECT * FROM draft_contacts WHERE draft_id=?", (draft_id,)).fetchone()
    if not contact:
        from core.exceptions import BusinessError
        raise BusinessError('CONTACT_MISSING', 'Contact information is required')

    passengers = db.execute("SELECT * FROM draft_passengers WHERE draft_id=? ORDER BY passenger_index", (draft_id,)).fetchall()
    if not passengers:
        from core.exceptions import BusinessError
        raise BusinessError('PASSENGERS_MISSING', 'Passenger information is required')

    # Reprice and verify inventory
    offer = json.loads(draft['flight_offer_json'])
    total_amount = 0
    for f in offer:
        fare = db.execute(
            "SELECT fa.*, fi.available_seats FROM fares fa JOIN fare_inventories fi ON fi.fare_id=fa.id WHERE fa.id=?",
            (f['id'],)
        ).fetchone()
        if not fare or fare['available_seats'] < len(passengers):
            from core.exceptions import ConflictError
            raise ConflictError('Insufficient seat inventory', 'INVENTORY_INSUFFICIENT')
        total_amount += (fare['base_price'] + fare['tax'] + fare['fees']) * len(passengers)

    # Add ancillary costs
    ancillaries = db.execute("SELECT * FROM draft_ancillaries WHERE draft_id=?", (draft_id,)).fetchall()
    for anc in ancillaries:
        total_amount += anc['price'] * anc['quantity']

    bid = str(uuid.uuid4())
    now = now_dt.isoformat()

    with transaction(db):
        db.execute(
            "INSERT INTO bookings(id,pnr,user_id,draft_id,contact_name,contact_email,contact_phone,total_amount,currency,status,idempotency_key,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)",
            (bid, None, draft['user_id'], draft_id, contact['full_name'], contact['email'],
             contact['phone'], total_amount, 'VND', 'PENDING_PAYMENT', idempotency_key, now, now)
        )

        # Save segments
        for i, f in enumerate(offer):
            seg_id = str(uuid.uuid4())
            db.execute(
                "INSERT INTO booking_segments(id,booking_id,flight_id,fare_id,segment_order,created_at) VALUES(?,?,?,?,?,?)",
                (seg_id, bid, f.get('flight_id', ''), f['id'], i, now)
            )

        # Save passengers
        bp_ids = []
        for pax in passengers:
            bp_id = str(uuid.uuid4())
            db.execute(
                "INSERT INTO booking_passengers(id,booking_id,passenger_index,passenger_type,full_name,date_of_birth,nationality,passport_number,passport_expiry,created_at) VALUES(?,?,?,?,?,?,?,?,?,?)",
                (bp_id, bid, pax['passenger_index'], pax['passenger_type'], pax['full_name'],
                 pax['date_of_birth'], pax['nationality'], pax['passport_number'], pax['passport_expiry'], now)
            )
            bp_ids.append((bp_id, pax['passenger_index']))

        # Seat assignments from holds
        holds = db.execute("SELECT * FROM seat_holds WHERE draft_id=? AND released_at IS NULL", (draft_id,)).fetchall()
        segs = db.execute("SELECT * FROM booking_segments WHERE booking_id=? ORDER BY segment_order", (bid,)).fetchall()
        for hold in holds:
            bp = next((b for b in bp_ids if b[1] == hold['passenger_index']), None)
            if bp and segs:
                # Assign to first segment for simplicity
                db.execute(
                    "INSERT INTO seat_assignments(id,booking_id,segment_id,passenger_id,seat_id,created_at) VALUES(?,?,?,?,?,?)",
                    (str(uuid.uuid4()), bid, segs[0]['id'], bp[0], hold['seat_id'], now)
                )

        _booking_status_history(db, bid, None, 'PENDING_PAYMENT', changed_by=user['user_id'])
        db.execute("UPDATE booking_drafts SET status='CONFIRMED', updated_at=? WHERE id=?", (now, draft_id))
        _audit(db, user['user_id'], 'CREATE_BOOKING', 'bookings', bid, ip=handler.client_address[0])

    response.created(handler, {
        'id': bid,
        'status': 'PENDING_PAYMENT',
        'total_amount': total_amount,
        'currency': 'VND',
    }, 'Booking created')


@route('GET', '/bookings/{booking_id}')
def get_booking(handler, booking_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    booking = _require_booking_owner(db, booking_id, user)
    segments = db.execute(
        """SELECT bs.*, f.flight_number, f.departure_time, f.arrival_time, f.status as flight_status,
                  dep.iata_code as dep_iata, arr.iata_code as arr_iata,
                  al.name as airline_name
           FROM booking_segments bs
           JOIN flights f ON f.id=bs.flight_id
           JOIN airports dep ON dep.id=f.departure_airport_id
           JOIN airports arr ON arr.id=f.arrival_airport_id
           JOIN airlines al ON al.id=f.airline_id
           WHERE bs.booking_id=? ORDER BY bs.segment_order""",
        (booking_id,)
    ).fetchall()
    passengers = db.execute("SELECT * FROM booking_passengers WHERE booking_id=? ORDER BY passenger_index", (booking_id,)).fetchall()
    payments = db.execute("SELECT id,amount,currency,payment_method,status,created_at FROM payments WHERE booking_id=?", (booking_id,)).fetchall()

    response.success(handler, {
        'booking': dict(booking),
        'segments': [dict(s) for s in segments],
        'passengers': [dict(p) for p in passengers],
        'payments': [dict(p) for p in payments],
    })


@route('GET', '/users/me/bookings')
def my_bookings(handler):
    db = get_db()
    user = auth.require_auth(handler, db)
    page, size = req.get_pagination(handler)
    status_filter = req.get_query_param(handler, 'status')

    query = "SELECT * FROM bookings WHERE user_id=?"
    params = [user['user_id']]
    if status_filter:
        query += " AND status=?"
        params.append(status_filter)
    query += " ORDER BY created_at DESC"

    rows = db.execute(query, params).fetchall()
    from utils.pagination import paginate
    result = paginate([dict(r) for r in rows], page, size)
    response.success(handler, result)


@route('GET', '/users/me/bookings/{booking_id}')
def my_booking_detail(handler, booking_id):
    return get_booking(handler, booking_id)


@route('GET', '/users/me/bookings/{booking_id}/history')
def my_booking_history(handler, booking_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    _require_booking_owner(db, booking_id, user)
    rows = db.execute("SELECT * FROM booking_status_histories WHERE booking_id=? ORDER BY created_at", (booking_id,)).fetchall()
    response.success(handler, [dict(r) for r in rows])


@route('GET', '/users/me/bookings/{booking_id}/printable')
def my_booking_printable(handler, booking_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    booking = _require_booking_owner(db, booking_id, user)
    segments = db.execute(
        """SELECT bs.*, f.flight_number, f.departure_time, f.arrival_time,
                  dep.iata_code as dep_iata, dep.city as dep_city,
                  arr.iata_code as arr_iata, arr.city as arr_city,
                  al.name as airline_name
           FROM booking_segments bs
           JOIN flights f ON f.id=bs.flight_id
           JOIN airports dep ON dep.id=f.departure_airport_id
           JOIN airports arr ON arr.id=f.arrival_airport_id
           JOIN airlines al ON al.id=f.airline_id
           WHERE bs.booking_id=? ORDER BY bs.segment_order""",
        (booking_id,)
    ).fetchall()
    passengers = db.execute("SELECT * FROM booking_passengers WHERE booking_id=? ORDER BY passenger_index", (booking_id,)).fetchall()

    html = _generate_itinerary_html(dict(booking), [dict(s) for s in segments], [dict(p) for p in passengers])
    from core.response import _send
    # Return as JSON with html field for simplicity
    response.success(handler, {'html': html})


def _generate_itinerary_html(booking, segments, passengers):
    segs_html = ''.join(
        f"<tr><td>{s['flight_number']}</td><td>{s['dep_iata']} → {s['arr_iata']}</td><td>{s['departure_time']}</td><td>{s['arrival_time']}</td></tr>"
        for s in segments
    )
    pax_html = ''.join(
        f"<tr><td>{p['passenger_index']+1}</td><td>{p['full_name']}</td><td>{p['passenger_type']}</td></tr>"
        for p in passengers
    )
    return f"""<!DOCTYPE html>
<html><head><title>Booking {booking['pnr'] or booking['id']}</title></head>
<body>
<h1>Itinerary</h1>
<p>PNR: <strong>{booking['pnr'] or 'Pending'}</strong></p>
<p>Status: {booking['status']}</p>
<p>Contact: {booking['contact_name']} | {booking['contact_email']} | {booking['contact_phone']}</p>
<h2>Flights</h2>
<table border="1"><tr><th>Flight</th><th>Route</th><th>Departure</th><th>Arrival</th></tr>{segs_html}</table>
<h2>Passengers</h2>
<table border="1"><tr><th>#</th><th>Name</th><th>Type</th></tr>{pax_html}</table>
<p>Total: {booking['total_amount']:,} {booking['currency']}</p>
</body></html>"""


@route('POST', '/users/me/bookings/{booking_id}/resend-confirmation')
def resend_confirmation(handler, booking_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    booking = _require_booking_owner(db, booking_id, user)
    # Simulated: just log
    import logging
    logging.getLogger(__name__).info('Resend confirmation for booking %s to %s', booking_id, booking['contact_email'])
    response.success(handler, None, 'Confirmation email sent (simulated)')


@route('POST', '/bookings/lookup')
def lookup_booking(handler):
    ip = handler.client_address[0]
    middleware.check_rate_limit(f'pnr_lookup:{ip}', 10, 300)
    db = get_db()
    data = req.parse_json_body(handler)
    val.require_fields(data, 'pnr', 'last_name')
    pnr = data['pnr'].upper()
    last_name = data['last_name'].lower()

    booking = db.execute("SELECT * FROM bookings WHERE pnr=?", (pnr,)).fetchone()
    if not booking:
        from core.exceptions import NotFoundError
        raise NotFoundError('Booking')

    # Verify last name
    pax = db.execute(
        "SELECT full_name FROM booking_passengers WHERE booking_id=?", (booking['id'],)
    ).fetchall()
    found = any(last_name in p['full_name'].lower() for p in pax)
    if not found:
        from core.exceptions import NotFoundError
        raise NotFoundError('Booking')

    # Return limited info
    response.success(handler, {
        'id': booking['id'],
        'pnr': booking['pnr'],
        'status': booking['status'],
        'contact_name': booking['contact_name'],
        'total_amount': booking['total_amount'],
        'currency': booking['currency'],
    })


@route('GET', '/bookings/{booking_id}/itinerary')
def get_itinerary(handler, booking_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    booking = _require_booking_owner(db, booking_id, user)
    segments = db.execute(
        """SELECT bs.*, f.flight_number, f.departure_time, f.arrival_time, f.duration_minutes,
                  dep.iata_code as dep_iata, dep.name as dep_name, dep.city as dep_city, dep.timezone as dep_tz,
                  arr.iata_code as arr_iata, arr.name as arr_name, arr.city as arr_city, arr.timezone as arr_tz,
                  al.name as airline_name, al.iata_code as airline_code
           FROM booking_segments bs
           JOIN flights f ON f.id=bs.flight_id
           JOIN airports dep ON dep.id=f.departure_airport_id
           JOIN airports arr ON arr.id=f.arrival_airport_id
           JOIN airlines al ON al.id=f.airline_id
           WHERE bs.booking_id=? ORDER BY bs.segment_order""",
        (booking_id,)
    ).fetchall()
    response.success(handler, {'booking': dict(booking), 'segments': [dict(s) for s in segments]})


@route('GET', '/bookings/{booking_id}/e-tickets')
def get_etickets(handler, booking_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    _require_booking_owner(db, booking_id, user)
    tickets = db.execute(
        "SELECT et.*, bp.full_name, bp.passenger_type FROM e_tickets et JOIN booking_passengers bp ON bp.id=et.passenger_id WHERE et.booking_id=?",
        (booking_id,)
    ).fetchall()
    response.success(handler, [dict(t) for t in tickets])


@route('GET', '/bookings/{booking_id}/e-tickets/{ticket_id}')
def get_eticket(handler, booking_id, ticket_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    _require_booking_owner(db, booking_id, user)
    ticket = db.execute(
        """SELECT et.*, bp.full_name, bp.passport_number, bp.nationality, bp.passenger_type
           FROM e_tickets et JOIN booking_passengers bp ON bp.id=et.passenger_id
           WHERE et.id=? AND et.booking_id=?""",
        (ticket_id, booking_id)
    ).fetchone()
    if not ticket:
        from core.exceptions import NotFoundError
        raise NotFoundError('E-Ticket')
    response.success(handler, dict(ticket))


@route('GET', '/bookings/{booking_id}/receipt')
def get_receipt(handler, booking_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    booking = _require_booking_owner(db, booking_id, user)
    payments = db.execute("SELECT * FROM payments WHERE booking_id=? AND status='SUCCESS'", (booking_id,)).fetchall()
    response.success(handler, {
        'booking_id': booking_id,
        'pnr': booking['pnr'],
        'total_amount': booking['total_amount'],
        'currency': booking['currency'],
        'payments': [dict(p) for p in payments],
    })


@route('POST', '/bookings/{booking_id}/documents/send-email')
def send_documents_email(handler, booking_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    booking = _require_booking_owner(db, booking_id, user)
    import logging
    logging.getLogger(__name__).info('Sending documents for booking %s', booking_id)
    response.success(handler, None, 'Documents sent by email (simulated)')


# Cancellation endpoints
@route('POST', '/users/me/bookings/{booking_id}/cancellation-preview')
def cancellation_preview(handler, booking_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    booking = _require_booking_owner(db, booking_id, user)
    if booking['status'] not in ('CONFIRMED', 'PENDING_PAYMENT'):
        from core.exceptions import BusinessError
        raise BusinessError('CANNOT_CANCEL', f'Booking in status {booking["status"]} cannot be cancelled')

    # Calculate refund
    total = booking['total_amount']
    # Simple demo logic: 80% refund
    refund = int(total * 0.8)
    fee = total - refund

    response.success(handler, {
        'booking_id': booking_id,
        'total_paid': total,
        'cancellation_fee': fee,
        'refund_amount': refund,
        'refund_eligible': True,
        'currency': 'VND',
    })


@route('POST', '/users/me/bookings/{booking_id}/cancel')
def cancel_booking(handler, booking_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    booking = _require_booking_owner(db, booking_id, user)
    if booking['status'] not in ('CONFIRMED', 'PENDING_PAYMENT'):
        from core.exceptions import BusinessError
        raise BusinessError('CANNOT_CANCEL', f'Booking in status {booking["status"]} cannot be cancelled')

    data = req.parse_json_body(handler)
    reason = data.get('reason', 'Customer request')
    now = datetime.datetime.utcnow().isoformat()

    with transaction(db):
        old_status = booking['status']
        db.execute("UPDATE bookings SET status='CANCELLED', updated_at=? WHERE id=?", (now, booking_id))
        _booking_status_history(db, booking_id, old_status, 'CANCELLED', changed_by=user['user_id'], reason=reason)

        # Return seats
        assigns = db.execute(
            "SELECT seat_id FROM seat_assignments WHERE booking_id=?", (booking_id,)
        ).fetchall()
        for a in assigns:
            db.execute("UPDATE seats SET status='AVAILABLE', updated_at=? WHERE id=?", (now, a['seat_id']))

        # Create cancellation record
        total = booking['total_amount']
        refund = int(total * 0.8)
        db.execute(
            "INSERT INTO cancellations(id,booking_id,reason,cancelled_by,refund_eligible,created_at) VALUES(?,?,?,?,1,?)",
            (str(uuid.uuid4()), booking_id, reason, user['user_id'], now)
        )

        # Auto-create refund
        payment = db.execute("SELECT id FROM payments WHERE booking_id=? AND status='SUCCESS'", (booking_id,)).fetchone()
        if payment:
            db.execute(
                "INSERT INTO refunds(id,booking_id,payment_id,amount,currency,status,reason,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)",
                (str(uuid.uuid4()), booking_id, payment['id'], refund, 'VND', 'PENDING', reason, now, now)
            )
        _audit(db, user['user_id'], 'CANCEL_BOOKING', 'bookings', booking_id, ip=handler.client_address[0])

    response.success(handler, {'status': 'CANCELLED', 'refund_amount': refund, 'currency': 'VND'})


@route('GET', '/users/me/bookings/{booking_id}/cancellation')
def get_cancellation(handler, booking_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    _require_booking_owner(db, booking_id, user)
    row = db.execute("SELECT * FROM cancellations WHERE booking_id=?", (booking_id,)).fetchone()
    if not row:
        from core.exceptions import NotFoundError
        raise NotFoundError('Cancellation')
    response.success(handler, dict(row))


@route('GET', '/bookings/{booking_id}/refund-preview')
def refund_preview(handler, booking_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    booking = _require_booking_owner(db, booking_id, user)
    total = booking['total_amount']
    refund = int(total * 0.8)
    response.success(handler, {'refund_amount': refund, 'currency': 'VND', 'fee': total - refund})


@route('POST', '/bookings/{booking_id}/refunds')
def create_refund(handler, booking_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    booking = _require_booking_owner(db, booking_id, user)
    data = req.parse_json_body(handler)
    now = datetime.datetime.utcnow().isoformat()
    total = booking['total_amount']
    amount = data.get('amount', int(total * 0.8))
    payment = db.execute("SELECT id FROM payments WHERE booking_id=? AND status='SUCCESS'", (booking_id,)).fetchone()
    rid = str(uuid.uuid4())
    db.execute(
        "INSERT INTO refunds(id,booking_id,payment_id,amount,currency,status,reason,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)",
        (rid, booking_id, payment['id'] if payment else None, amount, 'VND', 'PENDING', data.get('reason'), now, now)
    )
    db.commit()
    response.created(handler, {'id': rid, 'amount': amount, 'status': 'PENDING'})


@route('GET', '/bookings/{booking_id}/refunds')
def get_refunds(handler, booking_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    _require_booking_owner(db, booking_id, user)
    rows = db.execute("SELECT * FROM refunds WHERE booking_id=? ORDER BY created_at DESC", (booking_id,)).fetchall()
    response.success(handler, [dict(r) for r in rows])


@route('GET', '/refunds/{refund_id}')
def get_refund(handler, refund_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    row = db.execute("SELECT * FROM refunds WHERE id=?", (refund_id,)).fetchone()
    if not row:
        from core.exceptions import NotFoundError
        raise NotFoundError('Refund')
    booking = db.execute("SELECT user_id FROM bookings WHERE id=?", (row['booking_id'],)).fetchone()
    if user['role'] == 'CUSTOMER' and booking['user_id'] != user['user_id']:
        from core.exceptions import AuthorizationError
        raise AuthorizationError()
    response.success(handler, dict(row))


@route('GET', '/bookings/{booking_id}/check-in')
def check_in_link(handler, booking_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    booking = _require_booking_owner(db, booking_id, user)
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
    _require_booking_owner(db, booking_id, user)
    segments = db.execute(
        "SELECT f.flight_number, f.status, f.departure_time, f.arrival_time FROM booking_segments bs JOIN flights f ON f.id=bs.flight_id WHERE bs.booking_id=? ORDER BY bs.segment_order",
        (booking_id,)
    ).fetchall()
    response.success(handler, [dict(s) for s in segments])


@route('GET', '/bookings/{booking_id}/travel-alerts')
def travel_alerts(handler, booking_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    _require_booking_owner(db, booking_id, user)
    # Simulated alerts
    response.success(handler, [
        {'type': 'INFO', 'title': 'Check-in Open', 'message': 'Online check-in opens 24 hours before departure'},
    ])


# Change flight
@route('POST', '/users/me/bookings/{booking_id}/change-search')
def change_search(handler, booking_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    booking = _require_booking_owner(db, booking_id, user)
    if booking['status'] != 'CONFIRMED':
        from core.exceptions import BusinessError
        raise BusinessError('CANNOT_CHANGE', 'Booking must be confirmed to change')
    data = req.parse_json_body(handler)
    # Re-use flight search logic
    from controllers.flight_controller import _search_one_way
    results = _search_one_way(data, data)
    response.success(handler, results)


@route('POST', '/users/me/bookings/{booking_id}/change-quote')
def change_quote(handler, booking_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    booking = _require_booking_owner(db, booking_id, user)
    data = req.parse_json_body(handler)
    val.require_fields(data, 'new_fare_id')
    new_fare = db.execute("SELECT * FROM fares WHERE id=?", (data['new_fare_id'],)).fetchone()
    if not new_fare:
        from core.exceptions import NotFoundError
        raise NotFoundError('Fare')
    # Compare prices
    passengers = db.execute("SELECT count(*) as cnt FROM booking_passengers WHERE booking_id=?", (booking_id,)).fetchone()
    pax_count = passengers['cnt']
    new_total = (new_fare['base_price'] + new_fare['tax'] + new_fare['fees']) * pax_count
    diff = new_total - booking['total_amount']
    change_fee = new_fare['change_fee']
    response.success(handler, {
        'new_total': new_total,
        'current_total': booking['total_amount'],
        'price_difference': diff,
        'change_fee': change_fee,
        'amount_to_pay': max(0, diff + change_fee),
        'currency': 'VND',
    })


@route('POST', '/users/me/bookings/{booking_id}/change-confirm')
def change_confirm(handler, booking_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    booking = _require_booking_owner(db, booking_id, user)
    data = req.parse_json_body(handler)
    val.require_fields(data, 'new_fare_id', 'new_flight_id')
    now = datetime.datetime.utcnow().isoformat()

    with transaction(db):
        db.execute("UPDATE bookings SET status='CHANGE_PENDING', updated_at=? WHERE id=?", (now, booking_id))
        _booking_status_history(db, booking_id, booking['status'], 'CHANGE_PENDING', changed_by=user['user_id'])
        change_id = str(uuid.uuid4())
        db.execute(
            "INSERT INTO booking_changes(id,booking_id,change_type,old_data_json,new_data_json,fee,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)",
            (change_id, booking_id, 'FLIGHT', json.dumps({'flight_id': data.get('old_flight_id')}),
             json.dumps({'flight_id': data['new_flight_id'], 'fare_id': data['new_fare_id']}), 0, 'PENDING', now, now)
        )
        _audit(db, user['user_id'], 'CHANGE_FLIGHT', 'bookings', booking_id, ip=handler.client_address[0])

    response.success(handler, {'change_id': change_id, 'status': 'CHANGE_PENDING'})


@route('GET', '/users/me/bookings/{booking_id}/change-status')
def change_status(handler, booking_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    _require_booking_owner(db, booking_id, user)
    change = db.execute("SELECT * FROM booking_changes WHERE booking_id=? ORDER BY created_at DESC LIMIT 1", (booking_id,)).fetchone()
    response.success(handler, dict(change) if change else {'status': 'NO_CHANGE_IN_PROGRESS'})


@route('GET', '/users/me/bookings/{booking_id}/segments/{segment_id}/seat-map')
def post_booking_seat_map(handler, booking_id, segment_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    _require_booking_owner(db, booking_id, user)
    seg = db.execute("SELECT flight_id FROM booking_segments WHERE id=? AND booking_id=?", (segment_id, booking_id)).fetchone()
    if not seg:
        from core.exceptions import NotFoundError
        raise NotFoundError('Segment')
    flight_id = seg['flight_id']
    seat_map = db.execute("SELECT * FROM seat_maps WHERE flight_id=?", (flight_id,)).fetchone()
    seats = db.execute("SELECT * FROM seats WHERE flight_id=? ORDER BY row_number, column_label", (flight_id,)).fetchall()
    response.success(handler, {
        'flight_id': flight_id,
        'layout': json.loads(seat_map['layout_json']) if seat_map else {},
        'seats': [dict(s) for s in seats],
    })


@route('POST', '/users/me/bookings/{booking_id}/seat-change-preview')
def seat_change_preview(handler, booking_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    _require_booking_owner(db, booking_id, user)
    data = req.parse_json_body(handler)
    seat_id = data.get('seat_id')
    if seat_id:
        seat = db.execute("SELECT * FROM seats WHERE id=?", (seat_id,)).fetchone()
        fee = seat['extra_fee'] if seat else 0
    else:
        fee = 0
    response.success(handler, {'seat_change_fee': fee, 'currency': 'VND'})


@route('POST', '/users/me/bookings/{booking_id}/seat-change-confirm')
def seat_change_confirm(handler, booking_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    booking = _require_booking_owner(db, booking_id, user)
    data = req.parse_json_body(handler)
    val.require_fields(data, 'segment_id', 'passenger_id', 'new_seat_id')
    now = datetime.datetime.utcnow().isoformat()

    with transaction(db):
        old_assign = db.execute(
            "SELECT * FROM seat_assignments WHERE segment_id=? AND passenger_id=? AND booking_id=?",
            (data['segment_id'], data['passenger_id'], booking_id)
        ).fetchone()
        if old_assign:
            db.execute("UPDATE seats SET status='AVAILABLE', updated_at=? WHERE id=?", (now, old_assign['seat_id']))

        new_seat = db.execute("SELECT * FROM seats WHERE id=?", (data['new_seat_id'],)).fetchone()
        if not new_seat or new_seat['status'] not in ('AVAILABLE',):
            from core.exceptions import ConflictError
            raise ConflictError('New seat not available', 'SEAT_NOT_AVAILABLE')

        if old_assign:
            db.execute("UPDATE seat_assignments SET seat_id=? WHERE id=?", (data['new_seat_id'], old_assign['id']))
        else:
            db.execute(
                "INSERT INTO seat_assignments(id,booking_id,segment_id,passenger_id,seat_id,created_at) VALUES(?,?,?,?,?,?)",
                (str(uuid.uuid4()), booking_id, data['segment_id'], data['passenger_id'], data['new_seat_id'], now)
            )
        db.execute("UPDATE seats SET status='BOOKED', updated_at=? WHERE id=?", (now, data['new_seat_id']))
        _audit(db, user['user_id'], 'CHANGE_SEAT', 'bookings', booking_id, ip=handler.client_address[0])

    response.success(handler, None, 'Seat changed successfully')
