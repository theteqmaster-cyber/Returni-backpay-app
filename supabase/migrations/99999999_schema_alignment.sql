-- ==========================================
-- RETURNI SCHEMA INTEGRITY: ALIGNMENT & FIX
-- Run this in your Supabase SQL Editor
-- ==========================================

-- 1. MERCHANT BALANCE ALIGNMENT
ALTER TABLE IF EXISTS public.demo_merchants 
ADD COLUMN IF NOT EXISTS usd_balance NUMERIC(12,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS zig_balance NUMERIC(12,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS business_name TEXT,
ADD COLUMN IF NOT EXISTS kyc_completed BOOLEAN DEFAULT FALSE;

-- 2. INVENTORY SCHEMA ALIGNMENT
CREATE TABLE IF NOT EXISTS public.demo_inventory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    demo_merchant_id UUID REFERENCES public.demo_merchants(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    sku TEXT,
    stock_level INTEGER DEFAULT 0,
    price NUMERIC(12,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. LEDGER (TRANSACTIONS) SCHEMA ALIGNMENT
-- We remove old constraints to allow 'Client', 'Supplier', etc.
CREATE TABLE IF NOT EXISTS public.demo_wallet_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    merchant_id UUID REFERENCES public.demo_merchants(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL, -- receive, send, etc.
    amount NUMERIC(12,2) NOT NULL,
    currency TEXT NOT NULL, -- USD, ZiG
    provider TEXT, -- EcoCash, OneMoney, Returni
    category TEXT, -- Client, Supplier, Personal
    description TEXT,
    phone_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. OPEN PERMISSIONS (RLS) FOR DEMO
ALTER TABLE public.demo_merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Allow all actions so your browser can process POS sales
DROP POLICY IF EXISTS "Allow all merchants" ON public.demo_merchants;
CREATE POLICY "Allow all merchants" ON public.demo_merchants FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all inventory" ON public.demo_inventory;
CREATE POLICY "Allow all inventory" ON public.demo_inventory FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all transactions" ON public.demo_wallet_transactions;
CREATE POLICY "Allow all transactions" ON public.demo_wallet_transactions FOR ALL USING (true) WITH CHECK (true);
