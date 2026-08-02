import uuid
import datetime
from core.router import route
from core import response, request as req, authentication as auth, validation as val
from database.connection import get_db
from utils.pagination import paginate


@route('GET', '/staff/bookings')
def staff_list_bookings(handler):
    db = get_db()
    user = auth.require_staff(handler, db)
    page, size = req.get_pagination(handler)

    q = req.get_query_param(handler, 'q', '')
    status = req.get_query_param(handler, 'status', '')
    pnr = req.get_query_param(handler, 'pnr', '')

    rows = db.execute("SELECT * FROM bookings ORDER BY created_at DESC").fetchall()
    items = [dict(r) for r in rows]

    if pnr:
        items = [i for i in items if i.get('pnr', '').upper() == pnr.upper()]
    if status:
        items = [i for i in items if i['status'] == status]
    if q:
        q_lower = q.lower()
        items = [i for i in items if q_lower in (i.get('contact_name', '') or '').lower()
                 or q_lower in (i.get('contact_email', '') or '').lower()
                 or q_lower in (i.get('contact_phone', '') or '').lower()]

    result = paginate(items, page, size)
    response.success(handler, result)


@route('GET', '/staff/bookings/{booking_id}')
def staff_get_booking(handler, booking_id):
    db = get_db()
    auth.require_staff(handler, db)
    booking = db.execute("SELECT * FROM bookings WHERE id=?", (booking_id,)).fetchone()
    if not booking:
        from core.exceptions import NotFoundError
        raise NotFoundError('Booking')
    segments = db.execute(
        "SELECT bs.*, f.flight_number, f.departure_time, f.arrival_time FROM booking_segments bs JOIN flights f ON f.id=bs.flight_id WHERE bs.booking_id=? ORDER BY bs.segment_order",
        (booking_id,)
    ).fetchall()
    passengers = db.execute("SELECT * FROM booking_passengers WHERE booking_id=?", (booking_id,)).fetchall()
    payments = db.execute("SELECT * FROM payments WHERE booking_id=?", (booking_id,)).fetchall()
    notes = db.execute("SELECT * FROM booking_notes WHERE booking_id=? ORDER BY created_at DESC", (booking_id,)).fetchall()
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
    user = auth.require_staff(handler, db)
    # Delegate to draft controller logic but with staff as creator
    from controllers.draft_controller import create_draft
    create_draft(handler)


@route('POST', '/staff/bookings')
def staff_create_booking(handler):
    db = get_db()
    user = auth.require_staff(handler, db)
    from controllers.booking_controller import create_booking
    create_booking(handler)


@route('PATCH', '/staff/bookings/{booking_id}/contact')
def staff_update_contact(handler, booking_id):
    db = get_db()
    user = auth.require_staff(handler, db)
    booking = db.execute("SELECT id FROM bookings WHERE id=?", (booking_id,)).fetchone()
    if not booking:
        from core.exceptions import NotFoundError
        raise NotFoundError('Booking')
    data = req.parse_json_body(handler)
    allowed = {'contact_name', 'contact_email', 'contact_phone'}
    updates = {k: v for k, v in data.items() if k in allowed}
    if not updates:
        from core.exceptions import ValidationError
        raise ValidationError('No fields to update')
    now = datetime.datetime.utcnow().isoformat()
    updates['updated_at'] = now
    set_clause = ', '.join(f'{k}=?' for k in updates)
    db.execute(f"UPDATE bookings SET {set_clause} WHERE id=?", (*updates.values(), booking_id))
    db.execute(
        "INSERT INTO audit_logs(id,user_id,action,resource,resource_id,created_at) VALUES(?,?,?,?,?,?)",
        (str(uuid.uuid4()), user['user_id'], 'UPDATE_CONTACT', 'bookings', booking_id, now)
    )
    db.commit()
    response.success(handler, None, 'Contact updated')


@route('PATCH', '/staff/bookings/{booking_id}/passengers/{passenger_id}')
def staff_update_passenger(handler, booking_id, passenger_id):
    db = get_db()
    auth.require_staff(handler, db)
    pax = db.execute("SELECT id FROM booking_passengers WHERE id=? AND booking_id=?", (passenger_id, booking_id)).fetchone()
    if not pax:
        from core.exceptions import NotFoundError
        raise NotFoundError('Passenger')
    data = req.parse_json_body(handler)
    allowed = {'full_name', 'date_of_birth', 'nationality', 'passport_number', 'passport_expiry'}
    updates = {k: v for k, v in data.items() if k in allowed}
    set_clause = ', '.join(f'{k}=?' for k in updates)
    db.execute(f"UPDATE booking_passengers SET {set_clause} WHERE id=?", (*updates.values(), passenger_id))
    db.commit()
    response.success(handler, None, 'Passenger updated')


@route('POST', '/staff/bookings/{booking_id}/change-seat')
def staff_change_seat(handler, booking_id):
    db = get_db()
    user = auth.require_staff(handler, db)
    from controllers.booking_controller import seat_change_confirm
    seat_change_confirm(handler, booking_id)


@route('POST', '/staff/bookings/{booking_id}/cancel')
def staff_cancel_booking(handler, booking_id):
    db = get_db()
    user = auth.require_staff(handler, db)
    booking = db.execute("SELECT * FROM bookings WHERE id=?", (booking_id,)).fetchone()
    if not booking:
        from core.exceptions import NotFoundError
        raise NotFoundError('Booking')
    if booking['status'] in ('CANCELLED', 'COMPLETED'):
        from core.exceptions import BusinessError
        raise BusinessError('CANNOT_CANCEL', f'Booking already {booking["status"]}')
    data = req.parse_json_body(handler)
    now = datetime.datetime.utcnow().isoformat()
    with db:
        db.execute("UPDATE bookings SET status='CANCELLED', updated_at=? WHERE id=?", (now, booking_id))
        db.execute(
            "INSERT INTO booking_status_histories(id,booking_id,from_status,to_status,reason,changed_by,created_at) VALUES(?,?,?,?,?,?,?)",
            (str(uuid.uuid4()), booking_id, booking['status'], 'CANCELLED', data.get('reason', 'Staff cancellation'), user['user_id'], now)
        )
        db.execute(
            "INSERT INTO audit_logs(id,user_id,action,resource,resource_id,created_at) VALUES(?,?,?,?,?,?)",
            (str(uuid.uuid4()), user['user_id'], 'CANCEL_BOOKING', 'bookings', booking_id, now)
        )
    response.success(handler, None, 'Booking cancelled')


@route('POST', '/staff/bookings/{booking_id}/notes')
def staff_add_note(handler, booking_id):
    db = get_db()
    user = auth.require_staff(handler, db)
    data = req.parse_json_body(handler)
    val.require_fields(data, 'note')
    now = datetime.datetime.utcnow().isoformat()
    nid = str(uuid.uuid4())
    db.execute(
        "INSERT INTO booking_notes(id,booking_id,staff_id,note,created_at) VALUES(?,?,?,?,?)",
        (nid, booking_id, user['user_id'], data['note'], now)
    )
    db.commit()
    response.created(handler, {'id': nid})


@route('GET', '/staff/bookings/{booking_id}/notes')
def staff_get_notes(handler, booking_id):
    db = get_db()
    auth.require_staff(handler, db)
    rows = db.execute("SELECT * FROM booking_notes WHERE booking_id=? ORDER BY created_at DESC", (booking_id,)).fetchall()
    response.success(handler, [dict(r) for r in rows])


@route('GET', '/staff/bookings/{booking_id}/history')
def staff_booking_history(handler, booking_id):
    db = get_db()
    auth.require_staff(handler, db)
    rows = db.execute("SELECT * FROM booking_status_histories WHERE booking_id=? ORDER BY created_at", (booking_id,)).fetchall()
    response.success(handler, [dict(r) for r in rows])


@route('GET', '/staff/support/tickets')
def staff_list_tickets(handler):
    db = get_db()
    user = auth.require_staff(handler, db)
    page, size = req.get_pagination(handler)
    status = req.get_query_param(handler, 'status', '')
    query = "SELECT st.*, u.email as user_email FROM support_tickets st LEFT JOIN users u ON u.id=st.user_id"
    params = []
    if status:
        query += " WHERE st.status=?"
        params.append(status)
    query += " ORDER BY st.created_at DESC"
    rows = db.execute(query, params).fetchall()
    result = paginate([dict(r) for r in rows], page, size)
    response.success(handler, result)


@route('GET', '/staff/support/tickets/{ticket_id}')
def staff_get_ticket(handler, ticket_id):
    db = get_db()
    auth.require_staff(handler, db)
    ticket = db.execute("SELECT * FROM support_tickets WHERE id=?", (ticket_id,)).fetchone()
    if not ticket:
        from core.exceptions import NotFoundError
        raise NotFoundError('Ticket')
    messages = db.execute("SELECT * FROM support_messages WHERE ticket_id=? ORDER BY created_at", (ticket_id,)).fetchall()
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
    now = datetime.datetime.utcnow().isoformat()
    db.execute("UPDATE support_tickets SET status=?, updated_at=? WHERE id=?", (data['status'], now, ticket_id))
    db.commit()
    response.success(handler, None, 'Status updated')


@route('POST', '/staff/support/tickets/{ticket_id}/messages')
def staff_reply_ticket(handler, ticket_id):
    db = get_db()
    user = auth.require_staff(handler, db)
    data = req.parse_json_body(handler)
    val.require_fields(data, 'body')
    now = datetime.datetime.utcnow().isoformat()
    mid = str(uuid.uuid4())
    db.execute("INSERT INTO support_messages(id,ticket_id,sender_id,body,created_at) VALUES(?,?,?,?,?)",
               (mid, ticket_id, user['user_id'], data['body'], now))
    db.execute("UPDATE support_tickets SET status='WAITING_CUSTOMER', updated_at=? WHERE id=?", (now, ticket_id))
    db.commit()
    response.created(handler, {'id': mid})


@route('POST', '/staff/support/tickets/{ticket_id}/assign')
def staff_assign_ticket(handler, ticket_id):
    db = get_db()
    user = auth.require_staff(handler, db)
    data = req.parse_json_body(handler)
    assignee_id = data.get('staff_id', user['user_id'])
    now = datetime.datetime.utcnow().isoformat()
    db.execute("UPDATE support_tickets SET assigned_to=?, status='IN_PROGRESS', updated_at=? WHERE id=?", (assignee_id, now, ticket_id))
    db.commit()
    response.success(handler, None, 'Ticket assigned')
