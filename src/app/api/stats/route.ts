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

    // Parallelize all independent database queries
    const [
      { data: merchantData, error: mInfoError },
      { count: todaySalesCount, error: countError },
      { data: volData, error: volError },
      { data: liabilityData, error: liabilityError },
      { data: recentTransactions, error: txError }
    ] = await Promise.all([
      // 1. Merchant details (agent_id)
      supabase.from('merchants').select('agent_id').eq('id', merchantId).single(),
      
      // 2. Today's sales count (Database-side count)
      supabase.from('transactions')
        .select('*', { count: 'exact', head: true })
        .eq('merchant_id', merchantId)
        .gte('created_at', today),

      // 3. Total Volume (Using RPC for DB-side aggregation)
      supabase.rpc('get_merchant_volume', { merchant_uuid: merchantId }),

      // 4. Unclaimed Liability (Using RPC for DB-side aggregation)
      supabase.rpc('get_merchant_liability', { merchant_uuid: merchantId }),

      // 5. Recent Transactions (Limited to 7 as requested)
      supabase.from('transactions')
        .select('id, amount, currency, payment_method, merchant_notes, created_at')
        .eq('merchant_id', merchantId)
        .order('created_at', { ascending: false })
        .limit(7)
    ]);

    if (mInfoError) {
      console.error('Merchant Info Error:', mInfoError);
      return NextResponse.json({ error: 'Failed to fetch merchant details' }, { status: 500 });
    }
    if (countError) {
       console.error('Sales Count Error:', countError);
       return NextResponse.json({ error: 'Failed to fetch sales count' }, { status: 500 });
    }
    if (volError) {
       console.error('Volume RPC Error:', volError);
       return NextResponse.json({ error: `Volume calculation failed: ${volError.message}. Ensure optimized stats functions are applied.` }, { status: 500 });
    }
    if (liabilityError) {
       console.error('Liability RPC Error:', liabilityError);
       return NextResponse.json({ error: `Liability calculation failed: ${liabilityError.message}. Ensure optimized stats functions are applied.` }, { status: 500 });
    }
    if (txError) {
       console.error('Transactions Error:', txError);
       return NextResponse.json({ error: 'Failed to fetch recent transactions' }, { status: 500 });
    }

    // Fetch agent contact if needed
    let agentContact = null;
    if (merchantData?.agent_id) {
       const { data: agentData } = await supabase
         .from('agents')
         .select('users!user_id(full_name, email, phone)')
         .eq('id', merchantData.agent_id)
         .single();
         
       if (agentData?.users) {
          agentContact = agentData.users;
       }
    }

    // Process volume and liability data from RPC
    const totalVol = { USD: 0, ZAR: 0, ZIG: 0 };
    volData?.forEach((row: any) => {
      const cur = (row.currency || 'USD') as 'USD' | 'ZAR' | 'ZIG';
      if (totalVol.hasOwnProperty(cur)) {
        totalVol[cur] = Number(row.total_amount || 0);
      }
    });

    const unclaimedLiability = { USD: 0, ZAR: 0, ZIG: 0 };
    liabilityData?.forEach((row: any) => {
      const cur = (row.currency || 'USD') as 'USD' | 'ZAR' | 'ZIG';
      if (unclaimedLiability.hasOwnProperty(cur)) {
        unclaimedLiability[cur] = Number(row.total_liability || 0);
      }
    });

    return NextResponse.json({
      todaySalesCount: todaySalesCount || 0,
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
      recentTransactions: recentTransactions || [],
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
