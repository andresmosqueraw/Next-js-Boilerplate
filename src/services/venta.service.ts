import { createClient } from '@/libs/supabase/server';

export type CrearVentaData = {
  carritoId: number;
  restauranteId: number;
  clienteId?: number | null;
  total: number;
  dineroRecibido: number;
  cambioDado: number;
  tipoDePedido: 'MESA' | 'DOMICILIO';
  metodoPago: string;
};

/**
 * Crea una venta en la base de datos a partir de un carrito completado
 */
export async function crearVenta(data: CrearVentaData) {
  const supabase = await createClient();

  console.warn('💰 [Service crearVenta] ═══════════════════════════════════');
  console.warn('💰 [Service crearVenta] INICIO - Creando venta');
  console.warn('💰 [Service crearVenta] Datos recibidos:', {
    carritoId: data.carritoId,
    restauranteId: data.restauranteId,
    clienteId: data.clienteId,
    total: data.total,
    dineroRecibido: data.dineroRecibido,
    cambioDado: data.cambioDado,
    tipoDePedido: data.tipoDePedido,
    metodoPago: data.metodoPago,
  });

  try {
    // Paso 1: Verificar que el carrito existe y obtener su información
    const { data: carrito, error: errorCarrito } = await supabase
      .from('carrito')
      .select('*, tipo_pedido(*)')
      .eq('id', data.carritoId)
      .single();

    if (errorCarrito || !carrito) {
      console.error('❌ [Service crearVenta] Error obteniendo carrito:', errorCarrito);
      throw new Error('Carrito no encontrado');
    }

    console.warn('✅ [Service crearVenta] Carrito encontrado:', {
      carritoId: carrito.id,
      estado: carrito.estado,
      tipoPedidoId: carrito.tipo_pedido_id,
    });

    // Paso 2: Crear el registro de venta
    const ventaData = {
      carrito_id: data.carritoId,
      restaurante_id: data.restauranteId,
      cliente_id: data.clienteId || null,
      total: data.total,
      dinero_recibido: data.dineroRecibido,
      cambio_dado: data.cambioDado,
      tipo_de_pedido: data.tipoDePedido,
      metodo_pago: data.metodoPago,
      fecha: new Date().toISOString(),
    };

    console.warn('📝 [Service crearVenta] Insertando venta:', ventaData);

    const { data: ventaCreada, error: errorVenta } = await supabase
      .from('venta')
      .insert(ventaData)
      .select()
      .single();

    if (errorVenta || !ventaCreada) {
      console.error('❌ [Service crearVenta] Error creando venta:', errorVenta);
      throw new Error('Error al crear la venta');
    }

    console.warn('✅ [Service crearVenta] Venta creada exitosamente:', {
      ventaId: ventaCreada.id,
      total: ventaCreada.total,
      tipoDePedido: ventaCreada.tipo_de_pedido,
    });

    // Paso 3: Actualizar el estado del carrito a 'completado' o 'servido'
    const { error: errorUpdateCarrito } = await supabase
      .from('carrito')
      .update({ estado: 'completado' })
      .eq('id', data.carritoId);

    if (errorUpdateCarrito) {
      console.error('⚠️ [Service crearVenta] Error actualizando estado del carrito:', errorUpdateCarrito);
      // No lanzar error, la venta ya se creó
    } else {
      console.warn('✅ [Service crearVenta] Estado del carrito actualizado a "completado"');
    }

    // Paso 4: Si es una mesa, actualizar su estado a 'disponible'
    if (data.tipoDePedido === 'MESA' && carrito.tipo_pedido?.mesa_id) {
      const { error: errorUpdateMesa } = await supabase
        .from('mesa')
        .update({ estado: 'disponible' })
        .eq('id', carrito.tipo_pedido.mesa_id);

      if (errorUpdateMesa) {
        console.error('⚠️ [Service crearVenta] Error actualizando estado de la mesa:', errorUpdateMesa);
        // No lanzar error, la venta ya se creó
      } else {
        console.warn('✅ [Service crearVenta] Estado de la mesa actualizado a "disponible"');
      }
    }

    console.warn('✅ [Service crearVenta] ═══════════════════════════════════');
    console.warn('✅ [Service crearVenta] Venta completada exitosamente');

    return {
      success: true,
      venta: ventaCreada,
    };
  } catch (error) {
    console.error('❌ [Service crearVenta] Error general:', error);
    throw error;
  }
}
