import { NextResponse } from 'next/server';
import { createClient } from '@/libs/supabase/server';

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();

    const { data: mesa, error } = await supabase
      .from('mesa')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !mesa) {
      return NextResponse.json(
        { success: false, error: 'Mesa not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, mesa });
  } catch (error) {
    console.error('Error in GET /api/mesa/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
