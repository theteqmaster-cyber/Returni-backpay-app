import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  if (!supabase) return NextResponse.json({ error: 'DB error' }, { status: 503 });
  
  try {
    const { data: merchants, error } = await supabase
      .from('merchants')
      .select(`
         id, name, business_name, email, phone, backpay_percent,
         owner:users!owner_user_id(email, full_name),
         agent:agents!agent_id(users!user_id(full_name))
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return NextResponse.json(merchants);
  } catch (err) {
    console.error('Fetch merchants error:', err);
    return NextResponse.json({ error: 'Failed to fetch merchants' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!supabase) return NextResponse.json({ error: 'DB error' }, { status: 503 });

  try {
    const body = await request.json();
    const { name, business_name, email, phone, agent_id, backpay_percent } = body;

    if (!name || !business_name || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Create User account first so they can log in
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
         full_name: name,
         email: email,
         phone: phone,
         role: 'merchant_user'
      })
      .select('id')
      .single();

    if (userError) throw userError;

    // 2. Create the Merchant profile linked to the new user and optionally an Agent
    const { data: merchant, error: merchantError } = await supabase
      .from('merchants')
      .insert({
         name,
         business_name,
         email,
         phone,
         owner_user_id: newUser.id,
         agent_id: agent_id || null,
         backpay_percent: backpay_percent ? Number(backpay_percent) : 3
      })
      .select('*')
      .single();

    if (merchantError) throw merchantError;

    return NextResponse.json({ success: true, merchant });
  } catch (err: any) {
    console.error('Create merchant error:', err);
    return NextResponse.json({ error: err.message || 'Failed to create merchant' }, { status: 500 });
  }
}
