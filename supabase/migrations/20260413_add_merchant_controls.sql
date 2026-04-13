-- Add backpay_expiry_days to merchants table
ALTER TABLE public.merchants 
ADD COLUMN IF NOT EXISTS backpay_expiry_days INTEGER DEFAULT 7;

-- If backpay_percent wasn't explicitly defaulting to something, set it now
ALTER TABLE public.merchants 
ALTER COLUMN backpay_percent SET DEFAULT 4.00;

-- Update existing records to have the default 7 day expiry
UPDATE public.merchants SET backpay_expiry_days = 7 WHERE backpay_expiry_days IS NULL;

-- RPC for calculated return rate
CREATE OR REPLACE FUNCTION public.get_merchant_return_rate(merchant_uuid UUID)
RETURNS NUMERIC AS $$
DECLARE
    total_customers BIGINT;
    returning_customers BIGINT;
BEGIN
    -- Total unique customers for this merchant
    SELECT COUNT(DISTINCT customer_id) INTO total_customers
    FROM public.transactions
    WHERE merchant_id = merchant_uuid;

    IF total_customers = 0 THEN
        RETURN 0.00;
    END IF;

    -- Customers with more than 1 transaction
    SELECT COUNT(*) INTO returning_customers
    FROM (
        SELECT customer_id
        FROM public.transactions
        WHERE merchant_id = merchant_uuid
        GROUP BY customer_id
        HAVING COUNT(*) > 1
    ) AS returning_group;

    RETURN ROUND((returning_customers::NUMERIC / total_customers::NUMERIC) * 100, 2);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
