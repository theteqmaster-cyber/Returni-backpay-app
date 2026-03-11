import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  if (!supabase) return NextResponse.json({ error: 'DB error' }, { status: 503 });

  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');

    if (!agentId) return NextResponse.json({ error: 'Missing agentId' }, { status: 400 });

    // 1. Fetch assigned merchants
    const { data: merchants, error: mError } = await supabase
      .from('merchants')
      .select('id, business_name, email, phone')
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false });

    if (mError) throw mError;

    // 2. Fetch total volume from agents merchants
    const merchantIds = merchants?.map(m => m.id) || [];
    let totalVolume = 0;

    if (merchantIds.length > 0) {
      const { data: txs, error: txError } = await supabase
        .from('transactions')
        .select('amount')
        .in('merchant_id', merchantIds);

      if (!txError && txs) {
        totalVolume = txs.reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
      }
    }

    // Example logic: Agent gets a 1% cut of the total volume their merchants process
    const expectedPayout = (totalVolume * 0.01).toFixed(2);

    return NextResponse.json({
      activeMerchants: merchantIds.length,
      pendingFees: expectedPayout,
      totalVolumeProcessed: totalVolume.toFixed(2),
      merchants: merchants || []
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
