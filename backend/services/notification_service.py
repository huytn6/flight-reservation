from core.exceptions import NotFoundError
from database.connection import get_db
from repositories import notification_repo
from utils.pagination import paginate

DEFAULTS = {'delay_alerts': True, 'gate_changes': True, 'cancellation_alerts': True, 'price_drop_alerts': True}


def list_notifications(user_id: str, page: int, size: int) -> dict:
    db = get_db()
    rows = notification_repo.list_notifications(db, user_id)
    return paginate([dict(r) for r in rows], page, size)


def get_unread_count(user_id: str) -> dict:
    db = get_db()
    return {'unread_count': notification_repo.count_unread(db, user_id)}


def mark_read(user_id: str, notif_id: str) -> None:
    db = get_db()
    row = notification_repo.find_notification(db, notif_id, user_id)
    if not row:
        raise NotFoundError('Notification')
    notification_repo.mark_read(db, notif_id, user_id)
    db.commit()


def mark_all_read(user_id: str) -> None:
    db = get_db()
    notification_repo.mark_all_read(db, user_id)
    db.commit()


def get_alert_preferences(user_id: str) -> dict:
    db = get_db()
    row = notification_repo.get_alert_preferences(db, user_id)
    if not row:
        return DEFAULTS.copy()
    return dict(row)


def update_alert_preferences(user_id: str, data: dict) -> None:
    db = get_db()
    allowed = {'delay_alerts', 'gate_changes', 'cancellation_alerts', 'price_drop_alerts'}
    prefs = {k: (1 if v else 0) for k, v in data.items() if k in allowed}
    notification_repo.upsert_alert_preferences(db, user_id, prefs)
    db.commit()
