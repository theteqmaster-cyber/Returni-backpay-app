-- Add balance columns to demo_merchants
ALTER TABLE public.demo_merchants 
ADD COLUMN IF NOT EXISTS usd_balance DECIMAL(12, 2) DEFAULT 1000.00,
ADD COLUMN IF NOT EXISTS zig_balance DECIMAL(12, 2) DEFAULT 5000.00;

-- Create demo_wallet_transactions table
CREATE TABLE IF NOT EXISTS public.demo_wallet_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    merchant_id UUID REFERENCES public.demo_merchants(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('payment', 'withdrawal', 'receive')),
    amount DECIMAL(12, 2) NOT NULL,
    currency TEXT NOT NULL CHECK (currency IN ('USD', 'ZiG')),
    description TEXT,
    status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.demo_wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Allow public select of demo wallet transactions (for demo)
CREATE POLICY "Allow public select of demo wallet transactions" ON public.demo_wallet_transactions
    FOR SELECT TO public
    USING (true);

-- Allow public insert of demo wallet transactions (for demo)
CREATE POLICY "Allow public insert of demo wallet transactions" ON public.demo_wallet_transactions
    FOR INSERT TO public
    WITH CHECK (true);
