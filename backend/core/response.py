import json
import uuid


def _json_default(obj):
    from datetime import datetime, date
    from decimal import Decimal
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError(f'Object of type {type(obj).__name__} is not JSON serializable')


def success(handler, data=None, message='Operation completed successfully', status=200):
    request_id = getattr(handler, '_request_id', str(uuid.uuid4()))
    body = {
        'success': True,
        'data': data,
        'message': message,
        'request_id': request_id,
    }
    _send(handler, status, body)


def created(handler, data=None, message='Created successfully'):
    success(handler, data, message, 201)


def no_content(handler):
    handler.send_response(204)
    handler.send_header('Content-Length', '0')
    _add_cors_headers(handler)
    handler.end_headers()


def error(handler, code, message, status=400, details=None):
    request_id = getattr(handler, '_request_id', str(uuid.uuid4()))
    body = {
        'success': False,
        'error': {
            'code': code,
            'message': message,
            'details': details or {},
        },
        'request_id': request_id,
    }
    _send(handler, status, body)


def from_exception(handler, exc):
    from core.exceptions import AppError
    if isinstance(exc, AppError):
        error(handler, exc.code, exc.message, exc.status, exc.details)
    else:
        import traceback
        traceback.print_exc()
        error(handler, 'INTERNAL_ERROR', 'An unexpected error occurred', 500)


def _send(handler, status, body):
    raw = json.dumps(body, default=_json_default, ensure_ascii=False)
    encoded = raw.encode('utf-8')
    handler.send_response(status)
    handler.send_header('Content-Type', 'application/json; charset=utf-8')
    handler.send_header('Content-Length', str(len(encoded)))
    _add_cors_headers(handler)
    handler.end_headers()
    handler.wfile.write(encoded)


def _add_cors_headers(handler):
    import config
    origin = handler.headers.get('Origin', '*')
    allowed = config.CORS_ORIGINS
    if allowed == '*' or origin in allowed.split(','):
        handler.send_header('Access-Control-Allow-Origin', origin)
    else:
        handler.send_header('Access-Control-Allow-Origin', '')
    handler.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
    handler.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Idempotency-Key')
    handler.send_header('Access-Control-Allow-Credentials', 'true')
    handler.send_header('Access-Control-Max-Age', '86400')
    handler.send_header('Vary', 'Origin')
