import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { agregarProductoACarrito } from '@/services/carrito.service';
import { getProductoRestauranteId } from '@/services/producto.service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      carritoId,
      productoRestauranteId,
      productoId,
      restauranteId,
      cantidad,
      precioUnitario,
    } = body;

    // Si no se proporciona productoRestauranteId, buscarlo con productoId y restauranteId
    let finalProductoRestauranteId = productoRestauranteId;

    if (!finalProductoRestauranteId && productoId && restauranteId) {
      finalProductoRestauranteId = await getProductoRestauranteId(
        productoId,
        restauranteId,
      );

      if (!finalProductoRestauranteId) {
        return NextResponse.json(
          { error: 'No se encontró el producto en este restaurante' },
          { status: 404 },
        );
      }
    }

    if (!finalProductoRestauranteId) {
      return NextResponse.json(
        { error: 'Se requiere productoRestauranteId o (productoId + restauranteId)' },
        { status: 400 },
      );
    }

    const resultado = await agregarProductoACarrito(
      carritoId,
      finalProductoRestauranteId,
      cantidad,
      precioUnitario,
    );

    if (!resultado.success) {
      return NextResponse.json(
        { error: resultado.error },
        { status: 400 },
      );
    }

    // Revalidar dashboard para actualizar estados
    revalidatePath('/dashboard');

    return NextResponse.json(resultado);
  } catch (error) {
    console.error('Error in POST /api/carrito/agregar-producto:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
