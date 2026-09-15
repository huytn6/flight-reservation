import re
from core.exceptions import ValidationError


def require_fields(data: dict, *fields):
    missing = [f for f in fields if f not in data or data[f] is None or data[f] == '']
    if missing:
        raise ValidationError(f'Thiếu các trường bắt buộc: {", ".join(missing)}')


def validate_email(email: str) -> str:
    email = email.strip().lower()
    if not re.match(r'^[^@\s]+@[^@\s]+\.[^@\s]+$', email):
        raise ValidationError('Địa chỉ email không hợp lệ')
    return email


def validate_password(password: str):
    if len(password) < 8:
        raise ValidationError('Mật khẩu phải có ít nhất 8 ký tự')
    if not re.search(r'[A-Z]', password):
        raise ValidationError('Mật khẩu phải có ít nhất một chữ cái viết hoa')
    if not re.search(r'[a-z]', password):
        raise ValidationError('Mật khẩu phải có ít nhất một chữ cái viết thường')
    if not re.search(r'\d', password):
        raise ValidationError('Mật khẩu phải có ít nhất một chữ số')


def validate_phone(phone: str) -> str:
    phone = re.sub(r'[\s\-\(\)]', '', phone)
    if not re.match(r'^\+?[0-9]{7,15}$', phone):
        raise ValidationError('Số điện thoại không hợp lệ')
    return phone


def validate_date(date_str: str, field='date') -> str:
    from datetime import datetime
    try:
        datetime.strptime(date_str, '%Y-%m-%d')
        return date_str
    except ValueError:
        raise ValidationError(f'{field} không hợp lệ, định dạng yêu cầu là YYYY-MM-DD')


def validate_positive_int(value, field='value') -> int:
    try:
        v = int(value)
        if v <= 0:
            raise ValueError()
        return v
    except (TypeError, ValueError):
        raise ValidationError(f'{field} phải là số nguyên dương')


def sanitize_str(value, max_len=255, field='field') -> str:
    if not isinstance(value, str):
        raise ValidationError(f'{field} phải là chuỗi ký tự')
    value = value.strip()
    if len(value) > max_len:
        raise ValidationError(f'{field} vượt quá độ dài tối đa {max_len} ký tự')
    return value
