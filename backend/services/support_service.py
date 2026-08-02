import uuid
from core.exceptions import NotFoundError
from database.connection import get_db
from repositories import support_repo
from utils.date_utils import utcnow_iso


def create_ticket(user_id: str, subject: str, category: str | None,
                  booking_id: str | None, message: str | None) -> dict:
    db = get_db()
    tid = str(uuid.uuid4())
    support_repo.create_ticket(db, tid, user_id, subject, category or 'GENERAL', booking_id)
    if message:
        support_repo.add_message(db, str(uuid.uuid4()), tid, user_id, message, 'CUSTOMER')
    db.commit()
    return {'id': tid}


def list_my_tickets(user_id: str) -> list:
    db = get_db()
    rows = support_repo.list_tickets_for_user(db, user_id)
    return [dict(r) for r in rows]


def get_my_ticket(user_id: str, ticket_id: str) -> dict:
    db = get_db()
    ticket = support_repo.find_ticket(db, ticket_id)
    if not ticket or ticket['user_id'] != user_id:
        raise NotFoundError('Ticket')
    messages = support_repo.get_messages(db, ticket_id)
    return {'ticket': dict(ticket), 'messages': [dict(m) for m in messages]}


def add_message(user_id: str, ticket_id: str, content: str) -> dict:
    db = get_db()
    ticket = support_repo.find_ticket(db, ticket_id)
    if not ticket or ticket['user_id'] != user_id:
        raise NotFoundError('Ticket')
    mid = str(uuid.uuid4())
    support_repo.add_message(db, mid, ticket_id, user_id, content, 'CUSTOMER')
    support_repo.update_ticket_status(db, ticket_id, 'WAITING_CUSTOMER')
    db.commit()
    return {'id': mid}


def close_ticket(user_id: str, ticket_id: str) -> None:
    db = get_db()
    ticket = support_repo.find_ticket(db, ticket_id)
    if not ticket or ticket['user_id'] != user_id:
        raise NotFoundError('Ticket')
    support_repo.update_ticket_status(db, ticket_id, 'CLOSED')
    db.commit()
