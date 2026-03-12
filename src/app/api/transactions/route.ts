import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

function generateRandomToken() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function generateShortCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid ambiguous chars like I, O, 1, 0
  let code = '';
  // Mix of letters and numbers as requested. 1 letter + 4 numbers/letters
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
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

    // 2. Fetch merchant backpay percentage (default 4.00) and name
    const { data: merchant, error: merchantError } = await supabase
       .from('merchants')
       .select('backpay_percent, business_name')
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
    const shortCode = generateShortCode();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const { data: backpay, error: bpError } = await supabase
       .from('backpay_records')
       .insert({
          transaction_id: transaction.id,
          merchant_id: merchantId,
          customer_id: customerId,
          backpay_amount: backpayAmount,
          qr_token: qrToken,
          short_code: shortCode,
          expires_at: expiresAt.toISOString(),
          status: 'unclaimed',
          currency
       })
       .select('id, qr_token, short_code, backpay_amount, currency')
       .single();

    if (bpError) throw bpError;

    return NextResponse.json({ 
       success: true, 
       backpay_amount: backpay.backpay_amount, 
       qr_token: backpay.qr_token,
       short_code: backpay.short_code,
       currency: backpay.currency,
       merchant_name: merchant.business_name
    });

  } catch (err) {
    console.error('Transaction create error:', err);
    return NextResponse.json(
      { error: 'Failed to process transaction' },
      { status: 500 }
    );
  }
}
