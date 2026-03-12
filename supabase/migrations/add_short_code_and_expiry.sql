-- Migration: Add short_code and expires_at to backpay_records
-- Run this in your Supabase SQL Editor

ALTER TABLE backpay_records
ADD COLUMN IF NOT EXISTS short_code VARCHAR(5) UNIQUE,
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Index for faster lookups by short_code
CREATE INDEX IF NOT EXISTS idx_backpay_records_short_code ON backpay_records(short_code);
