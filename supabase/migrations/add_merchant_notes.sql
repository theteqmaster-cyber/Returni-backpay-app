-- Migration: Add Merchant Notes to Transactions
-- Purpose: Allows merchants to add optional private text notes to transactions

-- 1. Add `merchant_notes` to the transactions table (nullable text field)
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS merchant_notes TEXT;

-- (Optional) If we want to be able to index it for search queries later
-- CREATE INDEX IF NOT EXISTS idx_transactions_merchant_notes ON transactions USING GIN (to_tsvector('english', coalesce(merchant_notes, '')));
