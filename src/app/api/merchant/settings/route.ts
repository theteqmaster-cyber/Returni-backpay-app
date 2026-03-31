import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { merchantId, promoText, promoImages } = await request.json();

    if (!merchantId) {
      return NextResponse.json({ error: 'Missing merchantId' }, { status: 400 });
    }

    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const { error } = await supabase
      .from('merchants')
      .update({
        promo_text: promoText,
        promo_images: promoImages || []
      })
      .eq('id', merchantId);

    if (error) throw error;

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error('Update merchant settings error:', err);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
