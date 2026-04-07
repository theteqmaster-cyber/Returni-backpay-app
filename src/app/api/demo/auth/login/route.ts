import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createSession } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    // Lookup demo merchant
    const { data: user, error: userError } = await supabase
      .from('demo_merchants')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Create session
    await createSession({
      id: user.id,
      role: 'demo_merchant',
      merchant_id: user.id,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        businessName: user.business_name,
        kycCompleted: user.kyc_completed
      }
    });

  } catch (err) {
    console.error('Demo Login error:', err);
    return NextResponse.json({ error: 'Failed to authenticate' }, { status: 500 });
  }
}
