import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  if (!supabase) return NextResponse.json({ error: 'DB error' }, { status: 503 });

  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');

    if (!agentId) return NextResponse.json({ error: 'Missing agentId' }, { status: 400 });

    // 1. Fetch assigned merchants first to get IDs
    const { data: merchants, error: mError } = await supabase
      .from('merchants')
      .select('id, business_name, email, phone, internal_notes, created_at')
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false });

    if (mError) throw mError;

    const merchantIds = merchants?.map(m => m.id) || [];
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // 2. Fetch activity and volume in parallel
    const [
      { data: recentActivity, error: activityError },
      { count: monthlySignups, error: goalError },
      { data: txs, error: txError }
    ] = await Promise.all([
      // Recent transactions from these merchants
      supabase.from('transactions')
        .select('id, amount, currency, created_at, merchants(business_name)')
        .in('merchant_id', merchantIds)
        .order('created_at', { ascending: false })
        .limit(10),

      // Recruitment goal count
      supabase.from('merchants')
        .select('*', { count: 'exact', head: true })
        .eq('agent_id', agentId)
        .gte('created_at', startOfMonth.toISOString()),

      // All transactions for volume calculation
      supabase.from('transactions')
        .select('merchant_id, amount, currency')
        .in('merchant_id', merchantIds)
    ]);

    // 3. Process volume and performance
    const totalVolume = { USD: 0, ZAR: 0, ZIG: 0 };
    const merchantPerformance: Record<string, { USD: number; ZAR: number; ZIG: number; count: number }> = {};

    if (!txError && txs) {
      txs.forEach(tx => {
        const cur = (tx.currency || 'USD') as 'USD' | 'ZAR' | 'ZIG';
        const mid = tx.merchant_id;
        
        if (!merchantPerformance[mid]) {
          merchantPerformance[mid] = { USD: 0, ZAR: 0, ZIG: 0, count: 0 };
        }
        
        merchantPerformance[mid].count++;
        if (cur === 'USD' || cur === 'ZAR' || cur === 'ZIG') {
           totalVolume[cur] += Number(tx.amount || 0);
           merchantPerformance[mid][cur] += Number(tx.amount || 0);
        }
      });
    }

    // Agent Payout Calculation:
    // 1. $5 per merchant signed up (Recruitment Fee)
    // 2. $1.50 per merchant manage (Monthly Servicing Fee)
    // For now, "expectedPayout" is the sum of these two.
    
    const merchantCount = merchantIds.length;
    const recruitmentEarnings = merchantCount * 5;
    const servicingEarnings = merchantCount * 1.5;
    const totalEarnings = recruitmentEarnings + servicingEarnings;

    const expectedPayout = {
      USD: totalEarnings.toFixed(2),
      ZAR: (totalEarnings * 18).toFixed(2), // Rough estimate for ZAR
      ZIG: (totalEarnings * 25).toFixed(2)  // Rough estimate for ZiG
    };

    return NextResponse.json({
      activeMerchants: merchantCount,
      pendingFees: expectedPayout,
      payoutBreakdown: {
        recruitment: recruitmentEarnings.toFixed(2),
        servicing: servicingEarnings.toFixed(2),
        total: totalEarnings.toFixed(2)
      },
      totalVolumeProcessed: {
        USD: totalVolume.USD.toFixed(2),
        ZAR: totalVolume.ZAR.toFixed(2),
        ZIG: totalVolume.ZIG.toFixed(2)
      },
      monthlySignups: monthlySignups || 0,
      monthlyTarget: 10, 
      recentActivity: recentActivity || [],
      merchants: merchants?.map(m => ({
        ...m,
        stats: merchantPerformance[m.id] || { USD: 0, ZAR: 0, ZIG: 0, count: 0 }
      })) || []
    });

  } catch (err) {
    console.error('Agent stats error:', err);
    return NextResponse.json({ error: 'Failed to fetch agent stats' }, { status: 500 });
  }
}

// Update merchant internal_notes
export async function PATCH(request: NextRequest) {
  if (!supabase) return NextResponse.json({ error: 'DB error' }, { status: 503 });

  try {
    const body = await request.json();
    const { merchantId, notes } = body;

    if (!merchantId) return NextResponse.json({ error: 'Missing merchantId' }, { status: 400 });

    const { error } = await supabase
      .from('merchants')
      .update({ internal_notes: notes })
      .eq('id', merchantId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Update notes error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
