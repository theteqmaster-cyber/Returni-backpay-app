import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  if (!supabase) return NextResponse.json({ error: 'DB error' }, { status: 503 });

  try {
    const { searchParams } = new URL(request.url);
    const merchantId = searchParams.get('merchantId');
    const range = searchParams.get('range') || '7d'; // default to 7 days

    if (!merchantId) return NextResponse.json({ error: 'Missing merchantId' }, { status: 400 });

    // Calculate start date based on range
    let startDate: Date | null = new Date();
    if (range === '7d') startDate.setDate(startDate.getDate() - 7);
    else if (range === '2w') startDate.setDate(startDate.getDate() - 14);
    else if (range === '1m') startDate.setMonth(startDate.getMonth() - 1);
    else startDate = null; // 'all'

    const startDateIso = startDate ? startDate.toISOString() : '1970-01-01T00:00:00Z';

    // 1. Fetch merchant details + transactions + volume in parallel
    const [
      { data: merchant, error: mError },
      { data: volData, error: volError },
      { data: transactions, count: totalCount, error: txError }
    ] = await Promise.all([
      supabase.from('merchants')
        .select('id, name, business_name, email, phone, agent_id, owner:users!owner_user_id(full_name)')
        .eq('id', merchantId)
        .single(),
      
      supabase.rpc('get_merchant_volume_filtered', { 
        merchant_uuid: merchantId, 
        start_date: startDateIso 
      }),

      supabase.from('transactions')
        .select('id, amount, currency, payment_method, merchant_notes, created_at, backpay_records(backpay_amount, status, customers(phone))', { count: 'exact' })
        .eq('merchant_id', merchantId)
        .gte('created_at', startDateIso)
        .order('created_at', { ascending: false })
    ]);

    if (mError) throw mError;
    if (volError) throw volError;
    if (txError) throw txError;

    // 2. Fetch agent contact if assigned
    let agentName = null;
    let agentPhone = null;
    if (merchant?.agent_id) {
      const { data: agentData } = await supabase
        .from('agents')
        .select('users!user_id(full_name, phone)')
        .eq('id', merchant.agent_id)
        .single();
      if (agentData?.users) {
        agentName = (agentData.users as any).full_name;
        agentPhone = (agentData.users as any).phone;
      }
    }

    // 3. Process volume data
    const totalVolume = { USD: 0, ZAR: 0, ZIG: 0 };
    volData?.forEach((row: any) => {
      const cur = (row.currency || 'USD') as 'USD' | 'ZAR' | 'ZIG';
      if (totalVolume.hasOwnProperty(cur)) {
        totalVolume[cur] = Number(row.total_amount || 0);
      }
    });

    // 4. Calculate BackPay stats
    const totalBackpayIssued = { USD: 0, ZAR: 0, ZIG: 0 };
    const totalBackpayClaimed = { USD: 0, ZAR: 0, ZIG: 0 };

    transactions?.forEach((tx: any) => {
      const cur = (tx.currency || 'USD') as 'USD' | 'ZAR' | 'ZIG';
      // Handle potential array from Supabase join
      const bp = Array.isArray(tx.backpay_records) ? tx.backpay_records[0] : tx.backpay_records;
      
      if (bp) {
        const amt = parseFloat(bp.backpay_amount || '0');
        totalBackpayIssued[cur] += amt;
        if (bp.status === 'claimed') {
          totalBackpayClaimed[cur] += amt;
        }
      }
    });

    return NextResponse.json({
      merchant: {
        business_name: merchant.business_name,
        owner_name: (merchant.owner as any)?.full_name || merchant.name,
        email: merchant.email,
        phone: merchant.phone,
      },
      agent: agentName ? { name: agentName, phone: agentPhone } : null,
      transactions: transactions?.map(tx => {
        const bp = Array.isArray(tx.backpay_records) ? tx.backpay_records[0] : tx.backpay_records;
        return {
          ...tx,
          backpay_details: bp,
          customer_phone: bp?.customers ? (Array.isArray(bp.customers) ? bp.customers[0]?.phone : (bp.customers as any).phone) : null
        };
      }) || [],
      summary: {
        totalCount: totalCount || 0,
        totalVolume: {
          USD: totalVolume.USD.toFixed(2),
          ZAR: totalVolume.ZAR.toFixed(2),
          ZIG: totalVolume.ZIG.toFixed(2)
        },
        totalBackpayIssued: {
          USD: totalBackpayIssued.USD.toFixed(2),
          ZAR: totalBackpayIssued.ZAR.toFixed(2),
          ZIG: totalBackpayIssued.ZIG.toFixed(2)
        },
        totalBackpayClaimed: {
          USD: totalBackpayClaimed.USD.toFixed(2),
          ZAR: totalBackpayClaimed.ZAR.toFixed(2),
          ZIG: totalBackpayClaimed.ZIG.toFixed(2)
        },
        generatedAt: new Date().toISOString(),
      }
    });

  } catch (err: any) {
    console.error('Report error:', err);
    return NextResponse.json({ error: err.message || 'Failed to generate report' }, { status: 500 });
  }
}
