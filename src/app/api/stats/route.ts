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
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekStart = weekAgo.toISOString().split('T')[0];

    const { data: visits, error: visitsError } = await supabase
      .from('visits')
      .select('id, created_at, points_earned')
      .eq('merchant_id', merchantId)
      .order('created_at', { ascending: false });

    if (visitsError) throw visitsError;

    const totalVisits = visits?.length ?? 0;
    const todayVisits = visits?.filter((v) => v.created_at.startsWith(today)).length ?? 0;
    const weekVisits = visits?.filter((v) => v.created_at >= weekStart).length ?? 0;
    const totalPointsGiven = visits?.reduce((s, v) => s + (v.points_earned || 0), 0) ?? 0;

    const { data: uniqueCustomers } = await supabase
      .from('visits')
      .select('customer_id')
      .eq('merchant_id', merchantId);

    const uniqueCount = new Set(uniqueCustomers?.map((c) => c.customer_id) ?? []).size;

    const recentVisits = visits?.slice(0, 10) ?? [];

    return NextResponse.json({
      totalVisits,
      todayVisits,
      weekVisits,
      totalPointsGiven,
      uniqueCustomers: uniqueCount,
      recentVisits,
    });
  } catch (err) {
    console.error('Stats error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
