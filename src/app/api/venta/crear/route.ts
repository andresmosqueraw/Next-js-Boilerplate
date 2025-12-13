import type { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { crearVenta } from '@/services/venta.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.warn('💰 [API /venta/crear] Recibida petición');
    console.warn('💰 [API /venta/crear] Datos recibidos:', body);

    const {
      carritoId,
      restauranteId,
      clienteId,
      total,
      dineroRecibido,
      cambioDado,
      tipoDePedido,
      metodoPago,
    } = body;

    // Validar campos requeridos
    if (!carritoId || !restauranteId || total === undefined || !tipoDePedido || !metodoPago) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos requeridos' },
        { status: 400 },
      );
    }

    const result = await crearVenta({
      carritoId: Number(carritoId),
      restauranteId: Number(restauranteId),
      clienteId: clienteId ? Number(clienteId) : null,
      total: Number(total),
      dineroRecibido: Number(dineroRecibido),
      cambioDado: Number(cambioDado),
      tipoDePedido: tipoDePedido as 'MESA' | 'DOMICILIO',
      metodoPago,
    });

    // Revalidar el dashboard para reflejar los cambios
    revalidatePath('/dashboard');
    revalidatePath('/[locale]/dashboard', 'page');

    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ [API /venta/crear] Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 },
    );
  }
}
