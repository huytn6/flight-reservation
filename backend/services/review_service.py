import uuid
from core.exceptions import NotFoundError, BusinessError, ValidationError, AuthorizationError, ConflictError
from database.connection import get_db
from repositories import review_repo, booking_repo

ALLOWED_UPDATE_FIELDS = {'rating', 'title', 'body'}


def list_reviews(airline_id: str | None = None) -> list:
    db = get_db()
    rows = review_repo.list_reviews(db, airline_id=airline_id)
    return [dict(r) for r in rows]


def create_review(user_id: str, booking_id: str, airline_id: str, rating: int,
                  title: str | None, body: str | None) -> dict:
    if not 1 <= rating <= 5:
        raise ValidationError('Rating must be between 1 and 5')
    db = get_db()
    booking = db.execute(
        "SELECT * FROM bookings WHERE id=? AND user_id=?", (booking_id, user_id)
    ).fetchone()
    if not booking:
        raise NotFoundError('Booking')
    if booking['status'] != 'COMPLETED':
        raise BusinessError('BOOKING_NOT_COMPLETED', 'You can only review completed bookings')
    if review_repo.find_review_by_user_and_airline(db, user_id, airline_id):
        raise ConflictError('You have already reviewed this airline', 'REVIEW_ALREADY_EXISTS')

    rid = str(uuid.uuid4())
    review_repo.create_review(db, rid, user_id, airline_id, booking_id, rating, title, body)
    db.commit()
    return {'id': rid}


def update_review(user_id: str, review_id: str, data: dict) -> None:
    db = get_db()
    row = review_repo.find_review(db, review_id)
    if not row or row['user_id'] != user_id:
        raise NotFoundError('Review')
    updates = {k: v for k, v in data.items() if k in ALLOWED_UPDATE_FIELDS}
    if 'rating' in updates:
        updates['rating'] = int(updates['rating'])
    review_repo.update_review(db, review_id, updates)
    db.commit()


def delete_review(user_id: str, role: str, review_id: str) -> None:
    db = get_db()
    if role == 'ADMIN':
        row = review_repo.find_review(db, review_id)
    else:
        row = review_repo.find_review(db, review_id)
        if row and row['user_id'] != user_id:
            row = None
    if not row:
        raise NotFoundError('Review')
    review_repo.delete_review(db, review_id)
    db.commit()


def report_review(user_id: str, review_id: str, reason: str) -> None:
    db = get_db()
    row = review_repo.find_review(db, review_id)
    if not row:
        raise NotFoundError('Review')
    review_repo.report_review(db, review_id, user_id, reason)
    db.commit()
