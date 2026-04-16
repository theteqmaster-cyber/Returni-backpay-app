import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/session';

export async function GET() {
  try {
    const cookie = cookies().get('returni_session')?.value;
    const session = await decrypt(cookie);
    if (!session || !session.merchant_id) {
      // For demo testing if session is lost, fallback to a hardcoded ID or error. We'll return the default.
      return NextResponse.json({ amount: "0.00", currency: "USD", status: "active" });
    }

    const { data, error } = await supabase!
      .from('merchants')
      .select('rllet_balance')
      .eq('id', session.merchant_id)
      .single();

    if (error || !data) {
      console.warn('Could not fetch real balance from Supabase:', error);
      // Fallback
      return NextResponse.json({ amount: "0.00", currency: "USD", status: "active" });
    }

    return NextResponse.json({
      amount: Number(data.rllet_balance || 0).toFixed(2),
      currency: "USD",
      status: "active",
      lastUpdated: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch balance' }, { status: 500 });
  }
}
