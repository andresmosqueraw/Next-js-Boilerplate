import { NextResponse } from 'next/server';
import { obtenerCarritoCompleto } from '@/services/carrito.service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get('tipo') as 'mesa' | 'domicilio' | null;
    const id = searchParams.get('id');
    const restauranteId = searchParams.get('restauranteId');

    if (!tipo || !id || !restauranteId) {
      return NextResponse.json(
        { error: 'Faltan parámetros: tipo, id, restauranteId' },
        { status: 400 },
      );
    }

    const resultado = await obtenerCarritoCompleto(
      tipo,
      Number.parseInt(id),
      Number.parseInt(restauranteId),
    );

    if (!resultado.success) {
      return NextResponse.json(
        { error: 'Error al obtener el carrito' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      carritoId: resultado.carritoId,
      productos: resultado.productos,
    });
  } catch (error) {
    console.error('❌ [API /carrito/obtener-completo] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
