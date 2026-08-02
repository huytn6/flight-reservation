-- ============================================================
-- ACCOUNT GROUP
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id              VARCHAR(36)  PRIMARY KEY,
    email           VARCHAR(255) UNIQUE NOT NULL,
    password        TEXT         NOT NULL,
    full_name       TEXT         NOT NULL,
    phone           VARCHAR(20),
    date_of_birth   VARCHAR(10),
    nationality     VARCHAR(50),
    passport_number VARCHAR(20),
    passport_expiry VARCHAR(10),
    role            VARCHAR(20)  NOT NULL DEFAULT 'CUSTOMER',
    status          VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    created_at      VARCHAR(32)  NOT NULL,
    updated_at      VARCHAR(32)  NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sessions (
    id           VARCHAR(36) PRIMARY KEY,
    user_id      VARCHAR(36) NOT NULL,
    token_hash   VARCHAR(64) UNIQUE NOT NULL,
    ip_address   VARCHAR(45),
    user_agent   TEXT,
    created_at   VARCHAR(32) NOT NULL,
    expires_at   VARCHAR(32) NOT NULL,
    revoked_at   VARCHAR(32),
    last_seen_at VARCHAR(32)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id         VARCHAR(36) PRIMARY KEY,
    user_id    VARCHAR(36) NOT NULL,
    token_hash VARCHAR(64) UNIQUE NOT NULL,
    created_at VARCHAR(32) NOT NULL,
    expires_at VARCHAR(32) NOT NULL,
    used_at    VARCHAR(32)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS saved_passengers (
    id              VARCHAR(36) PRIMARY KEY,
    user_id         VARCHAR(36) NOT NULL,
    full_name       TEXT        NOT NULL,
    date_of_birth   VARCHAR(10),
    nationality     VARCHAR(50),
    passport_number VARCHAR(20),
    passport_expiry VARCHAR(10),
    passenger_type  VARCHAR(10) NOT NULL DEFAULT 'ADULT',
    created_at      VARCHAR(32) NOT NULL,
    updated_at      VARCHAR(32) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- FLIGHT DATA GROUP
-- ============================================================
CREATE TABLE IF NOT EXISTS airports (
    id           VARCHAR(36) PRIMARY KEY,
    iata_code    VARCHAR(10) UNIQUE NOT NULL,
    icao_code    VARCHAR(10),
    name         TEXT        NOT NULL,
    city         TEXT        NOT NULL,
    country      TEXT        NOT NULL,
    country_code VARCHAR(3)  NOT NULL,
    timezone     VARCHAR(50) NOT NULL,
    latitude     DOUBLE,
    longitude    DOUBLE,
    created_at   VARCHAR(32) NOT NULL,
    updated_at   VARCHAR(32) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS airlines (
    id         VARCHAR(36) PRIMARY KEY,
    iata_code  VARCHAR(10) UNIQUE NOT NULL,
    icao_code  VARCHAR(10),
    name       TEXT        NOT NULL,
    country    TEXT,
    logo_url   TEXT,
    created_at VARCHAR(32) NOT NULL,
    updated_at VARCHAR(32) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS aircraft_types (
    id            VARCHAR(36) PRIMARY KEY,
    iata_code     VARCHAR(10) NOT NULL,
    name          TEXT        NOT NULL,
    manufacturer  TEXT,
    seat_capacity INT,
    created_at    VARCHAR(32) NOT NULL,
    updated_at    VARCHAR(32) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cabin_classes (
    id         VARCHAR(36) PRIMARY KEY,
    code       VARCHAR(30) UNIQUE NOT NULL,
    name       TEXT        NOT NULL,
    created_at VARCHAR(32) NOT NULL,
    updated_at VARCHAR(32) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS flights (
    id                   VARCHAR(36) PRIMARY KEY,
    flight_number        VARCHAR(10) NOT NULL,
    airline_id           VARCHAR(36) NOT NULL,
    aircraft_type_id     VARCHAR(36),
    departure_airport_id VARCHAR(36) NOT NULL,
    arrival_airport_id   VARCHAR(36) NOT NULL,
    departure_time       VARCHAR(32) NOT NULL,
    arrival_time         VARCHAR(32) NOT NULL,
    duration_minutes     INT         NOT NULL,
    status               VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED',
    is_codeshare         TINYINT(1)  NOT NULL DEFAULT 0,
    created_at           VARCHAR(32) NOT NULL,
    updated_at           VARCHAR(32) NOT NULL,
    INDEX idx_flights_dep (departure_airport_id, departure_time),
    INDEX idx_flights_arr (arrival_airport_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS flight_segments (
    id                   VARCHAR(36) PRIMARY KEY,
    flight_id            VARCHAR(36) NOT NULL,
    segment_order        INT         NOT NULL,
    departure_airport_id VARCHAR(36) NOT NULL,
    arrival_airport_id   VARCHAR(36) NOT NULL,
    departure_time       VARCHAR(32) NOT NULL,
    arrival_time         VARCHAR(32) NOT NULL,
    duration_minutes     INT         NOT NULL,
    created_at           VARCHAR(32) NOT NULL,
    updated_at           VARCHAR(32) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fares (
    id             VARCHAR(36) PRIMARY KEY,
    flight_id      VARCHAR(36) NOT NULL,
    cabin_class_id VARCHAR(36) NOT NULL,
    fare_code      VARCHAR(20) NOT NULL,
    fare_name      TEXT        NOT NULL,
    base_price     BIGINT      NOT NULL,
    tax            BIGINT      NOT NULL DEFAULT 0,
    fees           BIGINT      NOT NULL DEFAULT 0,
    currency       VARCHAR(3)  NOT NULL DEFAULT 'VND',
    baggage_kg     INT         NOT NULL DEFAULT 0,
    carry_on_kg    INT         NOT NULL DEFAULT 7,
    is_refundable  TINYINT(1)  NOT NULL DEFAULT 0,
    is_changeable  TINYINT(1)  NOT NULL DEFAULT 0,
    change_fee     BIGINT      NOT NULL DEFAULT 0,
    cancel_fee     BIGINT      NOT NULL DEFAULT 0,
    created_at     VARCHAR(32) NOT NULL,
    updated_at     VARCHAR(32) NOT NULL,
    INDEX idx_fares_flight (flight_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fare_rules (
    id          VARCHAR(36) PRIMARY KEY,
    fare_id     VARCHAR(36) NOT NULL,
    rule_type   VARCHAR(20) NOT NULL,
    description TEXT        NOT NULL,
    created_at  VARCHAR(32) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fare_inventories (
    id              VARCHAR(36) PRIMARY KEY,
    fare_id         VARCHAR(36) NOT NULL UNIQUE,
    total_seats     INT         NOT NULL DEFAULT 0,
    available_seats INT         NOT NULL DEFAULT 0,
    updated_at      VARCHAR(32) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS price_histories (
    id          VARCHAR(36) PRIMARY KEY,
    fare_id     VARCHAR(36) NOT NULL,
    price       BIGINT      NOT NULL,
    recorded_at VARCHAR(32) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS seat_maps (
    id          VARCHAR(36) PRIMARY KEY,
    flight_id   VARCHAR(36) NOT NULL UNIQUE,
    layout_json LONGTEXT    NOT NULL,
    created_at  VARCHAR(32) NOT NULL,
    updated_at  VARCHAR(32) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS seats (
    id             VARCHAR(36) PRIMARY KEY,
    flight_id      VARCHAR(36) NOT NULL,
    seat_number    VARCHAR(10) NOT NULL,
    cabin_class_id VARCHAR(36) NOT NULL,
    seat_row       INT         NOT NULL,
    column_label   VARCHAR(5)  NOT NULL,
    seat_type      VARCHAR(20) NOT NULL DEFAULT 'STANDARD',
    status         VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    extra_fee      BIGINT      NOT NULL DEFAULT 0,
    created_at     VARCHAR(32) NOT NULL,
    updated_at     VARCHAR(32) NOT NULL,
    UNIQUE KEY uniq_seat (flight_id, seat_number),
    INDEX idx_seats_flight (flight_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- SEARCH AND TRACKING GROUP
-- ============================================================
CREATE TABLE IF NOT EXISTS saved_flights (
    id         VARCHAR(36) PRIMARY KEY,
    user_id    VARCHAR(36) NOT NULL,
    flight_id  VARCHAR(36) NOT NULL,
    fare_id    VARCHAR(36),
    created_at VARCHAR(32) NOT NULL,
    UNIQUE KEY uniq_saved_flight (user_id, flight_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS price_alerts (
    id               VARCHAR(36) PRIMARY KEY,
    user_id          VARCHAR(36) NOT NULL,
    origin_iata      VARCHAR(10) NOT NULL,
    destination_iata VARCHAR(10) NOT NULL,
    departure_date   VARCHAR(10) NOT NULL,
    return_date      VARCHAR(10),
    cabin_class      VARCHAR(30),
    max_price        BIGINT,
    is_active        TINYINT(1)  NOT NULL DEFAULT 1,
    created_at       VARCHAR(32) NOT NULL,
    updated_at       VARCHAR(32) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS price_alert_histories (
    id          VARCHAR(36) PRIMARY KEY,
    alert_id    VARCHAR(36) NOT NULL,
    price       BIGINT      NOT NULL,
    recorded_at VARCHAR(32) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- CHECKOUT AND BOOKING GROUP
-- ============================================================
CREATE TABLE IF NOT EXISTS booking_drafts (
    id                VARCHAR(36)  PRIMARY KEY,
    user_id           VARCHAR(36),
    flight_offer_json LONGTEXT     NOT NULL,
    status            VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    expires_at        VARCHAR(32)  NOT NULL,
    created_at        VARCHAR(32)  NOT NULL,
    updated_at        VARCHAR(32)  NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS draft_contacts (
    id         VARCHAR(36)  PRIMARY KEY,
    draft_id   VARCHAR(36)  NOT NULL UNIQUE,
    full_name  TEXT         NOT NULL,
    email      VARCHAR(255) NOT NULL,
    phone      VARCHAR(20)  NOT NULL,
    created_at VARCHAR(32)  NOT NULL,
    updated_at VARCHAR(32)  NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS draft_passengers (
    id              VARCHAR(36) PRIMARY KEY,
    draft_id        VARCHAR(36) NOT NULL,
    passenger_index INT         NOT NULL,
    passenger_type  VARCHAR(10) NOT NULL,
    full_name       TEXT        NOT NULL,
    date_of_birth   VARCHAR(10),
    nationality     VARCHAR(50),
    passport_number VARCHAR(20),
    passport_expiry VARCHAR(10),
    created_at      VARCHAR(32) NOT NULL,
    updated_at      VARCHAR(32) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS draft_ancillaries (
    id              VARCHAR(36) PRIMARY KEY,
    draft_id        VARCHAR(36) NOT NULL,
    passenger_index INT,
    segment_id      VARCHAR(36),
    ancillary_type  VARCHAR(20) NOT NULL,
    code            VARCHAR(50) NOT NULL,
    name            TEXT        NOT NULL,
    price           BIGINT      NOT NULL DEFAULT 0,
    quantity        INT         NOT NULL DEFAULT 1,
    created_at      VARCHAR(32) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS seat_holds (
    id              VARCHAR(36) PRIMARY KEY,
    draft_id        VARCHAR(36) NOT NULL,
    seat_id         VARCHAR(36) NOT NULL,
    passenger_index INT         NOT NULL,
    expires_at      VARCHAR(32) NOT NULL,
    released_at     VARCHAR(32),
    created_at      VARCHAR(32) NOT NULL,
    UNIQUE KEY uniq_seat_hold (draft_id, seat_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS bookings (
    id              VARCHAR(36)  PRIMARY KEY,
    pnr             VARCHAR(10)  UNIQUE,
    user_id         VARCHAR(36),
    draft_id        VARCHAR(36),
    contact_name    TEXT         NOT NULL,
    contact_email   VARCHAR(255) NOT NULL,
    contact_phone   VARCHAR(20)  NOT NULL,
    total_amount    BIGINT       NOT NULL,
    currency        VARCHAR(3)   NOT NULL DEFAULT 'VND',
    status          VARCHAR(30)  NOT NULL DEFAULT 'PENDING_PAYMENT',
    idempotency_key VARCHAR(100) UNIQUE,
    created_at      VARCHAR(32)  NOT NULL,
    updated_at      VARCHAR(32)  NOT NULL,
    INDEX idx_bookings_user (user_id),
    INDEX idx_bookings_pnr (pnr)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS booking_segments (
    id            VARCHAR(36) PRIMARY KEY,
    booking_id    VARCHAR(36) NOT NULL,
    flight_id     VARCHAR(36) NOT NULL,
    fare_id       VARCHAR(36) NOT NULL,
    segment_order INT         NOT NULL,
    created_at    VARCHAR(32) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS booking_passengers (
    id              VARCHAR(36) PRIMARY KEY,
    booking_id      VARCHAR(36) NOT NULL,
    passenger_index INT         NOT NULL,
    passenger_type  VARCHAR(10) NOT NULL,
    full_name       TEXT        NOT NULL,
    date_of_birth   VARCHAR(10),
    nationality     VARCHAR(50),
    passport_number VARCHAR(20),
    passport_expiry VARCHAR(10),
    created_at      VARCHAR(32) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS seat_assignments (
    id           VARCHAR(36) PRIMARY KEY,
    booking_id   VARCHAR(36) NOT NULL,
    segment_id   VARCHAR(36) NOT NULL,
    passenger_id VARCHAR(36) NOT NULL,
    seat_id      VARCHAR(36) NOT NULL,
    created_at   VARCHAR(32) NOT NULL,
    UNIQUE KEY uniq_seat_assign (segment_id, passenger_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS e_tickets (
    id            VARCHAR(36) PRIMARY KEY,
    booking_id    VARCHAR(36) NOT NULL,
    passenger_id  VARCHAR(36) NOT NULL,
    ticket_number VARCHAR(20) UNIQUE NOT NULL,
    status        VARCHAR(20) NOT NULL DEFAULT 'ISSUED',
    issued_at     VARCHAR(32) NOT NULL,
    created_at    VARCHAR(32) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS booking_documents (
    id         VARCHAR(36) PRIMARY KEY,
    booking_id VARCHAR(36) NOT NULL,
    doc_type   VARCHAR(20) NOT NULL,
    content    LONGTEXT,
    created_at VARCHAR(32) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS booking_status_histories (
    id          VARCHAR(36) PRIMARY KEY,
    booking_id  VARCHAR(36) NOT NULL,
    from_status VARCHAR(30),
    to_status   VARCHAR(30) NOT NULL,
    reason      TEXT,
    changed_by  VARCHAR(36),
    created_at  VARCHAR(32) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- PAYMENT AND POST-BOOKING GROUP
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
    id              VARCHAR(36)  PRIMARY KEY,
    booking_id      VARCHAR(36)  NOT NULL,
    amount          BIGINT       NOT NULL,
    currency        VARCHAR(3)   NOT NULL DEFAULT 'VND',
    payment_method  VARCHAR(20)  NOT NULL,
    status          VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    idempotency_key VARCHAR(100) UNIQUE,
    created_at      VARCHAR(32)  NOT NULL,
    updated_at      VARCHAR(32)  NOT NULL,
    INDEX idx_payments_booking (booking_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS payment_transactions (
    id            VARCHAR(36) PRIMARY KEY,
    payment_id    VARCHAR(36) NOT NULL,
    event_type    VARCHAR(20) NOT NULL,
    amount        BIGINT,
    metadata_json LONGTEXT,
    created_at    VARCHAR(32) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cancellations (
    id              VARCHAR(36) PRIMARY KEY,
    booking_id      VARCHAR(36) NOT NULL,
    reason          TEXT,
    cancelled_by    VARCHAR(36),
    refund_eligible TINYINT(1)  NOT NULL DEFAULT 0,
    created_at      VARCHAR(32) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS refunds (
    id         VARCHAR(36) PRIMARY KEY,
    booking_id VARCHAR(36) NOT NULL,
    payment_id VARCHAR(36),
    amount     BIGINT      NOT NULL,
    currency   VARCHAR(3)  NOT NULL DEFAULT 'VND',
    status     VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    reason     TEXT,
    created_at VARCHAR(32) NOT NULL,
    updated_at VARCHAR(32) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS booking_changes (
    id            VARCHAR(36) PRIMARY KEY,
    booking_id    VARCHAR(36) NOT NULL,
    change_type   VARCHAR(20) NOT NULL,
    old_data_json LONGTEXT,
    new_data_json LONGTEXT,
    fee           BIGINT      NOT NULL DEFAULT 0,
    status        VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at    VARCHAR(32) NOT NULL,
    updated_at    VARCHAR(32) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS insurances (
    id         VARCHAR(36) PRIMARY KEY,
    booking_id VARCHAR(36) NOT NULL,
    plan_code  VARCHAR(30) NOT NULL,
    plan_name  TEXT        NOT NULL,
    price      BIGINT      NOT NULL,
    created_at VARCHAR(32) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- SUPPORT AND ADMIN GROUP
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
    id             VARCHAR(36) PRIMARY KEY,
    user_id        VARCHAR(36) NOT NULL,
    title          TEXT        NOT NULL,
    body           TEXT        NOT NULL,
    type           VARCHAR(20) NOT NULL DEFAULT 'INFO',
    is_read        TINYINT(1)  NOT NULL DEFAULT 0,
    reference_id   VARCHAR(36),
    reference_type VARCHAR(30),
    created_at     VARCHAR(32) NOT NULL,
    INDEX idx_notif_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS travel_alert_preferences (
    id                  VARCHAR(36) PRIMARY KEY,
    user_id             VARCHAR(36) NOT NULL UNIQUE,
    delay_alerts        TINYINT(1)  NOT NULL DEFAULT 1,
    gate_changes        TINYINT(1)  NOT NULL DEFAULT 1,
    cancellation_alerts TINYINT(1)  NOT NULL DEFAULT 1,
    price_drop_alerts   TINYINT(1)  NOT NULL DEFAULT 1,
    updated_at          VARCHAR(32) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS support_tickets (
    id          VARCHAR(36) PRIMARY KEY,
    user_id     VARCHAR(36),
    booking_id  VARCHAR(36),
    subject     TEXT        NOT NULL,
    status      VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    priority    VARCHAR(20) NOT NULL DEFAULT 'NORMAL',
    assigned_to VARCHAR(36),
    created_at  VARCHAR(32) NOT NULL,
    updated_at  VARCHAR(32) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS support_messages (
    id         VARCHAR(36) PRIMARY KEY,
    ticket_id  VARCHAR(36) NOT NULL,
    sender_id  VARCHAR(36) NOT NULL,
    body       TEXT        NOT NULL,
    created_at VARCHAR(32) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS booking_notes (
    id         VARCHAR(36) PRIMARY KEY,
    booking_id VARCHAR(36) NOT NULL,
    staff_id   VARCHAR(36) NOT NULL,
    note       TEXT        NOT NULL,
    created_at VARCHAR(32) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reviews (
    id         VARCHAR(36) PRIMARY KEY,
    booking_id VARCHAR(36) NOT NULL,
    user_id    VARCHAR(36) NOT NULL,
    airline_id VARCHAR(36) NOT NULL,
    rating     INT         NOT NULL,
    title      TEXT,
    body       TEXT,
    status     VARCHAR(20) NOT NULL DEFAULT 'PUBLISHED',
    created_at VARCHAR(32) NOT NULL,
    updated_at VARCHAR(32) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS review_reports (
    id          VARCHAR(36) PRIMARY KEY,
    review_id   VARCHAR(36) NOT NULL,
    reporter_id VARCHAR(36) NOT NULL,
    reason      TEXT        NOT NULL,
    created_at  VARCHAR(32) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS coupons (
    id             VARCHAR(36) PRIMARY KEY,
    code           VARCHAR(50) UNIQUE NOT NULL,
    discount_type  VARCHAR(10) NOT NULL DEFAULT 'PERCENT',
    discount_value BIGINT      NOT NULL,
    min_amount     BIGINT,
    max_uses       INT,
    used_count     INT         NOT NULL DEFAULT 0,
    valid_from     VARCHAR(32) NOT NULL,
    valid_until    VARCHAR(32) NOT NULL,
    is_active      TINYINT(1)  NOT NULL DEFAULT 1,
    created_at     VARCHAR(32) NOT NULL,
    updated_at     VARCHAR(32) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS contents (
    id           VARCHAR(36)  PRIMARY KEY,
    slug         VARCHAR(100) UNIQUE NOT NULL,
    title        TEXT         NOT NULL,
    body         LONGTEXT     NOT NULL,
    content_type VARCHAR(20)  NOT NULL DEFAULT 'PAGE',
    is_published TINYINT(1)   NOT NULL DEFAULT 0,
    created_at   VARCHAR(32)  NOT NULL,
    updated_at   VARCHAR(32)  NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS audit_logs (
    id           VARCHAR(36)  PRIMARY KEY,
    user_id      VARCHAR(36),
    action       VARCHAR(100) NOT NULL,
    resource     VARCHAR(100) NOT NULL,
    resource_id  VARCHAR(36),
    details_json LONGTEXT,
    ip_address   VARCHAR(45),
    created_at   VARCHAR(32)  NOT NULL,
    INDEX idx_audit_resource (resource, resource_id),
    INDEX idx_audit_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
