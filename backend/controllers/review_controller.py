from core.router import route
from core import response, request as req, authentication as auth, validation as val
from database.connection import get_db
from services import review_service


@route('GET', '/airlines/{airline_id}/reviews')
def airline_reviews(handler, airline_id):
    result = review_service.list_reviews(airline_id=airline_id)
    response.success(handler, result)


@route('POST', '/bookings/{booking_id}/reviews')
def create_review(handler, booking_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    data = req.parse_json_body(handler)
    val.require_fields(data, 'airline_id', 'rating')
    result = review_service.create_review(
        user['user_id'], booking_id, data['airline_id'], int(data['rating']),
        data.get('title'), data.get('body')
    )
    response.created(handler, result)


@route('PATCH', '/reviews/{review_id}')
def update_review(handler, review_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    data = req.parse_json_body(handler)
    review_service.update_review(user['user_id'], review_id, data)
    response.success(handler, None, 'Review updated')


@route('DELETE', '/reviews/{review_id}')
def delete_review(handler, review_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    review_service.delete_review(user['user_id'], user['role'], review_id)
    response.no_content(handler)


@route('POST', '/reviews/{review_id}/reports')
def report_review(handler, review_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    data = req.parse_json_body(handler)
    val.require_fields(data, 'reason')
    review_service.report_review(user['user_id'], review_id, data['reason'])
    response.created(handler, None)
