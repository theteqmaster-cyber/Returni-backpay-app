import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  if (!supabase) return NextResponse.json({ error: 'DB error' }, { status: 503 });

  try {
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select(`
        id, amount, currency, created_at,
        merchant:merchants!merchant_id(business_name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Build CSV string
    const header = 'Transaction ID,Business,Date,Time,Amount,Currency\n';
    const rows = (transactions || []).map(tx => {
      const d = new Date(tx.created_at);
      return [
        tx.id,
        `"${(tx.merchant as any)?.business_name || 'Unknown'}"`,
        d.toLocaleDateString('en-GB'),
        d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        Number(tx.amount).toFixed(2),
        tx.currency || 'USD'
      ].join(',');
    });

    const csv = header + rows.join('\n');

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="returni-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (err: any) {
    console.error('Export error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
