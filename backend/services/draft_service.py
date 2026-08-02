import json
import uuid
import datetime

from core.exceptions import ValidationError, NotFoundError, AuthorizationError, BusinessError, ConflictError
from core import validation as val
from database.connection import get_db, transaction
from repositories import booking_repo, flight_repo, coupon_repo
from utils.date_utils import utcnow_iso
from utils.price_utils import apply_coupon as calc_discount
import config

ANCILLARY_CATALOG = [
    {'code': 'BAGGAGE_20KG', 'name': 'Extra Baggage 20kg', 'ancillary_type': 'BAGGAGE', 'price': 500000},
    {'code': 'BAGGAGE_30KG', 'name': 'Extra Baggage 30kg', 'ancillary_type': 'BAGGAGE', 'price': 700000},
    {'code': 'MEAL_VEG', 'name': 'Vegetarian Meal', 'ancillary_type': 'MEAL', 'price': 150000},
    {'code': 'MEAL_CHICKEN', 'name': 'Chicken Meal', 'ancillary_type': 'MEAL', 'price': 150000},
    {'code': 'PRIORITY_BOARDING', 'name': 'Priority Boarding', 'ancillary_type': 'PRIORITY', 'price': 200000},
    {'code': 'LOUNGE_ACCESS', 'name': 'Airport Lounge Access', 'ancillary_type': 'LOUNGE', 'price': 400000},
    {'code': 'INSURANCE_BASIC', 'name': 'Basic Travel Insurance', 'ancillary_type': 'INSURANCE', 'price': 150000},
    {'code': 'INSURANCE_FULL', 'name': 'Comprehensive Travel Insurance', 'ancillary_type': 'INSURANCE', 'price': 350000},
]

INSURANCE_PLANS = {
    'BASIC': ('Basic Travel Insurance', 150000),
    'FULL': ('Comprehensive Travel Insurance', 350000),
}


def _get_draft_or_403(db, draft_id: str, user_id: str | None, role: str | None):
    row = booking_repo.find_draft(db, draft_id)
    if not row:
        raise NotFoundError('Booking draft')
    if role == 'CUSTOMER' and user_id and row['user_id'] and row['user_id'] != user_id:
        raise AuthorizationError()
    return row


def create_draft(user_id: str, flights: list) -> dict:
    if not isinstance(flights, list) or not flights:
        raise ValidationError('flights must be a non-empty list')
    db = get_db()
    offer_snapshot = []
    for item in flights:
        fare_id = item.get('fare_id')
        flight_id = item.get('flight_id')
        if not fare_id or not flight_id:
            raise ValidationError('Each flight item needs flight_id and fare_id')
        fare = flight_repo.find_fare_with_flight(db, fare_id, flight_id)
        if not fare:
            raise NotFoundError('Fare')
        if fare['available_seats'] <= 0:
            raise ConflictError('No seats available for selected fare', 'SEATS_UNAVAILABLE')
        offer_snapshot.append(dict(fare))

    did = str(uuid.uuid4())
    now = datetime.datetime.utcnow()
    expires = now + datetime.timedelta(minutes=config.DRAFT_EXPIRE_MINUTES)
    booking_repo.create_draft(db, did, user_id, json.dumps(offer_snapshot), expires.isoformat())
    db.commit()
    return {'id': did, 'expires_at': expires.isoformat()}


def get_draft(draft_id: str, user_id: str, role: str) -> dict:
    db = get_db()
    draft = _get_draft_or_403(db, draft_id, user_id, role)
    contact = booking_repo.get_draft_contact(db, draft_id)
    passengers = booking_repo.get_draft_passengers(db, draft_id)
    ancillaries = booking_repo.get_draft_ancillaries(db, draft_id)
    seat_holds = booking_repo.get_active_seat_holds(db, draft_id)
    return {
        'draft': dict(draft),
        'contact': dict(contact) if contact else None,
        'passengers': [dict(p) for p in passengers],
        'ancillaries': [dict(a) for a in ancillaries],
        'seat_holds': [dict(s) for s in seat_holds],
    }


def cancel_draft(draft_id: str, user_id: str, role: str) -> None:
    db = get_db()
    _get_draft_or_403(db, draft_id, user_id, role)
    now = utcnow_iso()
    booking_repo.release_all_draft_holds(db, draft_id)
    held_ids = booking_repo.get_held_seat_ids_for_draft(db, draft_id)
    for sid in held_ids:
        flight_repo.update_seat_status(db, sid, 'AVAILABLE')
    booking_repo.set_draft_status(db, draft_id, 'CANCELLED')
    db.commit()


def reprice_draft(draft_id: str, user_id: str, role: str) -> dict:
    db = get_db()
    draft = _get_draft_or_403(db, draft_id, user_id, role)
    offer = json.loads(draft['flight_offer_json'])
    updated = []
    price_changed = False
    for item in offer:
        fare = db.execute(
            "SELECT fa.*, fi.available_seats FROM fares fa JOIN fare_inventories fi ON fi.fare_id=fa.id WHERE fa.id=?",
            (item['id'],)
        ).fetchone()
        if not fare:
            raise ConflictError('Fare no longer available', 'FARE_UNAVAILABLE')
        current = dict(fare)
        if current['base_price'] != item['base_price']:
            price_changed = True
        updated.append(current)
    booking_repo.update_draft(db, draft_id, flight_offer_json=json.dumps(updated))
    db.commit()
    return {'price_changed': price_changed, 'fares': updated}


def save_contact(draft_id: str, user_id: str, role: str, full_name: str, email: str, phone: str) -> None:
    db = get_db()
    _get_draft_or_403(db, draft_id, user_id, role)
    booking_repo.upsert_draft_contact(db, draft_id, full_name, email, phone)
    db.commit()


def get_passengers(draft_id: str, user_id: str, role: str) -> list:
    db = get_db()
    _get_draft_or_403(db, draft_id, user_id, role)
    rows = booking_repo.get_draft_passengers(db, draft_id)
    return [dict(r) for r in rows]


def save_passengers(draft_id: str, user_id: str, role: str, passengers: list) -> None:
    if not passengers:
        raise ValidationError('passengers list is required')
    db = get_db()
    draft = _get_draft_or_403(db, draft_id, user_id, role)

    offer = json.loads(draft['flight_offer_json'])
    first_flight = db.execute(
        "SELECT departure_time FROM flights WHERE id=?", (offer[0].get('flight_id', ''),)
    ).fetchone()
    dep_date = first_flight['departure_time'][:10] if first_flight else datetime.date.today().isoformat()

    booking_repo.clear_draft_passengers(db, draft_id)
    adult_count = 0
    infant_count = 0
    for i, pax in enumerate(passengers):
        val.require_fields(pax, 'full_name', 'passenger_type')
        ptype = pax['passenger_type'].upper()
        if ptype not in ('ADULT', 'CHILD', 'INFANT'):
            raise ValidationError(f'Invalid passenger_type: {ptype}')
        if ptype == 'ADULT':
            adult_count += 1
        if ptype == 'INFANT':
            infant_count += 1
        booking_repo.add_draft_passenger(
            db, draft_id, i, ptype, pax['full_name'], pax.get('date_of_birth'),
            pax.get('nationality'), pax.get('passport_number'), pax.get('passport_expiry')
        )

    if infant_count > adult_count:
        raise BusinessError('INFANT_EXCEEDS_ADULT', 'Number of infants cannot exceed number of adults')

    booking_repo.update_draft(db, draft_id)
    db.commit()


def get_seat_map(draft_id: str, flight_id: str, user_id: str, role: str) -> dict:
    db = get_db()
    _get_draft_or_403(db, draft_id, user_id, role)
    seat_map = flight_repo.get_seat_map(db, flight_id)
    if not seat_map:
        raise NotFoundError('Seat map')
    seats = flight_repo.list_seats(db, flight_id)
    held_by_me = booking_repo.get_held_seat_ids_for_draft(db, draft_id)
    seats_list = []
    for s in seats:
        sd = dict(s)
        sd['held_by_me'] = s['id'] in held_by_me
        seats_list.append(sd)
    return {'flight_id': flight_id, 'layout': json.loads(seat_map['layout_json']), 'seats': seats_list}


def get_seat_holds(draft_id: str, user_id: str, role: str) -> list:
    db = get_db()
    _get_draft_or_403(db, draft_id, user_id, role)
    rows = booking_repo.get_active_seat_holds(db, draft_id)
    return [dict(r) for r in rows]


def hold_seat(draft_id: str, user_id: str, role: str, seat_id: str, pax_idx: int) -> dict:
    db = get_db()
    _get_draft_or_403(db, draft_id, user_id, role)
    now = datetime.datetime.utcnow()
    expires = now + datetime.timedelta(minutes=config.SEAT_HOLD_MINUTES)

    with transaction(db):
        seat = flight_repo.find_seat(db, seat_id)
        if not seat:
            raise NotFoundError('Seat')
        if seat['status'] not in ('AVAILABLE',):
            held = booking_repo.find_active_hold_for_seat(db, draft_id, seat_id)
            if not held:
                raise ConflictError(f'Seat {seat["seat_number"]} is not available', 'SEAT_NOT_AVAILABLE')

        old_hold = booking_repo.find_active_hold_for_passenger(db, draft_id, pax_idx)
        if old_hold:
            booking_repo.release_passenger_holds(db, draft_id, pax_idx)
            flight_repo.update_seat_status(db, old_hold['seat_id'], 'AVAILABLE')

        hold_id = str(uuid.uuid4())
        booking_repo.create_seat_hold(db, hold_id, draft_id, seat_id, pax_idx, expires.isoformat())
        flight_repo.update_seat_status(db, seat_id, 'HELD')

    return {'id': hold_id, 'expires_at': expires.isoformat()}


def change_seat_hold(draft_id: str, user_id: str, role: str, hold_id: str, new_seat_id: str) -> dict:
    db = get_db()
    _get_draft_or_403(db, draft_id, user_id, role)
    old_hold = booking_repo.find_seat_hold(db, hold_id, draft_id)
    if not old_hold:
        raise NotFoundError('Seat hold')

    now = datetime.datetime.utcnow()
    expires = now + datetime.timedelta(minutes=config.SEAT_HOLD_MINUTES)

    with transaction(db):
        seat = flight_repo.find_seat(db, new_seat_id)
        if not seat or seat['status'] != 'AVAILABLE':
            raise ConflictError('New seat is not available', 'SEAT_NOT_AVAILABLE')
        booking_repo.release_seat_hold(db, hold_id)
        flight_repo.update_seat_status(db, old_hold['seat_id'], 'AVAILABLE')
        new_hold_id = str(uuid.uuid4())
        booking_repo.create_seat_hold(db, new_hold_id, draft_id, new_seat_id,
                                      old_hold['passenger_index'], expires.isoformat())
        flight_repo.update_seat_status(db, new_seat_id, 'HELD')

    return {'id': new_hold_id, 'expires_at': expires.isoformat()}


def release_seat_hold(draft_id: str, user_id: str, role: str, hold_id: str) -> None:
    db = get_db()
    _get_draft_or_403(db, draft_id, user_id, role)
    hold = booking_repo.find_seat_hold(db, hold_id, draft_id)
    if not hold:
        raise NotFoundError('Seat hold')
    booking_repo.release_seat_hold(db, hold_id)
    flight_repo.update_seat_status(db, hold['seat_id'], 'AVAILABLE')
    db.commit()


def get_ancillaries(draft_id: str, user_id: str, role: str) -> dict:
    db = get_db()
    _get_draft_or_403(db, draft_id, user_id, role)
    rows = booking_repo.get_draft_ancillaries(db, draft_id)
    return {'selected': [dict(r) for r in rows], 'available': ANCILLARY_CATALOG}


def add_ancillary(draft_id: str, user_id: str, role: str, data: dict) -> dict:
    db = get_db()
    _get_draft_or_403(db, draft_id, user_id, role)
    val.require_fields(data, 'code', 'ancillary_type', 'name', 'price')
    aid = str(uuid.uuid4())
    booking_repo.add_draft_ancillary(
        db, aid, draft_id, data.get('passenger_index'), data.get('segment_id'),
        data['ancillary_type'], data['code'], data['name'], int(data['price']), data.get('quantity', 1)
    )
    db.commit()
    return {'id': aid}


def update_ancillary_quantity(draft_id: str, user_id: str, role: str, item_id: str, quantity: int) -> None:
    db = get_db()
    _get_draft_or_403(db, draft_id, user_id, role)
    row = booking_repo.find_draft_ancillary(db, item_id, draft_id)
    if not row:
        raise NotFoundError('Ancillary item')
    booking_repo.update_draft_ancillary_quantity(db, item_id, quantity)
    db.commit()


def delete_ancillary(draft_id: str, user_id: str, role: str, item_id: str) -> None:
    db = get_db()
    _get_draft_or_403(db, draft_id, user_id, role)
    booking_repo.delete_draft_ancillary(db, item_id, draft_id)
    db.commit()


def add_insurance(draft_id: str, user_id: str, role: str, plan_code: str) -> dict:
    if plan_code not in INSURANCE_PLANS:
        raise ValidationError('Invalid plan code')
    db = get_db()
    _get_draft_or_403(db, draft_id, user_id, role)
    name, price = INSURANCE_PLANS[plan_code]
    booking_repo.delete_draft_ancillaries_by_type(db, draft_id, 'INSURANCE')
    aid = str(uuid.uuid4())
    booking_repo.add_draft_ancillary(db, aid, draft_id, None, None, 'INSURANCE', plan_code, name, price, 1)
    db.commit()
    return {'id': aid, 'plan_name': name, 'price': price}


def remove_insurance(draft_id: str, user_id: str, role: str) -> None:
    db = get_db()
    _get_draft_or_403(db, draft_id, user_id, role)
    booking_repo.delete_draft_ancillaries_by_type(db, draft_id, 'INSURANCE')
    db.commit()


def get_price_breakdown(draft_id: str, user_id: str, role: str) -> dict:
    db = get_db()
    draft = _get_draft_or_403(db, draft_id, user_id, role)
    offer = json.loads(draft['flight_offer_json'])
    passengers = booking_repo.get_draft_passengers(db, draft_id)
    ancillaries = booking_repo.get_draft_ancillaries(db, draft_id)
    pax_count = len(passengers) if passengers else 1

    fare_items = []
    for f in offer:
        total_fare = f['base_price'] + f['tax'] + f['fees']
        fare_items.append({
            'fare_id': f['id'], 'fare_name': f.get('fare_name', ''),
            'base_price': f['base_price'], 'tax': f['tax'], 'fees': f['fees'],
            'subtotal': total_fare * pax_count, 'passengers': pax_count,
        })

    anc_items = [
        {'code': a['code'], 'name': a['name'], 'price': a['price'],
         'quantity': a['quantity'], 'subtotal': a['price'] * a['quantity']}
        for a in ancillaries
    ]

    fares_total = sum(i['subtotal'] for i in fare_items)
    anc_total = sum(i['subtotal'] for i in anc_items)
    return {
        'fare_items': fare_items,
        'ancillary_items': anc_items,
        'fares_total': fares_total,
        'ancillary_total': anc_total,
        'coupon_discount': 0,
        'grand_total': fares_total + anc_total,
        'currency': 'VND',
    }


def apply_coupon(draft_id: str, user_id: str, role: str, code: str) -> dict:
    db = get_db()
    draft = _get_draft_or_403(db, draft_id, user_id, role)
    now = utcnow_iso()
    coupon = db.execute(
        "SELECT * FROM coupons WHERE code=? AND is_active=1 AND valid_from<=? AND valid_until>=?",
        (code.upper(), now, now)
    ).fetchone()
    if not coupon:
        raise ValidationError('Invalid or expired coupon code')
    if coupon['max_uses'] and coupon['used_count'] >= coupon['max_uses']:
        raise ValidationError('Coupon usage limit reached')

    offer = json.loads(draft['flight_offer_json'])
    passengers = booking_repo.get_draft_passengers(db, draft_id)
    pax_count = len(passengers) if passengers else 1
    subtotal = sum((f['base_price'] + f['tax'] + f['fees']) for f in offer) * pax_count

    if coupon['min_amount'] and subtotal < coupon['min_amount']:
        raise ValidationError(f'Minimum amount {coupon["min_amount"]:,} VND required')

    discount = calc_discount(subtotal, dict(coupon))
    booking_repo.delete_draft_ancillaries_by_type(db, draft_id, 'COUPON')
    booking_repo.add_draft_ancillary(
        db, str(uuid.uuid4()), draft_id, None, None, 'COUPON',
        code.upper(), f'Coupon {code.upper()}', -discount, 1
    )
    db.commit()
    return {'code': code.upper(), 'discount': discount}


def remove_coupon(draft_id: str, user_id: str, role: str, code: str) -> None:
    db = get_db()
    _get_draft_or_403(db, draft_id, user_id, role)
    booking_repo.delete_draft_ancillaries_by_type_and_code(db, draft_id, 'COUPON', code.upper())
    db.commit()
