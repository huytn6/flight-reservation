-- Seed an admin account so the system has an initial user who can access
-- admin-only features. Password hash uses the same PBKDF2-HMAC-SHA256
-- scheme as core/authentication.py::hash_password (260000 iterations,
-- format "<salt_hex>:<derived_key_hex>").
--
-- Email:    huytranngoc@gmail.com
-- Password: Huy@123
INSERT INTO users (id, email, password, full_name, role, status, created_at, updated_at)
VALUES (
    '2651866e-3591-4ae5-a33d-b74c0738e9da',
    'huytranngoc@gmail.com',
    'aec2f83f629cc7a23fde59513a68785caa29a367347bd5b255dd3c69ecc7972c:e8063cc078cca53ef0552d9e7036ff8ec068c6874c2853284dcd0a4d25cbaa6d',
    'Quản trị viên',
    'ADMIN',
    'ACTIVE',
    '2026-09-16T16:04:13.626940',
    '2026-09-16T16:04:13.626940'
)
ON DUPLICATE KEY UPDATE
    password   = VALUES(password),
    role       = 'ADMIN',
    status     = 'ACTIVE',
    updated_at = VALUES(updated_at);
