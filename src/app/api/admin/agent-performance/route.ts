import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  if (!supabase) return NextResponse.json({ error: 'DB error' }, { status: 503 });

  try {
    // Get all agents with user info
    const { data: agents, error: aError } = await supabase
      .from('agents')
      .select('id, users!user_id(full_name, email)');

    if (aError) throw aError;

    const sb = supabase!; // already checked above
    const results = await Promise.all((agents || []).map(async (agent: any) => {
      // Get merchants for this agent
      const { data: merchants } = await sb
        .from('merchants')
        .select('id, business_name')
        .eq('agent_id', agent.id);

      const merchantIds = merchants?.map(m => m.id) || [];
      let totalVolume = 0;

      if (merchantIds.length > 0) {
        const { data: txs } = await sb
          .from('transactions')
          .select('amount')
          .in('merchant_id', merchantIds);
        totalVolume = (txs || []).reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
      }

      return {
        id: agent.id,
        name: agent.users?.full_name || 'Unknown',
        email: agent.users?.email || '',
        merchantCount: merchantIds.length,
        merchants: merchants || [],
        totalVolume: totalVolume.toFixed(2),
        expectedCommission: (totalVolume * 0.01).toFixed(2),
      };
    }));

    // Sort by volume descending
    results.sort((a, b) => Number(b.totalVolume) - Number(a.totalVolume));

    return NextResponse.json(results);
  } catch (err: any) {
    console.error('Agent perf error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
