-- Create demo_merchants table for Version 3 hackathon demo
CREATE TABLE IF NOT EXISTS public.demo_merchants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    business_name TEXT,
    kyc_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.demo_merchants ENABLE ROW LEVEL SECURITY;

-- Allow anonymous selecting (for login check)
CREATE POLICY "Allow public select of demo merchants" ON public.demo_merchants
    FOR SELECT TO public
    USING (true);

-- Allow anonymous inserts (for signup)
CREATE POLICY "Allow public insert of demo merchants" ON public.demo_merchants
    FOR INSERT TO public
    WITH CHECK (true);

-- Allow anonymous updates (for KYC status)
CREATE POLICY "Allow public update of demo merchants" ON public.demo_merchants
    FOR UPDATE TO public
    USING (true)
    WITH CHECK (true);
