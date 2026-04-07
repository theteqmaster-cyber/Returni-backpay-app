import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const { merchantId, items, paymentMethod, currency, total } = await req.json();

    if (!merchantId || !items || !paymentMethod || !total) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Update Inventory Levels
    for (const item of items) {
       const { data: currentItem, error: fetchErr } = await supabase
         .from('demo_inventory')
         .select('stock_level')
         .eq('id', item.id)
         .single();

       if (fetchErr || !currentItem) continue;

       const { error: updateErr } = await supabase
         .from('demo_inventory')
         .update({ stock_level: Math.max(0, currentItem.stock_level - item.quantity) })
         .eq('id', item.id);

       if (updateErr) throw updateErr;
    }

    // 2. Fetch/Update Merchant Balance
    const { data: merchant, error: merchantErr } = await supabase
      .from('demo_merchants')
      .select('*')
      .eq('id', merchantId)
      .single();

    if (merchantErr || !merchant) {
      throw new Error('Merchant not found');
    }

    const currentBalance = currency === 'USD' ? merchant.usd_balance : merchant.zig_balance;
    const newBalance = Number(currentBalance) + Number(total);

    const updateData = currency === 'USD' 
      ? { usd_balance: newBalance } 
      : { zig_balance: newBalance };

    const { error: balanceErr } = await supabase
      .from('demo_merchants')
      .update(updateData)
      .eq('id', merchantId);

    if (balanceErr) throw balanceErr;

    // 3. Record Transaction
    const { error: txErr } = await supabase
      .from('demo_wallet_transactions')
      .insert({
        merchant_id: merchantId,
        type: 'receive',
        amount: total,
        currency,
        provider: paymentMethod,
        description: `Terminal Sale: ${items.length} items`,
        category: 'Client',
        phone_number: 'POS-TERMINAL-V3'
      });

    if (txErr) throw txErr;

    return NextResponse.json({ success: true, newBalance });
  } catch (err: any) {
    console.error('Terminal Sale Error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
