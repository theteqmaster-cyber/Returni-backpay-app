-- RETURNi Database Schema for Supabase
-- Run this in Supabase SQL Editor to set up your database

CREATE TABLE IF NOT EXISTS merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  business_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Core application users (admins, agents, merchant users, clients)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'agent', 'merchant_user', 'client')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agents (linked to users)
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Link merchants to their owning user and agent
ALTER TABLE merchants
ADD COLUMN IF NOT EXISTS owner_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS backpay_percent NUMERIC(5,2) DEFAULT 4.00;

-- Customers (identified by phone)
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(phone)
);

-- Merchant-Customer visits (links customer to merchant)
CREATE TABLE IF NOT EXISTS visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  points_earned INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Points balance per merchant-customer
CREATE TABLE IF NOT EXISTS customer_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  points INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(merchant_id, customer_id)
);

-- Pending sync queue (for offline transactions)
CREATE TABLE IF NOT EXISTS pending_sync (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  synced BOOLEAN DEFAULT FALSE
);

-- Monetary transactions (purchases at merchants)
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Backpay records created from transactions
CREATE TABLE IF NOT EXISTS backpay_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE NOT NULL,
  merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  backpay_amount NUMERIC(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'unclaimed' CHECK (status IN ('unclaimed', 'claimed', 'expired')),
  qr_token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  claimed_at TIMESTAMPTZ
);

-- Backpay claims (audit trail)
CREATE TABLE IF NOT EXISTS backpay_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backpay_record_id UUID REFERENCES backpay_records(id) ON DELETE CASCADE NOT NULL,
  claimed_by_merchant_id UUID REFERENCES merchants(id) ON DELETE SET NULL,
  claimed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Simple monthly agent commissions snapshot (optional, can also be computed)
CREATE TABLE IF NOT EXISTS agent_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE NOT NULL,
  merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE NOT NULL,
  month TEXT NOT NULL, -- e.g. '2025-03'
  commission_amount NUMERIC(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_visits_merchant ON visits(merchant_id);
CREATE INDEX IF NOT EXISTS idx_visits_customer ON visits(customer_id);
CREATE INDEX IF NOT EXISTS idx_visits_created ON visits(created_at);
CREATE INDEX IF NOT EXISTS idx_customer_points_merchant ON customer_points(merchant_id);
CREATE INDEX IF NOT EXISTS idx_customer_points_customer ON customer_points(customer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_merchant ON transactions(merchant_id);
CREATE INDEX IF NOT EXISTS idx_transactions_customer ON transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_backpay_records_merchant ON backpay_records(merchant_id);
CREATE INDEX IF NOT EXISTS idx_backpay_records_customer ON backpay_records(customer_id);
CREATE INDEX IF NOT EXISTS idx_agent_commissions_agent_month ON agent_commissions(agent_id, month);

-- Enable RLS (Row Level Security) - optional, for multi-tenant
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE backpay_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE backpay_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_commissions ENABLE ROW LEVEL SECURITY;

-- Allow all for MVP (simplify - add auth later)
CREATE POLICY "Allow all merchants" ON merchants FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all customers" ON customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all visits" ON visits FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all customer_points" ON customer_points FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all agents" ON agents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all transactions" ON transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all backpay_records" ON backpay_records FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all backpay_claims" ON backpay_claims FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all agent_commissions" ON agent_commissions FOR ALL USING (true) WITH CHECK (true);
