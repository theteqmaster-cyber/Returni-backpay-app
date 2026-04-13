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
    const results = await Promise.all([
      // 0. Merchant details (agent_id, promotions, settings)
      supabase.from('merchants').select('agent_id, promo_text, promo_images, backpay_percent, backpay_expiry_days').eq('id', merchantId).single(),
      
      // 1. Today's sales count (Database-side count)
      supabase.from('transactions')
        .select('*', { count: 'exact', head: true })
        .eq('merchant_id', merchantId)
        .gte('created_at', today),

      // 2. Total Volume (Using RPC for DB-side aggregation)
      supabase.rpc('get_merchant_volume', { merchant_uuid: merchantId }),

      // 3. Unclaimed Liability (Using RPC for DB-side aggregation)
      supabase.rpc('get_merchant_liability', { merchant_uuid: merchantId }),

      // 4. Recent Transactions (Limited to 7 as requested)
      supabase.from('transactions')
        .select('id, amount, currency, payment_method, merchant_notes, created_at, backpay_records(backpay_amount, status)')
        .eq('merchant_id', merchantId)
        .order('created_at', { ascending: false })
        .limit(7),

      // 5. Redemption Stats
      supabase.from('backpay_records').select('status', { count: 'exact' }).eq('merchant_id', merchantId),

      // 6. Return Rate (New RPC)
      supabase.rpc('get_merchant_return_rate', { merchant_uuid: merchantId })
    ]);

    const merchantData = results[0].data;
    const mInfoError = results[0].error;
    const todaySalesCount = results[1].count;
    const countError = results[1].error;
    const volData = results[2].data;
    const volError = results[2].error;
    const liabilityData = results[3].data;
    const liabilityError = results[3].error;
    const recentTransactions = results[4].data;
    const txError = results[4].error;
    const redemptionData = results[5].data;
    const redemptionError = results[5].error;
    const returnRateData = results[6].data;
    const returnRateError = results[6].error;

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
       return NextResponse.json({ error: `Volume calculation failed: ${volError.message}` }, { status: 500 });
    }
    if (liabilityError) {
       console.error('Liability RPC Error:', liabilityError);
       return NextResponse.json({ error: `Liability calculation failed: ${liabilityError.message}` }, { status: 500 });
    }
    if (txError) {
       console.error('Transactions Error:', txError);
       return NextResponse.json({ error: 'Failed to fetch recent transactions' }, { status: 500 });
    }
    if (redemptionError) {
        console.error('Redemption Error:', redemptionError);
    }
    if (returnRateError) {
        console.error('Return Rate Error:', returnRateError);
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

    // Calculate Redemption Rate
    const totalIssued = results[5].count || 0;
    const redeemedCount = results[5].data?.filter((r: any) => r.status === 'claimed').length || 0;
    const redemptionRate = totalIssued > 0 ? (redeemedCount / totalIssued) * 100 : 0;

    // 6. Daily Sales Counts (Last 6 Days)
    const sixDaysAgo = new Date();
    sixDaysAgo.setDate(sixDaysAgo.getDate() - 5);
    sixDaysAgo.setHours(0,0,0,0);

    const { data: dailyCounts } = await supabase
       .from('transactions')
       .select('created_at')
       .eq('merchant_id', merchantId)
       .gte('created_at', sixDaysAgo.toISOString())
       .order('created_at', { ascending: true });

    const dailySalesArr = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 0; i < 6; i++) {
       const d = new Date();
       d.setDate(d.getDate() - (5 - i));
       const dayName = days[d.getDay()];
       const dateStr = d.toISOString().split('T')[0];
       
       const count = dailyCounts?.filter(tx => tx.created_at.startsWith(dateStr)).length || 0;
       dailySalesArr.push({ day: dayName, count });
    }

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
      redemptionRate: redemptionRate.toFixed(1),
      returnRate: Number(returnRateData || 0).toFixed(1),
      platformFee: "10.00",
      recentTransactions: recentTransactions || [],
      dailySales: dailySalesArr,
      agentContact,
      merchant: {
        promo_text: merchantData?.promo_text,
        promo_images: merchantData?.promo_images,
        backpay_percent: merchantData?.backpay_percent,
        backpay_expiry_days: merchantData?.backpay_expiry_days
      }
    });
  } catch (err) {
    console.error('Stats error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
