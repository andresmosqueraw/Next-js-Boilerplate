import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { crearCarrito } from '@/services/carrito.service';

export async function POST(request: Request) {
  const requestStartTime = Date.now();

  try {
    console.warn('📥 [API /carrito/crear] ═══════════════════════════════════');
    console.warn('📥 [API /carrito/crear] Recibida petición POST para crear carrito');
    console.warn(`📥 [API /carrito/crear] URL: ${request.url}`);
    console.warn(`📥 [API /carrito/crear] Method: ${request.method}`);

    const body = await request.json();
    const { tipoPedido, carritoData } = body;

    console.warn('📋 [API /carrito/crear] Datos recibidos del cliente:', {
      tipoPedido: {
        tipo: tipoPedido?.tipo,
        mesaId: tipoPedido?.mesaId,
        domicilioId: tipoPedido?.domicilioId,
      },
      carritoData: {
        restauranteId: carritoData?.restauranteId,
        clienteId: carritoData?.clienteId,
        productosCount: carritoData?.productos?.length || 0,
        productosDetalle: carritoData?.productos?.map((p: any) => ({
          productoId: p.productoId,
          cantidad: p.cantidad,
          precioUnitario: p.precioUnitario,
          subtotal: p.subtotal,
        })),
      },
    });

    console.warn('🔨 [API /carrito/crear] Llamando a crearCarrito() service...');
    const serviceStartTime = Date.now();

    const resultado = await crearCarrito(tipoPedido, carritoData);

    const serviceDuration = Date.now() - serviceStartTime;
    console.warn(`⏱️ [API /carrito/crear] Service crearCarrito() completado en ${serviceDuration}ms`);

    if (!resultado.success) {
      console.error('❌ [API /carrito/crear] ERROR - Fallo al crear carrito:', {
        error: resultado.error,
        tiempoTranscurrido: `${Date.now() - requestStartTime}ms`,
      });
      return NextResponse.json(
        { error: resultado.error },
        { status: 400 },
      );
    }

    console.warn('✅ [API /carrito/crear] Carrito creado exitosamente en Supabase:', {
      carritoId: resultado.carritoId,
      tipoPedidoId: resultado.tipoPedidoId,
      tiempoCreacion: `${Date.now() - requestStartTime}ms`,
    });

    // Revalidar el dashboard para que se actualicen los estados de las mesas
    console.warn('🔄 [API /carrito/crear] Iniciando revalidación del dashboard...');
    const revalidateStartTime = Date.now();

    revalidatePath('/dashboard');
    console.warn('  ↳ revalidatePath(\'/dashboard\') ejecutado');

    revalidatePath('/[locale]/dashboard', 'page');
    console.warn('  ↳ revalidatePath(\'/[locale]/dashboard\', \'page\') ejecutado');

    const revalidateDuration = Date.now() - revalidateStartTime;
    console.warn(`✅ [API /carrito/crear] Dashboard revalidado en ${revalidateDuration}ms`);

    const totalDuration = Date.now() - requestStartTime;
    console.warn(`🎉 [API /carrito/crear] PETICIÓN COMPLETADA en ${totalDuration}ms`);
    console.warn('📤 [API /carrito/crear] Respondiendo al cliente con:', {
      success: true,
      carritoId: resultado.carritoId,
      tipoPedidoId: resultado.tipoPedidoId,
    });
    console.warn('📥 [API /carrito/crear] ═══════════════════════════════════\n');

    return NextResponse.json(resultado);
  } catch (error) {
    const totalDuration = Date.now() - requestStartTime;
    console.error('❌ [API /carrito/crear] ERROR INESPERADO después de', totalDuration, 'ms:', error);
    console.error('❌ [API /carrito/crear] Stack trace:', error instanceof Error ? error.stack : 'N/A');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
