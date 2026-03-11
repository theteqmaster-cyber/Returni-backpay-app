import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

function generateRandomToken() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export async function POST(request: NextRequest) {
  try {
    const { amount, phone, merchantId, currency = 'USD', payment_method = 'CASH', merchantNotes } = await request.json();

    if (!amount || !phone || !merchantId) {
       return NextResponse.json({ error: 'Missing amount, phone, or merchantId' }, { status: 400 });
    }

    if (!supabase) {
       return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    // 1. Find or create the customer by phone
    let customerId = '';
    const { data: existingCustomer } = await supabase
       .from('customers')
       .select('id')
       .eq('phone', phone)
       .maybeSingle();

    if (existingCustomer) {
       customerId = existingCustomer.id;
    } else {
       const { data: newCustomer, error: createError } = await supabase
          .from('customers')
          .insert({ phone })
          .select('id')
          .single();
       if (createError) throw createError;
       customerId = newCustomer.id;
    }

    // 2. Fetch merchant backpay percentage (default 4.00)
    const { data: merchant, error: merchantError } = await supabase
       .from('merchants')
       .select('backpay_percent')
       .eq('id', merchantId)
       .single();

    if (merchantError || !merchant) {
       return NextResponse.json({ error: 'Merchant not found' }, { status: 404 });
    }

    const backpayPercent = parseFloat(merchant.backpay_percent?.toString() || '4.00');
    const backpayAmount = (parseFloat(amount) * (backpayPercent / 100)).toFixed(2);

    // 3. Create transaction record
    const { data: transaction, error: txError } = await supabase
       .from('transactions')
       .insert({
          merchant_id: merchantId,
          customer_id: customerId,
          amount: parseFloat(amount),
          currency,
          payment_method,
          merchant_notes: merchantNotes || null
       })
       .select('id')
       .single();
    
    if (txError) throw txError;

    // 4. Create BackpayRecord
    const qrToken = generateRandomToken();
    const { data: backpay, error: bpError } = await supabase
       .from('backpay_records')
       .insert({
          transaction_id: transaction.id,
          merchant_id: merchantId,
          customer_id: customerId,
          backpay_amount: backpayAmount,
          qr_token: qrToken,
          status: 'unclaimed', // expires_at can be set to +30 days if desired
          currency
       })
       .select('id, qr_token, backpay_amount, currency')
       .single();

    if (bpError) throw bpError;

    return NextResponse.json({ 
       success: true, 
       backpay_amount: backpay.backpay_amount, 
       qr_token: backpay.qr_token,
       currency: backpay.currency
    });

  } catch (err) {
    console.error('Transaction create error:', err);
    return NextResponse.json(
      { error: 'Failed to process transaction' },
      { status: 500 }
    );
  }
}
