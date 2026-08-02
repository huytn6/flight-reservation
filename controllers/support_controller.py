import uuid
import datetime
from core.router import route
from core import response, request as req, authentication as auth, validation as val
from database.connection import get_db


@route('POST', '/support/tickets')
def create_ticket(handler):
    db = get_db()
    user = auth.require_auth(handler, db)
    data = req.parse_json_body(handler)
    val.require_fields(data, 'subject')
    tid = str(uuid.uuid4())
    now = datetime.datetime.utcnow().isoformat()
    db.execute(
        "INSERT INTO support_tickets(id,user_id,booking_id,subject,status,priority,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)",
        (tid, user['user_id'], data.get('booking_id'), data['subject'], 'OPEN', data.get('priority', 'NORMAL'), now, now)
    )
    if data.get('message'):
        db.execute(
            "INSERT INTO support_messages(id,ticket_id,sender_id,body,created_at) VALUES(?,?,?,?,?)",
            (str(uuid.uuid4()), tid, user['user_id'], data['message'], now)
        )
    db.commit()
    response.created(handler, {'id': tid})


@route('GET', '/users/me/support/tickets')
def my_tickets(handler):
    db = get_db()
    user = auth.require_auth(handler, db)
    rows = db.execute("SELECT * FROM support_tickets WHERE user_id=? ORDER BY created_at DESC", (user['user_id'],)).fetchall()
    response.success(handler, [dict(r) for r in rows])


@route('GET', '/users/me/support/tickets/{ticket_id}')
def get_my_ticket(handler, ticket_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    ticket = db.execute("SELECT * FROM support_tickets WHERE id=? AND user_id=?", (ticket_id, user['user_id'])).fetchone()
    if not ticket:
        from core.exceptions import NotFoundError
        raise NotFoundError('Ticket')
    messages = db.execute("SELECT * FROM support_messages WHERE ticket_id=? ORDER BY created_at", (ticket_id,)).fetchall()
    response.success(handler, {'ticket': dict(ticket), 'messages': [dict(m) for m in messages]})


@route('POST', '/users/me/support/tickets/{ticket_id}/messages')
def add_message(handler, ticket_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    ticket = db.execute("SELECT * FROM support_tickets WHERE id=? AND user_id=?", (ticket_id, user['user_id'])).fetchone()
    if not ticket:
        from core.exceptions import NotFoundError
        raise NotFoundError('Ticket')
    data = req.parse_json_body(handler)
    val.require_fields(data, 'body')
    now = datetime.datetime.utcnow().isoformat()
    mid = str(uuid.uuid4())
    db.execute("INSERT INTO support_messages(id,ticket_id,sender_id,body,created_at) VALUES(?,?,?,?,?)",
               (mid, ticket_id, user['user_id'], data['body'], now))
    db.execute("UPDATE support_tickets SET status='WAITING_CUSTOMER', updated_at=? WHERE id=?", (now, ticket_id))
    db.commit()
    response.created(handler, {'id': mid})


@route('POST', '/users/me/support/tickets/{ticket_id}/close')
def close_ticket(handler, ticket_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    ticket = db.execute("SELECT id FROM support_tickets WHERE id=? AND user_id=?", (ticket_id, user['user_id'])).fetchone()
    if not ticket:
        from core.exceptions import NotFoundError
        raise NotFoundError('Ticket')
    now = datetime.datetime.utcnow().isoformat()
    db.execute("UPDATE support_tickets SET status='CLOSED', updated_at=? WHERE id=?", (now, ticket_id))
    db.commit()
    response.success(handler, None, 'Ticket closed')
