import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!supabase) return NextResponse.json({ error: 'DB error' }, { status: 503 });

  try {
    const { data: merchant, error } = await supabase
      .from('merchants')
      .select(`
        *,
        owner:users!owner_user_id(email, full_name),
        agent:agents!agent_id(users!user_id(full_name)),
        trader:traders!trader_id(users!user_id(full_name))
      `)
      .eq('id', params.id)
      .single();

    if (error) throw error;
    return NextResponse.json(merchant);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch merchant' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!supabase) return NextResponse.json({ error: 'DB error' }, { status: 503 });

  try {
    const body = await request.json();
    const { trader_id, agent_id, backpay_percent } = body;

    const { data: merchant, error } = await supabase
      .from('merchants')
      .update({
        trader_id: trader_id === undefined ? undefined : (trader_id === "" ? null : trader_id),
        agent_id: agent_id === undefined ? undefined : (agent_id === "" ? null : agent_id),
        backpay_percent: backpay_percent === undefined ? undefined : Number(backpay_percent)
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, merchant });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
