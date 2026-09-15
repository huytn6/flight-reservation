import json
import urllib.parse
from core.exceptions import ValidationError


def parse_json_body(handler):
    length = int(handler.headers.get('Content-Length', 0))
    if length == 0:
        return {}
    raw = handler.rfile.read(length)
    try:
        return json.loads(raw.decode('utf-8'))
    except (json.JSONDecodeError, UnicodeDecodeError):
        raise ValidationError('Dữ liệu JSON không hợp lệ')


def parse_query(handler):
    parsed = urllib.parse.urlparse(handler.path)
    return urllib.parse.parse_qs(parsed.query, keep_blank_values=False)


def get_query_param(handler, key, default=None):
    params = parse_query(handler)
    values = params.get(key)
    return values[0] if values else default


def get_int_param(handler, key, default=None, min_val=None, max_val=None):
    raw = get_query_param(handler, key)
    if raw is None:
        return default
    try:
        val = int(raw)
    except ValueError:
        raise ValidationError(f'Tham số "{key}" phải là số nguyên')
    if min_val is not None and val < min_val:
        raise ValidationError(f'Tham số "{key}" phải lớn hơn hoặc bằng {min_val}')
    if max_val is not None and val > max_val:
        raise ValidationError(f'Tham số "{key}" phải nhỏ hơn hoặc bằng {max_val}')
    return val


def get_bearer_token(handler):
    auth = handler.headers.get('Authorization', '')
    if auth.startswith('Bearer '):
        return auth[7:].strip()
    return None


def get_idempotency_key(handler):
    return handler.headers.get('Idempotency-Key')


def get_pagination(handler, default_size=20, max_size=100):
    page = get_int_param(handler, 'page', 1, min_val=1)
    # Frontend historically sends "size" on several pages while the API contract is
    # "page_size" — accept either so pagination actually takes effect either way.
    has_size = get_query_param(handler, 'size') is not None
    size_key = 'size' if has_size and get_query_param(handler, 'page_size') is None else 'page_size'
    size = get_int_param(handler, size_key, default_size, min_val=1, max_val=max_size)
    return page, size
