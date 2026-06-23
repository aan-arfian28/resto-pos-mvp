DO $$ BEGIN
    CREATE TYPE order_type AS ENUM ('dine_in', 'takeaway', 'delivery');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM ('cash', 'debit', 'credit', 'qris', 'other');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('draft', 'completed', 'voided');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY,
    shift_id UUID REFERENCES shifts(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES users(id),
    type order_type NOT NULL,
    table_number VARCHAR(20),
    tax_enabled BOOLEAN NOT NULL DEFAULT false,
    tax_rate DECIMAL(5,2) CHECK (tax_rate >= 0),
    tax_amount DECIMAL(12,2) DEFAULT 0,
    subtotal DECIMAL(12,2) NOT NULL CHECK (subtotal >= 0),
    grand_total DECIMAL(12,2) NOT NULL CHECK (grand_total >= 0),
    payment_method payment_method NOT NULL,
    amount_received DECIMAL(12,2) CHECK (amount_received >= 0),
    change_amount DECIMAL(12,2) CHECK (change_amount >= 0),
    status order_status NOT NULL DEFAULT 'completed',
    is_synced BOOLEAN NOT NULL DEFAULT true,
    original_timestamp TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_shift ON orders(shift_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_synced ON orders(is_synced);
CREATE INDEX IF NOT EXISTS idx_orders_original_ts ON orders(original_timestamp);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);
