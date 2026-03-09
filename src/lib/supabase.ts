import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export type Merchant = {
  id: string;
  name: string;
  business_name: string;
  email: string;
  phone?: string;
  created_at: string;
  updated_at: string;
};

export type Customer = {
  id: string;
  phone: string;
  name?: string;
  created_at: string;
};

export type Visit = {
  id: string;
  merchant_id: string;
  customer_id: string;
  points_earned: number;
  created_at: string;
};

export type CustomerPoints = {
  id: string;
  merchant_id: string;
  customer_id: string;
  points: number;
  updated_at: string;
};
