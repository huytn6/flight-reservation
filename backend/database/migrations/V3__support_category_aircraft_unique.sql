-- support_repo.py has always written a `category` value for every ticket and a
-- `sender_role` value for every message, but neither column ever existed on these
-- tables — every ticket creation and every reply crashed with "Unknown column".
ALTER TABLE support_tickets ADD COLUMN category VARCHAR(30) NOT NULL DEFAULT 'GENERAL' AFTER subject;
ALTER TABLE support_messages ADD COLUMN sender_role VARCHAR(10) NOT NULL DEFAULT 'CUSTOMER' AFTER sender_id;

-- aircraft_types.iata_code had no uniqueness constraint, unlike airports/airlines in
-- the same family of reference tables, so duplicate aircraft codes could be created.
ALTER TABLE aircraft_types ADD UNIQUE KEY uq_aircraft_types_iata_code (iata_code);
