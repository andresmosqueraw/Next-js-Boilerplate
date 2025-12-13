import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { actualizarCantidadProducto } from '@/services/carrito.service';
import { getProductoRestauranteId } from '@/services/producto.service';

export async function POST(request: Request) {
  try {
    console.warn('📥 [API /carrito/actualizar-cantidad] Recibida petición');

    const body = await request.json();
    const {
      carritoId,
      productoRestauranteId,
      productoId,
      restauranteId,
      cantidad,
      precioUnitario,
    } = body;

    console.warn('📋 [API /carrito/actualizar-cantidad] Datos recibidos:', {
      carritoId,
      productoId,
      restauranteId,
      cantidad,
      precioUnitario,
    });

    if (!carritoId || !restauranteId || cantidad === undefined) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos: carritoId, restauranteId, cantidad' },
        { status: 400 },
      );
    }

    // Si no se proporciona productoRestauranteId, buscarlo con productoId y restauranteId
    let finalProductoRestauranteId = productoRestauranteId;

    if (!finalProductoRestauranteId && productoId && restauranteId) {
      console.warn('🔍 [API /carrito/actualizar-cantidad] Buscando producto_restaurante_id...');
      finalProductoRestauranteId = await getProductoRestauranteId(
        productoId,
        restauranteId,
      );

      if (!finalProductoRestauranteId) {
        console.error('❌ [API /carrito/actualizar-cantidad] Producto no encontrado en restaurante');
        return NextResponse.json(
          { error: 'No se encontró el producto en este restaurante' },
          { status: 404 },
        );
      }

      console.warn('✅ [API /carrito/actualizar-cantidad] producto_restaurante_id encontrado:', finalProductoRestauranteId);
    }

    if (!finalProductoRestauranteId) {
      console.error('❌ [API /carrito/actualizar-cantidad] Falta productoRestauranteId');
      return NextResponse.json(
        { error: 'Se requiere productoRestauranteId o (productoId + restauranteId)' },
        { status: 400 },
      );
    }

    if (!precioUnitario || precioUnitario <= 0) {
      console.error('❌ [API /carrito/actualizar-cantidad] precioUnitario inválido');
      return NextResponse.json(
        { error: 'Se requiere precioUnitario válido' },
        { status: 400 },
      );
    }

    console.warn('🔨 [API /carrito/actualizar-cantidad] Llamando a actualizarCantidadProducto() service...');
    const resultado = await actualizarCantidadProducto(
      carritoId,
      finalProductoRestauranteId,
      cantidad,
      precioUnitario,
    );

    if (!resultado.success) {
      console.error('❌ [API /carrito/actualizar-cantidad] Error al actualizar cantidad:', resultado.error);
      return NextResponse.json(
        { error: resultado.error },
        { status: 400 },
      );
    }

    console.warn('✅ [API /carrito/actualizar-cantidad] Cantidad actualizada exitosamente');

    // Revalidar dashboard para actualizar estados
    console.warn('🔄 [API /carrito/actualizar-cantidad] Revalidando dashboard...');
    revalidatePath('/dashboard');
    revalidatePath('/[locale]/dashboard', 'page');
    console.warn('✅ [API /carrito/actualizar-cantidad] Dashboard revalidado');

    return NextResponse.json(resultado);
  } catch (error) {
    console.error('❌ [API /carrito/actualizar-cantidad] Error inesperado:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
