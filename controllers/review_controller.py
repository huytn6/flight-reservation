import uuid
import datetime
from core.router import route
from core import response, request as req, authentication as auth, validation as val
from database.connection import get_db


@route('GET', '/airlines/{airline_id}/reviews')
def airline_reviews(handler, airline_id):
    db = get_db()
    rows = db.execute(
        "SELECT r.*, u.full_name as reviewer_name FROM reviews r JOIN users u ON u.id=r.user_id WHERE r.airline_id=? AND r.status='PUBLISHED' ORDER BY r.created_at DESC",
        (airline_id,)
    ).fetchall()
    response.success(handler, [dict(r) for r in rows])


@route('POST', '/bookings/{booking_id}/reviews')
def create_review(handler, booking_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    booking = db.execute("SELECT * FROM bookings WHERE id=? AND user_id=?", (booking_id, user['user_id'])).fetchone()
    if not booking:
        from core.exceptions import NotFoundError
        raise NotFoundError('Booking')
    if booking['status'] != 'COMPLETED':
        from core.exceptions import BusinessError
        raise BusinessError('BOOKING_NOT_COMPLETED', 'You can only review completed bookings')

    data = req.parse_json_body(handler)
    val.require_fields(data, 'airline_id', 'rating')
    rating = int(data['rating'])
    if not 1 <= rating <= 5:
        from core.exceptions import ValidationError
        raise ValidationError('Rating must be between 1 and 5')

    rid = str(uuid.uuid4())
    now = datetime.datetime.utcnow().isoformat()
    db.execute(
        "INSERT INTO reviews(id,booking_id,user_id,airline_id,rating,title,body,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?)",
        (rid, booking_id, user['user_id'], data['airline_id'], rating, data.get('title'), data.get('body'), 'PUBLISHED', now, now)
    )
    db.commit()
    response.created(handler, {'id': rid})


@route('PATCH', '/reviews/{review_id}')
def update_review(handler, review_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    row = db.execute("SELECT * FROM reviews WHERE id=? AND user_id=?", (review_id, user['user_id'])).fetchone()
    if not row:
        from core.exceptions import NotFoundError
        raise NotFoundError('Review')
    data = req.parse_json_body(handler)
    allowed = {'rating', 'title', 'body'}
    updates = {k: v for k, v in data.items() if k in allowed}
    if 'rating' in updates:
        updates['rating'] = int(updates['rating'])
    now = datetime.datetime.utcnow().isoformat()
    updates['updated_at'] = now
    set_clause = ', '.join(f'{k}=?' for k in updates)
    db.execute(f"UPDATE reviews SET {set_clause} WHERE id=?", (*updates.values(), review_id))
    db.commit()
    response.success(handler, None, 'Review updated')


@route('DELETE', '/reviews/{review_id}')
def delete_review(handler, review_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    if user['role'] == 'ADMIN':
        row = db.execute("SELECT id FROM reviews WHERE id=?", (review_id,)).fetchone()
    else:
        row = db.execute("SELECT id FROM reviews WHERE id=? AND user_id=?", (review_id, user['user_id'])).fetchone()
    if not row:
        from core.exceptions import NotFoundError
        raise NotFoundError('Review')
    db.execute("DELETE FROM reviews WHERE id=?", (review_id,))
    db.commit()
    response.no_content(handler)


@route('POST', '/reviews/{review_id}/reports')
def report_review(handler, review_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    row = db.execute("SELECT id FROM reviews WHERE id=?", (review_id,)).fetchone()
    if not row:
        from core.exceptions import NotFoundError
        raise NotFoundError('Review')
    data = req.parse_json_body(handler)
    val.require_fields(data, 'reason')
    now = datetime.datetime.utcnow().isoformat()
    db.execute(
        "INSERT INTO review_reports(id,review_id,reporter_id,reason,created_at) VALUES(?,?,?,?,?)",
        (str(uuid.uuid4()), review_id, user['user_id'], data['reason'], now)
    )
    db.commit()
    response.created(handler, None)
