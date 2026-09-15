-- Expand the August/September 2026 demo into a denser, Vietnam-style schedule.
--
-- This is synthetic demo data, not a published airline timetable. Carrier mix,
-- route density and departure waves are shaped to resemble Vietnam's domestic
-- market: high frequency on the SGN-HAN-DAD trunk and regular services to major
-- tourism and regional airports.
--
-- V5 contributes 40 flights/day. V6 adds 120 flights/day, bringing the demo to
-- 160 flights/day (9,760 flights across all 61 dates).

SET @demo_v6_now := DATE_FORMAT(UTC_TIMESTAMP(6), '%Y-%m-%dT%H:%i:%s.%f');

-- Additional Vietnamese airports used by the denser route network.
CREATE TEMPORARY TABLE demo_v6_airports (
    iata_code VARCHAR(10) PRIMARY KEY,
    icao_code VARCHAR(10),
    name VARCHAR(255),
    city VARCHAR(255),
    country VARCHAR(255),
    country_code VARCHAR(3),
    timezone VARCHAR(50),
    latitude DOUBLE,
    longitude DOUBLE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO demo_v6_airports VALUES
    ('CXR', 'VVCR', 'Cam Ranh International Airport', 'Nha Trang', 'Vietnam', 'VN', 'Asia/Ho_Chi_Minh', 11.9982, 109.2194),
    ('DLI', 'VVDL', 'Lien Khuong International Airport', 'Da Lat', 'Vietnam', 'VN', 'Asia/Ho_Chi_Minh', 11.7500, 108.3736),
    ('VCA', 'VVCT', 'Can Tho International Airport', 'Can Tho', 'Vietnam', 'VN', 'Asia/Ho_Chi_Minh', 10.0851, 105.7119),
    ('HUI', 'VVPB', 'Phu Bai International Airport', 'Hue', 'Vietnam', 'VN', 'Asia/Ho_Chi_Minh', 16.4015, 107.7026),
    ('UIH', 'VVPC', 'Phu Cat Airport', 'Quy Nhon', 'Vietnam', 'VN', 'Asia/Ho_Chi_Minh', 13.9550, 109.0420),
    ('BMV', 'VVBM', 'Buon Ma Thuot Airport', 'Buon Ma Thuot', 'Vietnam', 'VN', 'Asia/Ho_Chi_Minh', 12.6683, 108.1200),
    ('VII', 'VVVH', 'Vinh International Airport', 'Vinh', 'Vietnam', 'VN', 'Asia/Ho_Chi_Minh', 18.7376, 105.6708);

INSERT INTO airports (
    id, iata_code, icao_code, name, city, country, country_code, timezone,
    latitude, longitude, created_at, updated_at
)
SELECT UUID(), source.iata_code, source.icao_code, source.name, source.city,
       source.country, source.country_code, source.timezone, source.latitude,
       source.longitude, @demo_v6_now, @demo_v6_now
FROM demo_v6_airports source
LEFT JOIN airports existing ON existing.iata_code = source.iata_code
WHERE existing.id IS NULL;

-- Additional active Vietnamese passenger airlines represented in the demo.
CREATE TEMPORARY TABLE demo_v6_airlines (
    iata_code VARCHAR(10) PRIMARY KEY,
    icao_code VARCHAR(10),
    name VARCHAR(255),
    country VARCHAR(255)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO demo_v6_airlines VALUES
    ('BL', 'PIC', 'Pacific Airlines', 'Vietnam'),
    ('VU', 'VAG', 'Vietravel Airlines', 'Vietnam'),
    ('9G', 'SPA', 'Sun PhuQuoc Airways', 'Vietnam');

INSERT INTO airlines (
    id, iata_code, icao_code, name, country, logo_url, created_at, updated_at
)
SELECT UUID(), source.iata_code, source.icao_code, source.name, source.country,
       NULL, @demo_v6_now, @demo_v6_now
FROM demo_v6_airlines source
LEFT JOIN airlines existing ON existing.iata_code = source.iata_code
WHERE existing.id IS NULL;

INSERT INTO aircraft_types (
    id, iata_code, name, manufacturer, seat_capacity, created_at, updated_at
)
SELECT UUID(), '320', 'Airbus A320', 'Airbus', 180, @demo_v6_now, @demo_v6_now
WHERE NOT EXISTS (SELECT 1 FROM aircraft_types WHERE iata_code = '320');

CREATE TEMPORARY TABLE demo_v6_dates (
    flight_date DATE PRIMARY KEY
);

INSERT INTO demo_v6_dates (flight_date)
WITH RECURSIVE date_range AS (
    SELECT DATE('2026-08-01') AS flight_date
    UNION ALL
    SELECT DATE_ADD(flight_date, INTERVAL 1 DAY)
    FROM date_range
    WHERE flight_date < DATE('2026-09-30')
)
SELECT flight_date FROM date_range;

CREATE TEMPORARY TABLE demo_v6_slots (
    slot_no INT PRIMARY KEY
);

INSERT INTO demo_v6_slots VALUES (0), (1), (2), (3);

-- One profile may expand into multiple daily flights. first_departure_minute and
-- spacing_minutes are minutes after midnight.
CREATE TEMPORARY TABLE demo_v6_profiles (
    airline_iata VARCHAR(10),
    aircraft_iata VARCHAR(10),
    departure_iata VARCHAR(10),
    arrival_iata VARCHAR(10),
    flight_number_base INT,
    daily_frequency INT,
    first_departure_minute INT,
    spacing_minutes INT,
    duration_minutes INT,
    route_base_price BIGINT,
    PRIMARY KEY (airline_iata, flight_number_base)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO demo_v6_profiles VALUES
    ('VN', '321', 'SGN', 'HAN', 1200, 4, 300, 240, 130, 1450000),
    ('VN', '321', 'HAN', 'SGN', 1210, 4, 360, 240, 130, 1450000),
    ('VJ', '32N', 'SGN', 'HAN', 1500, 4, 390, 240, 130, 1250000),
    ('VJ', '32N', 'HAN', 'SGN', 1510, 4, 450, 240, 130, 1250000),
    ('BL', '320', 'SGN', 'HAN', 600, 2, 480, 480, 130, 1320000),
    ('BL', '320', 'HAN', 'SGN', 610, 2, 540, 480, 130, 1320000),
    ('VU', '321', 'SGN', 'HAN', 300, 1, 750, 0, 130, 1280000),
    ('VU', '321', 'HAN', 'SGN', 310, 1, 825, 0, 130, 1280000),

    ('VN', '321', 'SGN', 'DAD', 1300, 3, 360, 300, 75, 1050000),
    ('VN', '321', 'DAD', 'SGN', 1310, 3, 480, 300, 75, 1050000),
    ('VJ', '32N', 'SGN', 'DAD', 1600, 3, 450, 300, 75, 850000),
    ('VJ', '32N', 'DAD', 'SGN', 1610, 3, 570, 300, 75, 850000),
    ('BL', '320', 'SGN', 'DAD', 700, 1, 840, 0, 75, 920000),
    ('BL', '320', 'DAD', 'SGN', 710, 1, 960, 0, 75, 920000),
    ('VU', '321', 'SGN', 'DAD', 400, 1, 1110, 0, 75, 880000),
    ('VU', '321', 'DAD', 'SGN', 410, 1, 1230, 0, 75, 880000),

    ('VN', '321', 'HAN', 'DAD', 1400, 2, 420, 480, 85, 1080000),
    ('VN', '321', 'DAD', 'HAN', 1410, 2, 540, 480, 85, 1080000),
    ('VJ', '32N', 'HAN', 'DAD', 1700, 2, 600, 480, 85, 900000),
    ('VJ', '32N', 'DAD', 'HAN', 1710, 2, 720, 480, 85, 900000),
    ('BL', '320', 'HAN', 'DAD', 800, 1, 780, 0, 85, 950000),
    ('BL', '320', 'DAD', 'HAN', 810, 1, 900, 0, 85, 950000),

    ('VN', '321', 'SGN', 'CXR', 1500, 2, 390, 480, 65, 980000),
    ('VN', '321', 'CXR', 'SGN', 1510, 2, 510, 480, 65, 980000),
    ('VJ', '32N', 'SGN', 'CXR', 1800, 2, 570, 480, 65, 780000),
    ('VJ', '32N', 'CXR', 'SGN', 1810, 2, 690, 480, 65, 780000),
    ('BL', '320', 'SGN', 'CXR', 900, 1, 750, 0, 65, 840000),
    ('BL', '320', 'CXR', 'SGN', 910, 1, 870, 0, 65, 840000),
    ('VN', '321', 'HAN', 'CXR', 1600, 2, 420, 480, 115, 1380000),
    ('VN', '321', 'CXR', 'HAN', 1610, 2, 570, 480, 115, 1380000),
    ('VJ', '32N', 'HAN', 'CXR', 1900, 1, 660, 0, 115, 1180000),
    ('VJ', '32N', 'CXR', 'HAN', 1910, 1, 840, 0, 115, 1180000),

    ('VN', '321', 'SGN', 'DLI', 1700, 1, 480, 0, 50, 880000),
    ('VN', '321', 'DLI', 'SGN', 1710, 1, 570, 0, 50, 880000),
    ('VJ', '32N', 'SGN', 'DLI', 2000, 2, 720, 420, 50, 700000),
    ('VJ', '32N', 'DLI', 'SGN', 2010, 2, 810, 420, 50, 700000),
    ('VN', '321', 'HAN', 'DLI', 1800, 1, 420, 0, 110, 1250000),
    ('VN', '321', 'DLI', 'HAN', 1810, 1, 570, 0, 110, 1250000),
    ('VJ', '32N', 'HAN', 'DLI', 2100, 1, 900, 0, 110, 1050000),
    ('VJ', '32N', 'DLI', 'HAN', 2110, 1, 1050, 0, 110, 1050000),

    ('VN', '321', 'SGN', 'VCA', 1900, 2, 450, 360, 45, 820000),
    ('VN', '321', 'VCA', 'SGN', 1910, 2, 540, 360, 45, 820000),
    ('VJ', '32N', 'SGN', 'VCA', 2200, 1, 1020, 0, 45, 650000),
    ('VJ', '32N', 'VCA', 'SGN', 2210, 1, 1110, 0, 45, 650000),
    ('VN', '321', 'HAN', 'VCA', 2300, 1, 420, 0, 125, 1350000),
    ('VN', '321', 'VCA', 'HAN', 2310, 1, 600, 0, 125, 1350000),
    ('VJ', '32N', 'HAN', 'VCA', 2700, 1, 840, 0, 125, 1150000),
    ('VJ', '32N', 'VCA', 'HAN', 2710, 1, 1020, 0, 125, 1150000),

    ('VN', '321', 'HAN', 'PQC', 2000, 2, 360, 540, 130, 1480000),
    ('VN', '321', 'PQC', 'HAN', 2010, 2, 540, 540, 130, 1480000),
    ('VJ', '32N', 'HAN', 'PQC', 2300, 1, 660, 0, 130, 1250000),
    ('VJ', '32N', 'PQC', 'HAN', 2310, 1, 840, 0, 130, 1250000),
    ('9G', '321', 'HAN', 'PQC', 100, 1, 780, 0, 130, 1420000),
    ('9G', '321', 'PQC', 'HAN', 110, 1, 960, 0, 130, 1420000),
    ('VJ', '32N', 'DAD', 'PQC', 2400, 1, 540, 0, 90, 920000),
    ('VJ', '32N', 'PQC', 'DAD', 2410, 1, 660, 0, 90, 920000),
    ('9G', '321', 'DAD', 'PQC', 200, 1, 780, 0, 90, 1080000),
    ('9G', '321', 'PQC', 'DAD', 210, 1, 900, 0, 90, 1080000),
    ('9G', '321', 'HPH', 'PQC', 300, 1, 600, 0, 125, 1380000),
    ('9G', '321', 'PQC', 'HPH', 310, 1, 775, 0, 125, 1380000),

    ('VN', '321', 'SGN', 'HPH', 2100, 1, 390, 0, 120, 1280000),
    ('VN', '321', 'HPH', 'SGN', 2110, 1, 930, 0, 120, 1280000),
    ('VJ', '32N', 'SGN', 'HPH', 2500, 1, 720, 0, 120, 1080000),
    ('VJ', '32N', 'HPH', 'SGN', 2510, 1, 840, 0, 120, 1080000),
    ('9G', '321', 'SGN', 'HPH', 400, 1, 425, 0, 125, 1200000),
    ('9G', '321', 'HPH', 'SGN', 410, 1, 950, 0, 130, 1200000),

    ('VN', '321', 'SGN', 'HUI', 2200, 1, 420, 0, 85, 950000),
    ('VN', '321', 'HUI', 'SGN', 2210, 1, 540, 0, 85, 950000),
    ('VJ', '32N', 'SGN', 'HUI', 2600, 1, 900, 0, 85, 780000),
    ('VJ', '32N', 'HUI', 'SGN', 2610, 1, 1020, 0, 85, 780000),
    ('VN', '321', 'SGN', 'UIH', 2400, 1, 480, 0, 70, 880000),
    ('VN', '321', 'UIH', 'SGN', 2410, 1, 600, 0, 70, 880000),
    ('VJ', '32N', 'SGN', 'UIH', 2800, 1, 900, 0, 70, 720000),
    ('VJ', '32N', 'UIH', 'SGN', 2810, 1, 1020, 0, 70, 720000),
    ('VN', '321', 'SGN', 'BMV', 2500, 1, 420, 0, 60, 820000),
    ('VN', '321', 'BMV', 'SGN', 2510, 1, 540, 0, 60, 820000),
    ('VJ', '32N', 'SGN', 'BMV', 2900, 1, 840, 0, 60, 680000),
    ('VJ', '32N', 'BMV', 'SGN', 2910, 1, 960, 0, 60, 680000),
    ('VN', '321', 'SGN', 'VII', 2600, 1, 360, 0, 110, 1180000),
    ('VN', '321', 'VII', 'SGN', 2610, 1, 510, 0, 110, 1180000),
    ('VJ', '32N', 'SGN', 'VII', 3000, 1, 780, 0, 110, 980000),
    ('VJ', '32N', 'VII', 'SGN', 3010, 1, 930, 0, 110, 980000);

CREATE TEMPORARY TABLE demo_v6_instances (
    flight_date DATE,
    slot_no INT,
    flight_number VARCHAR(10),
    airline_iata VARCHAR(10),
    aircraft_iata VARCHAR(10),
    departure_iata VARCHAR(10),
    arrival_iata VARCHAR(10),
    departure_time VARCHAR(32),
    arrival_time VARCHAR(32),
    duration_minutes INT,
    route_base_price BIGINT,
    PRIMARY KEY (flight_date, flight_number)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO demo_v6_instances
SELECT date_list.flight_date,
       slot.slot_no,
       CONCAT(profile.airline_iata, profile.flight_number_base + slot.slot_no),
       profile.airline_iata,
       profile.aircraft_iata,
       profile.departure_iata,
       profile.arrival_iata,
       DATE_FORMAT(
           TIMESTAMPADD(
               MINUTE,
               profile.first_departure_minute + slot.slot_no * profile.spacing_minutes,
               TIMESTAMP(date_list.flight_date, '00:00:00')
           ),
           '%Y-%m-%dT%H:%i:%s'
       ),
       DATE_FORMAT(
           TIMESTAMPADD(
               MINUTE,
               profile.duration_minutes,
               TIMESTAMPADD(
                   MINUTE,
                   profile.first_departure_minute + slot.slot_no * profile.spacing_minutes,
                   TIMESTAMP(date_list.flight_date, '00:00:00')
               )
           ),
           '%Y-%m-%dT%H:%i:%s'
       ),
       profile.duration_minutes,
       profile.route_base_price
FROM demo_v6_dates date_list
CROSS JOIN demo_v6_profiles profile
JOIN demo_v6_slots slot ON slot.slot_no < profile.daily_frequency;

INSERT INTO flights (
    id, flight_number, airline_id, aircraft_type_id, departure_airport_id,
    arrival_airport_id, departure_time, arrival_time, duration_minutes,
    status, created_at, updated_at
)
SELECT UUID(), instance.flight_number, airline.id, aircraft.id,
       departure_airport.id, arrival_airport.id, instance.departure_time,
       instance.arrival_time, instance.duration_minutes,
       IF(instance.departure_time < @demo_v6_now, 'ARRIVED', 'SCHEDULED'),
       @demo_v6_now, @demo_v6_now
FROM demo_v6_instances instance
JOIN airlines airline ON airline.iata_code = instance.airline_iata
JOIN aircraft_types aircraft ON aircraft.iata_code = instance.aircraft_iata
JOIN airports departure_airport ON departure_airport.iata_code = instance.departure_iata
JOIN airports arrival_airport ON arrival_airport.iata_code = instance.arrival_iata
LEFT JOIN flights existing
  ON existing.flight_number = instance.flight_number
 AND existing.departure_time = instance.departure_time
WHERE existing.id IS NULL;

-- Three products per flight with deterministic price and inventory variation.
CREATE TEMPORARY TABLE demo_v6_fare_products (
    fare_code VARCHAR(20) PRIMARY KEY,
    fare_name VARCHAR(255),
    cabin_code VARCHAR(30),
    price_multiplier DECIMAL(5,2),
    price_addition BIGINT,
    baggage_kg INT,
    is_refundable TINYINT,
    is_changeable TINYINT,
    change_fee BIGINT,
    cancel_fee BIGINT,
    total_seats INT,
    base_sold INT,
    sold_spread INT
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO demo_v6_fare_products VALUES
    ('ECO_LITE', 'Economy Lite', 'ECONOMY', 1.00, 0, 0, 0, 0, 0, 0, 80, 8, 28),
    ('ECO_FLEX', 'Economy Flex', 'ECONOMY', 1.18, 220000, 20, 1, 1, 300000, 150000, 80, 4, 18),
    ('BUS_FULL', 'Business Full', 'BUSINESS', 2.30, 600000, 30, 1, 1, 0, 0, 20, 1, 8);

INSERT INTO fares (
    id, flight_id, cabin_class_id, fare_code, fare_name, base_price, tax,
    fees, currency, baggage_kg, is_refundable, is_changeable, change_fee,
    cancel_fee, created_at, updated_at
)
SELECT UUID(), flight.id, cabin.id, product.fare_code, product.fare_name,
       ROUND(
           (instance.route_base_price
             + MOD(DAYOFYEAR(instance.flight_date) + instance.slot_no * 3, 5) * 50000)
           * product.price_multiplier + product.price_addition
       ),
       FLOOR(
           ROUND(
               (instance.route_base_price
                 + MOD(DAYOFYEAR(instance.flight_date) + instance.slot_no * 3, 5) * 50000)
               * product.price_multiplier + product.price_addition
           ) * 0.1
       ),
       50000, 'VND', product.baggage_kg, product.is_refundable,
       product.is_changeable, product.change_fee, product.cancel_fee,
       @demo_v6_now, @demo_v6_now
FROM demo_v6_instances instance
CROSS JOIN demo_v6_fare_products product
JOIN flights flight
  ON flight.flight_number = instance.flight_number
 AND flight.departure_time = instance.departure_time
JOIN cabin_classes cabin ON cabin.code = product.cabin_code
LEFT JOIN fares existing
  ON existing.flight_id = flight.id
 AND existing.fare_code = product.fare_code
WHERE existing.id IS NULL;

INSERT INTO fare_inventories (
    id, fare_id, total_seats, available_seats, updated_at
)
SELECT UUID(), fare.id, product.total_seats,
       GREATEST(
           6,
           product.total_seats - product.base_sold
             - MOD(DAYOFYEAR(instance.flight_date) + instance.slot_no * 7, product.sold_spread)
       ),
       @demo_v6_now
FROM demo_v6_instances instance
CROSS JOIN demo_v6_fare_products product
JOIN flights flight
  ON flight.flight_number = instance.flight_number
 AND flight.departure_time = instance.departure_time
JOIN fares fare
  ON fare.flight_id = flight.id
 AND fare.fare_code = product.fare_code
LEFT JOIN fare_inventories existing ON existing.fare_id = fare.id
WHERE existing.id IS NULL;

CREATE TEMPORARY TABLE demo_v6_columns (
    column_label VARCHAR(5) PRIMARY KEY
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO demo_v6_columns VALUES ('A'), ('B'), ('C'), ('D'), ('E'), ('F');

CREATE TEMPORARY TABLE demo_v6_seat_positions (
    seat_number VARCHAR(10) PRIMARY KEY,
    cabin_code VARCHAR(30),
    seat_row INT,
    column_label VARCHAR(5),
    seat_type VARCHAR(20),
    extra_fee BIGINT
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO demo_v6_seat_positions (
    seat_number, cabin_code, seat_row, column_label, seat_type, extra_fee
)
WITH RECURSIVE seat_rows AS (
    SELECT 1 AS seat_row
    UNION ALL
    SELECT seat_row + 1 FROM seat_rows WHERE seat_row < 30
)
SELECT CONCAT(seat_rows.seat_row, seat_columns.column_label),
       IF(seat_rows.seat_row <= 4, 'BUSINESS', 'ECONOMY'),
       seat_rows.seat_row,
       seat_columns.column_label,
       CASE
           WHEN seat_rows.seat_row IN (15, 16) THEN 'EXIT'
           WHEN seat_columns.column_label IN ('A', 'F') THEN 'WINDOW'
           WHEN seat_columns.column_label IN ('C', 'D') THEN 'AISLE'
           ELSE 'STANDARD'
       END,
       CASE
           WHEN seat_rows.seat_row IN (15, 16)
             OR seat_columns.column_label IN ('A', 'F') THEN 100000
           ELSE 0
       END
FROM seat_rows
CROSS JOIN demo_v6_columns seat_columns
WHERE seat_rows.seat_row > 4
   OR seat_columns.column_label IN ('A', 'C', 'D', 'F');

INSERT INTO seats (
    id, flight_id, seat_number, cabin_class_id, seat_row, column_label,
    seat_type, status, extra_fee, created_at, updated_at
)
SELECT UUID(), flight.id, position.seat_number, cabin.id,
       position.seat_row, position.column_label, position.seat_type,
       'AVAILABLE', position.extra_fee, @demo_v6_now, @demo_v6_now
FROM demo_v6_instances instance
CROSS JOIN demo_v6_seat_positions position
JOIN flights flight
  ON flight.flight_number = instance.flight_number
 AND flight.departure_time = instance.departure_time
JOIN cabin_classes cabin ON cabin.code = position.cabin_code
LEFT JOIN seats existing
  ON existing.flight_id = flight.id
 AND existing.seat_number = position.seat_number
WHERE existing.id IS NULL;

INSERT INTO seat_maps (id, flight_id, layout_json, created_at, updated_at)
SELECT UUID(), flight.id,
       '{"business":{"rows":[1,4],"columns":["A","C","D","F"]},"economy":{"rows":[5,30],"columns":["A","B","C","D","E","F"]}}',
       @demo_v6_now, @demo_v6_now
FROM demo_v6_instances instance
JOIN flights flight
  ON flight.flight_number = instance.flight_number
 AND flight.departure_time = instance.departure_time
LEFT JOIN seat_maps existing ON existing.flight_id = flight.id
WHERE existing.id IS NULL;

DROP TEMPORARY TABLE demo_v6_seat_positions;
DROP TEMPORARY TABLE demo_v6_columns;
DROP TEMPORARY TABLE demo_v6_fare_products;
DROP TEMPORARY TABLE demo_v6_instances;
DROP TEMPORARY TABLE demo_v6_profiles;
DROP TEMPORARY TABLE demo_v6_slots;
DROP TEMPORARY TABLE demo_v6_dates;
DROP TEMPORARY TABLE demo_v6_airlines;
DROP TEMPORARY TABLE demo_v6_airports;
