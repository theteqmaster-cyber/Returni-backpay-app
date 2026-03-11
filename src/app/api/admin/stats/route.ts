import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured.' }, { status: 503 });
  }

  try {
    // 1. Total Merchants
    const { count: merchantCount, error: mError } = await supabase
      .from('merchants')
      .select('*', { count: 'exact', head: true });
    
    if (mError) throw mError;

    // 2. Total Agents
    const { count: agentCount, error: aError } = await supabase
      .from('agents')
      .select('*', { count: 'exact', head: true });
      
    if (aError) throw aError;

    // 3. Total Revenue (Fees) - For MVP we assume $5 x Merchants (or sum from a table if we built billing)
    // We'll calculate it statically for MVP based on active merchants
    const platformFeeRevenue = (merchantCount || 0) * 5.00;

    // 4. Total Backpay Liability (sum of all unclaimed across all merchants)
    const { data: backpay, error: bpError } = await supabase
      .from('backpay_records')
      .select('backpay_amount')
      .eq('status', 'unclaimed');
      
    if (bpError) throw bpError;

    const totalLiability = backpay?.reduce((sum, b) => sum + Number(b.backpay_amount || 0), 0) || 0;

    return NextResponse.json({
      totalMerchants: merchantCount || 0,
      totalAgents: agentCount || 0,
      totalRevenue: platformFeeRevenue.toFixed(2),
      totalLiability: totalLiability.toFixed(2)
    });

  } catch (err) {
    console.error('Admin stats error:', err);
    return NextResponse.json({ error: 'Failed to fetch admin stats' }, { status: 500 });
  }
}
