import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  if (!supabase) return NextResponse.json({ error: 'DB error' }, { status: 503 });

  try {
    const { searchParams } = new URL(request.url);
    const merchantId = searchParams.get('merchantId');

    if (!merchantId) return NextResponse.json({ error: 'Missing merchantId' }, { status: 400 });

    // 1. Fetch merchant details + owner + agent
    const { data: merchant, error: mError } = await supabase
      .from('merchants')
      .select('id, name, business_name, email, phone, agent_id, owner:users!owner_user_id(full_name)')
      .eq('id', merchantId)
      .single();

    if (mError) throw mError;

    // 2. Fetch agent contact if assigned
    let agentName = null;
    let agentPhone = null;
    if (merchant?.agent_id) {
      const { data: agentData } = await supabase
        .from('agents')
        .select('users!user_id(full_name, phone)')
        .eq('id', merchant.agent_id)
        .single();
      if (agentData?.users) {
        agentName = (agentData.users as any).full_name;
        agentPhone = (agentData.users as any).phone;
      }
    }

    // 3. Fetch ALL transactions for this merchant (no limit)
    const { data: transactions, error: txError } = await supabase
      .from('transactions')
      .select('id, amount, currency, created_at')
      .eq('merchant_id', merchantId)
      .order('created_at', { ascending: false });

    if (txError) throw txError;

    const totalVolume = transactions?.reduce((sum, t) => sum + Number(t.amount || 0), 0) || 0;
    const totalCount = transactions?.length || 0;

    return NextResponse.json({
      merchant: {
        business_name: merchant.business_name,
        owner_name: (merchant.owner as any)?.full_name || merchant.name,
        email: merchant.email,
        phone: merchant.phone,
      },
      agent: agentName ? { name: agentName, phone: agentPhone } : null,
      transactions: transactions || [],
      summary: {
        totalCount,
        totalVolume: totalVolume.toFixed(2),
        generatedAt: new Date().toISOString(),
      }
    });

  } catch (err: any) {
    console.error('Report error:', err);
    return NextResponse.json({ error: err.message || 'Failed to generate report' }, { status: 500 });
  }
}
