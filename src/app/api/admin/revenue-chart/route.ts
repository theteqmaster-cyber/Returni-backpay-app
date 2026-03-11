import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  if (!supabase) return NextResponse.json({ error: 'DB error' }, { status: 503 });

  try {
    // Fetch all transactions with created_at
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('amount, created_at')
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Build last 6 months
    const months: { month: string; label: string; volume: number; count: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleString('default', { month: 'short' });
      months.push({ month: key, label, volume: 0, count: 0 });
    }

    for (const tx of transactions || []) {
      const txMonth = tx.created_at.substring(0, 7); // "YYYY-MM"
      const bucket = months.find(m => m.month === txMonth);
      if (bucket) {
        bucket.volume += Number(tx.amount || 0);
        bucket.count += 1;
      }
    }

    return NextResponse.json(months);
  } catch (err: any) {
    console.error('Revenue chart error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
