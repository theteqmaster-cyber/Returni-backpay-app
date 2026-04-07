import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const merchantId = searchParams.get('merchantId');

  if (!merchantId) {
    return NextResponse.json({ error: 'Merchant ID required' }, { status: 400 });
  }

  try {
    // 1. Fetch merchant data
    const { data: merchant, error: mError } = await supabase
      .from('demo_merchants')
      .select('usd_balance, zig_balance')
      .eq('id', merchantId)
      .single();

    if (mError) throw mError;

    // 2. Fetch recent transactions
    const { data: transactions, error: txError } = await supabase
      .from('demo_wallet_transactions')
      .select('*')
      .eq('merchant_id', merchantId)
      .order('created_at', { ascending: false });

    if (txError) throw txError;

    if (transactions.length === 0) {
        return NextResponse.json({
            score: 410,
            level: 'New Account',
            insights: [
                { title: 'Fresh Node', body: 'This merchant node is new. Process your first client settlement to start building history.', type: 'positive' },
                { title: 'Credit Potential', body: 'Add inventory assets to demonstrate business ownership and liquidity.', type: 'positive' }
            ]
        });
    }

    // 3. Analytics Engine Logic
    let score = 550; // Starting base score
    const insights = [];

    // Balance factors
    const totalUsdValue = Number(merchant.usd_balance) + (Number(merchant.zig_balance) / 25);
    if (totalUsdValue > 1000) {
      score += 120;
      insights.push({ title: 'Liquidity Surplus', body: 'Your treasury reserves are healthy. Consider expanding your inventory node.', type: 'positive' });
    } else if (totalUsdValue > 100) {
      score += 60;
      insights.push({ title: 'Stable Reserves', body: 'Good liquidity balance. Keep consistent settlements to maintain score.', type: 'positive' });
    } else {
      score -= 40;
      insights.push({ title: 'Treasury Alert', body: 'Current liquidity is below recommended operating threshold. Consider ZB Quick-Refill.', type: 'warning' });
    }

    // Category analysis
    const categories = transactions.map(t => t.category);
    const supplierCount = categories.filter(c => c === 'Supplier').length;
    const clientCount = categories.filter(c => c === 'Client').length;
    const personalCount = categories.filter(c => c === 'Personal').length;

    if (supplierCount > 2) {
      score += 80;
      insights.push({ title: 'B2B Trust', body: 'Strong supplier settlement history. You are prioritized for inventory-backed financing.', type: 'positive' });
    }

    if (clientCount > 0) {
      score += Math.min(clientCount * 20, 100); // Reward for sales activity
      insights.push({ title: 'Retail Velocity', body: 'Active client settlements detected. Your reliability index is growing.', type: 'positive' });
    }

    if (personalCount > (transactions.length / 2) && personalCount > 0) {
      score -= 50;
      insights.push({ title: 'Diversification Alert', body: 'High personal outflow detected. Reallocating to B2B categories will improve credit scores.', type: 'warning' });
    }

    // Transaction volume factor
    if (transactions.length > 5) {
      score += 30;
    }

    const level = score > 750 ? 'Excellent' : score > 650 ? 'Good' : score > 550 ? 'Fair' : 'Needs Work';

    return NextResponse.json({
      score: Math.min(score, 850),
      level,
      insights: insights.slice(0, 3) // Max 3 for the dashboard
    });

  } catch (error: any) {
    console.error('Vest AI API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
