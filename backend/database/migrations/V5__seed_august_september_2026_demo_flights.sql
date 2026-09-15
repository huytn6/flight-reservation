-- Install a stable, repeatable flight schedule for classroom demos.
--
-- Coverage: every date from 2026-08-01 through 2026-09-30, including weekends.
-- Volume:   40 flights per day, 3 fares and 172 selectable seats per flight.
--
-- Every INSERT below only fills missing records. This matters because local
-- databases may already contain rows created by database/seed.py before this
-- migration was introduced.

SET @demo_v5_now := DATE_FORMAT(UTC_TIMESTAMP(6), '%Y-%m-%dT%H:%i:%s.%f');

-- Reference data required by the schedule.
CREATE TEMPORARY TABLE demo_v5_airports (
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

INSERT INTO demo_v5_airports VALUES
    ('SGN', 'VVTS', 'Tan Son Nhat International Airport', 'Ho Chi Minh City', 'Vietnam', 'VN', 'Asia/Ho_Chi_Minh', 10.8188, 106.6519),
    ('HAN', 'VVNB', 'Noi Bai International Airport', 'Hanoi', 'Vietnam', 'VN', 'Asia/Ho_Chi_Minh', 21.2212, 105.8074),
    ('DAD', 'VVDN', 'Da Nang International Airport', 'Da Nang', 'Vietnam', 'VN', 'Asia/Ho_Chi_Minh', 16.0439, 108.1993),
    ('PQC', 'VVPQ', 'Phu Quoc International Airport', 'Phu Quoc', 'Vietnam', 'VN', 'Asia/Ho_Chi_Minh', 9.7328, 104.1699),
    ('HPH', 'VVCI', 'Cat Bi International Airport', 'Hai Phong', 'Vietnam', 'VN', 'Asia/Ho_Chi_Minh', 20.8194, 106.7249),
    ('BKK', 'VTBS', 'Suvarnabhumi Airport', 'Bangkok', 'Thailand', 'TH', 'Asia/Bangkok', 13.6811, 100.7475),
    ('SIN', 'WSSS', 'Singapore Changi Airport', 'Singapore', 'Singapore', 'SG', 'Asia/Singapore', 1.3644, 103.9915),
    ('NRT', 'RJAA', 'Narita International Airport', 'Tokyo', 'Japan', 'JP', 'Asia/Tokyo', 35.7720, 140.3929);

INSERT INTO airports (
    id, iata_code, icao_code, name, city, country, country_code, timezone,
    latitude, longitude, created_at, updated_at
)
SELECT UUID(), source.iata_code, source.icao_code, source.name, source.city,
       source.country, source.country_code, source.timezone, source.latitude,
       source.longitude, @demo_v5_now, @demo_v5_now
FROM demo_v5_airports source
LEFT JOIN airports existing ON existing.iata_code = source.iata_code
WHERE existing.id IS NULL;

CREATE TEMPORARY TABLE demo_v5_airlines (
    iata_code VARCHAR(10) PRIMARY KEY,
    icao_code VARCHAR(10),
    name VARCHAR(255),
    country VARCHAR(255)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO demo_v5_airlines VALUES
    ('VN', 'HVN', 'Vietnam Airlines', 'Vietnam'),
    ('VJ', 'VJC', 'VietJet Air', 'Vietnam'),
    ('QH', 'BAV', 'Bamboo Airways', 'Vietnam'),
    ('TG', 'THA', 'Thai Airways', 'Thailand'),
    ('SQ', 'SIA', 'Singapore Airlines', 'Singapore'),
    ('NH', 'ANA', 'All Nippon Airways', 'Japan');

INSERT INTO airlines (
    id, iata_code, icao_code, name, country, logo_url, created_at, updated_at
)
SELECT UUID(), source.iata_code, source.icao_code, source.name, source.country,
       NULL, @demo_v5_now, @demo_v5_now
FROM demo_v5_airlines source
LEFT JOIN airlines existing ON existing.iata_code = source.iata_code
WHERE existing.id IS NULL;

CREATE TEMPORARY TABLE demo_v5_aircraft (
    iata_code VARCHAR(10) PRIMARY KEY,
    name VARCHAR(255),
    manufacturer VARCHAR(255),
    seat_capacity INT
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO demo_v5_aircraft VALUES
    ('738', 'Boeing 737-800', 'Boeing', 160),
    ('321', 'Airbus A321', 'Airbus', 220),
    ('789', 'Boeing 787-9', 'Boeing', 296),
    ('77W', 'Boeing 777-300ER', 'Boeing', 396),
    ('32N', 'Airbus A320neo', 'Airbus', 150);

INSERT INTO aircraft_types (
    id, iata_code, name, manufacturer, seat_capacity, created_at, updated_at
)
SELECT UUID(), source.iata_code, source.name, source.manufacturer,
       source.seat_capacity, @demo_v5_now, @demo_v5_now
FROM demo_v5_aircraft source
LEFT JOIN aircraft_types existing ON existing.iata_code = source.iata_code
WHERE existing.id IS NULL;

CREATE TEMPORARY TABLE demo_v5_cabins (
    code VARCHAR(30) PRIMARY KEY,
    name VARCHAR(255)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO demo_v5_cabins VALUES
    ('ECONOMY', 'Economy'),
    ('PREMIUM_ECONOMY', 'Premium Economy'),
    ('BUSINESS', 'Business'),
    ('FIRST', 'First Class');

INSERT INTO cabin_classes (id, code, name, created_at, updated_at)
SELECT UUID(), source.code, source.name, @demo_v5_now, @demo_v5_now
FROM demo_v5_cabins source
LEFT JOIN cabin_classes existing ON existing.code = source.code
WHERE existing.id IS NULL;

-- Calendar dates and the 40 daily flight definitions.
CREATE TEMPORARY TABLE demo_v5_dates (
    flight_date DATE PRIMARY KEY
);

INSERT INTO demo_v5_dates (flight_date)
WITH RECURSIVE date_range AS (
    SELECT DATE('2026-08-01') AS flight_date
    UNION ALL
    SELECT DATE_ADD(flight_date, INTERVAL 1 DAY)
    FROM date_range
    WHERE flight_date < DATE('2026-09-30')
)
SELECT flight_date FROM date_range;

CREATE TEMPORARY TABLE demo_v5_flight_templates (
    flight_number VARCHAR(10) PRIMARY KEY,
    airline_iata VARCHAR(10),
    aircraft_iata VARCHAR(10),
    departure_iata VARCHAR(10),
    arrival_iata VARCHAR(10),
    departure_hour INT,
    departure_minute INT,
    duration_minutes INT
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO demo_v5_flight_templates VALUES
    ('VN100', 'VN', '321', 'SGN', 'HAN', 6, 0, 130),
    ('VN101', 'VN', '321', 'HAN', 'SGN', 9, 0, 130),
    ('QH100', 'QH', '738', 'SGN', 'HAN', 10, 0, 130),
    ('QH101', 'QH', '738', 'HAN', 'SGN', 13, 0, 130),
    ('VN200', 'VN', '789', 'SGN', 'HAN', 14, 0, 130),
    ('VN201', 'VN', '789', 'HAN', 'SGN', 17, 30, 130),
    ('VJ100', 'VJ', '321', 'SGN', 'HAN', 19, 0, 130),
    ('VJ101', 'VJ', '321', 'HAN', 'SGN', 21, 0, 130),
    ('VJ300', 'VJ', '321', 'SGN', 'DAD', 7, 0, 75),
    ('VJ301', 'VJ', '321', 'DAD', 'SGN', 10, 30, 75),
    ('VJ302', 'VJ', '32N', 'SGN', 'DAD', 13, 0, 75),
    ('VJ303', 'VJ', '32N', 'DAD', 'SGN', 16, 0, 75),
    ('VJ400', 'VJ', '32N', 'HAN', 'DAD', 8, 0, 75),
    ('VJ401', 'VJ', '32N', 'DAD', 'HAN', 11, 30, 75),
    ('VN120', 'VN', '738', 'HAN', 'DAD', 14, 0, 85),
    ('VN121', 'VN', '738', 'DAD', 'HAN', 17, 0, 85),
    ('QH500', 'QH', '738', 'SGN', 'PQC', 9, 0, 60),
    ('QH501', 'QH', '738', 'PQC', 'SGN', 11, 30, 60),
    ('QH540', 'QH', '321', 'SGN', 'PQC', 15, 0, 60),
    ('QH541', 'QH', '321', 'PQC', 'SGN', 17, 0, 60),
    ('VN600', 'VN', '789', 'SGN', 'BKK', 7, 30, 90),
    ('VN601', 'VN', '789', 'BKK', 'SGN', 10, 30, 90),
    ('TG910', 'TG', '77W', 'SGN', 'BKK', 13, 0, 90),
    ('TG911', 'TG', '77W', 'BKK', 'SGN', 16, 0, 90),
    ('SQ700', 'SQ', '789', 'SGN', 'SIN', 10, 0, 115),
    ('SQ701', 'SQ', '789', 'SIN', 'SGN', 14, 0, 115),
    ('NH800', 'NH', '77W', 'SGN', 'NRT', 0, 30, 360),
    ('NH801', 'NH', '77W', 'NRT', 'SGN', 11, 0, 360),
    ('VN110', 'VN', '738', 'HAN', 'DAD', 6, 30, 85),
    ('VN111', 'VN', '738', 'DAD', 'HAN', 9, 30, 85),
    ('QH520', 'QH', '321', 'HAN', 'PQC', 8, 0, 140),
    ('QH521', 'QH', '321', 'PQC', 'HAN', 11, 30, 140),
    ('VJ320', 'VJ', '32N', 'SGN', 'HPH', 6, 45, 115),
    ('VJ321', 'VJ', '32N', 'HPH', 'SGN', 10, 0, 115),
    ('QH530', 'QH', '738', 'DAD', 'PQC', 13, 0, 90),
    ('QH531', 'QH', '738', 'PQC', 'DAD', 15, 30, 90),
    ('TG900', 'TG', '77W', 'HAN', 'BKK', 9, 0, 120),
    ('TG901', 'TG', '77W', 'BKK', 'HAN', 12, 0, 120),
    ('VN610', 'VN', '789', 'HAN', 'SIN', 8, 0, 220),
    ('VN611', 'VN', '789', 'SIN', 'HAN', 12, 30, 220);

INSERT INTO flights (
    id, flight_number, airline_id, aircraft_type_id, departure_airport_id,
    arrival_airport_id, departure_time, arrival_time, duration_minutes,
    status, created_at, updated_at
)
SELECT UUID(), template.flight_number, airline.id, aircraft.id,
       departure_airport.id, arrival_airport.id,
       DATE_FORMAT(
           TIMESTAMP(date_list.flight_date, MAKETIME(template.departure_hour, template.departure_minute, 0)),
           '%Y-%m-%dT%H:%i:%s'
       ),
       DATE_FORMAT(
           DATE_ADD(
               TIMESTAMP(date_list.flight_date, MAKETIME(template.departure_hour, template.departure_minute, 0)),
               INTERVAL template.duration_minutes MINUTE
           ),
           '%Y-%m-%dT%H:%i:%s'
       ),
       template.duration_minutes, 'SCHEDULED', @demo_v5_now, @demo_v5_now
FROM demo_v5_dates date_list
CROSS JOIN demo_v5_flight_templates template
JOIN airlines airline ON airline.iata_code = template.airline_iata
JOIN aircraft_types aircraft ON aircraft.iata_code = template.aircraft_iata
JOIN airports departure_airport ON departure_airport.iata_code = template.departure_iata
JOIN airports arrival_airport ON arrival_airport.iata_code = template.arrival_iata
LEFT JOIN flights existing
  ON existing.flight_number = template.flight_number
 AND existing.departure_time = DATE_FORMAT(
     TIMESTAMP(date_list.flight_date, MAKETIME(template.departure_hour, template.departure_minute, 0)),
     '%Y-%m-%dT%H:%i:%s'
 )
WHERE existing.id IS NULL;

-- Fare products and inventory for every migrated flight.
CREATE TEMPORARY TABLE demo_v5_fare_templates (
    fare_code VARCHAR(20) PRIMARY KEY,
    fare_name VARCHAR(255),
    cabin_code VARCHAR(30),
    base_price BIGINT,
    baggage_kg INT,
    is_refundable TINYINT,
    is_changeable TINYINT,
    change_fee BIGINT,
    cancel_fee BIGINT,
    total_seats INT,
    available_seats INT
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO demo_v5_fare_templates VALUES
    ('ECO_LITE', 'Economy Lite', 'ECONOMY', 1200000, 0, 0, 0, 0, 0, 80, 75),
    ('ECO_FLEX', 'Economy Flex', 'ECONOMY', 1800000, 20, 1, 1, 300000, 150000, 80, 80),
    ('BUS_FULL', 'Business Full', 'BUSINESS', 4500000, 30, 1, 1, 0, 0, 20, 20);

INSERT INTO fares (
    id, flight_id, cabin_class_id, fare_code, fare_name, base_price, tax,
    fees, currency, baggage_kg, is_refundable, is_changeable, change_fee,
    cancel_fee, created_at, updated_at
)
SELECT UUID(), flight.id, cabin.id, fare_template.fare_code,
       fare_template.fare_name, fare_template.base_price,
       FLOOR(fare_template.base_price * 0.1), 50000, 'VND',
       fare_template.baggage_kg, fare_template.is_refundable,
       fare_template.is_changeable, fare_template.change_fee,
       fare_template.cancel_fee, @demo_v5_now, @demo_v5_now
FROM demo_v5_dates date_list
CROSS JOIN demo_v5_flight_templates flight_template
CROSS JOIN demo_v5_fare_templates fare_template
JOIN flights flight
  ON flight.flight_number = flight_template.flight_number
 AND flight.departure_time = DATE_FORMAT(
     TIMESTAMP(date_list.flight_date, MAKETIME(flight_template.departure_hour, flight_template.departure_minute, 0)),
     '%Y-%m-%dT%H:%i:%s'
 )
JOIN cabin_classes cabin ON cabin.code = fare_template.cabin_code
LEFT JOIN fares existing
  ON existing.flight_id = flight.id
 AND existing.fare_code = fare_template.fare_code
WHERE existing.id IS NULL;

INSERT INTO fare_inventories (
    id, fare_id, total_seats, available_seats, updated_at
)
SELECT UUID(), fare.id, fare_template.total_seats,
       fare_template.available_seats, @demo_v5_now
FROM demo_v5_dates date_list
CROSS JOIN demo_v5_flight_templates flight_template
CROSS JOIN demo_v5_fare_templates fare_template
JOIN flights flight
  ON flight.flight_number = flight_template.flight_number
 AND flight.departure_time = DATE_FORMAT(
     TIMESTAMP(date_list.flight_date, MAKETIME(flight_template.departure_hour, flight_template.departure_minute, 0)),
     '%Y-%m-%dT%H:%i:%s'
 )
JOIN fares fare
  ON fare.flight_id = flight.id
 AND fare.fare_code = fare_template.fare_code
LEFT JOIN fare_inventories existing ON existing.fare_id = fare.id
WHERE existing.id IS NULL;

-- Seat positions shared by every flight: 16 business + 156 economy seats.
CREATE TEMPORARY TABLE demo_v5_columns (
    column_label VARCHAR(5) PRIMARY KEY
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO demo_v5_columns VALUES ('A'), ('B'), ('C'), ('D'), ('E'), ('F');

CREATE TEMPORARY TABLE demo_v5_seat_positions (
    seat_number VARCHAR(10) PRIMARY KEY,
    cabin_code VARCHAR(30),
    seat_row INT,
    column_label VARCHAR(5),
    seat_type VARCHAR(20),
    extra_fee BIGINT
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO demo_v5_seat_positions (
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
CROSS JOIN demo_v5_columns seat_columns
WHERE seat_rows.seat_row > 4
   OR seat_columns.column_label IN ('A', 'C', 'D', 'F');

INSERT INTO seats (
    id, flight_id, seat_number, cabin_class_id, seat_row, column_label,
    seat_type, status, extra_fee, created_at, updated_at
)
SELECT UUID(), flight.id, position.seat_number, cabin.id,
       position.seat_row, position.column_label, position.seat_type,
       'AVAILABLE', position.extra_fee, @demo_v5_now, @demo_v5_now
FROM demo_v5_dates date_list
CROSS JOIN demo_v5_flight_templates flight_template
CROSS JOIN demo_v5_seat_positions position
JOIN flights flight
  ON flight.flight_number = flight_template.flight_number
 AND flight.departure_time = DATE_FORMAT(
     TIMESTAMP(date_list.flight_date, MAKETIME(flight_template.departure_hour, flight_template.departure_minute, 0)),
     '%Y-%m-%dT%H:%i:%s'
 )
JOIN cabin_classes cabin ON cabin.code = position.cabin_code
LEFT JOIN seats existing
  ON existing.flight_id = flight.id
 AND existing.seat_number = position.seat_number
WHERE existing.id IS NULL;

INSERT INTO seat_maps (id, flight_id, layout_json, created_at, updated_at)
SELECT UUID(), flight.id,
       '{"business":{"rows":[1,4],"columns":["A","C","D","F"]},"economy":{"rows":[5,30],"columns":["A","B","C","D","E","F"]}}',
       @demo_v5_now, @demo_v5_now
FROM demo_v5_dates date_list
CROSS JOIN demo_v5_flight_templates flight_template
JOIN flights flight
  ON flight.flight_number = flight_template.flight_number
 AND flight.departure_time = DATE_FORMAT(
     TIMESTAMP(date_list.flight_date, MAKETIME(flight_template.departure_hour, flight_template.departure_minute, 0)),
     '%Y-%m-%dT%H:%i:%s'
 )
LEFT JOIN seat_maps existing ON existing.flight_id = flight.id
WHERE existing.id IS NULL;

DROP TEMPORARY TABLE demo_v5_seat_positions;
DROP TEMPORARY TABLE demo_v5_columns;
DROP TEMPORARY TABLE demo_v5_fare_templates;
DROP TEMPORARY TABLE demo_v5_flight_templates;
DROP TEMPORARY TABLE demo_v5_dates;
DROP TEMPORARY TABLE demo_v5_cabins;
DROP TEMPORARY TABLE demo_v5_aircraft;
DROP TEMPORARY TABLE demo_v5_airlines;
DROP TEMPORARY TABLE demo_v5_airports;
