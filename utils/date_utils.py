import datetime


def utcnow_iso() -> str:
    return datetime.datetime.utcnow().isoformat()


def utcnow() -> datetime.datetime:
    return datetime.datetime.utcnow()


def parse_iso(s: str) -> datetime.datetime:
    return datetime.datetime.fromisoformat(s)


def age_at(dob_str: str, reference_date_str: str) -> int:
    dob = datetime.date.fromisoformat(dob_str)
    ref = datetime.date.fromisoformat(reference_date_str[:10])
    age = ref.year - dob.year - ((ref.month, ref.day) < (dob.month, dob.day))
    return age


def passenger_type_for_age(age: int) -> str:
    if age < 2:
        return 'INFANT'
    if age < 18:
        return 'CHILD'
    return 'ADULT'


def add_minutes(dt_iso: str, minutes: int) -> str:
    dt = parse_iso(dt_iso)
    return (dt + datetime.timedelta(minutes=minutes)).isoformat()
