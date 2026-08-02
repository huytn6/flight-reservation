from core.router import route
from core import response, request as req, authentication as auth
from database.connection import get_db
from services import user_service


@route('GET', '/users/me')
def get_profile(handler):
    db = get_db()
    user = auth.require_auth(handler, db)
    result = user_service.get_profile(user['user_id'])
    response.success(handler, result)


@route('PATCH', '/users/me')
def update_profile(handler):
    db = get_db()
    user = auth.require_auth(handler, db)
    data = req.parse_json_body(handler)
    user_service.update_profile(user['user_id'], data)
    response.success(handler, None, 'Profile updated')


@route('GET', '/users/me/sessions')
def get_sessions(handler):
    db = get_db()
    user = auth.require_auth(handler, db)
    page, size = req.get_pagination(handler)
    result = user_service.get_sessions(user['user_id'], page, size)
    response.success(handler, result)


@route('DELETE', '/users/me/sessions/{session_id}')
def revoke_session(handler, session_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    user_service.revoke_session(user['user_id'], session_id)
    response.no_content(handler)


@route('GET', '/users/me/saved-passengers')
def get_saved_passengers(handler):
    db = get_db()
    user = auth.require_auth(handler, db)
    result = user_service.get_saved_passengers(user['user_id'])
    response.success(handler, result)


@route('POST', '/users/me/saved-passengers')
def add_saved_passenger(handler):
    db = get_db()
    user = auth.require_auth(handler, db)
    data = req.parse_json_body(handler)
    result = user_service.add_saved_passenger(user['user_id'], data)
    response.created(handler, result)


@route('PATCH', '/users/me/saved-passengers/{pid}')
def update_saved_passenger(handler, pid):
    db = get_db()
    user = auth.require_auth(handler, db)
    data = req.parse_json_body(handler)
    user_service.update_saved_passenger(user['user_id'], pid, data)
    response.success(handler, None, 'Passenger updated')


@route('DELETE', '/users/me/saved-passengers/{pid}')
def delete_saved_passenger(handler, pid):
    db = get_db()
    user = auth.require_auth(handler, db)
    user_service.delete_saved_passenger(user['user_id'], pid)
    response.no_content(handler)
