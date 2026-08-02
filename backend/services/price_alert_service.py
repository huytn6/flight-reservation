import uuid
from core.exceptions import NotFoundError, ValidationError
from database.connection import get_db
from repositories import price_alert_repo

ALLOWED_UPDATE_FIELDS = {'max_price', 'cabin_class', 'is_active', 'return_date'}


def list_alerts(user_id: str) -> list:
    db = get_db()
    rows = price_alert_repo.list_alerts_for_user(db, user_id)
    return [dict(r) for r in rows]


def create_alert(user_id: str, data: dict) -> dict:
    origin = data.get('origin_iata', '').upper()
    destination = data.get('destination_iata', '').upper()
    departure_date = data.get('departure_date')
    if not origin or not destination or not departure_date:
        raise ValidationError('origin_iata, destination_iata, departure_date required')

    db = get_db()
    aid = str(uuid.uuid4())
    alert_data = {
        'origin_iata': origin,
        'destination_iata': destination,
        'departure_date': departure_date,
        'return_date': data.get('return_date'),
        'cabin_class': data.get('cabin_class'),
        'max_price': data.get('max_price'),
    }
    price_alert_repo.create_alert(db, aid, user_id, alert_data)
    db.commit()
    return {'id': aid}


def get_alert(user_id: str, alert_id: str) -> dict:
    db = get_db()
    row = price_alert_repo.find_alert(db, alert_id, user_id)
    if not row:
        raise NotFoundError('Price alert')
    return dict(row)


def update_alert(user_id: str, alert_id: str, data: dict) -> None:
    db = get_db()
    row = price_alert_repo.find_alert(db, alert_id, user_id)
    if not row:
        raise NotFoundError('Price alert')
    updates = {k: v for k, v in data.items() if k in ALLOWED_UPDATE_FIELDS}
    price_alert_repo.update_alert(db, alert_id, updates)
    db.commit()


def delete_alert(user_id: str, alert_id: str) -> None:
    db = get_db()
    row = price_alert_repo.find_alert(db, alert_id, user_id)
    if not row:
        raise NotFoundError('Price alert')
    price_alert_repo.delete_alert(db, alert_id)
    db.commit()


def get_history(user_id: str, alert_id: str) -> list:
    db = get_db()
    row = price_alert_repo.find_alert(db, alert_id, user_id)
    if not row:
        raise NotFoundError('Price alert')
    hist = price_alert_repo.get_alert_history(db, alert_id)
    return [dict(h) for h in hist]
