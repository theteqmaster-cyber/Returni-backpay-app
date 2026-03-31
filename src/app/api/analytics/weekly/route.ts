import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const merchantId = searchParams.get('merchantId');
  const page = parseInt(searchParams.get('page') || '0');
  const limit = 4;
  const offset = page * limit;

  if (!merchantId) {
    return NextResponse.json({ error: 'Missing merchantId' }, { status: 400 });
  }

  // Get merchant details to verify existence
  const { data: merchantData } = await supabase
    .from('merchants')
    .select('id')
    .eq('id', merchantId)
    .single();

  if (!merchantData) {
    return NextResponse.json({ error: 'Merchant not found' }, { status: 404 });
  }

  // Calculate the dates for the weeks
  const today = new Date();
  const currentSun = new Date(today);
  currentSun.setDate(today.getDate() - today.getDay());
  currentSun.setHours(0,0,0,0);

  const weeks = [];
  const daysArr = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = 0; i < limit; i++) {
    const weekIndex = offset + i;
    const weekSun = new Date(currentSun);
    weekSun.setDate(currentSun.getDate() - (weekIndex * 7));
    
    const weekSat = new Date(weekSun);
    weekSat.setDate(weekSun.getDate() + 6);
    weekSat.setHours(23,59,59,999);

    // Query transactions for this week
    const { data: txs, error: txError } = await supabase
      .from('transactions')
      .select('created_at, amount')
      .eq('merchant_id', merchantId)
      .gte('created_at', weekSun.toISOString())
      .lte('created_at', weekSat.toISOString())
      .order('created_at', { ascending: true });

    if (txError) {
      console.error('Error fetching weekly txs:', txError);
      continue;
    }

    // Process daily counts
    const dailyData: { day: string; count: number; totalLine: number }[] = [];
    let weekTotal = 0;
    for (let d = 0; d < 7; d++) {
       const targetDate = new Date(weekSun);
       targetDate.setDate(weekSun.getDate() + d);
       const dateStr = targetDate.toISOString().split('T')[0];
       
       const dayTxs = (txs || []).filter((t: { created_at: string }) => t.created_at.startsWith(dateStr));
       const count = dayTxs.length;
       const daySum = dayTxs.reduce((sum: number, t: { amount: string }) => sum + parseFloat(t.amount || '0'), 0);
       
       dailyData.push({ day: daysArr[d], count, totalLine: daySum });
       weekTotal += daySum;
    }

    weeks.push({
      label: `Week ${weekIndex + 1}`,
      dateRange: `${weekSun.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekSat.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      totalSales: weekTotal.toFixed(2),
      totalCount: txs?.length || 0,
      days: dailyData,
      weekStart: weekSun.toISOString()
    });
  }

  return NextResponse.json({
    weeks,
    hasMore: weeks.some(w => w.totalCount > 0) || weeks.length === limit,
    nextPage: page + 1
  });
}
