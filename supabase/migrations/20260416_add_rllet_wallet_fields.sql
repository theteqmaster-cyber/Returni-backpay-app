-- Zenra Phase 2: Rllet Wallet Database Migration
-- Run this script in your Supabase SQL Editor to enable persistent wallet balances.

-- Add the wallet balance and PIN fields to the merchants table
ALTER TABLE merchants
ADD COLUMN IF NOT EXISTS rllet_balance NUMERIC(12,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS rllet_pin TEXT DEFAULT '1910';

-- For existing merchants, sync their true historical sales volume (Total Revenue)
UPDATE merchants m
SET rllet_balance = COALESCE(
  (SELECT CAST(SUM(amount) AS NUMERIC(12,2)) FROM transactions t WHERE t.merchant_id = m.id AND t.currency = 'USD'), 
  0.00
);

-- Ensure constraints (e.g. balance cannot drop below 0 if we assume no overdraft)
ALTER TABLE merchants
ADD CONSTRAINT chk_rllet_balance_positive CHECK (rllet_balance >= 0);
