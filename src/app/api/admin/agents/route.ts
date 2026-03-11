import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  if (!supabase) return NextResponse.json({ error: 'DB error' }, { status: 503 });
  
  try {
    // Agents table only holds links, so we join user data
    const { data: agents, error } = await supabase
      .from('agents')
      .select(`
         id,
         created_at,
         users!user_id(id, full_name, email, phone)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return NextResponse.json(agents);
  } catch (err) {
    console.error('Fetch agents error:', err);
    return NextResponse.json({ error: 'Failed to fetch agents' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!supabase) return NextResponse.json({ error: 'DB error' }, { status: 503 });

  try {
    const body = await request.json();
    const { full_name, email, phone } = body;

    if (!full_name || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Create User account as Agent
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
         full_name,
         email,
         phone,
         role: 'agent'
      })
      .select('id')
      .single();

    if (userError) throw userError;

    // 2. Link to Agent table
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .insert({ user_id: newUser.id })
      .select('*')
      .single();

    if (agentError) throw agentError;

    return NextResponse.json({ success: true, agent });
  } catch (err: any) {
    console.error('Create agent error:', err);
    return NextResponse.json({ error: err.message || 'Failed to create agent' }, { status: 500 });
  }
}
