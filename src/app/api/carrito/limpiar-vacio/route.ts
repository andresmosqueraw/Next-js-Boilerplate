import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { limpiarCarritoVacio } from '@/services/carrito.service';

export async function POST(request: Request) {
  const requestStartTime = Date.now();

  try {
    console.warn('📥 [API /carrito/limpiar-vacio] ═══════════════════════════════════');
    console.warn('📥 [API /carrito/limpiar-vacio] Recibida petición POST para limpiar carrito vacío');

    const body = await request.json();
    const { carritoId, tipoPedido } = body;

    console.warn('📋 [API /carrito/limpiar-vacio] Datos recibidos:', {
      carritoId,
      tipoPedido: {
        tipo: tipoPedido?.tipo,
        mesaId: tipoPedido?.mesaId,
        domicilioId: tipoPedido?.domicilioId,
      },
    });

    console.warn('🔨 [API /carrito/limpiar-vacio] Llamando a limpiarCarritoVacio() service...');
    const serviceStartTime = Date.now();

    const resultado = await limpiarCarritoVacio(carritoId, tipoPedido);

    const serviceDuration = Date.now() - serviceStartTime;
    console.warn(`⏱️ [API /carrito/limpiar-vacio] Service limpiarCarritoVacio() completado en ${serviceDuration}ms`);

    if (!resultado.success) {
      console.error('❌ [API /carrito/limpiar-vacio] ERROR - Fallo al limpiar carrito:', {
        error: resultado.error,
        tiempoTranscurrido: `${Date.now() - requestStartTime}ms`,
      });
      return NextResponse.json(
        { error: resultado.error },
        { status: 400 },
      );
    }

    console.warn('✅ [API /carrito/limpiar-vacio] Carrito limpiado exitosamente:', {
      carritoId: resultado.carritoId,
      tiempoLimpieza: `${Date.now() - requestStartTime}ms`,
    });

    // Revalidar el dashboard para que se actualicen los estados de las mesas
    console.warn('🔄 [API /carrito/limpiar-vacio] Iniciando revalidación del dashboard...');
    const revalidateStartTime = Date.now();

    revalidatePath('/dashboard');
    console.warn('  ↳ revalidatePath(\'/dashboard\') ejecutado');

    revalidatePath('/[locale]/dashboard', 'page');
    console.warn('  ↳ revalidatePath(\'/[locale]/dashboard\', \'page\') ejecutado');

    const revalidateDuration = Date.now() - revalidateStartTime;
    console.warn(`✅ [API /carrito/limpiar-vacio] Dashboard revalidado en ${revalidateDuration}ms`);

    const totalDuration = Date.now() - requestStartTime;
    console.warn(`🎉 [API /carrito/limpiar-vacio] PETICIÓN COMPLETADA en ${totalDuration}ms`);
    console.warn('📤 [API /carrito/limpiar-vacio] Respondiendo al cliente con:', {
      success: true,
      carritoId: resultado.carritoId,
    });
    console.warn('📥 [API /carrito/limpiar-vacio] ═══════════════════════════════════\n');

    return NextResponse.json(resultado);
  } catch (error) {
    const totalDuration = Date.now() - requestStartTime;
    console.error('❌ [API /carrito/limpiar-vacio] ERROR INESPERADO después de', totalDuration, 'ms:', error);
    console.error('❌ [API /carrito/limpiar-vacio] Stack trace:', error instanceof Error ? error.stack : 'N/A');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
