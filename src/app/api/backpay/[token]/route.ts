import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  const token = params.token;

  if (!supabase) {
    return NextResponse.json({ error: 'DB error' }, { status: 503 });
  }

  try {
    // Lookup the backpay record by token (qr_token)
    const { data: backpay, error: bpError } = await supabase
      .from('backpay_records')
      .select(`
        id,
        backpay_amount,
        currency,
        status,
        created_at,
        expires_at,
        short_code,
        transactions (
          amount,
          merchant_notes,
          merchants (
            business_name
          )
        )
      `)
      .eq('qr_token', token)
      .single();

    if (bpError || !backpay) {
      return NextResponse.json({ error: 'Receipt not found' }, { status: 404 });
    }

    const tx = (backpay.transactions as any);
    const merchant = tx?.merchants;

    return NextResponse.json({
      merchant_name: merchant?.business_name || 'Merchant',
      date: backpay.created_at,
      amount: tx?.amount,
      currency: backpay.currency,
      notes: tx?.merchant_notes,
      backpay_amount: backpay.backpay_amount,
      status: backpay.status,
      expires_at: backpay.expires_at,
      short_code: backpay.short_code
    });

  } catch (err: any) {
    console.error('Fetch e-receipt error:', err);
    return NextResponse.json({ error: 'Failed to load receipt details' }, { status: 500 });
  }
}
