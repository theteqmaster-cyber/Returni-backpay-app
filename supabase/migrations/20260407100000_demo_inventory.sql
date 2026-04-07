-- Create demo_inventory table for Version 3 demo
CREATE TABLE IF NOT EXISTS public.demo_inventory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    demo_merchant_id UUID REFERENCES public.demo_merchants(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    sku TEXT, -- For barcodes
    stock_level INTEGER DEFAULT 0,
    price NUMERIC(12,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.demo_inventory ENABLE ROW LEVEL SECURITY;

-- Allow public access for the demo portal
CREATE POLICY "Allow all actions on demo_inventory" ON public.demo_inventory FOR ALL USING (true) WITH CHECK (true);
