-- Add phone_number and category to demo_wallet_transactions
ALTER TABLE public.demo_wallet_transactions 
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS category TEXT CHECK (category IN ('Supplier', 'Client', 'Personal', 'Internal'));

-- Create an index for merchant_id
CREATE INDEX IF NOT EXISTS idx_demo_wallet_merchant_id ON public.demo_wallet_transactions(merchant_id);

-- Add a comment for documentation
COMMENT ON COLUMN public.demo_wallet_transactions.category IS 'Financial category for Vest AI analysis (Supplier, Client, Personal)';
