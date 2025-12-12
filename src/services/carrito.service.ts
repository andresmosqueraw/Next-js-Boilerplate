import { createClient } from '@/libs/supabase/server';
import { mapearProductosARestaurante } from './producto.service';

export type TipoPedidoData = {
  tipo: 'mesa' | 'domicilio';
  mesaId?: number;
  domicilioId?: number;
};

export type CarritoData = {
  restauranteId: number;
  clienteId?: number;
  productos: Array<{
    productoId: number; // Ahora usamos productoId, no productoRestauranteId
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
  }>;
};

/**
 * Crea un nuevo pedido (tipo_pedido + carrito + carrito_producto)
 * y actualiza el estado de la mesa a 'ocupada' si es mesa
 */
export async function crearCarrito(
  tipoPedido: TipoPedidoData,
  carritoData: CarritoData,
) {
  const supabase = await createClient();

  try {
    // Primero, mapear los producto_id a producto_restaurante_id
    const productosIds = carritoData.productos.map(p => p.productoId);
    const mapaProductos = await mapearProductosARestaurante(
      productosIds,
      carritoData.restauranteId,
    );

    console.warn('🗺️ Mapa de productos:', Object.fromEntries(mapaProductos));

    // Verificar que todos los productos tengan un producto_restaurante_id válido
    const productosInvalidos = carritoData.productos.filter(
      p => !mapaProductos.has(p.productoId),
    );

    if (productosInvalidos.length > 0) {
      const idsInvalidos = productosInvalidos.map(p => p.productoId);
      console.error('❌ Productos sin producto_restaurante:', idsInvalidos);
      return {
        success: false,
        error: `Productos no disponibles en este restaurante: ${idsInvalidos.join(', ')}`,
      };
    }

    // Paso 1: Crear tipo_pedido
    const { data: tipoPedidoCreado, error: errorTipoPedido } = await supabase
      .from('tipo_pedido')
      .insert({
        mesa_id: tipoPedido.mesaId || null,
        domicilio_id: tipoPedido.domicilioId || null,
      })
      .select()
      .single();

    if (errorTipoPedido || !tipoPedidoCreado) {
      console.error('Error creating tipo_pedido:', errorTipoPedido);
      throw new Error('Failed to create tipo_pedido');
    }

    // Paso 2: Crear carrito
    const { data: carritoCreado, error: errorCarrito } = await supabase
      .from('carrito')
      .insert({
        restaurante_id: carritoData.restauranteId,
        tipo_pedido_id: tipoPedidoCreado.id,
        cliente_id: carritoData.clienteId || null,
        estado: 'pendiente',
      })
      .select()
      .single();

    if (errorCarrito || !carritoCreado) {
      console.error('Error creating carrito:', errorCarrito);
      throw new Error('Failed to create carrito');
    }

    // Paso 3: Crear carrito_producto para cada producto usando el mapa
    const productosParaInsertar = carritoData.productos.map(prod => ({
      carrito_id: carritoCreado.id,
      producto_restaurante_id: mapaProductos.get(prod.productoId)!,
      cantidad: prod.cantidad,
      precio_unitario: prod.precioUnitario,
      subtotal: prod.subtotal,
    }));

    console.warn('📦 Insertando productos:', productosParaInsertar);

    const { error: errorProductos } = await supabase
      .from('carrito_producto')
      .insert(productosParaInsertar);

    if (errorProductos) {
      console.error('Error creating carrito_producto:', errorProductos);
      throw new Error('Failed to create carrito_producto');
    }

    // Paso 4: Si es mesa, actualizar estado a 'ocupada'
    if (tipoPedido.tipo === 'mesa' && tipoPedido.mesaId) {
      const { error: errorMesa } = await supabase
        .from('mesa')
        .update({ estado: 'ocupada' })
        .eq('id', tipoPedido.mesaId);

      if (errorMesa) {
        console.error('Error updating mesa estado:', errorMesa);
        // No lanzar error, el carrito ya está creado
      }
    }

    return {
      success: true,
      carritoId: carritoCreado.id,
      tipoPedidoId: tipoPedidoCreado.id,
    };
  } catch (error) {
    console.error('Error in crearCarrito:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Agrega un producto a un carrito existente
 */
export async function agregarProductoACarrito(
  carritoId: number,
  productoRestauranteId: number,
  cantidad: number,
  precioUnitario: number,
) {
  const supabase = await createClient();

  const subtotal = cantidad * precioUnitario;

  // Verificar si el producto ya existe en el carrito
  const { data: productoExistente } = await supabase
    .from('carrito_producto')
    .select('*')
    .eq('carrito_id', carritoId)
    .eq('producto_restaurante_id', productoRestauranteId)
    .single();

  if (productoExistente) {
    // Actualizar cantidad existente
    const { error } = await supabase
      .from('carrito_producto')
      .update({
        cantidad: productoExistente.cantidad + cantidad,
        subtotal: (productoExistente.cantidad + cantidad) * precioUnitario,
      })
      .eq('id', productoExistente.id);

    if (error) {
      console.error('Error updating carrito_producto:', error);
      return { success: false, error: error.message };
    }
  } else {
    // Insertar nuevo producto
    const { error } = await supabase
      .from('carrito_producto')
      .insert({
        carrito_id: carritoId,
        producto_restaurante_id: productoRestauranteId,
        cantidad,
        precio_unitario: precioUnitario,
        subtotal,
      });

    if (error) {
      console.error('Error inserting carrito_producto:', error);
      return { success: false, error: error.message };
    }
  }

  return { success: true };
}

/**
 * Actualiza la cantidad de un producto en el carrito
 */
export async function actualizarCantidadProducto(
  carritoId: number,
  productoRestauranteId: number,
  nuevaCantidad: number,
  precioUnitario: number,
) {
  const supabase = await createClient();

  if (nuevaCantidad <= 0) {
    // Eliminar el producto si la cantidad es 0
    const { error } = await supabase
      .from('carrito_producto')
      .delete()
      .eq('carrito_id', carritoId)
      .eq('producto_restaurante_id', productoRestauranteId);

    if (error) {
      console.error('Error deleting carrito_producto:', error);
      return { success: false, error: error.message };
    }
  } else {
    // Actualizar cantidad
    const { error } = await supabase
      .from('carrito_producto')
      .update({
        cantidad: nuevaCantidad,
        subtotal: nuevaCantidad * precioUnitario,
      })
      .eq('carrito_id', carritoId)
      .eq('producto_restaurante_id', productoRestauranteId);

    if (error) {
      console.error('Error updating carrito_producto:', error);
      return { success: false, error: error.message };
    }
  }

  return { success: true };
}

/**
 * Elimina un producto del carrito
 */
export async function eliminarProductoDeCarrito(
  carritoId: number,
  productoRestauranteId: number,
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('carrito_producto')
    .delete()
    .eq('carrito_id', carritoId)
    .eq('producto_restaurante_id', productoRestauranteId);

  if (error) {
    console.error('Error deleting carrito_producto:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Obtiene el carrito activo de una mesa o domicilio
 */
export async function obtenerCarritoActivo(
  tipo: 'mesa' | 'domicilio',
  id: number,
) {
  const supabase = await createClient();

  // Primero obtener el tipo_pedido
  const query = supabase
    .from('tipo_pedido')
    .select('id');

  if (tipo === 'mesa') {
    query.eq('mesa_id', id);
  } else {
    query.eq('domicilio_id', id);
  }

  const { data: tipoPedido, error: errorTipoPedido } = await query.single();

  if (errorTipoPedido || !tipoPedido) {
    return { success: false, carrito: null };
  }

  // Obtener el carrito con ese tipo_pedido_id
  const { data: carrito, error: errorCarrito } = await supabase
    .from('carrito')
    .select(`
      *,
      carrito_producto(*)
    `)
    .eq('tipo_pedido_id', tipoPedido.id)
    .in('estado', ['pendiente', 'en preparación'])
    .single();

  if (errorCarrito) {
    return { success: false, carrito: null };
  }

  return { success: true, carrito };
}
