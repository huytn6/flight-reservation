import json
import uuid
from utils.date_utils import utcnow_iso


# ── Booking drafts ────────────────────────────────────────────────────────────

def create_draft(db, did, user_id, offer_json, expires):
    now = utcnow_iso()
    db.execute(
        "INSERT INTO booking_drafts(id,user_id,flight_offer_json,status,expires_at,created_at,updated_at) "
        "VALUES(?,?,?,?,?,?,?)",
        (did, user_id, offer_json, 'ACTIVE', expires, now, now)
    )


def find_draft(db, draft_id):
    return db.execute("SELECT * FROM booking_drafts WHERE id=?", (draft_id,)).fetchone()


def update_draft(db, draft_id, **kwargs):
    now = utcnow_iso()
    kwargs['updated_at'] = now
    set_clause = ', '.join(f'{k}=?' for k in kwargs)
    db.execute(f"UPDATE booking_drafts SET {set_clause} WHERE id=?", (*kwargs.values(), draft_id))


def set_draft_status(db, draft_id, status):
    now = utcnow_iso()
    db.execute(
        "UPDATE booking_drafts SET status=?, updated_at=? WHERE id=?", (status, now, draft_id)
    )


# ── Draft contacts ────────────────────────────────────────────────────────────

def get_draft_contact(db, draft_id):
    return db.execute("SELECT * FROM draft_contacts WHERE draft_id=?", (draft_id,)).fetchone()


def upsert_draft_contact(db, draft_id, full_name, email, phone):
    now = utcnow_iso()
    existing = db.execute("SELECT id FROM draft_contacts WHERE draft_id=?", (draft_id,)).fetchone()
    if existing:
        db.execute(
            "UPDATE draft_contacts SET full_name=?,email=?,phone=?,updated_at=? WHERE draft_id=?",
            (full_name, email, phone, now, draft_id)
        )
    else:
        db.execute(
            "INSERT INTO draft_contacts(id,draft_id,full_name,email,phone,created_at,updated_at) "
            "VALUES(?,?,?,?,?,?,?)",
            (str(uuid.uuid4()), draft_id, full_name, email, phone, now, now)
        )


# ── Draft passengers ──────────────────────────────────────────────────────────

def get_draft_passengers(db, draft_id):
    return db.execute(
        "SELECT * FROM draft_passengers WHERE draft_id=? ORDER BY passenger_index", (draft_id,)
    ).fetchall()


def clear_draft_passengers(db, draft_id):
    db.execute("DELETE FROM draft_passengers WHERE draft_id=?", (draft_id,))


def add_draft_passenger(db, draft_id, index, ptype, full_name, dob, nationality, passport_num, passport_exp):
    now = utcnow_iso()
    db.execute(
        "INSERT INTO draft_passengers(id,draft_id,passenger_index,passenger_type,full_name,"
        "date_of_birth,nationality,passport_number,passport_expiry,created_at,updated_at) "
        "VALUES(?,?,?,?,?,?,?,?,?,?,?)",
        (str(uuid.uuid4()), draft_id, index, ptype, full_name,
         dob, nationality, passport_num, passport_exp, now, now)
    )


# ── Seat holds ────────────────────────────────────────────────────────────────

def create_seat_hold(db, hold_id, draft_id, seat_id, pax_index, expires):
    now = utcnow_iso()
    db.execute("DELETE FROM seat_holds WHERE draft_id=? AND seat_id=?", (draft_id, seat_id))
    db.execute(
        "INSERT INTO seat_holds(id,draft_id,seat_id,passenger_index,expires_at,created_at) "
        "VALUES(?,?,?,?,?,?)",
        (hold_id, draft_id, seat_id, pax_index, expires, now)
    )


def find_seat_hold(db, hold_id, draft_id):
    return db.execute(
        "SELECT * FROM seat_holds WHERE id=? AND draft_id=?", (hold_id, draft_id)
    ).fetchone()


def get_active_seat_holds(db, draft_id):
    return db.execute(
        """SELECT sh.*, s.seat_number, s.cabin_class_id, s.seat_type, s.extra_fee
           FROM seat_holds sh
           JOIN seats s ON s.id=sh.seat_id
           WHERE sh.draft_id=? AND sh.released_at IS NULL""",
        (draft_id,)
    ).fetchall()


def find_active_hold_for_seat(db, draft_id, seat_id):
    return db.execute(
        "SELECT id FROM seat_holds WHERE draft_id=? AND seat_id=? AND released_at IS NULL",
        (draft_id, seat_id)
    ).fetchone()


def find_active_hold_for_passenger(db, draft_id, pax_index):
    return db.execute(
        "SELECT seat_id FROM seat_holds WHERE draft_id=? AND passenger_index=? AND released_at IS NULL",
        (draft_id, pax_index)
    ).fetchone()


def get_expired_seat_holds(db, now):
    return db.execute(
        "SELECT seat_id FROM seat_holds WHERE expires_at < ? AND released_at IS NULL", (now,)
    ).fetchall()


def release_expired_seat_holds(db, now):
    db.execute(
        "UPDATE seat_holds SET released_at=? WHERE expires_at < ? AND released_at IS NULL",
        (now, now)
    )


def release_seat_hold(db, hold_id):
    now = utcnow_iso()
    db.execute("UPDATE seat_holds SET released_at=? WHERE id=?", (now, hold_id))


def release_passenger_holds(db, draft_id, pax_index):
    now = utcnow_iso()
    db.execute(
        "UPDATE seat_holds SET released_at=? WHERE draft_id=? AND passenger_index=? AND released_at IS NULL",
        (now, draft_id, pax_index)
    )


def release_all_draft_holds(db, draft_id):
    now = utcnow_iso()
    db.execute(
        "UPDATE seat_holds SET released_at=? WHERE draft_id=? AND released_at IS NULL",
        (now, draft_id)
    )


def get_held_seat_ids_for_draft(db, draft_id):
    rows = db.execute(
        "SELECT seat_id FROM seat_holds WHERE draft_id=? AND released_at IS NULL", (draft_id,)
    ).fetchall()
    return {r['seat_id'] for r in rows}


# ── Draft ancillaries ─────────────────────────────────────────────────────────

def get_draft_ancillaries(db, draft_id):
    return db.execute("SELECT * FROM draft_ancillaries WHERE draft_id=?", (draft_id,)).fetchall()


def find_draft_ancillary(db, item_id, draft_id):
    return db.execute(
        "SELECT id FROM draft_ancillaries WHERE id=? AND draft_id=?", (item_id, draft_id)
    ).fetchone()


def add_draft_ancillary(db, aid, draft_id, pax_index, segment_id, atype, code, name, price, quantity):
    now = utcnow_iso()
    db.execute(
        "INSERT INTO draft_ancillaries(id,draft_id,passenger_index,segment_id,ancillary_type,"
        "code,name,price,quantity,created_at) VALUES(?,?,?,?,?,?,?,?,?,?)",
        (aid, draft_id, pax_index, segment_id, atype, code, name, price, quantity, now)
    )


def update_draft_ancillary_quantity(db, item_id, quantity):
    db.execute("UPDATE draft_ancillaries SET quantity=? WHERE id=?", (quantity, item_id))


def delete_draft_ancillary(db, item_id, draft_id):
    db.execute("DELETE FROM draft_ancillaries WHERE id=? AND draft_id=?", (item_id, draft_id))


def delete_draft_ancillaries_by_type(db, draft_id, atype):
    db.execute("DELETE FROM draft_ancillaries WHERE draft_id=? AND ancillary_type=?", (draft_id, atype))


def delete_draft_ancillaries_by_type_and_code(db, draft_id, atype, code):
    db.execute(
        "DELETE FROM draft_ancillaries WHERE draft_id=? AND ancillary_type=? AND code=?",
        (draft_id, atype, code)
    )


# ── Bookings ──────────────────────────────────────────────────────────────────

def create_booking(db, bid, user_id, draft_id, contact, total_amount, idempotency_key=None):
    now = utcnow_iso()
    db.execute(
        "INSERT INTO bookings(id,pnr,user_id,draft_id,contact_name,contact_email,contact_phone,"
        "total_amount,currency,status,idempotency_key,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)",
        (bid, None, user_id, draft_id, contact['full_name'], contact['email'],
         contact['phone'], total_amount, 'VND', 'PENDING_PAYMENT', idempotency_key, now, now)
    )


def find_booking(db, booking_id):
    return db.execute("SELECT * FROM bookings WHERE id=?", (booking_id,)).fetchone()


def find_booking_by_pnr(db, pnr):
    return db.execute("SELECT * FROM bookings WHERE pnr=?", (pnr,)).fetchone()


def find_booking_by_idempotency(db, key):
    return db.execute("SELECT * FROM bookings WHERE idempotency_key=?", (key,)).fetchone()


def update_booking_status(db, booking_id, status):
    now = utcnow_iso()
    db.execute("UPDATE bookings SET status=?, updated_at=? WHERE id=?", (status, now, booking_id))


def update_booking_pnr(db, booking_id, pnr):
    now = utcnow_iso()
    db.execute("UPDATE bookings SET pnr=?, updated_at=? WHERE id=?", (pnr, now, booking_id))


def update_booking_pnr_and_status(db, booking_id, pnr, status):
    now = utcnow_iso()
    db.execute(
        "UPDATE bookings SET pnr=?, status=?, updated_at=? WHERE id=?", (pnr, status, now, booking_id)
    )


def update_booking_contact(db, booking_id, updates: dict):
    now = utcnow_iso()
    updates = dict(updates)
    updates['updated_at'] = now
    set_clause = ', '.join(f'{k}=?' for k in updates)
    db.execute(f"UPDATE bookings SET {set_clause} WHERE id=?", (*updates.values(), booking_id))


def list_bookings_for_user(db, user_id, status_filter=None):
    if status_filter:
        return db.execute(
            "SELECT * FROM bookings WHERE user_id=? AND status=? ORDER BY created_at DESC",
            (user_id, status_filter)
        ).fetchall()
    return db.execute(
        "SELECT * FROM bookings WHERE user_id=? ORDER BY created_at DESC", (user_id,)
    ).fetchall()


def list_all_bookings(db, status=None):
    if status:
        return db.execute(
            "SELECT * FROM bookings WHERE status=? ORDER BY created_at DESC", (status,)
        ).fetchall()
    return db.execute("SELECT * FROM bookings ORDER BY created_at DESC").fetchall()


# ── Booking segments ──────────────────────────────────────────────────────────

def add_booking_segment(db, seg_id, booking_id, flight_id, fare_id, order):
    now = utcnow_iso()
    db.execute(
        "INSERT INTO booking_segments(id,booking_id,flight_id,fare_id,segment_order,created_at) "
        "VALUES(?,?,?,?,?,?)",
        (seg_id, booking_id, flight_id, fare_id, order, now)
    )


def get_booking_segments(db, booking_id):
    return db.execute(
        """SELECT bs.*, f.flight_number, f.departure_time, f.arrival_time, f.status as flight_status,
                  dep.iata_code as dep_iata, arr.iata_code as arr_iata,
                  dep.iata_code as departure_iata, arr.iata_code as arrival_iata,
                  dep.city as dep_city, arr.city as arr_city,
                  dep.city as departure_city, arr.city as arrival_city,
                  dep.name as departure_airport_name, arr.name as arrival_airport_name,
                  al.name as airline_name, al.iata_code as airline_code
           FROM booking_segments bs
           JOIN flights f ON f.id=bs.flight_id
           JOIN airports dep ON dep.id=f.departure_airport_id
           JOIN airports arr ON arr.id=f.arrival_airport_id
           JOIN airlines al ON al.id=f.airline_id
           WHERE bs.booking_id=? ORDER BY bs.segment_order""",
        (booking_id,)
    ).fetchall()


def get_booking_segments_simple(db, booking_id):
    return db.execute(
        "SELECT * FROM booking_segments WHERE booking_id=? ORDER BY segment_order", (booking_id,)
    ).fetchall()


def find_booking_segment(db, segment_id, booking_id):
    return db.execute(
        "SELECT * FROM booking_segments WHERE id=? AND booking_id=?", (segment_id, booking_id)
    ).fetchone()


# ── Booking passengers ────────────────────────────────────────────────────────

def add_booking_passenger(db, bp_id, booking_id, pax: dict):
    now = utcnow_iso()
    db.execute(
        "INSERT INTO booking_passengers(id,booking_id,passenger_index,passenger_type,full_name,"
        "date_of_birth,nationality,passport_number,passport_expiry,created_at) VALUES(?,?,?,?,?,?,?,?,?,?)",
        (bp_id, booking_id, pax['passenger_index'], pax['passenger_type'], pax['full_name'],
         pax.get('date_of_birth'), pax.get('nationality'),
         pax.get('passport_number'), pax.get('passport_expiry'), now)
    )


def get_booking_passengers(db, booking_id):
    return db.execute(
        "SELECT * FROM booking_passengers WHERE booking_id=? ORDER BY passenger_index", (booking_id,)
    ).fetchall()


def count_booking_passengers(db, booking_id):
    row = db.execute(
        "SELECT COUNT(*) as cnt FROM booking_passengers WHERE booking_id=?", (booking_id,)
    ).fetchone()
    return row['cnt']


def find_booking_passenger(db, passenger_id, booking_id):
    return db.execute(
        "SELECT id FROM booking_passengers WHERE id=? AND booking_id=?", (passenger_id, booking_id)
    ).fetchone()


def update_booking_passenger(db, passenger_id, updates: dict):
    set_clause = ', '.join(f'{k}=?' for k in updates)
    db.execute(
        f"UPDATE booking_passengers SET {set_clause} WHERE id=?", (*updates.values(), passenger_id)
    )


# ── Seat assignments ──────────────────────────────────────────────────────────

def create_seat_assignment(db, assign_id, booking_id, segment_id, passenger_id, seat_id):
    now = utcnow_iso()
    db.execute(
        "INSERT INTO seat_assignments(id,booking_id,segment_id,passenger_id,seat_id,created_at) "
        "VALUES(?,?,?,?,?,?)",
        (assign_id, booking_id, segment_id, passenger_id, seat_id, now)
    )


def get_seat_assignments(db, booking_id):
    return db.execute(
        "SELECT seat_id FROM seat_assignments WHERE booking_id=?", (booking_id,)
    ).fetchall()


def get_seat_assignments_detailed(db, booking_id):
    return db.execute(
        """SELECT sa.segment_id, sa.passenger_id, s.seat_number, s.seat_type
           FROM seat_assignments sa
           JOIN seats s ON s.id=sa.seat_id
           WHERE sa.booking_id=?""",
        (booking_id,)
    ).fetchall()


def find_seat_assignment(db, segment_id, passenger_id, booking_id):
    return db.execute(
        "SELECT * FROM seat_assignments WHERE segment_id=? AND passenger_id=? AND booking_id=?",
        (segment_id, passenger_id, booking_id)
    ).fetchone()


def update_seat_assignment(db, assign_id, new_seat_id):
    db.execute("UPDATE seat_assignments SET seat_id=? WHERE id=?", (new_seat_id, assign_id))


# ── Booking status history ────────────────────────────────────────────────────

def add_status_history(db, booking_id, from_status, to_status, changed_by=None, reason=None):
    now = utcnow_iso()
    db.execute(
        "INSERT INTO booking_status_histories(id,booking_id,from_status,to_status,reason,changed_by,created_at) "
        "VALUES(?,?,?,?,?,?,?)",
        (str(uuid.uuid4()), booking_id, from_status, to_status, reason, changed_by, now)
    )


def get_status_history(db, booking_id):
    return db.execute(
        "SELECT * FROM booking_status_histories WHERE booking_id=? ORDER BY created_at", (booking_id,)
    ).fetchall()


# ── Cancellations ─────────────────────────────────────────────────────────────

def create_cancellation(db, cid, booking_id, reason, cancelled_by):
    now = utcnow_iso()
    db.execute(
        "INSERT INTO cancellations(id,booking_id,reason,cancelled_by,refund_eligible,created_at) "
        "VALUES(?,?,?,?,1,?)",
        (cid, booking_id, reason, cancelled_by, now)
    )


def find_cancellation(db, booking_id):
    return db.execute("SELECT * FROM cancellations WHERE booking_id=?", (booking_id,)).fetchone()


# ── E-Tickets ─────────────────────────────────────────────────────────────────

def create_e_ticket(db, ticket_id, booking_id, passenger_id, ticket_number):
    now = utcnow_iso()
    db.execute(
        "INSERT INTO e_tickets(id,booking_id,passenger_id,ticket_number,status,issued_at,created_at) "
        "VALUES(?,?,?,?,?,?,?)",
        (ticket_id, booking_id, passenger_id, ticket_number, 'ISSUED', now, now)
    )


def get_e_tickets(db, booking_id):
    return db.execute(
        "SELECT et.*, bp.full_name, bp.passenger_type FROM e_tickets et "
        "JOIN booking_passengers bp ON bp.id=et.passenger_id WHERE et.booking_id=?",
        (booking_id,)
    ).fetchall()


def find_e_ticket(db, ticket_id, booking_id):
    return db.execute(
        """SELECT et.*, bp.full_name, bp.passport_number, bp.nationality, bp.passenger_type
           FROM e_tickets et JOIN booking_passengers bp ON bp.id=et.passenger_id
           WHERE et.id=? AND et.booking_id=?""",
        (ticket_id, booking_id)
    ).fetchone()


# ── Booking changes ───────────────────────────────────────────────────────────

def create_booking_change(db, change_id, booking_id, change_type, old_data, new_data, fee=0):
    now = utcnow_iso()
    db.execute(
        "INSERT INTO booking_changes(id,booking_id,change_type,old_data_json,new_data_json,"
        "fee,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)",
        (change_id, booking_id, change_type, json.dumps(old_data),
         json.dumps(new_data), fee, 'PENDING', now, now)
    )


def find_latest_booking_change(db, booking_id):
    return db.execute(
        "SELECT * FROM booking_changes WHERE booking_id=? ORDER BY created_at DESC LIMIT 1",
        (booking_id,)
    ).fetchone()


# ── Booking notes ─────────────────────────────────────────────────────────────

def add_booking_note(db, nid, booking_id, staff_id, note):
    now = utcnow_iso()
    db.execute(
        "INSERT INTO booking_notes(id,booking_id,staff_id,note,created_at) VALUES(?,?,?,?,?)",
        (nid, booking_id, staff_id, note, now)
    )


def get_booking_notes(db, booking_id):
    return db.execute(
        "SELECT * FROM booking_notes WHERE booking_id=? ORDER BY created_at DESC", (booking_id,)
    ).fetchall()
