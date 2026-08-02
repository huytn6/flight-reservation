import json
import uuid
import datetime
from core.router import route
from core import response, request as req, authentication as auth, validation as val
from database.connection import get_db, transaction
import config


def _get_draft(db, draft_id, user_id=None):
    row = db.execute("SELECT * FROM booking_drafts WHERE id=?", (draft_id,)).fetchone()
    if not row:
        from core.exceptions import NotFoundError
        raise NotFoundError('Booking draft')
    if user_id and row['user_id'] and row['user_id'] != user_id:
        from core.exceptions import AuthorizationError
        raise AuthorizationError()
    return row


@route('POST', '/booking-drafts')
def create_draft(handler):
    db = get_db()
    user = auth.require_auth(handler, db)
    data = req.parse_json_body(handler)
    val.require_fields(data, 'flights')  # list of {flight_id, fare_id}

    flights = data['flights']
    if not isinstance(flights, list) or not flights:
        from core.exceptions import ValidationError
        raise ValidationError('flights must be a non-empty list')

    # Validate and reprice
    offer_snapshot = []
    for item in flights:
        fare_id = item.get('fare_id')
        flight_id = item.get('flight_id')
        if not fare_id or not flight_id:
            from core.exceptions import ValidationError
            raise ValidationError('Each flight item needs flight_id and fare_id')
        fare = db.execute(
            """SELECT fa.*, fi.available_seats FROM fares fa
               JOIN fare_inventories fi ON fi.fare_id=fa.id
               WHERE fa.id=? AND fa.flight_id=?""",
            (fare_id, flight_id)
        ).fetchone()
        if not fare:
            from core.exceptions import NotFoundError
            raise NotFoundError('Fare')
        if fare['available_seats'] <= 0:
            from core.exceptions import ConflictError
            raise ConflictError('No seats available for selected fare', 'SEATS_UNAVAILABLE')
        offer_snapshot.append(dict(fare))

    did = str(uuid.uuid4())
    now = datetime.datetime.utcnow()
    expires = now + datetime.timedelta(minutes=config.DRAFT_EXPIRE_MINUTES)

    db.execute(
        "INSERT INTO booking_drafts(id,user_id,flight_offer_json,status,expires_at,created_at,updated_at) VALUES(?,?,?,?,?,?,?)",
        (did, user['user_id'], json.dumps(offer_snapshot), 'ACTIVE', expires.isoformat(), now.isoformat(), now.isoformat())
    )
    db.commit()
    response.created(handler, {'id': did, 'expires_at': expires.isoformat()})


@route('GET', '/booking-drafts/{draft_id}')
def get_draft(handler, draft_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    draft = _get_draft(db, draft_id, user['user_id'] if user['role'] == 'CUSTOMER' else None)
    contact = db.execute("SELECT * FROM draft_contacts WHERE draft_id=?", (draft_id,)).fetchone()
    passengers = db.execute("SELECT * FROM draft_passengers WHERE draft_id=? ORDER BY passenger_index", (draft_id,)).fetchall()
    ancillaries = db.execute("SELECT * FROM draft_ancillaries WHERE draft_id=?", (draft_id,)).fetchall()
    seat_holds = db.execute("SELECT * FROM seat_holds WHERE draft_id=? AND released_at IS NULL", (draft_id,)).fetchall()

    response.success(handler, {
        'draft': dict(draft),
        'contact': dict(contact) if contact else None,
        'passengers': [dict(p) for p in passengers],
        'ancillaries': [dict(a) for a in ancillaries],
        'seat_holds': [dict(s) for s in seat_holds],
    })


@route('DELETE', '/booking-drafts/{draft_id}')
def cancel_draft(handler, draft_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    draft = _get_draft(db, draft_id, user['user_id'] if user['role'] == 'CUSTOMER' else None)
    now = datetime.datetime.utcnow().isoformat()
    # Release seat holds
    db.execute("UPDATE seat_holds SET released_at=? WHERE draft_id=? AND released_at IS NULL", (now, draft_id))
    db.execute("UPDATE seats SET status='AVAILABLE', updated_at=? WHERE id IN (SELECT seat_id FROM seat_holds WHERE draft_id=?)", (now, draft_id))
    db.execute("UPDATE booking_drafts SET status='CANCELLED', updated_at=? WHERE id=?", (now, draft_id))
    db.commit()
    response.no_content(handler)


@route('POST', '/booking-drafts/{draft_id}/reprice')
def reprice_draft(handler, draft_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    draft = _get_draft(db, draft_id, user['user_id'] if user['role'] == 'CUSTOMER' else None)
    offer = json.loads(draft['flight_offer_json'])
    updated = []
    price_changed = False
    for item in offer:
        fare = db.execute(
            "SELECT fa.*, fi.available_seats FROM fares fa JOIN fare_inventories fi ON fi.fare_id=fa.id WHERE fa.id=?",
            (item['id'],)
        ).fetchone()
        if not fare:
            from core.exceptions import ConflictError
            raise ConflictError('Fare no longer available', 'FARE_UNAVAILABLE')
        current = dict(fare)
        if current['base_price'] != item['base_price']:
            price_changed = True
        updated.append(current)
    # Update snapshot
    now = datetime.datetime.utcnow().isoformat()
    db.execute("UPDATE booking_drafts SET flight_offer_json=?, updated_at=? WHERE id=?", (json.dumps(updated), now, draft_id))
    db.commit()
    response.success(handler, {'price_changed': price_changed, 'fares': updated})


@route('GET', '/booking-drafts/{draft_id}/summary')
def draft_summary(handler, draft_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    draft = _get_draft(db, draft_id, user['user_id'] if user['role'] == 'CUSTOMER' else None)
    passengers = db.execute("SELECT * FROM draft_passengers WHERE draft_id=?", (draft_id,)).fetchall()
    ancillaries = db.execute("SELECT * FROM draft_ancillaries WHERE draft_id=?", (draft_id,)).fetchall()
    offer = json.loads(draft['flight_offer_json'])

    # Calculate totals
    pax_count = len(passengers) if passengers else 1
    fares_total = sum((f['base_price'] + f['tax'] + f['fees']) for f in offer) * pax_count
    ancillary_total = sum(a['price'] * a['quantity'] for a in ancillaries)
    total = fares_total + ancillary_total

    # Check coupon
    coupon_discount = 0
    coupon_row = db.execute("SELECT * FROM coupons WHERE code IN (SELECT DISTINCT code FROM draft_ancillaries WHERE draft_id=? AND ancillary_type='COUPON')", (draft_id,)).fetchone()

    response.success(handler, {
        'fares_total': fares_total,
        'ancillary_total': ancillary_total,
        'coupon_discount': coupon_discount,
        'total': total,
        'currency': 'VND',
        'passengers_count': pax_count,
    })


@route('PUT', '/booking-drafts/{draft_id}/contact')
def save_contact(handler, draft_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    draft = _get_draft(db, draft_id, user['user_id'] if user['role'] == 'CUSTOMER' else None)
    data = req.parse_json_body(handler)
    val.require_fields(data, 'full_name', 'email', 'phone')
    email = val.validate_email(data['email'])
    now = datetime.datetime.utcnow().isoformat()

    existing = db.execute("SELECT id FROM draft_contacts WHERE draft_id=?", (draft_id,)).fetchone()
    if existing:
        db.execute("UPDATE draft_contacts SET full_name=?,email=?,phone=?,updated_at=? WHERE draft_id=?",
                   (data['full_name'], email, data['phone'], now, draft_id))
    else:
        db.execute(
            "INSERT INTO draft_contacts(id,draft_id,full_name,email,phone,created_at,updated_at) VALUES(?,?,?,?,?,?,?)",
            (str(uuid.uuid4()), draft_id, data['full_name'], email, data['phone'], now, now)
        )
    db.commit()
    response.success(handler, None, 'Contact saved')


@route('GET', '/booking-drafts/{draft_id}/passengers')
def get_passengers(handler, draft_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    _get_draft(db, draft_id, user['user_id'] if user['role'] == 'CUSTOMER' else None)
    rows = db.execute("SELECT * FROM draft_passengers WHERE draft_id=? ORDER BY passenger_index", (draft_id,)).fetchall()
    response.success(handler, [dict(r) for r in rows])


@route('PUT', '/booking-drafts/{draft_id}/passengers')
def save_passengers(handler, draft_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    draft = _get_draft(db, draft_id, user['user_id'] if user['role'] == 'CUSTOMER' else None)
    data = req.parse_json_body(handler)
    passengers = data if isinstance(data, list) else data.get('passengers', [])
    if not passengers:
        from core.exceptions import ValidationError
        raise ValidationError('passengers list is required')

    offer = json.loads(draft['flight_offer_json'])
    # Get first departure date for age calculation
    first_flight = db.execute("SELECT departure_time FROM flights WHERE id=?", (offer[0].get('flight_id', ''),)).fetchone()
    dep_date = first_flight['departure_time'][:10] if first_flight else datetime.date.today().isoformat()

    now = datetime.datetime.utcnow().isoformat()
    # Remove old passengers
    db.execute("DELETE FROM draft_passengers WHERE draft_id=?", (draft_id,))

    adult_count = 0
    infant_count = 0
    for i, pax in enumerate(passengers):
        val.require_fields(pax, 'full_name', 'passenger_type')
        ptype = pax['passenger_type'].upper()
        if ptype not in ('ADULT', 'CHILD', 'INFANT'):
            from core.exceptions import ValidationError
            raise ValidationError(f'Invalid passenger_type: {ptype}')
        if ptype == 'ADULT':
            adult_count += 1
        if ptype == 'INFANT':
            infant_count += 1

        db.execute(
            "INSERT INTO draft_passengers(id,draft_id,passenger_index,passenger_type,full_name,date_of_birth,nationality,passport_number,passport_expiry,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)",
            (str(uuid.uuid4()), draft_id, i, ptype, pax['full_name'], pax.get('date_of_birth'),
             pax.get('nationality'), pax.get('passport_number'), pax.get('passport_expiry'), now, now)
        )

    if infant_count > adult_count:
        from core.exceptions import BusinessError
        raise BusinessError('INFANT_EXCEEDS_ADULT', 'Number of infants cannot exceed number of adults')

    db.execute("UPDATE booking_drafts SET updated_at=? WHERE id=?", (now, draft_id))
    db.commit()
    response.success(handler, None, 'Passengers saved')


@route('GET', '/booking-drafts/{draft_id}/segments/{segment_id}/seat-map')
def get_seat_map(handler, draft_id, segment_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    _get_draft(db, draft_id, user['user_id'] if user['role'] == 'CUSTOMER' else None)

    # segment_id is actually flight_id in this simplified model
    flight_id = segment_id
    seat_map = db.execute("SELECT * FROM seat_maps WHERE flight_id=?", (flight_id,)).fetchone()
    if not seat_map:
        from core.exceptions import NotFoundError
        raise NotFoundError('Seat map')

    seats = db.execute("SELECT * FROM seats WHERE flight_id=? ORDER BY row_number, column_label", (flight_id,)).fetchall()
    # Check which seats are held by THIS draft
    held_by_me = {s['seat_id'] for s in db.execute("SELECT seat_id FROM seat_holds WHERE draft_id=? AND released_at IS NULL", (draft_id,)).fetchall()}

    seats_list = []
    for s in seats:
        sd = dict(s)
        sd['held_by_me'] = s['id'] in held_by_me
        seats_list.append(sd)

    response.success(handler, {
        'flight_id': flight_id,
        'layout': json.loads(seat_map['layout_json']),
        'seats': seats_list,
    })


@route('GET', '/booking-drafts/{draft_id}/seat-holds')
def get_seat_holds(handler, draft_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    _get_draft(db, draft_id, user['user_id'] if user['role'] == 'CUSTOMER' else None)
    rows = db.execute("SELECT sh.*, s.seat_number, s.cabin_class_id FROM seat_holds sh JOIN seats s ON s.id=sh.seat_id WHERE sh.draft_id=? AND sh.released_at IS NULL", (draft_id,)).fetchall()
    response.success(handler, [dict(r) for r in rows])


@route('POST', '/booking-drafts/{draft_id}/seat-holds')
def hold_seat(handler, draft_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    draft = _get_draft(db, draft_id, user['user_id'] if user['role'] == 'CUSTOMER' else None)
    data = req.parse_json_body(handler)
    val.require_fields(data, 'seat_id', 'passenger_index')

    seat_id = data['seat_id']
    pax_idx = data['passenger_index']
    now = datetime.datetime.utcnow()
    expires = now + datetime.timedelta(minutes=config.SEAT_HOLD_MINUTES)

    with transaction(db):
        seat = db.execute("SELECT * FROM seats WHERE id=?", (seat_id,)).fetchone()
        if not seat:
            from core.exceptions import NotFoundError
            raise NotFoundError('Seat')
        if seat['status'] not in ('AVAILABLE',):
            # Check if held by this draft
            held = db.execute("SELECT id FROM seat_holds WHERE draft_id=? AND seat_id=? AND released_at IS NULL", (draft_id, seat_id)).fetchone()
            if not held:
                from core.exceptions import ConflictError
                raise ConflictError(f'Seat {seat["seat_number"]} is not available', 'SEAT_NOT_AVAILABLE')

        # Release previous hold for same passenger/draft if any
        old_hold = db.execute("SELECT seat_id FROM seat_holds WHERE draft_id=? AND passenger_index=? AND released_at IS NULL", (draft_id, pax_idx)).fetchone()
        if old_hold:
            db.execute("UPDATE seat_holds SET released_at=? WHERE draft_id=? AND passenger_index=? AND released_at IS NULL", (now.isoformat(), draft_id, pax_idx))
            db.execute("UPDATE seats SET status='AVAILABLE', updated_at=? WHERE id=?", (now.isoformat(), old_hold['seat_id']))

        hold_id = str(uuid.uuid4())
        db.execute(
            "INSERT INTO seat_holds(id,draft_id,seat_id,passenger_index,expires_at,created_at) VALUES(?,?,?,?,?,?)",
            (hold_id, draft_id, seat_id, pax_idx, expires.isoformat(), now.isoformat())
        )
        db.execute("UPDATE seats SET status='HELD', updated_at=? WHERE id=?", (now.isoformat(), seat_id))

    response.created(handler, {'id': hold_id, 'expires_at': expires.isoformat()})


@route('PATCH', '/booking-drafts/{draft_id}/seat-holds/{hold_id}')
def change_seat_hold(handler, draft_id, hold_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    _get_draft(db, draft_id, user['user_id'] if user['role'] == 'CUSTOMER' else None)
    data = req.parse_json_body(handler)
    new_seat_id = data.get('seat_id')
    if not new_seat_id:
        from core.exceptions import ValidationError
        raise ValidationError('seat_id required')

    old_hold = db.execute("SELECT * FROM seat_holds WHERE id=? AND draft_id=?", (hold_id, draft_id)).fetchone()
    if not old_hold:
        from core.exceptions import NotFoundError
        raise NotFoundError('Seat hold')

    now = datetime.datetime.utcnow()
    expires = now + datetime.timedelta(minutes=config.SEAT_HOLD_MINUTES)

    with transaction(db):
        seat = db.execute("SELECT * FROM seats WHERE id=?", (new_seat_id,)).fetchone()
        if not seat or seat['status'] != 'AVAILABLE':
            from core.exceptions import ConflictError
            raise ConflictError('New seat is not available', 'SEAT_NOT_AVAILABLE')
        # Release old
        db.execute("UPDATE seat_holds SET released_at=? WHERE id=?", (now.isoformat(), hold_id))
        db.execute("UPDATE seats SET status='AVAILABLE', updated_at=? WHERE id=?", (now.isoformat(), old_hold['seat_id']))
        # Create new
        new_hold_id = str(uuid.uuid4())
        db.execute(
            "INSERT INTO seat_holds(id,draft_id,seat_id,passenger_index,expires_at,created_at) VALUES(?,?,?,?,?,?)",
            (new_hold_id, draft_id, new_seat_id, old_hold['passenger_index'], expires.isoformat(), now.isoformat())
        )
        db.execute("UPDATE seats SET status='HELD', updated_at=? WHERE id=?", (now.isoformat(), new_seat_id))

    response.success(handler, {'id': new_hold_id, 'expires_at': expires.isoformat()})


@route('DELETE', '/booking-drafts/{draft_id}/seat-holds/{hold_id}')
def release_seat_hold(handler, draft_id, hold_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    _get_draft(db, draft_id, user['user_id'] if user['role'] == 'CUSTOMER' else None)
    hold = db.execute("SELECT * FROM seat_holds WHERE id=? AND draft_id=?", (hold_id, draft_id)).fetchone()
    if not hold:
        from core.exceptions import NotFoundError
        raise NotFoundError('Seat hold')
    now = datetime.datetime.utcnow().isoformat()
    db.execute("UPDATE seat_holds SET released_at=? WHERE id=?", (now, hold_id))
    db.execute("UPDATE seats SET status='AVAILABLE', updated_at=? WHERE id=?", (now, hold['seat_id']))
    db.commit()
    response.no_content(handler)


# Ancillaries
@route('GET', '/booking-drafts/{draft_id}/ancillaries')
def get_ancillaries(handler, draft_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    _get_draft(db, draft_id, user['user_id'] if user['role'] == 'CUSTOMER' else None)
    rows = db.execute("SELECT * FROM draft_ancillaries WHERE draft_id=?", (draft_id,)).fetchall()
    # Also list available ancillary options
    available = [
        {'code': 'BAGGAGE_20KG', 'name': 'Extra Baggage 20kg', 'ancillary_type': 'BAGGAGE', 'price': 500000},
        {'code': 'BAGGAGE_30KG', 'name': 'Extra Baggage 30kg', 'ancillary_type': 'BAGGAGE', 'price': 700000},
        {'code': 'MEAL_VEG', 'name': 'Vegetarian Meal', 'ancillary_type': 'MEAL', 'price': 150000},
        {'code': 'MEAL_CHICKEN', 'name': 'Chicken Meal', 'ancillary_type': 'MEAL', 'price': 150000},
        {'code': 'PRIORITY_BOARDING', 'name': 'Priority Boarding', 'ancillary_type': 'PRIORITY', 'price': 200000},
        {'code': 'LOUNGE_ACCESS', 'name': 'Airport Lounge Access', 'ancillary_type': 'LOUNGE', 'price': 400000},
        {'code': 'INSURANCE_BASIC', 'name': 'Basic Travel Insurance', 'ancillary_type': 'INSURANCE', 'price': 150000},
        {'code': 'INSURANCE_FULL', 'name': 'Comprehensive Travel Insurance', 'ancillary_type': 'INSURANCE', 'price': 350000},
    ]
    response.success(handler, {'selected': [dict(r) for r in rows], 'available': available})


@route('POST', '/booking-drafts/{draft_id}/ancillaries')
def add_ancillary(handler, draft_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    _get_draft(db, draft_id, user['user_id'] if user['role'] == 'CUSTOMER' else None)
    data = req.parse_json_body(handler)
    val.require_fields(data, 'code', 'ancillary_type', 'name', 'price')
    aid = str(uuid.uuid4())
    now = datetime.datetime.utcnow().isoformat()
    db.execute(
        "INSERT INTO draft_ancillaries(id,draft_id,passenger_index,segment_id,ancillary_type,code,name,price,quantity,created_at) VALUES(?,?,?,?,?,?,?,?,?,?)",
        (aid, draft_id, data.get('passenger_index'), data.get('segment_id'),
         data['ancillary_type'], data['code'], data['name'], int(data['price']), data.get('quantity', 1), now)
    )
    db.commit()
    response.created(handler, {'id': aid})


@route('PATCH', '/booking-drafts/{draft_id}/ancillaries/{item_id}')
def update_ancillary(handler, draft_id, item_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    _get_draft(db, draft_id, user['user_id'] if user['role'] == 'CUSTOMER' else None)
    row = db.execute("SELECT id FROM draft_ancillaries WHERE id=? AND draft_id=?", (item_id, draft_id)).fetchone()
    if not row:
        from core.exceptions import NotFoundError
        raise NotFoundError('Ancillary item')
    data = req.parse_json_body(handler)
    if 'quantity' in data:
        db.execute("UPDATE draft_ancillaries SET quantity=? WHERE id=?", (int(data['quantity']), item_id))
        db.commit()
    response.success(handler, None, 'Updated')


@route('DELETE', '/booking-drafts/{draft_id}/ancillaries/{item_id}')
def delete_ancillary(handler, draft_id, item_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    _get_draft(db, draft_id, user['user_id'] if user['role'] == 'CUSTOMER' else None)
    db.execute("DELETE FROM draft_ancillaries WHERE id=? AND draft_id=?", (item_id, draft_id))
    db.commit()
    response.no_content(handler)


@route('GET', '/booking-drafts/{draft_id}/insurance-options')
def insurance_options(handler, draft_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    _get_draft(db, draft_id, user['user_id'] if user['role'] == 'CUSTOMER' else None)
    options = [
        {'code': 'BASIC', 'name': 'Basic', 'price': 150000, 'covers': ['Trip cancellation', 'Medical emergency']},
        {'code': 'FULL', 'name': 'Comprehensive', 'price': 350000, 'covers': ['Trip cancellation', 'Medical emergency', 'Baggage loss', 'Flight delay']},
    ]
    response.success(handler, options)


@route('POST', '/booking-drafts/{draft_id}/insurance')
def add_insurance(handler, draft_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    _get_draft(db, draft_id, user['user_id'] if user['role'] == 'CUSTOMER' else None)
    data = req.parse_json_body(handler)
    val.require_fields(data, 'plan_code')
    plans = {'BASIC': ('Basic Travel Insurance', 150000), 'FULL': ('Comprehensive Travel Insurance', 350000)}
    if data['plan_code'] not in plans:
        from core.exceptions import ValidationError
        raise ValidationError('Invalid plan code')
    name, price = plans[data['plan_code']]
    now = datetime.datetime.utcnow().isoformat()
    # Remove old insurance
    db.execute("DELETE FROM draft_ancillaries WHERE draft_id=? AND ancillary_type='INSURANCE'", (draft_id,))
    aid = str(uuid.uuid4())
    db.execute(
        "INSERT INTO draft_ancillaries(id,draft_id,ancillary_type,code,name,price,quantity,created_at) VALUES(?,?,?,?,?,?,1,?)",
        (aid, draft_id, 'INSURANCE', data['plan_code'], name, price, now)
    )
    db.commit()
    response.created(handler, {'id': aid, 'plan_name': name, 'price': price})


@route('DELETE', '/booking-drafts/{draft_id}/insurance')
def remove_insurance(handler, draft_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    _get_draft(db, draft_id, user['user_id'] if user['role'] == 'CUSTOMER' else None)
    db.execute("DELETE FROM draft_ancillaries WHERE draft_id=? AND ancillary_type='INSURANCE'", (draft_id,))
    db.commit()
    response.no_content(handler)


@route('GET', '/booking-drafts/{draft_id}/price-breakdown')
def price_breakdown(handler, draft_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    draft = _get_draft(db, draft_id, user['user_id'] if user['role'] == 'CUSTOMER' else None)
    offer = json.loads(draft['flight_offer_json'])
    passengers = db.execute("SELECT * FROM draft_passengers WHERE draft_id=?", (draft_id,)).fetchall()
    ancillaries = db.execute("SELECT * FROM draft_ancillaries WHERE draft_id=?", (draft_id,)).fetchall()
    pax_count = len(passengers) if passengers else 1

    fare_items = []
    for f in offer:
        total_fare = f['base_price'] + f['tax'] + f['fees']
        fare_items.append({
            'fare_id': f['id'],
            'fare_name': f.get('fare_name', ''),
            'base_price': f['base_price'],
            'tax': f['tax'],
            'fees': f['fees'],
            'subtotal': total_fare * pax_count,
            'passengers': pax_count,
        })

    anc_items = [{'code': a['code'], 'name': a['name'], 'price': a['price'], 'quantity': a['quantity'], 'subtotal': a['price'] * a['quantity']} for a in ancillaries]

    fares_total = sum(i['subtotal'] for i in fare_items)
    anc_total = sum(i['subtotal'] for i in anc_items)
    grand_total = fares_total + anc_total

    response.success(handler, {
        'fare_items': fare_items,
        'ancillary_items': anc_items,
        'fares_total': fares_total,
        'ancillary_total': anc_total,
        'coupon_discount': 0,
        'grand_total': grand_total,
        'currency': 'VND',
    })


@route('POST', '/booking-drafts/{draft_id}/coupons')
def apply_coupon(handler, draft_id):
    db = get_db()
    user = auth.require_auth(handler, db)
    draft = _get_draft(db, draft_id, user['user_id'] if user['role'] == 'CUSTOMER' else None)
    data = req.parse_json_body(handler)
    val.require_fields(data, 'code')
    code = data['code'].upper()
    now = datetime.datetime.utcnow().isoformat()
    coupon = db.execute(
        "SELECT * FROM coupons WHERE code=? AND is_active=1 AND valid_from<=? AND valid_until>=?",
        (code, now, now)
    ).fetchone()
    if not coupon:
        from core.exceptions import ValidationError
        raise ValidationError('Invalid or expired coupon code')
    if coupon['max_uses'] and coupon['used_count'] >= coupon['max_uses']:
        from core.exceptions import ValidationError
        raise ValidationError('Coupon usage limit reached')

    offer = json.loads(draft['flight_offer_json'])
    passengers = db.execute("SELECT count(*) as cnt FROM draft_passengers WHERE draft_id=?", (draft_id,)).fetchone()
    pax_count = passengers['cnt'] if passengers['cnt'] else 1
    subtotal = sum((f['base_price'] + f['tax'] + f['fees']) for f in offer) * pax_count

    if coupon['min_amount'] and subtotal < coupon['min_amount']:
        from core.exceptions import ValidationError
        raise ValidationError(f'Minimum amount {coupon["min_amount"]:,} VND required')

    from utils.price_utils import apply_coupon as calc_discount
    discount = calc_discount(subtotal, dict(coupon))

    # Store coupon as ancillary-type entry
    db.execute("DELETE FROM draft_ancillaries WHERE draft_id=? AND ancillary_type='COUPON'", (draft_id,))
    db.execute(
        "INSERT INTO draft_ancillaries(id,draft_id,ancillary_type,code,name,price,quantity,created_at) VALUES(?,?,?,?,?,?,1,?)",
        (str(uuid.uuid4()), draft_id, 'COUPON', code, f'Coupon {code}', -discount, now)
    )
    db.commit()
    response.success(handler, {'code': code, 'discount': discount})


@route('DELETE', '/booking-drafts/{draft_id}/coupons/{code}')
def remove_coupon(handler, draft_id, code):
    db = get_db()
    user = auth.require_auth(handler, db)
    _get_draft(db, draft_id, user['user_id'] if user['role'] == 'CUSTOMER' else None)
    db.execute("DELETE FROM draft_ancillaries WHERE draft_id=? AND ancillary_type='COUPON' AND code=?", (draft_id, code.upper()))
    db.commit()
    response.no_content(handler)
