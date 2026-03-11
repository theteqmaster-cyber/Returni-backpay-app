-- Migration: Add multi-currency and payment method columns
-- Run this once in your Supabase SQL Editor

-- TRANSACTIONS
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20) DEFAULT 'CASH';

-- BACKPAY RECORDS
ALTER TABLE backpay_records
ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'USD';

-- BACKPAY CLAIMS
ALTER TABLE backpay_claims
ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'USD';
