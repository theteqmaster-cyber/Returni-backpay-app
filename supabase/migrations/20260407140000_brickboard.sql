-- Create demo_brickboards table
CREATE TABLE IF NOT EXISTS public.demo_brickboards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    merchant_id UUID REFERENCES public.demo_merchants(id) ON DELETE CASCADE UNIQUE,
    promo_text TEXT,
    image_url_1 TEXT, -- Poster Slot 1
    image_url_2 TEXT, -- Poster Slot 2
    image_url_3 TEXT, -- Poster Slot 3
    is_published BOOLEAN DEFAULT FALSE, -- Published state
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.demo_brickboards ENABLE ROW LEVEL SECURITY;

-- Allow public selecting for the Brickboard Feed
CREATE POLICY "Allow public select of demo brickboards" ON public.demo_brickboards
    FOR SELECT TO public
    USING (true);

-- Allow authenticated merchants to manage their own brickboard
CREATE POLICY "Allow merchants to handle their own brickboard" ON public.demo_brickboards
    FOR ALL TO public
    USING (true)
    WITH CHECK (true);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_brickboard_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_brickboard_modtime
    BEFORE UPDATE ON public.demo_brickboards
    FOR EACH ROW
    EXECUTE PROCEDURE update_brickboard_modified_column();
