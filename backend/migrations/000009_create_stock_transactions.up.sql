DO $$ BEGIN
    CREATE TYPE stock_transaction_type AS ENUM ('in', 'out', 'adjustment');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS stock_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    raw_material_id UUID NOT NULL REFERENCES raw_materials(id) ON DELETE CASCADE,
    type stock_transaction_type NOT NULL,
    quantity DECIMAL(10,2) NOT NULL CHECK (quantity != 0),
    reason TEXT,
    reference VARCHAR(200),
    user_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stock_tx_material ON stock_transactions(raw_material_id);
CREATE INDEX IF NOT EXISTS idx_stock_tx_created ON stock_transactions(created_at);
