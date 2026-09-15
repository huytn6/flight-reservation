import uuid
from core.router import route
from core import response, request as req, authentication as auth, validation as val
from database.connection import get_db
from repositories import booking_repo, audit_repo, support_repo
from utils.pagination import paginate
from utils.date_utils import utcnow_iso


@route('GET', '/staff/bookings')
def staff_list_bookings(handler):
    db = get_db()
    auth.require_staff(handler, db)
    page, size = req.get_pagination(handler)
    q = req.get_query_param(handler, 'q', '')
    status = req.get_query_param(handler, 'status', '')
    pnr = req.get_query_param(handler, 'pnr', '')

    rows = booking_repo.list_all_bookings(db)
    items = [dict(r) for r in rows]
    if pnr:
        items = [i for i in items if (i.get('pnr') or '').upper() == pnr.upper()]
    if status:
        items = [i for i in items if i['status'] == status]
    if q:
        q_lower = q.lower()
        items = [i for i in items if
                 q_lower in (i.get('contact_name') or '').lower() or
                 q_lower in (i.get('contact_email') or '').lower() or
                 q_lower in (i.get('contact_phone') or '').lower()]

    response.success(handler, paginate(items, page, size))


@route('GET', '/staff/bookings/{booking_id}')
def staff_get_booking(handler, booking_id):
    db = get_db()
    auth.require_staff(handler, db)
    booking = booking_repo.find_booking(db, booking_id)
    if not booking:
        from core.exceptions import NotFoundError
        raise NotFoundError('Booking')
    segments = db.execute(
        "SELECT bs.*, f.flight_number, f.departure_time, f.arrival_time "
        "FROM booking_segments bs JOIN flights f ON f.id=bs.flight_id "
        "WHERE bs.booking_id=? ORDER BY bs.segment_order",
        (booking_id,)
    ).fetchall()
    passengers = booking_repo.get_booking_passengers(db, booking_id)
    from repositories import payment_repo
    payments = payment_repo.list_payments_for_booking(db, booking_id)
    notes = booking_repo.get_booking_notes(db, booking_id)
    response.success(handler, {
        'booking': dict(booking),
        'segments': [dict(s) for s in segments],
        'passengers': [dict(p) for p in passengers],
        'payments': [dict(p) for p in payments],
        'notes': [dict(n) for n in notes],
    })


@route('POST', '/staff/booking-drafts')
def staff_create_draft(handler):
    db = get_db()
    auth.require_staff(handler, db)
    from controllers.draft_controller import create_draft
    create_draft(handler)


@route('POST', '/staff/bookings')
def staff_create_booking(handler):
    from controllers.booking_controller import create_booking
    create_booking(handler)


@route('PATCH', '/staff/bookings/{booking_id}/contact')
def staff_update_contact(handler, booking_id):
    db = get_db()
    user = auth.require_staff(handler, db)
    booking = booking_repo.find_booking(db, booking_id)
    if not booking:
        from core.exceptions import NotFoundError
        raise NotFoundError('Booking')
    data = req.parse_json_body(handler)
    allowed = {'contact_name', 'contact_email', 'contact_phone'}
    updates = {k: v for k, v in data.items() if k in allowed}
    if not updates:
        from core.exceptions import ValidationError
        raise ValidationError('No fields to update')
    booking_repo.update_booking_contact(db, booking_id, updates)
    audit_repo.log(db, user['user_id'], 'UPDATE_CONTACT', 'bookings', booking_id)
    db.commit()
    response.success(handler, None, 'Contact updated')


@route('PATCH', '/staff/bookings/{booking_id}/passengers/{passenger_id}')
def staff_update_passenger(handler, booking_id, passenger_id):
    db = get_db()
    auth.require_staff(handler, db)
    pax = booking_repo.find_booking_passenger(db, passenger_id, booking_id)
    if not pax:
        from core.exceptions import NotFoundError
        raise NotFoundError('Passenger')
    data = req.parse_json_body(handler)
    allowed = {'full_name', 'date_of_birth', 'nationality', 'passport_number', 'passport_expiry'}
    updates = {k: v for k, v in data.items() if k in allowed}
    merged = {**dict(pax), **updates}
    if not merged.get('date_of_birth'):
        from core.exceptions import ValidationError
        raise ValidationError('Vui lòng nhập ngày sinh của hành khách')
    if not str(merged.get('passport_number') or '').strip():
        from core.exceptions import ValidationError
        raise ValidationError('Vui lòng nhập Số Hộ chiếu / CCCD của hành khách')
    val.validate_date(merged['date_of_birth'], 'ngày sinh')
    if merged['date_of_birth'] > utcnow_iso()[:10]:
        from core.exceptions import ValidationError
        raise ValidationError('Ngày sinh không được lớn hơn ngày hiện tại')
    updates['passport_number'] = str(merged['passport_number']).strip()
    booking_repo.update_booking_passenger(db, passenger_id, updates)
    db.commit()
    response.success(handler, None, 'Passenger updated')


@route('POST', '/staff/bookings/{booking_id}/change-seat')
def staff_change_seat(handler, booking_id):
    from controllers.booking_controller import seat_change_confirm
    seat_change_confirm(handler, booking_id)


@route('POST', '/staff/bookings/{booking_id}/cancel')
def staff_cancel_booking(handler, booking_id):
    db = get_db()
    user = auth.require_staff(handler, db)
    booking = booking_repo.find_booking(db, booking_id)
    if not booking:
        from core.exceptions import NotFoundError
        raise NotFoundError('Booking')
    if booking['status'] in ('CANCELLED', 'COMPLETED'):
        from core.exceptions import BusinessError
        raise BusinessError('CANNOT_CANCEL', f'Booking already {booking["status"]}')
    data = req.parse_json_body(handler)
    reason = data.get('reason', 'Staff cancellation')

    from database.connection import transaction
    from repositories import flight_repo
    with transaction(db):
        booking_repo.update_booking_status(db, booking_id, 'CANCELLED')
        booking_repo.add_status_history(db, booking_id, booking['status'], 'CANCELLED',
                                        changed_by=user['user_id'], reason=reason)
        for a in booking_repo.get_seat_assignments(db, booking_id):
            flight_repo.update_seat_status(db, a['seat_id'], 'AVAILABLE')
        audit_repo.log(db, user['user_id'], 'CANCEL_BOOKING', 'bookings', booking_id)

    response.success(handler, None, 'Booking cancelled')


@route('POST', '/staff/bookings/{booking_id}/notes')
def staff_add_note(handler, booking_id):
    db = get_db()
    user = auth.require_staff(handler, db)
    data = req.parse_json_body(handler)
    val.require_fields(data, 'note')
    nid = str(uuid.uuid4())
    booking_repo.add_booking_note(db, nid, booking_id, user['user_id'], data['note'])
    db.commit()
    response.created(handler, {'id': nid})


@route('GET', '/staff/bookings/{booking_id}/notes')
def staff_get_notes(handler, booking_id):
    db = get_db()
    auth.require_staff(handler, db)
    rows = booking_repo.get_booking_notes(db, booking_id)
    response.success(handler, [dict(r) for r in rows])


@route('GET', '/staff/bookings/{booking_id}/history')
def staff_booking_history(handler, booking_id):
    db = get_db()
    auth.require_staff(handler, db)
    rows = booking_repo.get_status_history(db, booking_id)
    response.success(handler, [dict(r) for r in rows])


@route('GET', '/staff/support/tickets')
def staff_list_tickets(handler):
    db = get_db()
    auth.require_staff(handler, db)
    page, size = req.get_pagination(handler)
    status = req.get_query_param(handler, 'status', '')
    query = ("SELECT st.*, u.email as user_email FROM support_tickets st "
             "LEFT JOIN users u ON u.id=st.user_id")
    params = []
    if status:
        query += " WHERE st.status=?"
        params.append(status)
    query += " ORDER BY st.created_at DESC"
    rows = db.execute(query, params).fetchall()
    response.success(handler, paginate([dict(r) for r in rows], page, size))


@route('GET', '/staff/support/tickets/{ticket_id}')
def staff_get_ticket(handler, ticket_id):
    db = get_db()
    auth.require_staff(handler, db)
    ticket = support_repo.find_ticket(db, ticket_id)
    if not ticket:
        from core.exceptions import NotFoundError
        raise NotFoundError('Ticket')
    messages = support_repo.get_messages(db, ticket_id)
    response.success(handler, {'ticket': dict(ticket), 'messages': [dict(m) for m in messages]})


@route('PATCH', '/staff/support/tickets/{ticket_id}/status')
def staff_update_ticket_status(handler, ticket_id):
    db = get_db()
    auth.require_staff(handler, db)
    data = req.parse_json_body(handler)
    val.require_fields(data, 'status')
    valid_statuses = ('OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER', 'RESOLVED', 'CLOSED')
    if data['status'] not in valid_statuses:
        from core.exceptions import ValidationError
        raise ValidationError(f'Invalid status. Must be one of: {", ".join(valid_statuses)}')
    support_repo.update_ticket_status(db, ticket_id, data['status'])
    db.commit()
    response.success(handler, None, 'Status updated')


@route('POST', '/staff/support/tickets/{ticket_id}/messages')
def staff_reply_ticket(handler, ticket_id):
    db = get_db()
    user = auth.require_staff(handler, db)
    data = req.parse_json_body(handler)
    val.require_fields(data, 'body')
    mid = str(uuid.uuid4())
    support_repo.add_message(db, mid, ticket_id, user['user_id'], data['body'], 'STAFF')
    support_repo.update_ticket_status(db, ticket_id, 'WAITING_CUSTOMER')
    db.commit()
    response.created(handler, {'id': mid})


@route('POST', '/staff/support/tickets/{ticket_id}/assign')
def staff_assign_ticket(handler, ticket_id):
    db = get_db()
    user = auth.require_staff(handler, db)
    data = req.parse_json_body(handler)
    assignee_id = data.get('staff_id', user['user_id'])
    support_repo.assign_ticket(db, ticket_id, assignee_id)
    support_repo.update_ticket_status(db, ticket_id, 'IN_PROGRESS')
    db.commit()
    response.success(handler, None, 'Ticket assigned')
