DELETE FROM settings WHERE key IN ('tax_enabled', 'tax_rate', 'token_enabled');
DELETE FROM users WHERE username = 'owner';
