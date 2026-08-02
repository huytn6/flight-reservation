import threading
import time
import logging

logger = logging.getLogger(__name__)

_jobs = []
_lock = threading.Lock()
_running_jobs = set()


def register(name: str, interval_seconds: int, fn):
    _jobs.append({'name': name, 'interval': interval_seconds, 'fn': fn, 'last_run': 0})


def _run_job(job):
    name = job['name']
    with _lock:
        if name in _running_jobs:
            return
        _running_jobs.add(name)
    try:
        job['fn']()
    except Exception:
        logger.exception('Scheduler job %s failed', name)
    finally:
        try:
            from database.connection import close_db
            close_db()
        except Exception:
            logger.exception('Failed to close scheduler database connection')
        with _lock:
            _running_jobs.discard(name)
        job['last_run'] = time.time()


def start():
    def loop():
        while True:
            now = time.time()
            for job in _jobs:
                if now - job['last_run'] >= job['interval']:
                    t = threading.Thread(target=_run_job, args=(job,), daemon=True)
                    t.start()
            time.sleep(1)

    t = threading.Thread(target=loop, daemon=True)
    t.start()
    logger.info('Scheduler started with %d jobs', len(_jobs))
