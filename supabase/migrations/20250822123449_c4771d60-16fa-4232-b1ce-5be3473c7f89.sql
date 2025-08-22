-- Fix OTP expiry security warning
-- Set OTP expiry to recommended 1 hour (3600 seconds)

UPDATE auth.config SET value = '3600' WHERE parameter = 'OTP_EXPIRY';

-- Also ensure recommended security settings for OTP
UPDATE auth.config SET value = '6' WHERE parameter = 'OTP_LENGTH';
UPDATE auth.config SET value = '60' WHERE parameter = 'RATE_LIMIT_OTP_SENT';