import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createSession } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    // Lookup user by email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (userError || !user) {
      // In a real app we'd just return generic 401. For MVP we can be descriptive.
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Role-specific lookups to store ID in session
    let merchantId = undefined;
    let agentId = undefined;
    let traderId = undefined;

    if (user.role === 'merchant_user') {
      const { data: merchant } = await supabase
        .from('merchants')
        .select('id')
        .eq('owner_user_id', user.id)
        .single();
      if (merchant) merchantId = merchant.id;
    } else if (user.role === 'agent') {
      const { data: agent } = await supabase
        .from('agents')
        .select('id')
        .eq('user_id', user.id)
        .single();
      if (agent) agentId = agent.id;
    } else if (user.role === 'trader') {
      const { data: trader } = await supabase
        .from('traders')
        .select('id')
        .eq('user_id', user.id)
        .single();
      if (trader) traderId = trader.id;
    }

    // Create secure session
    await createSession({
      id: user.id,
      role: user.role,
      merchant_id: merchantId,
      agent_id: agentId,
      trader_id: traderId,
    });

    return NextResponse.json({
      success: true,
      role: user.role,
      full_name: user.full_name,
      merchant_id: merchantId,
      agent_id: agentId,
      trader_id: traderId
    });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json(
      { error: 'Failed to authenticate' },
      { status: 500 }
    );
  }
}
