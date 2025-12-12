import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { eliminarProductoDeCarrito } from '@/services/carrito.service';
import { getProductoRestauranteId } from '@/services/producto.service';

export async function POST(request: Request) {
  try {
    console.warn('📥 [API /carrito/eliminar-producto] Recibida petición');

    const body = await request.json();
    const {
      carritoId,
      productoRestauranteId,
      productoId,
      restauranteId,
    } = body;

    console.warn('📋 [API /carrito/eliminar-producto] Datos recibidos:', {
      carritoId,
      productoId,
      restauranteId,
    });

    // Si no se proporciona productoRestauranteId, buscarlo con productoId y restauranteId
    let finalProductoRestauranteId = productoRestauranteId;

    if (!finalProductoRestauranteId && productoId && restauranteId) {
      console.warn('🔍 [API /carrito/eliminar-producto] Buscando producto_restaurante_id...');
      finalProductoRestauranteId = await getProductoRestauranteId(
        productoId,
        restauranteId,
      );

      if (!finalProductoRestauranteId) {
        console.error('❌ [API /carrito/eliminar-producto] Producto no encontrado en restaurante');
        return NextResponse.json(
          { error: 'No se encontró el producto en este restaurante' },
          { status: 404 },
        );
      }

      console.warn('✅ [API /carrito/eliminar-producto] producto_restaurante_id encontrado:', finalProductoRestauranteId);
    }

    if (!finalProductoRestauranteId) {
      console.error('❌ [API /carrito/eliminar-producto] Falta productoRestauranteId');
      return NextResponse.json(
        { error: 'Se requiere productoRestauranteId o (productoId + restauranteId)' },
        { status: 400 },
      );
    }

    console.warn('🔨 [API /carrito/eliminar-producto] Llamando a eliminarProductoDeCarrito() service...');
    const resultado = await eliminarProductoDeCarrito(
      carritoId,
      finalProductoRestauranteId,
    );

    if (!resultado.success) {
      console.error('❌ [API /carrito/eliminar-producto] Error al eliminar producto:', resultado.error);
      return NextResponse.json(
        { error: resultado.error },
        { status: 400 },
      );
    }

    console.warn('✅ [API /carrito/eliminar-producto] Producto eliminado exitosamente');

    // Revalidar dashboard para actualizar estados
    console.warn('🔄 [API /carrito/eliminar-producto] Revalidando dashboard...');
    revalidatePath('/dashboard');
    console.warn('✅ [API /carrito/eliminar-producto] Dashboard revalidado');

    return NextResponse.json(resultado);
  } catch (error) {
    console.error('❌ [API /carrito/eliminar-producto] Error inesperado:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
