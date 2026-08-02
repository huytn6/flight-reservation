import re
from core.exceptions import ValidationError


def require_fields(data: dict, *fields):
    missing = [f for f in fields if f not in data or data[f] is None or data[f] == '']
    if missing:
        raise ValidationError(f'Missing required fields: {", ".join(missing)}')


def validate_email(email: str) -> str:
    email = email.strip().lower()
    if not re.match(r'^[^@\s]+@[^@\s]+\.[^@\s]+$', email):
        raise ValidationError('Invalid email address')
    return email


def validate_password(password: str):
    if len(password) < 8:
        raise ValidationError('Password must be at least 8 characters')
    if not re.search(r'[A-Z]', password):
        raise ValidationError('Password must contain at least one uppercase letter')
    if not re.search(r'[a-z]', password):
        raise ValidationError('Password must contain at least one lowercase letter')
    if not re.search(r'\d', password):
        raise ValidationError('Password must contain at least one digit')


def validate_phone(phone: str) -> str:
    phone = re.sub(r'[\s\-\(\)]', '', phone)
    if not re.match(r'^\+?[0-9]{7,15}$', phone):
        raise ValidationError('Invalid phone number')
    return phone


def validate_date(date_str: str, field='date') -> str:
    from datetime import datetime
    try:
        datetime.strptime(date_str, '%Y-%m-%d')
        return date_str
    except ValueError:
        raise ValidationError(f'Invalid {field}, expected YYYY-MM-DD')


def validate_positive_int(value, field='value') -> int:
    try:
        v = int(value)
        if v <= 0:
            raise ValueError()
        return v
    except (TypeError, ValueError):
        raise ValidationError(f'{field} must be a positive integer')


def sanitize_str(value, max_len=255, field='field') -> str:
    if not isinstance(value, str):
        raise ValidationError(f'{field} must be a string')
    value = value.strip()
    if len(value) > max_len:
        raise ValidationError(f'{field} exceeds max length of {max_len}')
    return value
