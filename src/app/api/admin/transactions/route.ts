import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  if (!supabase) return NextResponse.json({ error: 'DB error' }, { status: 503 });

  try {
    const { searchParams } = new URL(request.url);
    const merchantId = searchParams.get('merchant_id');
    const from = searchParams.get('from'); // YYYY-MM-DD
    const to = searchParams.get('to');     // YYYY-MM-DD

    let query = supabase
      .from('transactions')
      .select(`
        id, amount, currency, created_at,
        merchant:merchants!merchant_id(id, business_name)
      `)
      .order('created_at', { ascending: false })
      .limit(500);

    if (merchantId) query = query.eq('merchant_id', merchantId);
    if (from) query = query.gte('created_at', from);
    if (to) query = query.lte('created_at', to + 'T23:59:59');

    const { data, error } = await query;
    if (error) throw error;

    const total = (data || []).reduce((s, t) => s + Number(t.amount || 0), 0);

    return NextResponse.json({ transactions: data || [], total: total.toFixed(2) });
  } catch (err: any) {
    console.error('Admin txns error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
