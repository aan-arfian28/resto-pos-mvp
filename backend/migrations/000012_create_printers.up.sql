DO $$ BEGIN
    CREATE TYPE printer_type AS ENUM ('kitchen', 'receipt');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS printers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    type printer_type NOT NULL,
    ip_address VARCHAR(50),
    port INTEGER DEFAULT 9100,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
