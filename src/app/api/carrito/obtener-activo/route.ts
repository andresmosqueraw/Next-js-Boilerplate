import { NextResponse } from 'next/server';
import { obtenerCarritoActivo } from '@/services/carrito.service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get('tipo') as 'mesa' | 'domicilio';
    const id = searchParams.get('id');

    if (!tipo || !id) {
      return NextResponse.json(
        { error: 'Missing tipo or id parameter' },
        { status: 400 },
      );
    }

    const resultado = await obtenerCarritoActivo(tipo, Number.parseInt(id));

    return NextResponse.json(resultado);
  } catch (error) {
    console.error('Error in GET /api/carrito/obtener-activo:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
