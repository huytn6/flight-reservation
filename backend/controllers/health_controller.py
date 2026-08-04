from core.router import route
from core import response
from database.connection import get_db


@route('GET', '/health')
def health(handler):
    db = get_db()
    row = db.execute('SELECT 1 AS healthy').fetchone()
    response.success(handler, {
        'status': 'ok',
        'database': 'ok' if row and row['healthy'] == 1 else 'error',
    })
