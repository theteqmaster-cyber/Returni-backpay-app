import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createSession } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const { email, password, businessName } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('demo_merchants')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    // Create new demo merchant
    const { data: newUser, error: signUpError } = await supabase
      .from('demo_merchants')
      .insert([{ email, password, business_name: businessName }])
      .select()
      .single();

    if (signUpError || !newUser) {
      throw signUpError || new Error('Signup failed');
    }

    // Create session
    await createSession({
      id: newUser.id,
      role: 'merchant_user',
      merchant_id: newUser.id, // Store their ID as the merchant ID for the demo
    });

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        businessName: newUser.business_name,
        kycCompleted: newUser.kyc_completed
      }
    });

  } catch (err) {
    console.error('Demo Signup error:', err);
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
}
