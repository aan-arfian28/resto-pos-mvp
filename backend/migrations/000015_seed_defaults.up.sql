-- Seed default settings
INSERT INTO settings (key, value, description) VALUES
    ('tax_enabled', 'false', 'Enable PPN tax calculation'),
    ('tax_rate', '11', 'PPN tax rate percentage'),
    ('token_enabled', 'true', 'Enable table/token number input on POS')
ON CONFLICT (key) DO NOTHING;

-- Seed default owner account (password: admin123)
-- bcrypt hash for 'admin123' with cost 12
INSERT INTO users (username, password_hash, role, full_name) VALUES
    ('owner', '$2a$12$LJ3m4ys3Lk0TSwHCpNqrXeSqE2gqB5J8XPGxKxU8BvRmP7GqVqO6W', 'owner', 'Admin Utama')
ON CONFLICT (username) DO NOTHING;

-- Seed sample categories
INSERT INTO categories (id, name) VALUES
    (gen_random_uuid(), 'Makanan'),
    (gen_random_uuid(), 'Minuman'),
    (gen_random_uuid(), 'Snack'),
    (gen_random_uuid(), 'Dessert')
ON CONFLICT DO NOTHING;
