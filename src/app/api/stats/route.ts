import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  if (!supabase) {
    return NextResponse.json(
      { error: 'Database not configured.' },
      { status: 503 }
    );
  }
  try {
    const { searchParams } = new URL(request.url);
    const merchantId = searchParams.get('merchantId');

    if (!merchantId) {
      return NextResponse.json(
        { error: 'Missing merchantId' },
        { status: 400 }
      );
    }

    const today = new Date().toISOString().split('T')[0];

    // Fetch merchant details (specifically the assigned agent ID)
    const { data: merchantData, error: mInfoError } = await supabase
       .from('merchants')
       .select('agent_id')
       .eq('id', merchantId)
       .single();
       
    if (mInfoError) throw mInfoError;

    let agentContact = null;
    if (merchantData?.agent_id) {
       // Join agent to user table
       const { data: agentData } = await supabase
         .from('agents')
         .select('users!user_id(full_name, email, phone)')
         .eq('id', merchantData.agent_id)
         .single();
         
       if (agentData?.users) {
          agentContact = agentData.users;
       }
    }

    // Transactions today & total
    const { data: transactions, error: txError } = await supabase
      .from('transactions')
      .select('id, amount, currency, payment_method, merchant_notes, created_at')
      .eq('merchant_id', merchantId)
      .order('created_at', { ascending: false });

    if (txError) throw txError;

    const todayTransactions = transactions?.filter(t => t.created_at.startsWith(today)) || [];
    const todaySalesCount = todayTransactions.length;
    
    // Total Volume grouped by currency
    const totalVol = { USD: 0, ZAR: 0, ZIG: 0 };
    transactions?.forEach(t => {
      const cur = (t.currency || 'USD') as 'USD' | 'ZAR' | 'ZIG';
      if (cur === 'USD' || cur === 'ZAR' || cur === 'ZIG') {
        totalVol[cur] += Number(t.amount || 0);
      }
    });

    // Unclaimed Liability grouped by currency
    const { data: backpay, error: bpError } = await supabase
      .from('backpay_records')
      .select('backpay_amount, currency')
      .eq('merchant_id', merchantId)
      .eq('status', 'unclaimed');
      
    if (bpError) throw bpError;

    const unclaimedLiability = { USD: 0, ZAR: 0, ZIG: 0 };
    backpay?.forEach(b => {
      const cur = (b.currency || 'USD') as 'USD' | 'ZAR' | 'ZIG';
      if (cur === 'USD' || cur === 'ZAR' || cur === 'ZIG') {
        unclaimedLiability[cur] += Number(b.backpay_amount || 0);
      }
    });

    const recentTransactions = transactions?.slice(0, 10) || [];

    return NextResponse.json({
      todaySalesCount,
      totalVol: {
        USD: totalVol.USD.toFixed(2),
        ZAR: totalVol.ZAR.toFixed(2),
        ZIG: totalVol.ZIG.toFixed(2)
      },
      unclaimedLiability: {
        USD: unclaimedLiability.USD.toFixed(2),
        ZAR: unclaimedLiability.ZAR.toFixed(2),
        ZIG: unclaimedLiability.ZIG.toFixed(2)
      },
      platformFee: "10.00",
      recentTransactions,
      agentContact
    });
  } catch (err) {
    console.error('Stats error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
