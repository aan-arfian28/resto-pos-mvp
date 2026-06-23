DO $$ BEGIN
    CREATE TYPE shift_status AS ENUM ('open', 'closed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    start_time TIMESTAMPTZ NOT NULL DEFAULT now(),
    end_time TIMESTAMPTZ,
    modal_awal DECIMAL(12,2) NOT NULL CHECK (modal_awal >= 0),
    total_tunai DECIMAL(12,2) DEFAULT 0,
    total_void DECIMAL(12,2) DEFAULT 0,
    saldo_akhir DECIMAL(12,2),
    saldo_aktual DECIMAL(12,2),
    status shift_status NOT NULL DEFAULT 'open',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_shifts_user ON shifts(user_id);
CREATE INDEX IF NOT EXISTS idx_shifts_status ON shifts(status);
