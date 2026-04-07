-- ==========================================
-- FINAL SCHEMA REPAIR: ADD MISSING COLUMNS
-- Paste and Run in Supabase SQL Editor
-- ==========================================

-- 1. FIX MERCHANT BALANCES
ALTER TABLE IF EXISTS public.demo_merchants 
ADD COLUMN IF NOT EXISTS usd_balance NUMERIC(12,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS zig_balance NUMERIC(12,2) DEFAULT 0.00;

-- 2. FIX INVENTORY COLUMNS (Essential for Dasboard counts)
ALTER TABLE IF EXISTS public.demo_inventory 
ADD COLUMN IF NOT EXISTS stock_level INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS price NUMERIC(12,2) DEFAULT 0.00;

-- 3. FIX TRANSACTION COLUMNS (Essential for Sales calculation)
ALTER TABLE IF EXISTS public.demo_wallet_transactions 
ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'Returni',
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Client' CHECK (category IN ('Supplier', 'Client', 'Personal', 'Internal')),
ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- 4. ENSURE PERMISSIONS (REQUIRED FOR BROWSER)
ALTER TABLE public.demo_merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_wallet_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all merchants" ON public.demo_merchants;
CREATE POLICY "Allow all merchants" ON public.demo_merchants FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all inventory" ON public.demo_inventory;
CREATE POLICY "Allow all inventory" ON public.demo_inventory FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all transactions" ON public.demo_wallet_transactions;
CREATE POLICY "Allow all transactions" ON public.demo_wallet_transactions FOR ALL USING (true) WITH CHECK (true);
