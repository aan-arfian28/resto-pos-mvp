-- Seed default settings
INSERT INTO settings (key, value, description) VALUES
    ('tax_enabled', 'false', 'Enable PPN tax calculation'),
    ('tax_rate', '11', 'PPN tax rate percentage'),
    ('token_enabled', 'true', 'Enable table/token number input on POS')
ON CONFLICT (key) DO NOTHING;

-- Seed default owner account (password: admin123)
INSERT INTO users (username, password_hash, role, full_name) VALUES
    ('owner', '$2a$10$9m7OPpdePUwGp8OShYAKDOKEFKmx5txKF6r.fh3khf6lcVXj6J3aS', 'owner', 'Admin Utama')
ON CONFLICT (username) DO NOTHING;

-- Seed default cashier account (password: cashier123)
INSERT INTO users (username, password_hash, role, full_name) VALUES
    ('cashier', '$2a$10$jvkB4kmfD0fjuYOUp3mWpeOA01s7jS0pLCqEFlkDmsWVXgN91z7oi', 'cashier', 'Kasir 01')
ON CONFLICT (username) DO NOTHING;

-- Seed sample categories
INSERT INTO categories (id, name) VALUES
    (gen_random_uuid(), 'Makanan'),
    (gen_random_uuid(), 'Minuman'),
    (gen_random_uuid(), 'Snack'),
    (gen_random_uuid(), 'Dessert')
ON CONFLICT DO NOTHING;
