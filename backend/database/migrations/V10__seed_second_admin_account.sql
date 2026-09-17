-- Seed a second admin account. Password hash uses the same PBKDF2-HMAC-SHA256
-- scheme as core/authentication.py::hash_password (260000 iterations,
-- format "<salt_hex>:<derived_key_hex>").
--
-- Email:    huytranngoc@uitair.com
-- Password: Huy@123
INSERT INTO users (id, email, password, full_name, role, status, created_at, updated_at)
VALUES (
    '2dbbee56-2990-46bf-a45e-41cd42fed4d6',
    'huytranngoc@uitair.com',
    'e62649b7942b313240aae6566721d051566fc84a9851a449b22aabd43a2f12a4:b89ed7bcd44f0c6bc1e94000bd086bef5c3348aa8ffe675f328de7a38cb6ce51',
    'Quản trị viên',
    'ADMIN',
    'ACTIVE',
    '2026-09-16T16:10:31.608954',
    '2026-09-16T16:10:31.608954'
)
ON DUPLICATE KEY UPDATE
    password   = VALUES(password),
    role       = 'ADMIN',
    status     = 'ACTIVE',
    updated_at = VALUES(updated_at);
