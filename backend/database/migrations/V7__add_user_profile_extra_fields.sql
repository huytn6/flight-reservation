-- Profile > Edit's "About you" (bio), "Gender" and "Accessibility needs" fields were
-- collected from the user but silently discarded -- the users table had no columns
-- to hold them, so update_profile() dropped them and the Profile page always showed
-- "Chưa cập nhật" no matter what was submitted. Add the missing columns so saving
-- Profile > Edit persists every field shown on the form.
ALTER TABLE users
    ADD COLUMN gender             VARCHAR(30)  NULL,
    ADD COLUMN bio                TEXT         NULL,
    ADD COLUMN special_assistance VARCHAR(255) NULL;
