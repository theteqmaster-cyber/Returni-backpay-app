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
    const { amount, phone, merchantId, currency = 'USD', payment_method = 'CASH', merchantNotes, manual_backpay_amount } = await request.json();

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
    // 2. Fetch merchant backpay percentage (default 4.00), name, and promotions
    const { data: merchant, error: merchantError } = await supabase
       .from('merchants')
       .select('backpay_percent, business_name, promo_text, backpay_expiry_days')
       .eq('id', merchantId)
       .single();

    if (merchantError || !merchant) {
       return NextResponse.json({ error: 'Merchant not found' }, { status: 404 });
    }

    const backpayPercent = parseFloat(merchant.backpay_percent?.toString() || '0.00') || 0.00;
    let backpayAmount = (parseFloat(amount || '0') * (backpayPercent / 100)).toFixed(2);
    
    // Override with manual amount if provided
    if (manual_backpay_amount !== undefined && manual_backpay_amount !== null && manual_backpay_amount !== '') {
       const manualParsed = parseFloat(manual_backpay_amount);
       if (!isNaN(manualParsed)) {
          backpayAmount = manualParsed.toFixed(2);
       }
    }
    
    // Final NaN safeguard
    if (isNaN(parseFloat(backpayAmount))) {
       backpayAmount = "0.00";
    }

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
    const expiryDays = merchant?.backpay_expiry_days || 7;
    expiresAt.setDate(expiresAt.getDate() + expiryDays);

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
       merchant_name: merchant.business_name,
       promo_text: merchant.promo_text || ''
    });

  } catch (err) {
    console.error('Transaction create error:', err);
    return NextResponse.json(
      { error: 'Failed to process transaction' },
      { status: 500 }
    );
  }
}
