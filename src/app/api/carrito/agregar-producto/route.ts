import { NextResponse } from 'next/server';
import { agregarProductoACarrito } from '@/services/carrito.service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { carritoId, productoRestauranteId, cantidad, precioUnitario } = body;

    const resultado = await agregarProductoACarrito(
      carritoId,
      productoRestauranteId,
      cantidad,
      precioUnitario,
    );

    if (!resultado.success) {
      return NextResponse.json(
        { error: resultado.error },
        { status: 400 },
      );
    }

    return NextResponse.json(resultado);
  } catch (error) {
    console.error('Error in POST /api/carrito/agregar-producto:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
