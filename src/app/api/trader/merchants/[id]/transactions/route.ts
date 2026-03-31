import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!supabase) return NextResponse.json({ error: 'DB context missing' }, { status: 503 });

  try {
    const merchantId = params.id;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '0');
    const limit = 10;
    const start = page * limit;
    const end = start + limit - 1;

    // 1. Fetch merchant details
    const { data: merchant } = await supabase
      .from('merchants')
      .select('business_name, name')
      .eq('id', merchantId)
      .single();

    // 2. Fetch paginated transactions
    const { data: txs, error, count } = await supabase
      .from('transactions')
      .select('*', { count: 'exact' })
      .eq('merchant_id', merchantId)
      .order('created_at', { ascending: false })
      .range(start, end);

    if (error) throw error;

    // 3. Simple Summary Stats
    const { data: volData } = await supabase
      .from('transactions')
      .select('amount, currency')
      .eq('merchant_id', merchantId);

    const volumes: any = { USD: 0, ZAR: 0, ZIG: 0 };
    volData?.forEach(v => {
      const cur = v.currency || 'USD';
      if (volumes.hasOwnProperty(cur)) volumes[cur] += Number(v.amount || 0);
    });

    return NextResponse.json({
      merchant,
      transactions: txs || [],
      totalCount: count || 0,
      hasMore: (count || 0) > (end + 1),
      summary: {
         totalVolume: volumes
      }
    });

  } catch (err: any) {
    console.error('Branch history error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
