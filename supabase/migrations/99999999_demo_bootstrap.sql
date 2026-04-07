-- ==========================================
-- LIVE DEMO BOOTSTRAP: RETURNI PORTAL V3
-- Paste this into your Supabase SQL Editor and Run
-- ==========================================

-- 1. Ensure Merhcants Table has Balances
ALTER TABLE IF EXISTS public.demo_merchants 
ADD COLUMN IF NOT EXISTS usd_balance NUMERIC(12,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS zig_balance NUMERIC(12,2) DEFAULT 0.00;

-- 2. Create Stable Demo Merchant (If not exists)
INSERT INTO public.demo_merchants (id, email, password, business_name, usd_balance, zig_balance, kyc_completed)
VALUES (
    '00000000-0000-0000-0000-000000000001', 
    'demo@returni.com', 
    'demo123', 
    'Returni Node Prime', 
    5420.50, 
    12500.00, 
    TRUE
)
ON CONFLICT (id) DO UPDATE SET 
    business_name = 'Returni Node Prime',
    usd_balance = EXCLUDED.usd_balance,
    zig_balance = EXCLUDED.zig_balance;

-- 3. Seed Professional Inventory (For Terminal V3)
INSERT INTO public.demo_inventory (demo_merchant_id, name, sku, stock_level, price)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'Returni POS Terminal V3', 'RNI-POS-001', 12, 149.99),
    ('00000000-0000-0000-0000-000000000001', 'HDMI Connector (Bulk)', 'CAB-HDMI-01', 45, 12.50),
    ('00000000-0000-0000-0000-000000000001', '4G Merchant Router', 'NET-4G-WIFI', 3, 85.00), -- Low Stock Alert Trigger
    ('00000000-0000-0000-0000-000000000001', 'Node Verification Tag', 'TAG-RNI-05', 120, 2.99),
    ('00000000-0000-0000-0000-000000000001', 'Backup Battery Pack', 'PWR-BATT-02', 8, 35.00)
ON CONFLICT DO NOTHING;

-- 4. Seed Recent Transactions (For Vest AI Analytics)
INSERT INTO public.demo_wallet_transactions (merchant_id, type, amount, currency, provider, description, category, phone_number)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'receive', 450.00, 'USD', 'EcoCash', 'Client Settlement: Batch 45', 'Client', '263771000000'),
    ('00000000-0000-0000-0000-000000000001', 'receive', 120.00, 'USD', 'Returni', 'Client Settlement: Terminal V3 sale', 'Client', '263772000001'),
    ('00000000-0000-0000-0000-000000000001', 'send', 200.00, 'USD', 'ZiG Pay', 'Inventory Bulk Restock: HDMI', 'Supplier', '263773000002'),
    ('00000000-0000-0000-0000-000000000001', 'receive', 85.50, 'USD', 'OneMoney', 'Client Settlement: Node POS #12', 'Client', '263774000003'),
    ('00000000-0000-0000-0000-000000000001', 'send', 50.00, 'USD', 'Returni', 'Node Maintenance Fee', 'Personal', '263775000004')
ON CONFLICT DO NOTHING;
