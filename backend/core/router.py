import re
import logging

logger = logging.getLogger(__name__)

_routes = []  # list of (method, pattern, handler_fn, param_names)


def route(method, path_template):
    """Decorator: @route('GET', '/users/{id}')"""
    def decorator(fn):
        pattern, names = _compile(path_template)
        _routes.append((method.upper(), pattern, fn, names))
        return fn
    return decorator


def _compile(template):
    param_names = []
    regex = '^'
    for part in re.split(r'(\{[^}]+\})', template):
        if part.startswith('{') and part.endswith('}'):
            name = part[1:-1]
            param_names.append(name)
            regex += r'([^/]+)'
        else:
            regex += re.escape(part)
    regex += '$'
    return re.compile(regex), param_names


def dispatch(handler):
    try:
        _dispatch(handler)
    finally:
        from database.connection import close_db
        close_db()


def _dispatch(handler):
    import urllib.parse
    path = urllib.parse.urlparse(handler.path).path
    method = handler.command

    # Strip base URL prefix
    import config
    if path.startswith(config.BASE_URL):
        path = path[len(config.BASE_URL):] or '/'

    if method == 'OPTIONS':
        from core.response import _add_cors_headers
        handler.send_response(204)
        handler.send_header('Content-Length', '0')
        _add_cors_headers(handler)
        handler.end_headers()
        return

    for (m, pattern, fn, names) in _routes:
        if m != method:
            continue
        match = pattern.match(path)
        if match:
            params = dict(zip(names, match.groups()))
            try:
                fn(handler, **params)
            except Exception as exc:
                from core.response import from_exception
                from core.exceptions import AppError
                if not isinstance(exc, AppError):
                    logger.exception('Unhandled error in %s %s', method, path)
                from_exception(handler, exc)
            return

    from core.response import error
    error(handler, 'NOT_FOUND', f'Route {method} {path} not found', 404)
