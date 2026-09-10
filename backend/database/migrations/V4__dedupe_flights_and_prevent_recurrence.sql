-- Re-running database/seed.py more than once (before any guard existed) inserted the
-- same route/time/flight-number combination twice with different ids, so searches
-- show the same flight two or three times. Remove the extra copies — but only the
-- ones nobody has actually booked, held a seat on, or saved — then add a uniqueness
-- guard so this can never happen again, from seed.py or the admin "create flight" API.

CREATE TEMPORARY TABLE flights_to_remove AS
SELECT f.id
FROM flights f
JOIN (
    SELECT flight_number, departure_time, MIN(id) AS keep_id
    FROM flights
    GROUP BY flight_number, departure_time
    HAVING COUNT(*) > 1
) dup ON dup.flight_number = f.flight_number
     AND dup.departure_time = f.departure_time
     AND f.id <> dup.keep_id
WHERE NOT EXISTS (SELECT 1 FROM booking_segments bs WHERE bs.flight_id = f.id)
  AND NOT EXISTS (SELECT 1 FROM saved_flights sv WHERE sv.flight_id = f.id)
  AND NOT EXISTS (SELECT 1 FROM seats s WHERE s.flight_id = f.id AND s.status <> 'AVAILABLE');

DELETE FROM fares WHERE flight_id IN (SELECT id FROM flights_to_remove);
DELETE FROM seats WHERE flight_id IN (SELECT id FROM flights_to_remove);
DELETE FROM seat_maps WHERE flight_id IN (SELECT id FROM flights_to_remove);
DELETE FROM flight_segments WHERE flight_id IN (SELECT id FROM flights_to_remove);
DELETE FROM flights WHERE id IN (SELECT id FROM flights_to_remove);

DROP TEMPORARY TABLE flights_to_remove;

-- A given flight number can only depart once at a given date/time.
ALTER TABLE flights ADD UNIQUE KEY uq_flights_number_departure (flight_number, departure_time);
