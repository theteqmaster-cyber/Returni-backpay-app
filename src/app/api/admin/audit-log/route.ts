import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET: Fetch last 100 audit log entries
export async function GET() {
  if (!supabase) return NextResponse.json({ error: 'DB error' }, { status: 503 });

  try {
    const { data, error } = await supabase
      .from('admin_audit_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (err: any) {
    // Table may not exist yet — return empty array gracefully
    console.warn('Audit log not available:', err.message);
    return NextResponse.json([]);
  }
}

// POST: Write a new audit log entry (called internally by other admin routes)
export async function POST(request: NextRequest) {
  if (!supabase) return NextResponse.json({ error: 'DB error' }, { status: 503 });

  try {
    const body = await request.json();
    const { admin_name, action, entity_type, entity_id } = body;

    const { error } = await supabase
      .from('admin_audit_log')
      .insert({ admin_name, action, entity_type, entity_id });

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    // Soft fail — don't block the parent operation
    console.warn('Audit log write failed:', err.message);
    return NextResponse.json({ success: false });
  }
}
