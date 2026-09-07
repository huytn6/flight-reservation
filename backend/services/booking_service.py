import json
import uuid
import datetime

from core.exceptions import NotFoundError, AuthorizationError, BusinessError, ConflictError
from database.connection import get_db, transaction
from repositories import booking_repo, flight_repo, audit_repo
from utils.pagination import paginate


def _require_owner(db, booking_id: str, user_ctx: dict):
    row = booking_repo.find_booking(db, booking_id)
    if not row:
        raise NotFoundError('Booking')
    if user_ctx['role'] == 'CUSTOMER' and row['user_id'] != user_ctx['user_id']:
        raise AuthorizationError()
    return row


def create_booking(user_ctx: dict, draft_id: str, idempotency_key: str | None, ip: str) -> dict:
    db = get_db()
    if idempotency_key:
        existing = booking_repo.find_booking_by_idempotency(db, idempotency_key)
        if existing:
            return dict(existing)

    draft = booking_repo.find_draft(db, draft_id)
    if not draft:
        raise NotFoundError('Booking draft')
    if draft['status'] != 'ACTIVE':
        raise BusinessError('DRAFT_NOT_ACTIVE', 'Draft is no longer active')
    if datetime.datetime.utcnow().isoformat() > draft['expires_at']:
        raise BusinessError('DRAFT_EXPIRED', 'Draft has expired')

    contact = booking_repo.get_draft_contact(db, draft_id)
    if not contact:
        raise BusinessError('CONTACT_MISSING', 'Contact information is required')

    passengers = booking_repo.get_draft_passengers(db, draft_id)
    if not passengers:
        raise BusinessError('PASSENGERS_MISSING', 'Passenger information is required')

    offer = json.loads(draft['flight_offer_json'])
    total_amount = 0
    for f in offer:
        fare = db.execute(
            "SELECT fa.*, fi.available_seats FROM fares fa JOIN fare_inventories fi ON fi.fare_id=fa.id WHERE fa.id=?",
            (f['id'],)
        ).fetchone()
        if not fare or fare['available_seats'] < len(passengers):
            raise ConflictError('Insufficient seat inventory', 'INVENTORY_INSUFFICIENT')
        total_amount += (fare['base_price'] + fare['tax'] + fare['fees']) * len(passengers)

    ancillaries = booking_repo.get_draft_ancillaries(db, draft_id)
    for anc in ancillaries:
        total_amount += anc['price'] * anc['quantity']

    holds = booking_repo.get_active_seat_holds(db, draft_id)
    if len(holds) != len(passengers):
        raise BusinessError(
            'SEAT_PASSENGER_MISMATCH',
            f'{len(passengers)} passenger(s) but only {len(holds)} seat(s) held'
        )
    for hold in holds:
        total_amount += hold.get('extra_fee') or 0

    bid = str(uuid.uuid4())

    with transaction(db):
        booking_repo.create_booking(db, bid, user_ctx['user_id'], draft_id, dict(contact),
                                    total_amount, idempotency_key)

        for i, f in enumerate(offer):
            booking_repo.add_booking_segment(db, str(uuid.uuid4()), bid, f.get('flight_id', ''), f['id'], i)

        bp_ids = []
        for pax in passengers:
            bp_id = str(uuid.uuid4())
            booking_repo.add_booking_passenger(db, bp_id, bid, pax)
            bp_ids.append((bp_id, pax['passenger_index']))

        holds = booking_repo.get_active_seat_holds(db, draft_id)
        segs = booking_repo.get_booking_segments_simple(db, bid)
        for hold in holds:
            bp = next((b for b in bp_ids if b[1] == hold['passenger_index']), None)
            if bp and segs:
                booking_repo.create_seat_assignment(db, str(uuid.uuid4()), bid, segs[0]['id'], bp[0], hold['seat_id'])
            # Seat now belongs to this (unpaid) booking: mark it BOOKED and release the
            # timed hold so the background scheduler never reclaims it as "expired" out
            # from under a real booking while the customer is still on the payment step.
            flight_repo.update_seat_status(db, hold['seat_id'], 'BOOKED')
            booking_repo.release_seat_hold(db, hold['id'])

        booking_repo.add_status_history(db, bid, None, 'PENDING_PAYMENT', changed_by=user_ctx['user_id'])
        booking_repo.set_draft_status(db, draft_id, 'CONFIRMED')
        audit_repo.log(db, user_ctx['user_id'], 'CREATE_BOOKING', 'bookings', bid, ip=ip)

    return {'id': bid, 'status': 'PENDING_PAYMENT', 'total_amount': total_amount, 'currency': 'VND'}


def get_booking(booking_id: str, user_ctx: dict) -> dict:
    db = get_db()
    booking = _require_owner(db, booking_id, user_ctx)
    segments = booking_repo.get_booking_segments(db, booking_id)
    passengers = booking_repo.get_booking_passengers(db, booking_id)
    from repositories import payment_repo
    payments = payment_repo.list_payments_for_booking(db, booking_id)
    return {
        'booking': dict(booking),
        'segments': [dict(s) for s in segments],
        'passengers': [dict(p) for p in passengers],
        'payments': [dict(p) for p in payments],
    }


def list_my_bookings(user_id: str, status_filter: str | None, page: int, size: int) -> dict:
    db = get_db()
    rows = booking_repo.list_bookings_for_user(db, user_id, status_filter)
    return paginate([dict(r) for r in rows], page, size)


def get_status_history(booking_id: str, user_ctx: dict) -> list:
    db = get_db()
    _require_owner(db, booking_id, user_ctx)
    rows = booking_repo.get_status_history(db, booking_id)
    return [dict(r) for r in rows]


def get_itinerary(booking_id: str, user_ctx: dict) -> dict:
    db = get_db()
    booking = _require_owner(db, booking_id, user_ctx)
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
    return {'booking': dict(booking), 'segments': [dict(s) for s in segments]}


def get_printable(booking_id: str, user_ctx: dict) -> dict:
    db = get_db()
    booking = _require_owner(db, booking_id, user_ctx)
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
    passengers = booking_repo.get_booking_passengers(db, booking_id)
    html = _generate_itinerary_html(dict(booking), [dict(s) for s in segments], [dict(p) for p in passengers])
    return {'html': html}


def _generate_itinerary_html(booking, segments, passengers):
    segs_html = ''.join(
        f"<tr><td>{s['flight_number']}</td><td>{s['dep_iata']} → {s['arr_iata']}</td>"
        f"<td>{s['departure_time']}</td><td>{s['arrival_time']}</td></tr>"
        for s in segments
    )
    pax_html = ''.join(
        f"<tr><td>{p['passenger_index']+1}</td><td>{p['full_name']}</td><td>{p['passenger_type']}</td></tr>"
        for p in passengers
    )
    return (
        f"<!DOCTYPE html><html><head><title>Booking {booking['pnr'] or booking['id']}</title></head>"
        f"<body><h1>Itinerary</h1><p>PNR: <strong>{booking['pnr'] or 'Pending'}</strong></p>"
        f"<p>Status: {booking['status']}</p>"
        f"<p>Contact: {booking['contact_name']} | {booking['contact_email']} | {booking['contact_phone']}</p>"
        f"<h2>Flights</h2><table border='1'><tr><th>Flight</th><th>Route</th><th>Departure</th><th>Arrival</th></tr>"
        f"{segs_html}</table><h2>Passengers</h2>"
        f"<table border='1'><tr><th>#</th><th>Name</th><th>Type</th></tr>{pax_html}</table>"
        f"<p>Total: {booking['total_amount']:,} {booking['currency']}</p></body></html>"
    )


def get_etickets(booking_id: str, user_ctx: dict) -> list:
    db = get_db()
    _require_owner(db, booking_id, user_ctx)
    tickets = booking_repo.get_e_tickets(db, booking_id)
    return [dict(t) for t in tickets]


def get_eticket(booking_id: str, ticket_id: str, user_ctx: dict) -> dict:
    db = get_db()
    _require_owner(db, booking_id, user_ctx)
    ticket = booking_repo.find_e_ticket(db, ticket_id, booking_id)
    if not ticket:
        raise NotFoundError('E-Ticket')
    return dict(ticket)


def get_receipt(booking_id: str, user_ctx: dict) -> dict:
    db = get_db()
    booking = _require_owner(db, booking_id, user_ctx)
    from repositories import payment_repo
    payments = payment_repo.list_payments_for_booking(db, booking_id, status='SUCCESS')
    return {
        'booking_id': booking_id,
        'pnr': booking['pnr'],
        'total_amount': booking['total_amount'],
        'currency': booking['currency'],
        'payments': [dict(p) for p in payments],
    }


def lookup_booking(pnr: str, last_name: str) -> dict:
    db = get_db()
    booking = booking_repo.find_booking_by_pnr(db, pnr.upper())
    if not booking:
        raise NotFoundError('Booking')
    pax = booking_repo.get_booking_passengers(db, booking['id'])
    found = any(last_name.lower() in p['full_name'].lower() for p in pax)
    if not found:
        raise NotFoundError('Booking')
    segments = booking_repo.get_booking_segments(db, booking['id'])
    seg_dicts = [dict(s) for s in segments]
    first_seg = seg_dicts[0] if seg_dicts else {}
    return {
        'id': booking['id'],
        'pnr': booking['pnr'],
        'status': booking['status'],
        'contact_name': booking['contact_name'],
        'contact_full_name': booking['contact_name'],
        'total_amount': booking['total_amount'],
        'currency': booking['currency'],
        'flight_number': first_seg.get('flight_number'),
        'departure_city': first_seg.get('departure_city'),
        'arrival_city': first_seg.get('arrival_city'),
        'departure_time': first_seg.get('departure_time'),
        'arrival_time': first_seg.get('arrival_time'),
        'airline_name': first_seg.get('airline_name'),
        'segments': seg_dicts,
        'passengers': [dict(p) for p in pax],
    }


def confirm_check_in(booking_id: str) -> dict:
    """Public self-service check-in (reached only after a successful PNR + last-name
    lookup, mirroring lookup_booking's public/no-auth model). Persists CHECKED_IN on
    every e-ticket for the booking instead of the previous UI-only mock confirmation."""
    db = get_db()
    booking = booking_repo.find_booking(db, booking_id)
    if not booking:
        raise NotFoundError('Booking')
    if booking['status'] != 'CONFIRMED':
        raise BusinessError('NOT_CONFIRMED', 'Booking must be confirmed for check-in')

    tickets = booking_repo.get_e_tickets(db, booking_id)
    if not tickets:
        raise BusinessError('NO_TICKETS', 'No e-tickets found for this booking')
    already_checked_in = all(t['status'] == 'CHECKED_IN' for t in tickets)

    with transaction(db):
        for t in tickets:
            if t['status'] != 'CHECKED_IN':
                db.execute("UPDATE e_tickets SET status='CHECKED_IN' WHERE id=?", (t['id'],))

    seat_row = db.execute(
        """SELECT s.seat_number FROM seat_assignments sa
           JOIN seats s ON s.id=sa.seat_id WHERE sa.booking_id=? ORDER BY sa.created_at LIMIT 1""",
        (booking_id,)
    ).fetchone()

    return {
        'status': 'CHECKED_IN',
        'already_checked_in': already_checked_in,
        'seat_number': seat_row['seat_number'] if seat_row else None,
        'gate': 'A04',
        'boarding_group': 'B',
    }


def cancellation_preview(booking_id: str, user_ctx: dict) -> dict:
    db = get_db()
    booking = _require_owner(db, booking_id, user_ctx)
    if booking['status'] not in ('CONFIRMED', 'PENDING_PAYMENT', 'PAYMENT_FAILED'):
        raise BusinessError('CANNOT_CANCEL', f'Booking in status {booking["status"]} cannot be cancelled')
    total = booking['total_amount']
    refund = int(total * 0.8)
    return {
        'booking_id': booking_id, 'total_paid': total,
        'cancellation_fee': total - refund, 'refund_amount': refund,
        'refund_eligible': True, 'currency': 'VND',
    }


def cancel_booking(booking_id: str, user_ctx: dict, reason: str, ip: str) -> dict:
    db = get_db()
    booking = _require_owner(db, booking_id, user_ctx)
    if booking['status'] not in ('CONFIRMED', 'PENDING_PAYMENT', 'PAYMENT_FAILED'):
        raise BusinessError('CANNOT_CANCEL', f'Booking in status {booking["status"]} cannot be cancelled')

    with transaction(db):
        old_status = booking['status']
        booking_repo.update_booking_status(db, booking_id, 'CANCELLED')
        booking_repo.add_status_history(db, booking_id, old_status, 'CANCELLED',
                                        changed_by=user_ctx['user_id'], reason=reason)

        assigns = booking_repo.get_seat_assignments(db, booking_id)
        for a in assigns:
            flight_repo.update_seat_status(db, a['seat_id'], 'AVAILABLE')

        total = booking['total_amount']
        refund = int(total * 0.8)
        booking_repo.create_cancellation(db, str(uuid.uuid4()), booking_id, reason, user_ctx['user_id'])

        from repositories import payment_repo
        payment = payment_repo.find_successful_payment(db, booking_id)
        if payment:
            payment_repo.create_refund(db, str(uuid.uuid4()), booking_id, payment['id'],
                                       refund, 'VND', 'PENDING', reason)
        audit_repo.log(db, user_ctx['user_id'], 'CANCEL_BOOKING', 'bookings', booking_id, ip=ip)

    return {'status': 'CANCELLED', 'refund_amount': refund, 'currency': 'VND'}


def get_cancellation(booking_id: str, user_ctx: dict) -> dict:
    db = get_db()
    _require_owner(db, booking_id, user_ctx)
    row = booking_repo.find_cancellation(db, booking_id)
    if not row:
        raise NotFoundError('Cancellation')
    return dict(row)


def create_refund(booking_id: str, user_ctx: dict, amount: int | None, reason: str | None) -> dict:
    db = get_db()
    booking = _require_owner(db, booking_id, user_ctx)
    from repositories import payment_repo
    payment = payment_repo.find_successful_payment(db, booking_id)
    total = booking['total_amount']
    amount = amount or int(total * 0.8)
    rid = str(uuid.uuid4())
    payment_repo.create_refund(db, rid, booking_id, payment['id'] if payment else None,
                               amount, 'VND', 'PENDING', reason)
    db.commit()
    return {'id': rid, 'amount': amount, 'status': 'PENDING'}


def get_refunds(booking_id: str, user_ctx: dict) -> list:
    db = get_db()
    _require_owner(db, booking_id, user_ctx)
    from repositories import payment_repo
    rows = payment_repo.list_refunds_for_booking(db, booking_id)
    return [dict(r) for r in rows]


def get_refund(refund_id: str, user_ctx: dict) -> dict:
    db = get_db()
    from repositories import payment_repo
    row = payment_repo.find_refund(db, refund_id)
    if not row:
        raise NotFoundError('Refund')
    booking = booking_repo.find_booking(db, row['booking_id'])
    if user_ctx['role'] == 'CUSTOMER' and booking['user_id'] != user_ctx['user_id']:
        raise AuthorizationError()
    return dict(row)


def seat_change_preview(booking_id: str, user_ctx: dict, seat_id: str | None) -> dict:
    db = get_db()
    _require_owner(db, booking_id, user_ctx)
    fee = 0
    if seat_id:
        seat = flight_repo.find_seat(db, seat_id)
        fee = seat['extra_fee'] if seat else 0
    return {'seat_change_fee': fee, 'currency': 'VND'}


def seat_change_confirm(booking_id: str, user_ctx: dict, segment_id: str, passenger_id: str,
                        new_seat_id: str, ip: str) -> None:
    db = get_db()
    booking = _require_owner(db, booking_id, user_ctx)

    with transaction(db):
        old_assign = booking_repo.find_seat_assignment(db, segment_id, passenger_id, booking_id)
        if old_assign:
            flight_repo.update_seat_status(db, old_assign['seat_id'], 'AVAILABLE')

        new_seat = flight_repo.find_seat(db, new_seat_id)
        if not new_seat or new_seat['status'] not in ('AVAILABLE',):
            raise ConflictError('New seat not available', 'SEAT_NOT_AVAILABLE')

        if old_assign:
            booking_repo.update_seat_assignment(db, old_assign['id'], new_seat_id)
        else:
            booking_repo.create_seat_assignment(db, str(uuid.uuid4()), booking_id,
                                                segment_id, passenger_id, new_seat_id)
        flight_repo.update_seat_status(db, new_seat_id, 'BOOKED')
        audit_repo.log(db, user_ctx['user_id'], 'CHANGE_SEAT', 'bookings', booking_id, ip=ip)


def change_quote(booking_id: str, user_ctx: dict, new_fare_id: str) -> dict:
    db = get_db()
    booking = _require_owner(db, booking_id, user_ctx)
    new_fare = flight_repo.find_fare_basic(db, new_fare_id)
    if not new_fare:
        raise NotFoundError('Fare')
    pax_count = booking_repo.count_booking_passengers(db, booking_id)
    new_total = (new_fare['base_price'] + new_fare['tax'] + new_fare['fees']) * pax_count
    diff = new_total - booking['total_amount']
    return {
        'new_total': new_total, 'current_total': booking['total_amount'],
        'price_difference': diff, 'change_fee': new_fare['change_fee'],
        'amount_to_pay': max(0, diff + new_fare['change_fee']), 'currency': 'VND',
    }


def change_confirm(booking_id: str, user_ctx: dict, new_fare_id: str, new_flight_id: str,
                   old_flight_id: str | None, ip: str) -> dict:
    db = get_db()
    booking = _require_owner(db, booking_id, user_ctx)
    if booking['status'] != 'CONFIRMED':
        raise BusinessError('CANNOT_CHANGE', 'Booking must be confirmed to change')

    with transaction(db):
        booking_repo.update_booking_status(db, booking_id, 'CHANGE_PENDING')
        booking_repo.add_status_history(db, booking_id, booking['status'], 'CHANGE_PENDING',
                                        changed_by=user_ctx['user_id'])
        change_id = str(uuid.uuid4())
        booking_repo.create_booking_change(
            db, change_id, booking_id, 'FLIGHT',
            {'flight_id': old_flight_id}, {'flight_id': new_flight_id, 'fare_id': new_fare_id}
        )
        audit_repo.log(db, user_ctx['user_id'], 'CHANGE_FLIGHT', 'bookings', booking_id, ip=ip)

    return {'change_id': change_id, 'status': 'CHANGE_PENDING'}


def get_change_status(booking_id: str, user_ctx: dict) -> dict:
    db = get_db()
    _require_owner(db, booking_id, user_ctx)
    change = booking_repo.find_latest_booking_change(db, booking_id)
    return dict(change) if change else {'status': 'NO_CHANGE_IN_PROGRESS'}


def get_post_booking_seat_map(booking_id: str, segment_id: str, user_ctx: dict) -> dict:
    db = get_db()
    _require_owner(db, booking_id, user_ctx)
    seg = booking_repo.find_booking_segment(db, segment_id, booking_id)
    if not seg:
        raise NotFoundError('Segment')
    seat_map = flight_repo.get_seat_map(db, seg['flight_id'])
    seats = flight_repo.list_seats(db, seg['flight_id'])
    import json
    return {
        'flight_id': seg['flight_id'],
        'layout': json.loads(seat_map['layout_json']) if seat_map else {},
        'seats': [dict(s) for s in seats],
    }


def get_flight_status(booking_id: str, user_ctx: dict) -> list:
    db = get_db()
    _require_owner(db, booking_id, user_ctx)
    segments = db.execute(
        "SELECT f.flight_number, f.status, f.departure_time, f.arrival_time "
        "FROM booking_segments bs JOIN flights f ON f.id=bs.flight_id "
        "WHERE bs.booking_id=? ORDER BY bs.segment_order",
        (booking_id,)
    ).fetchall()
    return [dict(s) for s in segments]
