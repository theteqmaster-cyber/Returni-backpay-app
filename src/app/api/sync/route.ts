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
    const { merchantId, pendingVisits } = body;

    if (!merchantId || !Array.isArray(pendingVisits) || pendingVisits.length === 0) {
      return NextResponse.json(
        { error: 'Missing merchantId or pendingVisits array' },
        { status: 400 }
      );
    }

    const results: { id: number; success: boolean; error?: string }[] = [];

    for (const visit of pendingVisits) {
      const { id, customerPhone, pointsEarned = POINTS_PER_VISIT } = visit;

      try {
        const phone = (customerPhone || '').replace(/\D/g, '').slice(-9);
        const fullPhone = phone.length >= 9 ? (phone.startsWith('0') ? phone : `0${phone}`) : customerPhone;

        let { data: customer } = await supabase
          .from('customers')
          .select('id')
          .eq('phone', fullPhone)
          .single();

        if (!customer) {
          const { data: newCustomer } = await supabase
            .from('customers')
            .insert({ phone: fullPhone })
            .select('id')
            .single();
          customer = newCustomer;
        }

        if (!customer) {
          results.push({ id, success: false, error: 'Failed to get/create customer' });
          continue;
        }

        await supabase.from('visits').insert({
          merchant_id: merchantId,
          customer_id: customer.id,
          points_earned: pointsEarned,
        });

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

        results.push({ id, success: true });
      } catch (e) {
        results.push({
          id,
          success: false,
          error: e instanceof Error ? e.message : 'Unknown error',
        });
      }
    }

    const syncedIds = results.filter((r) => r.success).map((r) => r.id);

    return NextResponse.json({
      success: true,
      synced: syncedIds.length,
      failed: results.length - syncedIds.length,
      results,
      syncedIds,
    });
  } catch (err) {
    console.error('Sync error:', err);
    return NextResponse.json(
      { error: 'Failed to sync' },
      { status: 500 }
    );
  }
}
