import { NextResponse } from 'next/server';
import { createClient } from '@/libs/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Intenta hacer una consulta simple para verificar la conexión
    const { data: _data, error } = await supabase.auth.getSession();

    if (error) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Error connecting to Supabase',
          error: error.message,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      status: 'success',
      message: 'Supabase connection is working!',
      hasSession: !!_data.session,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to connect to Supabase',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
