import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    // Mark KYC as completed
    const { data: updatedUser, error: updateError } = await supabase
      .from('demo_merchants')
      .update({ kyc_completed: true })
      .eq('id', id)
      .select()
      .single();

    if (updateError || !updatedUser) {
      throw updateError || new Error('KYC update failed');
    }

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        businessName: updatedUser.business_name,
        kycCompleted: updatedUser.kyc_completed
      }
    });

  } catch (err) {
    console.error('KYC Complete error:', err);
    return NextResponse.json({ error: 'Failed to update KYC status' }, { status: 500 });
  }
}
