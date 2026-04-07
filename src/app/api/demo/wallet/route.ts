import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const merchantId = searchParams.get('merchantId');

  if (!merchantId) {
    return NextResponse.json({ error: 'Merchant ID is required' }, { status: 400 });
  }

  try {
    // Get merchant info
    const { data: merchant, error: merchantError } = await supabase
      .from('demo_merchants')
      .select('usd_balance, zig_balance')
      .eq('id', merchantId)
      .single();

    if (merchantError) throw merchantError;

    // Get last 10 transactions
    const { data: transactions, error: txError } = await supabase
      .from('demo_wallet_transactions')
      .select('*')
      .eq('merchant_id', merchantId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (txError) throw txError;

    return NextResponse.json({
      balances: {
        USD: merchant.usd_balance || 0,
        ZiG: merchant.zig_balance || 0
      },
      transactions
    });

  } catch (error: any) {
    console.error('Wallet API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { merchantId, type, amount, currency, description, provider, phoneNumber, category } = await request.json();

    if (!merchantId || !type || !amount || !currency) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Determine balance update direction
    const balanceField = currency === 'USD' ? 'usd_balance' : 'zig_balance';
    const multiplier = type === 'receive' ? 1 : -1;
    const finalAmount = Number(amount) * multiplier;

    // Determine final description
    const finalDescription = description || `${provider || 'External'} ${type === 'payment' ? 'Settlement' : 'Transfer'}`;

    // Update balances
    // For demo simplicity, we'll fetch and update directly
    const { data: current, error: getError } = await supabase
        .from('demo_merchants')
        .select('*')
        .eq('id', merchantId)
        .single();
    
    if (getError) throw getError;
    
    const currentBalance = Number(current[balanceField as keyof typeof current]);
    const newBalance = currentBalance + finalAmount;
    
    const { error: putError } = await supabase
        .from('demo_merchants')
        .update({ [balanceField]: newBalance })
        .eq('id', merchantId);
    
    if (putError) throw putError;

    // Record the transaction
    const { data: transaction, error: insertError } = await supabase
        .from('demo_wallet_transactions')
        .insert({
            merchant_id: merchantId,
            type,
            amount: Number(amount),
            currency,
            description: finalDescription,
            provider: provider || 'Returni Wallet',
            phone_number: phoneNumber,
            category: category || 'Internal',
            status: 'completed'
        })
        .select()
        .single();

    if (insertError) throw insertError;

    return NextResponse.json({ success: true, transaction });

  } catch (error: any) {
    console.error('Wallet Action API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
