-- Update default balances for new merchants to 0.00
ALTER TABLE public.demo_merchants 
ALTER COLUMN usd_balance SET DEFAULT 0.00,
ALTER COLUMN zig_balance SET DEFAULT 0.00;

-- Reset existing demo merchant balances for a fresh start (optional, as per user's prompt)
UPDATE public.demo_merchants SET usd_balance = 0.00, zig_balance = 0.00;

-- Add provider column to transaction history
ALTER TABLE public.demo_wallet_transactions 
ADD COLUMN IF NOT EXISTS provider TEXT;

-- (Optional) Update existing transactions to have a default provider
UPDATE public.demo_wallet_transactions SET provider = 'Returni Wallet' WHERE provider IS NULL;
