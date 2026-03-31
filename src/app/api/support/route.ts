import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  if (!supabase) return NextResponse.json({ error: 'DB error' }, { status: 503 });

  try {
    const { name, phone, description, role } = await request.json();

    if (!name || !phone || !description) {
      return NextResponse.json({ error: 'Please provide name, phone and problem description.' }, { status: 400 });
    }

    const { error } = await supabase
      .from('support_tickets')
      .insert({
        full_name: name,
        phone,
        problem_description: description,
        user_role: role || 'unknown'
      });

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Ticket submitted successfully!' });
  } catch (err: any) {
    console.error('Support ticket error:', err);
    return NextResponse.json({ error: 'Failed to submit ticket' }, { status: 500 });
  }
}
