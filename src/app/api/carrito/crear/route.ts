import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { crearCarrito } from '@/services/carrito.service';

export async function POST(request: Request) {
  try {
    console.warn('📥 [API /carrito/crear] Recibida petición para crear carrito');

    const body = await request.json();
    const { tipoPedido, carritoData } = body;

    console.warn('📋 [API /carrito/crear] Datos recibidos:', {
      tipo: tipoPedido.tipo,
      mesaId: tipoPedido.mesaId,
      domicilioId: tipoPedido.domicilioId,
      restauranteId: carritoData.restauranteId,
      productosCount: carritoData.productos?.length || 0,
    });

    console.warn('🔨 [API /carrito/crear] Llamando a crearCarrito() service...');
    const resultado = await crearCarrito(tipoPedido, carritoData);

    if (!resultado.success) {
      console.error('❌ [API /carrito/crear] Error al crear carrito:', resultado.error);
      return NextResponse.json(
        { error: resultado.error },
        { status: 400 },
      );
    }

    console.warn('✅ [API /carrito/crear] Carrito creado exitosamente:', {
      carritoId: resultado.carritoId,
      tipoPedidoId: resultado.tipoPedidoId,
    });

    // Revalidar el dashboard para que se actualicen los estados de las mesas
    console.warn('🔄 [API /carrito/crear] Revalidando dashboard...');
    revalidatePath('/dashboard');
    revalidatePath('/[locale]/dashboard', 'page');
    console.warn('✅ [API /carrito/crear] Dashboard revalidado');

    return NextResponse.json(resultado);
  } catch (error) {
    console.error('❌ [API /carrito/crear] Error inesperado:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
