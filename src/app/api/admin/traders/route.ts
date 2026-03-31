import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 503 });

  try {
    const { data: traders, error } = await supabase
      .from('traders')
      .select(`
        id,
        user_id,
        created_at,
        users:user_id (full_name, email, phone),
        merchants:merchants(id)
      `);

    if (error) throw error;

    // Enhance with branch count
    const enhanced = traders.map(t => ({
       ...t,
       branchCount: t.merchants?.length || 0
    }));

    return NextResponse.json(enhanced);
  } catch (err) {
    console.error('Fetch traders error:', err);
    return NextResponse.json({ error: 'Failed to fetch traders' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 503 });

  try {
    const { name, email, phone } = await request.json();

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email required' }, { status: 400 });
    }

    // 1. Create a user (Role: trader)
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        full_name: name,
        email,
        phone,
        role: 'trader'
      })
      .select()
      .single();

    if (userError) throw userError;

    // 2. Create the trader profile
    const { data: trader, error: traderError } = await supabase
      .from('traders')
      .insert({ user_id: user.id })
      .select()
      .single();

    if (traderError) throw traderError;

    return NextResponse.json({ success: true, trader_id: trader.id, user_id: user.id });
  } catch (err: any) {
    console.error('Create trader error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
