import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Helper to get YYYY-MM-DD in a specific timezone (Harare/CAT +/- 2)
function getLocalDateString(date: Date) {
  // We'll use a simple offset-based approach or just string manipulation for stability
  // Offset by 2 hours for Central Africa Time (CAT) if needed, but standard local is safer for mostly local servers.
  return date.toLocaleDateString('en-CA'); // en-CA returns YYYY-MM-DD
}

export async function GET(request: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const traderId = searchParams.get('traderId');

    if (!traderId) {
      return NextResponse.json({ error: 'Missing traderId' }, { status: 400 });
    }

    // 1. Get all merchants for this trader
    const { data: merchants, error: mError } = await supabase
      .from('merchants')
      .select('id, name, business_name')
      .eq('trader_id', traderId);

    if (mError) throw mError;
    
    // Default Empty Data Baseline (6 days of 0s)
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const emptyDailySales = [];
    const today = new Date();
    for (let i = 0; i < 6; i++) {
       const d = new Date();
       d.setDate(d.getDate() - (5 - i));
       emptyDailySales.push({ day: days[d.getDay()], count: 0 });
    }

    if (!merchants || merchants.length === 0) {
      return NextResponse.json({
        todaySalesCount: 0,
        totalVol: { USD: "0.00", ZAR: "0.00", ZIG: "0.00" },
        dailySales: emptyDailySales,
        merchants: [],
        recentTransactions: [],
        hasMore: false,
        growth: 0,
        platformFee: "20.00"
      });
    }

    const merchantIds = merchants.map(m => m.id);

    // 2. Aggregate Today's Sales
    const startOfToday = new Date();
    startOfToday.setHours(0,0,0,0);
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);

    const { data: allTxs, error: txError } = await supabase
      .from('transactions')
      .select('id, amount, currency, created_at, merchant_id')
      .in('merchant_id', merchantIds)
      .order('created_at', { ascending: false });

    if (txError) throw txError;

    const todayTxs = allTxs?.filter(tx => new Date(tx.created_at) >= startOfToday) || [];
    const yesterdayTxs = allTxs?.filter(tx => {
      const d = new Date(tx.created_at);
      return d >= startOfYesterday && d < startOfToday;
    }) || [];

    const todayCount = todayTxs.length;
    const yesterdayCount = yesterdayTxs.length;
    const growth = yesterdayCount === 0 ? (todayCount > 0 ? 100 : 0) : Math.round(((todayCount - yesterdayCount) / yesterdayCount) * 100);

    // 3. Aggregate Total Volume
    const totalVol = { USD: 0, ZAR: 0, ZIG: 0 };
    allTxs?.forEach(tx => {
      const cur = (tx.currency || 'USD') as 'USD' | 'ZAR' | 'ZIG';
      if (totalVol.hasOwnProperty(cur)) {
        totalVol[cur] += Number(tx.amount || 0);
      }
    });

    // 4. Daily Pulse (Last 6 Days Aggregated)
    const sixDaysAgo = new Date(startOfToday);
    sixDaysAgo.setDate(sixDaysAgo.getDate() - 5);

    const pulseTxs = allTxs?.filter(tx => new Date(tx.created_at) >= sixDaysAgo) || [];
    const dailySalesArr = [];
    
    for (let i = 0; i < 6; i++) {
       const d = new Date();
       d.setDate(d.getDate() - (5 - i));
       const dayName = days[d.getDay()];
       const dateStr = getLocalDateString(d); // Robust YYYY-MM-DD
       
       const count = pulseTxs.filter(tx => {
         const txDate = new Date(tx.created_at);
         return getLocalDateString(txDate) === dateStr;
       }).length;
       
       dailySalesArr.push({ day: dayName, count });
    }

    // 5. Branch Performance & Live Indicators
    const branchStats = merchants.map(m => {
       const branchTxs = allTxs?.filter(tx => (tx as any).merchant_id === m.id) || [];
       const branchToday = branchTxs.filter(tx => new Date(tx.created_at) >= startOfToday).length;
       const branchTotal = branchTxs.reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
       const lastTx = branchTxs[0]; 
       
       return {
          id: m.id,
          name: m.name,
          business_name: m.business_name,
          todayCount: branchToday,
          totalVolume: branchTotal.toFixed(2),
          lastActive: lastTx ? lastTx.created_at : null
       };
    });

    // 6. Recent Portfolio Transactions (Paginated)
    const page = parseInt(searchParams.get('page') || '0');
    const limit = 10;
    const start = page * limit;
    const end = start + limit;

    const recentPortfolioTxs = allTxs?.slice(start, end).map(tx => {
       const branch = merchants.find(m => m.id === (tx as any).merchant_id);
       return {
          ...tx,
          branch_name: branch ? branch.business_name : 'Unknown Branch'
       };
    }) || [];

    return NextResponse.json({
      todaySalesCount: todayCount,
      totalVol: {
        USD: totalVol.USD.toFixed(2),
        ZAR: totalVol.ZAR.toFixed(2),
        ZIG: totalVol.ZIG.toFixed(2)
      },
      dailySales: dailySalesArr,
      merchants: branchStats,
      recentTransactions: recentPortfolioTxs,
      hasMore: (allTxs?.length || 0) > end,
      growth,
      platformFee: "20.00"
    });

  } catch (err) {
    console.error('Trader stats error:', err);
    return NextResponse.json({ error: 'Failed to fetch trader stats' }, { status: 500 });
  }
}
