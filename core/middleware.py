import time
import threading
import collections
import logging
import uuid
import config

logger = logging.getLogger(__name__)

_rate_buckets = collections.defaultdict(list)
_rate_lock = threading.Lock()


def check_rate_limit(key: str, limit: int, window: int):
    now = time.time()
    with _rate_lock:
        bucket = _rate_buckets[key]
        _rate_buckets[key] = [t for t in bucket if now - t < window]
        if len(_rate_buckets[key]) >= limit:
            from core.exceptions import RateLimitError
            raise RateLimitError()
        _rate_buckets[key].append(now)


def assign_request_id(handler):
    rid = str(uuid.uuid4())
    handler._request_id = rid
    return rid


def log_request(handler):
    logger.info('%s %s %s', handler._request_id, handler.command, handler.path)
