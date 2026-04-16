import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    const cookie = cookies().get('returni_session')?.value;
    const session = await decrypt(cookie);
    // In strict env we'd require a session, but for the demo we'll let it slide or mock the ID
    const merchantId = session?.merchant_id || null;

    const { mobile, amount, channel, pin } = await req.json();

    // 1. PIN Check Security
    if (pin !== '1910') {
      return NextResponse.json({ error: 'Invalid Security PIN.' }, { status: 403 });
    }

    if (!mobile || !amount || !channel) {
      return NextResponse.json({ error: 'Mobile, amount, and channel are required.' }, { status: 400 });
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json({ error: 'Invalid amount.' }, { status: 400 });
    }

    // 2. Fetch current balance
    let currentBalance = 0.00;
    
    if (merchantId) {
      const { data, error } = await supabase!
        .from('merchants')
        .select('rllet_balance')
        .eq('id', merchantId)
        .single();
      if (!error && data) {
        currentBalance = parseFloat(data.rllet_balance || 0);
      }
    }

    // 3. Balance verification
    if (currentBalance < numericAmount) {
      return NextResponse.json({ error: 'Insufficient funds.' }, { status: 400 });
    }

    // 4. Processing Delay Simulation
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // 5. Update Supabase Database
    const newBalance = currentBalance - numericAmount;
    if (merchantId) {
      const { error: updateError } = await supabase!
        .from('merchants')
        .update({ rllet_balance: newBalance })
        .eq('id', merchantId);
        
      if (updateError) {
        throw new Error('Database update failed');
      }
    }

    // 6. Respond Success
    return NextResponse.json({
      success: true,
      message: `Successfully transferred $${numericAmount.toFixed(2)} USD via ${channel} to ${mobile}.`,
      transactionId: `ZB-MOCK-${Date.now()}`,
      status: 'completed',
      newBalance: newBalance,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
