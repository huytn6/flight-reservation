import secrets
import string
import uuid


def generate_pnr(length=6) -> str:
    chars = string.ascii_uppercase + string.digits
    return ''.join(secrets.choice(chars) for _ in range(length))


def generate_ticket_number(pnr: str, passenger_index: int) -> str:
    prefix = '738'  # airline ticketing prefix demo
    return f'{prefix}-{pnr}-{passenger_index + 1:02d}'


def generate_uid() -> str:
    return str(uuid.uuid4())
