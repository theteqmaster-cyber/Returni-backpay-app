import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const demoMerchantId = searchParams.get('demoMerchantId');

    if (!demoMerchantId) {
      return NextResponse.json({ error: 'demoMerchantId is required' }, { status: 400 });
    }

    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const { data, error } = await supabase
      .from('demo_inventory')
      .select('*')
      .eq('demo_merchant_id', demoMerchantId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, items: data });
  } catch (err) {
    console.error('Inventory Fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { demoMerchantId, name, sku, stockLevel, price } = await request.json();

    if (!demoMerchantId || !name) {
      return NextResponse.json({ error: 'demoMerchantId and name are required' }, { status: 400 });
    }

    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const { data, error } = await supabase
      .from('demo_inventory')
      .insert([{ 
        demo_merchant_id: demoMerchantId, 
        name, 
        sku, 
        stock_level: stockLevel || 0, 
        price: price || 0.00 
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, item: data });
  } catch (err) {
    console.error('Inventory Create error:', err);
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, stockLevel, name, sku, price } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const updateData: any = {};
    if (typeof stockLevel !== 'undefined') updateData.stock_level = stockLevel;
    if (name) updateData.name = name;
    if (sku) updateData.sku = sku;
    if (typeof price !== 'undefined') updateData.price = price;

    const { data, error } = await supabase
      .from('demo_inventory')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, item: data });
  } catch (err) {
    console.error('Inventory Update error:', err);
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
    try {
      const { id } = await request.json();
  
      if (!id) {
        return NextResponse.json({ error: 'ID is required' }, { status: 400 });
      }
  
      if (!supabase) {
        return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
      }
  
      const { error } = await supabase
        .from('demo_inventory')
        .delete()
        .eq('id', id);
  
      if (error) throw error;
  
      return NextResponse.json({ success: true });
    } catch (err) {
      console.error('Inventory Delete error:', err);
      return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
    }
  }
