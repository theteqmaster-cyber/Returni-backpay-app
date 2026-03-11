import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { token, merchantId } = await request.json();

    if (!token || !merchantId) {
      return NextResponse.json({ error: 'Missing token or merchantId' }, { status: 400 });
    }

    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    // Lookup unclaimed backpay record
    const { data: record, error: lookupError } = await supabase
      .from('backpay_records')
      .select('id, status, backpay_amount, transaction_id, customer_id, currency')
      .eq('qr_token', token)
      .single();

    if (lookupError || !record) {
      return NextResponse.json({ error: 'Invalid or expired QR code' }, { status: 404 });
    }

    if (record.status !== 'unclaimed') {
      return NextResponse.json({ error: `This backpay reward has already been ${record.status}` }, { status: 400 });
    }

    // Mark as claimed and create audit trail
    const { error: updateError } = await supabase
      .from('backpay_records')
      .update({ status: 'claimed', claimed_at: new Date().toISOString() })
      .eq('id', record.id);

    if (updateError) throw updateError;

    const { error: claimError } = await supabase
      .from('backpay_claims')
      .insert({
        backpay_record_id: record.id,
        claimed_by_merchant_id: merchantId,
        currency: record.currency || 'USD'
      });

    if (claimError) console.error('Failed to write claim audit record', claimError);

    return NextResponse.json({ 
      success: true, 
      message: `Successfully claimed ${record.currency === 'ZAR' ? 'ZAR ' : record.currency === 'ZIG' ? 'ZiG ' : '$'}${record.backpay_amount} return backpay.`,
      amount_claimed: record.backpay_amount,
      currency: record.currency
    });

  } catch (err) {
    console.error('Claim processing error:', err);
    return NextResponse.json(
      { error: 'Failed to process backpay claim' },
      { status: 500 }
    );
  }
}
