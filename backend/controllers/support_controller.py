from core.router import route
from core import response, request as req, authentication as auth, validation as val
from database.connection import get_db
from services import support_service


@route('POST', '/support/tickets')
def create_ticket(handler):
    db = get_db()
    user = auth.require_auth(handler, db)
    data = req.parse_json_body(handler)
    val.require_fields(data, 'subject')
    result = support_service.create_ticket(
        user['user_id'], data['subject'], data.get('category'),
        data.get('booking_id'), data.get('message')
    )
    response.created(handler, result)


@route('GET', '/users/me/support/tickets')
def my_tickets(handler):
    db = get_db()
    user = auth.require_auth(handler, db)
    result = support_service.list_my_tickets(user['user_id'])
    response.success(handler, result)


@route('GET', '/users/me/support/tickets/{ticket_id}')
def get_my_ticket(handler, ticket_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    result = support_service.get_my_ticket(user['user_id'], ticket_id)
    response.success(handler, result)


@route('POST', '/users/me/support/tickets/{ticket_id}/messages')
def add_message(handler, ticket_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    data = req.parse_json_body(handler)
    val.require_fields(data, 'body')
    result = support_service.add_message(user['user_id'], ticket_id, data['body'])
    response.created(handler, result)


@route('POST', '/users/me/support/tickets/{ticket_id}/close')
def close_ticket(handler, ticket_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    support_service.close_ticket(user['user_id'], ticket_id)
    response.success(handler, None, 'Ticket closed')
