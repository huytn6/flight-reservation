from core.router import route
from core import response, request as req, authentication as auth, validation as val, middleware
from database.connection import get_db
from services import auth_service
import config


@route('POST', '/auth/register')
def register(handler):
    data = req.parse_json_body(handler)
    val.require_fields(data, 'email', 'password', 'full_name')
    email = val.validate_email(data['email'])
    val.validate_password(data['password'])
    full_name = val.sanitize_str(data['full_name'], 100, 'full_name')
    user = auth_service.register(email, data['password'], full_name, handler.client_address[0])
    response.created(handler, user, 'Registration successful')


@route('POST', '/auth/login')
def login(handler):
    ip = handler.client_address[0]
    middleware.check_rate_limit(f'login:{ip}', config.RATE_LIMIT_LOGIN, config.RATE_LIMIT_WINDOW)
    data = req.parse_json_body(handler)
    val.require_fields(data, 'email', 'password')
    email = data['email'].strip().lower()
    result = auth_service.login(email, data['password'], ip, handler.headers.get('User-Agent', ''))
    response.success(handler, result, 'Login successful')


@route('POST', '/auth/logout')
def logout(handler):
    db = get_db()
    user = auth.require_auth(handler, db)
    token = req.get_bearer_token(handler)
    auth_service.logout(user, token, handler.client_address[0])
    response.success(handler, None, 'Logged out successfully')


@route('POST', '/auth/refresh')
def refresh_token(handler):
    db = get_db()
    user = auth.require_auth(handler, db)
    old_token = req.get_bearer_token(handler)
    result = auth_service.refresh(user, old_token, handler.client_address[0], handler.headers.get('User-Agent', ''))
    response.success(handler, result)


@route('GET', '/auth/me')
def me(handler):
    db = get_db()
    user = auth.require_auth(handler, db)
    response.success(handler, auth_service.get_me(user['user_id']))


@route('POST', '/auth/forgot-password')
def forgot_password(handler):
    ip = handler.client_address[0]
    middleware.check_rate_limit(f'forgot:{ip}', 5, 300)
    data = req.parse_json_body(handler)
    val.require_fields(data, 'email')
    auth_service.forgot_password(data['email'].strip().lower())
    response.success(handler, None, 'If the email exists, a reset link has been sent')


@route('POST', '/auth/reset-password')
def reset_password(handler):
    data = req.parse_json_body(handler)
    val.require_fields(data, 'token', 'new_password')
    val.validate_password(data['new_password'])
    auth_service.reset_password(data['token'], data['new_password'])
    response.success(handler, None, 'Password reset successfully')


@route('PUT', '/auth/change-password')
def change_password(handler):
    db = get_db()
    user = auth.require_auth(handler, db)
    data = req.parse_json_body(handler)
    val.require_fields(data, 'old_password', 'new_password')
    val.validate_password(data['new_password'])
    auth_service.change_password(user['user_id'], data['old_password'], data['new_password'],
                                 handler.client_address[0])
    response.success(handler, None, 'Password changed. Please login again.')
