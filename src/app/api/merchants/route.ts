import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  if (!supabase) {
    return NextResponse.json(
      { error: 'Database not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to environment.' },
      { status: 503 }
    );
  }
  try {
    const body = await request.json();
    const { name, business_name, email, phone } = body;

    if (!name || !business_name || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: name, business_name, email' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('merchants')
      .insert({ name, business_name, email, phone: phone || null })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Merchant with this email already exists' },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('Merchant create error:', err);
    return NextResponse.json(
      { error: 'Failed to create merchant' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  if (!supabase) {
    return NextResponse.json(
      { error: 'Database not configured.' },
      { status: 503 }
    );
  }
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const email = searchParams.get('email');

    if (id) {
      const { data, error } = await supabase
        .from('merchants')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        return NextResponse.json({ error: 'Merchant not found' }, { status: 404 });
      }
      return NextResponse.json(data);
    }

    if (email) {
      const { data, error } = await supabase
        .from('merchants')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !data) {
        return NextResponse.json({ error: 'Merchant not found' }, { status: 404 });
      }
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: 'Provide id or email' }, { status: 400 });
  } catch (err) {
    console.error('Merchant get error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch merchant' },
      { status: 500 }
    );
  }
}
