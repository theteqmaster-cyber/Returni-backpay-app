import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const POINTS_PER_VISIT = 10;

export async function POST(request: NextRequest) {
  if (!supabase) {
    return NextResponse.json(
      { error: 'Database not configured.' },
      { status: 503 }
    );
  }
  try {
    const body = await request.json();
    const { merchantId, customerPhone, pointsEarned = POINTS_PER_VISIT } = body;

    if (!merchantId || !customerPhone) {
      return NextResponse.json(
        { error: 'Missing merchantId or customerPhone' },
        { status: 400 }
      );
    }

    const phone = customerPhone.replace(/\D/g, '').slice(-9);
    if (phone.length < 9) {
      return NextResponse.json(
        { error: 'Invalid phone number' },
        { status: 400 }
      );
    }

    const fullPhone = phone.startsWith('0') ? phone : `0${phone}`;

    let { data: customer, error: custError } = await supabase
      .from('customers')
      .select('id')
      .eq('phone', fullPhone)
      .single();

    if (custError || !customer) {
      const { data: newCustomer, error: insertError } = await supabase
        .from('customers')
        .insert({ phone: fullPhone })
        .select('id')
        .single();

      if (insertError) {
        const { data: existing } = await supabase
          .from('customers')
          .select('id')
          .eq('phone', fullPhone)
          .single();
        customer = existing;
        if (!customer) throw insertError;
      } else {
        customer = newCustomer;
      }
    }

    const { error: visitError } = await supabase.from('visits').insert({
      merchant_id: merchantId,
      customer_id: customer.id,
      points_earned: pointsEarned,
    });

    if (visitError) throw visitError;

    const { data: pointsRow } = await supabase
      .from('customer_points')
      .select('id, points')
      .eq('merchant_id', merchantId)
      .eq('customer_id', customer.id)
      .single();

    if (pointsRow) {
      await supabase
        .from('customer_points')
        .update({
          points: pointsRow.points + pointsEarned,
          updated_at: new Date().toISOString(),
        })
        .eq('id', pointsRow.id);
    } else {
      await supabase.from('customer_points').insert({
        merchant_id: merchantId,
        customer_id: customer.id,
        points: pointsEarned,
      });
    }

    const { data: updated } = await supabase
      .from('customer_points')
      .select('points')
      .eq('merchant_id', merchantId)
      .eq('customer_id', customer.id)
      .single();

    return NextResponse.json({
      success: true,
      customerId: customer.id,
      pointsEarned,
      totalPoints: updated?.points ?? pointsEarned,
    });
  } catch (err) {
    console.error('Visit error:', err);
    return NextResponse.json(
      { error: 'Failed to record visit' },
      { status: 500 }
    );
  }
}
