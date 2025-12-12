import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createClient } from '@/libs/supabase/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    console.warn(`📡 API /api/mesa/${id} called`);

    const supabase = await createClient();

    const { data: mesa, error } = await supabase
      .from('mesa')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !mesa) {
      console.error(`❌ Mesa ${id} not found:`, error);
      return NextResponse.json(
        { success: false, error: 'Mesa not found' },
        { status: 404 },
      );
    }

    console.warn(`✅ Mesa ${id} found, restaurante_id:`, mesa.restaurante_id);
    return NextResponse.json({ success: true, mesa });
  } catch (error) {
    console.error('Error in GET /api/mesa/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
