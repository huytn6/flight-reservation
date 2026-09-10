-- Re-running database/seed.py more than once (before any guard existed) inserted the
-- same route/time/flight-number combination twice with different ids, so searches
-- show the same flight two or three times.
--
-- Step 1: find every duplicate group (same flight_number + departure_time) and pick
-- one row per group to keep (the oldest id).
-- Step 2: a handful of these groups have a real booking/seat hold/saved-flight sitting
-- on the copy we're NOT keeping (confirmed on production: 3 groups, see
-- TIEN_DO_FIX.md #4). Instead of leaving those duplicated forever, move the references
-- onto the row we're keeping -- safe, because both rows are the exact same real-world
-- flight (identical flight_number + departure_time), so redirecting a booking from one
-- copy to the other doesn't change what the passenger actually flies. Fares are matched
-- by cabin class + fare code, seats by seat number, since both copies were inserted by
-- the same (duplicated) seed run and are otherwise identical.
-- Step 3: delete every duplicate that no longer has anything real pointing at it. Any
-- row a merge couldn't fully clear (no matching fare/seat found) is deliberately left
-- in place rather than deleted, so this fails loudly (the guard below won't apply) on a
-- MySQL error instead of silently orphaning a booking.
-- Step 4: add a uniqueness guard so this can never happen again, from seed.py or the
-- admin "create flight" API.
--
-- Safe to re-run: every step only touches rows that still have duplicates / dangling
-- references, so a partially-applied previous attempt (MySQL auto-commits around the
-- CREATE/DROP TEMPORARY TABLE statements here, so a mid-script failure like the
-- ADD UNIQUE KEY below can leave step 1-3's deletes already committed) just resumes
-- cleanly instead of redoing or failing on already-finished work.

CREATE TEMPORARY TABLE flight_dup_groups AS
SELECT flight_number, departure_time, MIN(id) AS keep_id
FROM flights
GROUP BY flight_number, departure_time
HAVING COUNT(*) > 1;

CREATE TEMPORARY TABLE flight_dup_losers AS
SELECT f.id AS loser_id, g.keep_id
FROM flights f
JOIN flight_dup_groups g
  ON g.flight_number = f.flight_number AND g.departure_time = f.departure_time
WHERE f.id <> g.keep_id;

-- Move any real booking onto the row we're keeping.
UPDATE booking_segments bs
JOIN flight_dup_losers l ON bs.flight_id = l.loser_id
JOIN fares f_old ON f_old.id = bs.fare_id
JOIN fares f_new ON f_new.flight_id = l.keep_id
  AND f_new.cabin_class_id = f_old.cabin_class_id
  AND f_new.fare_code = f_old.fare_code
SET bs.flight_id = l.keep_id, bs.fare_id = f_new.id;

-- Move any seat assignment tied to that booking onto the equivalent seat on the row
-- we're keeping, then mark that seat taken (it's a copy, so it starts out AVAILABLE).
UPDATE seat_assignments sa
JOIN seats s_old ON s_old.id = sa.seat_id
JOIN flight_dup_losers l ON s_old.flight_id = l.loser_id
JOIN seats s_new ON s_new.flight_id = l.keep_id AND s_new.seat_number = s_old.seat_number
SET sa.seat_id = s_new.id;

UPDATE seats s_new
JOIN seat_assignments sa ON sa.seat_id = s_new.id
SET s_new.status = 'BOOKED'
WHERE s_new.status = 'AVAILABLE';

-- The loser's own copy of that seat has nothing pointing at it anymore (its
-- assignment just moved above) -- free it up too, otherwise its stale BOOKED/HELD
-- status would make the cleanup check below think the loser flight is still in use.
UPDATE seats s_old
JOIN flight_dup_losers l ON s_old.flight_id = l.loser_id
LEFT JOIN seat_assignments sa ON sa.seat_id = s_old.id
SET s_old.status = 'AVAILABLE'
WHERE sa.id IS NULL AND s_old.status <> 'AVAILABLE';

-- Point saved-flight bookmarks at the row we're keeping; if a user had somehow
-- bookmarked both copies, drop the duplicate bookmark instead of colliding with the
-- unique (user_id, flight_id) key.
-- MySQL won't let a DELETE's WHERE subquery reference the same table it's deleting
-- from, even under a different alias -- wrap it as a derived table to work around that.
DELETE sv FROM saved_flights sv
JOIN flight_dup_losers l ON sv.flight_id = l.loser_id
WHERE EXISTS (
  SELECT 1 FROM (SELECT user_id, flight_id FROM saved_flights) AS sv2
  WHERE sv2.user_id = sv.user_id AND sv2.flight_id = l.keep_id
);

UPDATE saved_flights sv
JOIN flight_dup_losers l ON sv.flight_id = l.loser_id
LEFT JOIN fares f_old ON f_old.id = sv.fare_id
LEFT JOIN fares f_new ON f_new.flight_id = l.keep_id
  AND f_new.cabin_class_id = f_old.cabin_class_id
  AND f_new.fare_code = f_old.fare_code
SET sv.flight_id = l.keep_id, sv.fare_id = f_new.id;

-- Remove every duplicate that no longer has anything real pointing at it (both the
-- always-safe copies, and the ones just merged above).
CREATE TEMPORARY TABLE flights_to_remove AS
SELECT l.loser_id AS id
FROM flight_dup_losers l
WHERE NOT EXISTS (SELECT 1 FROM booking_segments bs WHERE bs.flight_id = l.loser_id)
  AND NOT EXISTS (SELECT 1 FROM saved_flights sv WHERE sv.flight_id = l.loser_id)
  AND NOT EXISTS (SELECT 1 FROM seats s WHERE s.flight_id = l.loser_id AND s.status <> 'AVAILABLE');

DELETE FROM fare_inventories WHERE fare_id IN (SELECT id FROM fares WHERE flight_id IN (SELECT id FROM flights_to_remove));
DELETE FROM fares WHERE flight_id IN (SELECT id FROM flights_to_remove);
DELETE FROM seats WHERE flight_id IN (SELECT id FROM flights_to_remove);
DELETE FROM seat_maps WHERE flight_id IN (SELECT id FROM flights_to_remove);
DELETE FROM flight_segments WHERE flight_id IN (SELECT id FROM flights_to_remove);
DELETE FROM flights WHERE id IN (SELECT id FROM flights_to_remove);

-- Tidy up any fare_inventories rows left pointing at a fare that's already gone (e.g.
-- from this migration's first, partially-applied attempt, before this fix existed).
DELETE fi FROM fare_inventories fi
LEFT JOIN fares f ON f.id = fi.fare_id
WHERE f.id IS NULL;

DROP TEMPORARY TABLE flights_to_remove;
DROP TEMPORARY TABLE flight_dup_losers;
DROP TEMPORARY TABLE flight_dup_groups;

-- A given flight number can only depart once at a given date/time.
ALTER TABLE flights ADD UNIQUE KEY uq_flights_number_departure (flight_number, departure_time);
