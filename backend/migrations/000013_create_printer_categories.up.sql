CREATE TABLE IF NOT EXISTS printer_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    printer_id UUID NOT NULL REFERENCES printers(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_printer_cat_printer ON printer_categories(printer_id);
CREATE INDEX IF NOT EXISTS idx_printer_cat_category ON printer_categories(category_id);
