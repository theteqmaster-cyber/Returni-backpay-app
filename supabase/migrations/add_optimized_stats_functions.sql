-- Migration: Optimized Merchant Statistics Functions
-- Run this in your Supabase SQL Editor

-- Function to get transaction volume grouped by currency
CREATE OR REPLACE FUNCTION get_merchant_volume(merchant_uuid UUID)
RETURNS TABLE (currency TEXT, total_amount NUMERIC) AS $$
BEGIN
    RETURN QUERY
    SELECT t.currency::TEXT, SUM(t.amount::NUMERIC)
    FROM transactions t
    WHERE t.merchant_id = merchant_uuid
    GROUP BY t.currency;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unclaimed liability grouped by currency
CREATE OR REPLACE FUNCTION get_merchant_liability(merchant_uuid UUID)
RETURNS TABLE (currency TEXT, total_liability NUMERIC) AS $$
BEGIN
    RETURN QUERY
    SELECT b.currency::TEXT, SUM(b.backpay_amount::NUMERIC)
    FROM backpay_records b
    WHERE b.merchant_id = merchant_uuid AND b.status = 'unclaimed'
    GROUP BY b.currency;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get transaction volume filtered by date
CREATE OR REPLACE FUNCTION get_merchant_volume_filtered(merchant_uuid UUID, start_date TIMESTAMPTZ)
RETURNS TABLE (currency TEXT, total_amount NUMERIC) AS $$
BEGIN
    RETURN QUERY
    SELECT t.currency::TEXT, SUM(t.amount::NUMERIC)
    FROM transactions t
    WHERE t.merchant_id = merchant_uuid AND t.created_at >= start_date
    GROUP BY t.currency;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
