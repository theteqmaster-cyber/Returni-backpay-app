import { createClient } from '@supabase/supabase-js';
import { NextResponse, NextRequest } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const merchantId = searchParams.get('merchantId');

  try {
    if (merchantId) {
      // Fetch single merchant's brickboard
      const { data, error } = await supabase
        .from('demo_brickboards')
        .select('*')
        .eq('merchant_id', merchantId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is 'not found'
      return NextResponse.json({ success: true, brickboard: data || {} });
    } else {
      // 1. Fetch ALL merchants
      const { data: merchants, error: mError } = await supabase
        .from('demo_merchants')
        .select('id, business_name')
        .order('business_name', { ascending: true });

      if (mError) throw mError;

      // 2. Fetch ALL brickboards
      const { data: boards, error: bError } = await supabase
        .from('demo_brickboards')
        .select('*');

      if (bError) throw bError;
      
      // 3. Manually merge the data (Safe, robust alternative to failing Joins)
      const integratedFeed = merchants.map((m: any) => {
          const board = boards?.find(b => b.merchant_id === m.id);
          return {
              ...(board || {}), // Spread board data if it exists
              merchant_id: m.id,
              id: board?.id, // Ensure board ID is clearly defined
              demo_merchants: { business_name: m.business_name }
          };
      });

      return NextResponse.json({ success: true, brickboards: integratedFeed });
    }
  } catch (error: any) {
    console.error('Brickboard GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { 
      merchantId, 
      promoText, 
      imageUrl1, 
      imageUrl2, 
      imageUrl3, 
      isPublished 
    } = await request.json();

    if (!merchantId) {
      return NextResponse.json({ error: 'Merchant ID is required' }, { status: 400 });
    }

    // Upsert the brickboard record
    const { data, error } = await supabase
      .from('demo_brickboards')
      .upsert({
        merchant_id: merchantId,
        promo_text: promoText,
        image_url_1: imageUrl1,
        image_url_2: imageUrl2,
        image_url_3: imageUrl3,
        is_published: isPublished !== undefined ? isPublished : true,
      }, {
        onConflict: 'merchant_id'
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, brickboard: data });
  } catch (error: any) {
    console.error('Brickboard POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
