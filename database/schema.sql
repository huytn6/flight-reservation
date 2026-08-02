-- ============================================================
-- ACCOUNT GROUP
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id          TEXT PRIMARY KEY,
    email       TEXT UNIQUE NOT NULL,
    password    TEXT NOT NULL,
    full_name   TEXT NOT NULL,
    phone       TEXT,
    date_of_birth TEXT,
    nationality TEXT,
    passport_number TEXT,
    passport_expiry TEXT,
    role        TEXT NOT NULL DEFAULT 'CUSTOMER', -- CUSTOMER | STAFF | ADMIN
    status      TEXT NOT NULL DEFAULT 'ACTIVE',   -- ACTIVE | INACTIVE | BANNED
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
    id          TEXT PRIMARY KEY,
    user_id     TEXT NOT NULL REFERENCES users(id),
    token_hash  TEXT UNIQUE NOT NULL,
    ip_address  TEXT,
    user_agent  TEXT,
    created_at  TEXT NOT NULL,
    expires_at  TEXT NOT NULL,
    revoked_at  TEXT,
    last_seen_at TEXT
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id          TEXT PRIMARY KEY,
    user_id     TEXT NOT NULL REFERENCES users(id),
    token_hash  TEXT UNIQUE NOT NULL,
    created_at  TEXT NOT NULL,
    expires_at  TEXT NOT NULL,
    used_at     TEXT
);

CREATE TABLE IF NOT EXISTS saved_passengers (
    id          TEXT PRIMARY KEY,
    user_id     TEXT NOT NULL REFERENCES users(id),
    full_name   TEXT NOT NULL,
    date_of_birth TEXT,
    nationality TEXT,
    passport_number TEXT,
    passport_expiry TEXT,
    passenger_type TEXT NOT NULL DEFAULT 'ADULT',
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL
);

-- ============================================================
-- FLIGHT DATA GROUP
-- ============================================================
CREATE TABLE IF NOT EXISTS airports (
    id          TEXT PRIMARY KEY,
    iata_code   TEXT UNIQUE NOT NULL,
    icao_code   TEXT,
    name        TEXT NOT NULL,
    city        TEXT NOT NULL,
    country     TEXT NOT NULL,
    country_code TEXT NOT NULL,
    timezone    TEXT NOT NULL,
    latitude    REAL,
    longitude   REAL,
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS airlines (
    id          TEXT PRIMARY KEY,
    iata_code   TEXT UNIQUE NOT NULL,
    icao_code   TEXT,
    name        TEXT NOT NULL,
    country     TEXT,
    logo_url    TEXT,
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS aircraft_types (
    id          TEXT PRIMARY KEY,
    iata_code   TEXT NOT NULL,
    name        TEXT NOT NULL,
    manufacturer TEXT,
    seat_capacity INTEGER,
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cabin_classes (
    id          TEXT PRIMARY KEY,
    code        TEXT UNIQUE NOT NULL,  -- ECONOMY | PREMIUM_ECONOMY | BUSINESS | FIRST
    name        TEXT NOT NULL,
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS flights (
    id              TEXT PRIMARY KEY,
    flight_number   TEXT NOT NULL,
    airline_id      TEXT NOT NULL REFERENCES airlines(id),
    aircraft_type_id TEXT REFERENCES aircraft_types(id),
    departure_airport_id TEXT NOT NULL REFERENCES airports(id),
    arrival_airport_id   TEXT NOT NULL REFERENCES airports(id),
    departure_time  TEXT NOT NULL,  -- UTC ISO
    arrival_time    TEXT NOT NULL,  -- UTC ISO
    duration_minutes INTEGER NOT NULL,
    status          TEXT NOT NULL DEFAULT 'SCHEDULED',
    is_codeshare    INTEGER NOT NULL DEFAULT 0,
    created_at      TEXT NOT NULL,
    updated_at      TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_flights_dep ON flights(departure_airport_id, departure_time);
CREATE INDEX IF NOT EXISTS idx_flights_arr ON flights(arrival_airport_id);

CREATE TABLE IF NOT EXISTS flight_segments (
    id              TEXT PRIMARY KEY,
    flight_id       TEXT NOT NULL REFERENCES flights(id),
    segment_order   INTEGER NOT NULL,
    departure_airport_id TEXT NOT NULL REFERENCES airports(id),
    arrival_airport_id   TEXT NOT NULL REFERENCES airports(id),
    departure_time  TEXT NOT NULL,
    arrival_time    TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL,
    created_at      TEXT NOT NULL,
    updated_at      TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS fares (
    id              TEXT PRIMARY KEY,
    flight_id       TEXT NOT NULL REFERENCES flights(id),
    cabin_class_id  TEXT NOT NULL REFERENCES cabin_classes(id),
    fare_code       TEXT NOT NULL,
    fare_name       TEXT NOT NULL,
    base_price      INTEGER NOT NULL,   -- VND, no floats
    tax             INTEGER NOT NULL DEFAULT 0,
    fees            INTEGER NOT NULL DEFAULT 0,
    currency        TEXT NOT NULL DEFAULT 'VND',
    baggage_kg      INTEGER NOT NULL DEFAULT 0,
    carry_on_kg     INTEGER NOT NULL DEFAULT 7,
    is_refundable   INTEGER NOT NULL DEFAULT 0,
    is_changeable   INTEGER NOT NULL DEFAULT 0,
    change_fee      INTEGER NOT NULL DEFAULT 0,
    cancel_fee      INTEGER NOT NULL DEFAULT 0,
    created_at      TEXT NOT NULL,
    updated_at      TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_fares_flight ON fares(flight_id);

CREATE TABLE IF NOT EXISTS fare_rules (
    id          TEXT PRIMARY KEY,
    fare_id     TEXT NOT NULL REFERENCES fares(id),
    rule_type   TEXT NOT NULL,  -- CANCELLATION | CHANGE | BAGGAGE | OTHER
    description TEXT NOT NULL,
    created_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS fare_inventories (
    id          TEXT PRIMARY KEY,
    fare_id     TEXT NOT NULL REFERENCES fares(id) UNIQUE,
    total_seats INTEGER NOT NULL DEFAULT 0,
    available_seats INTEGER NOT NULL DEFAULT 0,
    updated_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS price_histories (
    id          TEXT PRIMARY KEY,
    fare_id     TEXT NOT NULL REFERENCES fares(id),
    price       INTEGER NOT NULL,
    recorded_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS seat_maps (
    id          TEXT PRIMARY KEY,
    flight_id   TEXT NOT NULL REFERENCES flights(id) UNIQUE,
    layout_json TEXT NOT NULL,  -- JSON describing columns/rows layout
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS seats (
    id          TEXT PRIMARY KEY,
    flight_id   TEXT NOT NULL REFERENCES flights(id),
    seat_number TEXT NOT NULL,
    cabin_class_id TEXT NOT NULL REFERENCES cabin_classes(id),
    row_number  INTEGER NOT NULL,
    column_label TEXT NOT NULL,
    seat_type   TEXT NOT NULL DEFAULT 'STANDARD',  -- STANDARD | WINDOW | AISLE | EXIT | EXTRA_LEGROOM
    status      TEXT NOT NULL DEFAULT 'AVAILABLE',  -- AVAILABLE | HELD | BOOKED | BLOCKED
    extra_fee   INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL,
    UNIQUE(flight_id, seat_number)
);
CREATE INDEX IF NOT EXISTS idx_seats_flight ON seats(flight_id);

-- ============================================================
-- SEARCH AND TRACKING GROUP
-- ============================================================
CREATE TABLE IF NOT EXISTS saved_flights (
    id          TEXT PRIMARY KEY,
    user_id     TEXT NOT NULL REFERENCES users(id),
    flight_id   TEXT NOT NULL REFERENCES flights(id),
    fare_id     TEXT REFERENCES fares(id),
    created_at  TEXT NOT NULL,
    UNIQUE(user_id, flight_id)
);

CREATE TABLE IF NOT EXISTS price_alerts (
    id          TEXT PRIMARY KEY,
    user_id     TEXT NOT NULL REFERENCES users(id),
    origin_iata TEXT NOT NULL,
    destination_iata TEXT NOT NULL,
    departure_date TEXT NOT NULL,
    return_date TEXT,
    cabin_class TEXT,
    max_price   INTEGER,
    is_active   INTEGER NOT NULL DEFAULT 1,
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS price_alert_histories (
    id          TEXT PRIMARY KEY,
    alert_id    TEXT NOT NULL REFERENCES price_alerts(id),
    price       INTEGER NOT NULL,
    recorded_at TEXT NOT NULL
);

-- ============================================================
-- CHECKOUT AND BOOKING GROUP
-- ============================================================
CREATE TABLE IF NOT EXISTS booking_drafts (
    id          TEXT PRIMARY KEY,
    user_id     TEXT REFERENCES users(id),
    flight_offer_json TEXT NOT NULL,  -- snapshot of selected flights/fares
    status      TEXT NOT NULL DEFAULT 'ACTIVE',  -- ACTIVE | CONFIRMED | EXPIRED | CANCELLED
    expires_at  TEXT NOT NULL,
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS draft_contacts (
    id          TEXT PRIMARY KEY,
    draft_id    TEXT NOT NULL REFERENCES booking_drafts(id) UNIQUE,
    full_name   TEXT NOT NULL,
    email       TEXT NOT NULL,
    phone       TEXT NOT NULL,
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS draft_passengers (
    id          TEXT PRIMARY KEY,
    draft_id    TEXT NOT NULL REFERENCES booking_drafts(id),
    passenger_index INTEGER NOT NULL,
    passenger_type TEXT NOT NULL,  -- ADULT | CHILD | INFANT
    full_name   TEXT NOT NULL,
    date_of_birth TEXT,
    nationality TEXT,
    passport_number TEXT,
    passport_expiry TEXT,
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS draft_ancillaries (
    id          TEXT PRIMARY KEY,
    draft_id    TEXT NOT NULL REFERENCES booking_drafts(id),
    passenger_index INTEGER,
    segment_id  TEXT,
    ancillary_type TEXT NOT NULL,  -- BAGGAGE | MEAL | PRIORITY | LOUNGE | INSURANCE | OTHER
    code        TEXT NOT NULL,
    name        TEXT NOT NULL,
    price       INTEGER NOT NULL DEFAULT 0,
    quantity    INTEGER NOT NULL DEFAULT 1,
    created_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS seat_holds (
    id          TEXT PRIMARY KEY,
    draft_id    TEXT NOT NULL REFERENCES booking_drafts(id),
    seat_id     TEXT NOT NULL REFERENCES seats(id),
    passenger_index INTEGER NOT NULL,
    expires_at  TEXT NOT NULL,
    released_at TEXT,
    created_at  TEXT NOT NULL,
    UNIQUE(draft_id, seat_id)
);

CREATE TABLE IF NOT EXISTS bookings (
    id          TEXT PRIMARY KEY,
    pnr         TEXT UNIQUE,
    user_id     TEXT REFERENCES users(id),
    draft_id    TEXT REFERENCES booking_drafts(id),
    contact_name TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    total_amount INTEGER NOT NULL,
    currency    TEXT NOT NULL DEFAULT 'VND',
    status      TEXT NOT NULL DEFAULT 'PENDING_PAYMENT',
    idempotency_key TEXT UNIQUE,
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_pnr ON bookings(pnr);

CREATE TABLE IF NOT EXISTS booking_segments (
    id          TEXT PRIMARY KEY,
    booking_id  TEXT NOT NULL REFERENCES bookings(id),
    flight_id   TEXT NOT NULL REFERENCES flights(id),
    fare_id     TEXT NOT NULL REFERENCES fares(id),
    segment_order INTEGER NOT NULL,
    created_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS booking_passengers (
    id              TEXT PRIMARY KEY,
    booking_id      TEXT NOT NULL REFERENCES bookings(id),
    passenger_index INTEGER NOT NULL,
    passenger_type  TEXT NOT NULL,
    full_name       TEXT NOT NULL,
    date_of_birth   TEXT,
    nationality     TEXT,
    passport_number TEXT,
    passport_expiry TEXT,
    created_at      TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS seat_assignments (
    id          TEXT PRIMARY KEY,
    booking_id  TEXT NOT NULL REFERENCES bookings(id),
    segment_id  TEXT NOT NULL REFERENCES booking_segments(id),
    passenger_id TEXT NOT NULL REFERENCES booking_passengers(id),
    seat_id     TEXT NOT NULL REFERENCES seats(id),
    created_at  TEXT NOT NULL,
    UNIQUE(segment_id, passenger_id)
);

CREATE TABLE IF NOT EXISTS e_tickets (
    id          TEXT PRIMARY KEY,
    booking_id  TEXT NOT NULL REFERENCES bookings(id),
    passenger_id TEXT NOT NULL REFERENCES booking_passengers(id),
    ticket_number TEXT UNIQUE NOT NULL,
    status      TEXT NOT NULL DEFAULT 'ISSUED',
    issued_at   TEXT NOT NULL,
    created_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS booking_documents (
    id          TEXT PRIMARY KEY,
    booking_id  TEXT NOT NULL REFERENCES bookings(id),
    doc_type    TEXT NOT NULL,  -- ITINERARY | RECEIPT | ETICKET
    content     TEXT,
    created_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS booking_status_histories (
    id          TEXT PRIMARY KEY,
    booking_id  TEXT NOT NULL REFERENCES bookings(id),
    from_status TEXT,
    to_status   TEXT NOT NULL,
    reason      TEXT,
    changed_by  TEXT,
    created_at  TEXT NOT NULL
);

-- ============================================================
-- PAYMENT AND POST-BOOKING GROUP
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
    id          TEXT PRIMARY KEY,
    booking_id  TEXT NOT NULL REFERENCES bookings(id),
    amount      INTEGER NOT NULL,
    currency    TEXT NOT NULL DEFAULT 'VND',
    payment_method TEXT NOT NULL,  -- CARD | MOMO | BANK_TRANSFER
    status      TEXT NOT NULL DEFAULT 'PENDING',
    idempotency_key TEXT UNIQUE,
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id);

CREATE TABLE IF NOT EXISTS payment_transactions (
    id          TEXT PRIMARY KEY,
    payment_id  TEXT NOT NULL REFERENCES payments(id),
    event_type  TEXT NOT NULL,  -- INITIATED | SUCCESS | FAILED | RETRY
    amount      INTEGER,
    metadata_json TEXT,
    created_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cancellations (
    id          TEXT PRIMARY KEY,
    booking_id  TEXT NOT NULL REFERENCES bookings(id),
    reason      TEXT,
    cancelled_by TEXT,
    refund_eligible INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS refunds (
    id          TEXT PRIMARY KEY,
    booking_id  TEXT NOT NULL REFERENCES bookings(id),
    payment_id  TEXT REFERENCES payments(id),
    amount      INTEGER NOT NULL,
    currency    TEXT NOT NULL DEFAULT 'VND',
    status      TEXT NOT NULL DEFAULT 'PENDING',
    reason      TEXT,
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS booking_changes (
    id          TEXT PRIMARY KEY,
    booking_id  TEXT NOT NULL REFERENCES bookings(id),
    change_type TEXT NOT NULL,  -- FLIGHT | SEAT
    old_data_json TEXT,
    new_data_json TEXT,
    fee         INTEGER NOT NULL DEFAULT 0,
    status      TEXT NOT NULL DEFAULT 'PENDING',
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS insurances (
    id          TEXT PRIMARY KEY,
    booking_id  TEXT NOT NULL REFERENCES bookings(id),
    plan_code   TEXT NOT NULL,
    plan_name   TEXT NOT NULL,
    price       INTEGER NOT NULL,
    created_at  TEXT NOT NULL
);

-- ============================================================
-- SUPPORT AND ADMIN GROUP
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
    id          TEXT PRIMARY KEY,
    user_id     TEXT NOT NULL REFERENCES users(id),
    title       TEXT NOT NULL,
    body        TEXT NOT NULL,
    type        TEXT NOT NULL DEFAULT 'INFO',
    is_read     INTEGER NOT NULL DEFAULT 0,
    reference_id TEXT,
    reference_type TEXT,
    created_at  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(user_id);

CREATE TABLE IF NOT EXISTS travel_alert_preferences (
    id          TEXT PRIMARY KEY,
    user_id     TEXT NOT NULL REFERENCES users(id) UNIQUE,
    delay_alerts INTEGER NOT NULL DEFAULT 1,
    gate_changes INTEGER NOT NULL DEFAULT 1,
    cancellation_alerts INTEGER NOT NULL DEFAULT 1,
    price_drop_alerts   INTEGER NOT NULL DEFAULT 1,
    updated_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS support_tickets (
    id          TEXT PRIMARY KEY,
    user_id     TEXT REFERENCES users(id),
    booking_id  TEXT REFERENCES bookings(id),
    subject     TEXT NOT NULL,
    status      TEXT NOT NULL DEFAULT 'OPEN',
    priority    TEXT NOT NULL DEFAULT 'NORMAL',
    assigned_to TEXT REFERENCES users(id),
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS support_messages (
    id          TEXT PRIMARY KEY,
    ticket_id   TEXT NOT NULL REFERENCES support_tickets(id),
    sender_id   TEXT NOT NULL REFERENCES users(id),
    body        TEXT NOT NULL,
    created_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS booking_notes (
    id          TEXT PRIMARY KEY,
    booking_id  TEXT NOT NULL REFERENCES bookings(id),
    staff_id    TEXT NOT NULL REFERENCES users(id),
    note        TEXT NOT NULL,
    created_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS reviews (
    id          TEXT PRIMARY KEY,
    booking_id  TEXT NOT NULL REFERENCES bookings(id),
    user_id     TEXT NOT NULL REFERENCES users(id),
    airline_id  TEXT NOT NULL REFERENCES airlines(id),
    rating      INTEGER NOT NULL,  -- 1-5
    title       TEXT,
    body        TEXT,
    status      TEXT NOT NULL DEFAULT 'PUBLISHED',
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS review_reports (
    id          TEXT PRIMARY KEY,
    review_id   TEXT NOT NULL REFERENCES reviews(id),
    reporter_id TEXT NOT NULL REFERENCES users(id),
    reason      TEXT NOT NULL,
    created_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS coupons (
    id          TEXT PRIMARY KEY,
    code        TEXT UNIQUE NOT NULL,
    discount_type TEXT NOT NULL DEFAULT 'PERCENT',  -- PERCENT | FIXED
    discount_value INTEGER NOT NULL,
    min_amount  INTEGER,
    max_uses    INTEGER,
    used_count  INTEGER NOT NULL DEFAULT 0,
    valid_from  TEXT NOT NULL,
    valid_until TEXT NOT NULL,
    is_active   INTEGER NOT NULL DEFAULT 1,
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS contents (
    id          TEXT PRIMARY KEY,
    key         TEXT UNIQUE NOT NULL,
    title       TEXT NOT NULL,
    body        TEXT NOT NULL,
    content_type TEXT NOT NULL DEFAULT 'PAGE',  -- PAGE | BANNER | FAQ
    is_published INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id          TEXT PRIMARY KEY,
    user_id     TEXT,
    action      TEXT NOT NULL,
    resource    TEXT NOT NULL,
    resource_id TEXT,
    details_json TEXT,
    ip_address  TEXT,
    created_at  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_audit_resource ON audit_logs(resource, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);
