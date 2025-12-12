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
  const serviceStartTime = Date.now();
  const supabase = await createClient();

  console.warn('🔨 [Service crearCarrito] ═══════════════════════════════════');
  console.warn('🔨 [Service crearCarrito] INICIO - Creando carrito completo');
  console.warn('🔨 [Service crearCarrito] Parámetros recibidos:', {
    tipoPedido: {
      tipo: tipoPedido.tipo,
      mesaId: tipoPedido.mesaId,
      domicilioId: tipoPedido.domicilioId,
    },
    carritoData: {
      restauranteId: carritoData.restauranteId,
      clienteId: carritoData.clienteId,
      productosCount: carritoData.productos.length,
      productosDetalle: carritoData.productos,
    },
  });

  try {
    // Primero, mapear los producto_id a producto_restaurante_id
    const productosIds = carritoData.productos.map(p => p.productoId);
    console.warn('🔍 [Service crearCarrito] Paso 0: Mapeando productos a restaurante...');
    console.warn('  ↳ productosIds:', productosIds);
    console.warn('  ↳ restauranteId:', carritoData.restauranteId);

    const mapStartTime = Date.now();
    const mapaProductos = await mapearProductosARestaurante(
      productosIds,
      carritoData.restauranteId,
    );
    const mapDuration = Date.now() - mapStartTime;

    console.warn(`🗺️ [Service crearCarrito] Mapa de productos obtenido en ${mapDuration}ms:`);
    console.warn('  ↳', Object.fromEntries(mapaProductos));

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

    // Paso 1: Verificar si ya existe un tipo_pedido para esta mesa/domicilio
    console.warn('📝 [Service crearCarrito] PASO 1: Verificando tipo_pedido existente...');
    const paso1StartTime = Date.now();

    let tipoPedidoCreado;
    let tipoPedidoExiste = false;

    if (tipoPedido.mesaId) {
      // Buscar tipo_pedido existente para esta mesa
      const { data: tipoPedidoExistente, error: errorBuscar } = await supabase
        .from('tipo_pedido')
        .select('id')
        .eq('mesa_id', tipoPedido.mesaId)
        .maybeSingle();

      if (errorBuscar) {
        console.error('❌ [Service crearCarrito] Error buscando tipo_pedido:', errorBuscar);
        throw new Error('Failed to check tipo_pedido');
      }

      if (tipoPedidoExistente) {
        tipoPedidoExiste = true;
        tipoPedidoCreado = tipoPedidoExistente;
        console.warn('✅ [Service crearCarrito] tipo_pedido existente encontrado:', {
          tipoPedidoId: tipoPedidoCreado.id,
          mesa_id: tipoPedido.mesaId,
          accion: 'Reutilizando tipo_pedido existente',
        });
      }
    } else if (tipoPedido.domicilioId) {
      // Buscar tipo_pedido existente para este domicilio
      const { data: tipoPedidoExistente, error: errorBuscar } = await supabase
        .from('tipo_pedido')
        .select('id')
        .eq('domicilio_id', tipoPedido.domicilioId)
        .maybeSingle();

      if (errorBuscar) {
        console.error('❌ [Service crearCarrito] Error buscando tipo_pedido:', errorBuscar);
        throw new Error('Failed to check tipo_pedido');
      }

      if (tipoPedidoExistente) {
        tipoPedidoExiste = true;
        tipoPedidoCreado = tipoPedidoExistente;
        console.warn('✅ [Service crearCarrito] tipo_pedido existente encontrado:', {
          tipoPedidoId: tipoPedidoCreado.id,
          domicilio_id: tipoPedido.domicilioId,
          accion: 'Reutilizando tipo_pedido existente',
        });
      }
    }

    // Si no existe, crear uno nuevo
    if (!tipoPedidoExiste) {
      console.warn('📝 [Service crearCarrito] No existe tipo_pedido, creando uno nuevo...');
      const tipoPedidoData = {
        mesa_id: tipoPedido.mesaId || null,
        domicilio_id: tipoPedido.domicilioId || null,
      };
      console.warn('  ↳ INSERT INTO tipo_pedido:', tipoPedidoData);

      const { data: nuevoTipoPedido, error: errorTipoPedido } = await supabase
        .from('tipo_pedido')
        .insert(tipoPedidoData)
        .select()
        .single();

      if (errorTipoPedido || !nuevoTipoPedido) {
        console.error('❌ [Service crearCarrito] Error creating tipo_pedido:', {
          error: errorTipoPedido,
          mensaje: errorTipoPedido?.message,
          detalles: errorTipoPedido?.details,
          hint: errorTipoPedido?.hint,
        });
        throw new Error('Failed to create tipo_pedido');
      }

      tipoPedidoCreado = nuevoTipoPedido;
      console.warn('✅ [Service crearCarrito] tipo_pedido creado:', {
        tipoPedidoId: tipoPedidoCreado.id,
        mesa_id: tipoPedidoCreado.mesa_id,
        domicilio_id: tipoPedidoCreado.domicilio_id,
      });
    }

    const paso1Duration = Date.now() - paso1StartTime;
    console.warn(`✅ [Service crearCarrito] PASO 1 completado en ${paso1Duration}ms`);

    // Paso 2: Verificar si ya existe un carrito para este tipo_pedido
    // NOTA: tipo_pedido_id es UNIQUE, así que solo puede haber UN carrito por tipo_pedido
    console.warn('📝 [Service crearCarrito] PASO 2: Verificando carrito existente...');
    const paso2StartTime = Date.now();

    // Buscar CUALQUIER carrito para este tipo_pedido (sin importar el estado)
    // porque tipo_pedido_id es UNIQUE en la tabla carrito
    const { data: carritoExistente, error: errorBuscarCarrito } = await supabase
      .from('carrito')
      .select('id, restaurante_id, tipo_pedido_id, estado')
      .eq('tipo_pedido_id', tipoPedidoCreado.id)
      .maybeSingle();

    if (errorBuscarCarrito) {
      console.error('❌ [Service crearCarrito] Error buscando carrito:', errorBuscarCarrito);
      throw new Error('Failed to check carrito');
    }

    let carritoCreado;
    let carritoReabierto = false;

    if (carritoExistente) {
      // Existe un carrito para este tipo_pedido
      const esCarritoActivo = ['pendiente', 'en preparación'].includes(carritoExistente.estado);

      if (esCarritoActivo) {
        // Reutilizar carrito activo
        carritoCreado = carritoExistente;
        console.warn('✅ [Service crearCarrito] Carrito activo existente encontrado, reutilizando:', {
          carritoId: carritoCreado.id,
          estado: carritoCreado.estado,
          accion: 'Agregando productos al carrito existente',
        });
      } else {
        // Carrito existe pero está cerrado/servido - reabrirlo
        console.warn('🔄 [Service crearCarrito] Carrito existente está cerrado, reabriendo...', {
          carritoId: carritoExistente.id,
          estadoAnterior: carritoExistente.estado,
        });

        const { data: carritoReabiertoData, error: errorReabrir } = await supabase
          .from('carrito')
          .update({ estado: 'pendiente' })
          .eq('id', carritoExistente.id)
          .select()
          .single();

        if (errorReabrir || !carritoReabiertoData) {
          console.error('❌ [Service crearCarrito] Error reabriendo carrito:', errorReabrir);
          throw new Error('Failed to reopen carrito');
        }

        carritoCreado = carritoReabiertoData;
        carritoReabierto = true;
        console.warn('✅ [Service crearCarrito] Carrito reabierto exitosamente:', {
          carritoId: carritoCreado.id,
          estadoNuevo: carritoCreado.estado,
          accion: 'Carrito reabierto y listo para agregar productos',
        });
      }
    } else {
      // Crear nuevo carrito
      console.warn('📝 [Service crearCarrito] No existe carrito activo, creando uno nuevo...');
      const carritoDataInsert = {
        restaurante_id: carritoData.restauranteId,
        tipo_pedido_id: tipoPedidoCreado.id,
        cliente_id: carritoData.clienteId || null,
        estado: 'pendiente',
      };
      console.warn('  ↳ INSERT INTO carrito:', carritoDataInsert);

      const { data: nuevoCarrito, error: errorCarrito } = await supabase
        .from('carrito')
        .insert(carritoDataInsert)
        .select()
        .single();

      if (errorCarrito || !nuevoCarrito) {
        console.error('❌ [Service crearCarrito] Error creating carrito:', {
          error: errorCarrito,
          mensaje: errorCarrito?.message,
          detalles: errorCarrito?.details,
          hint: errorCarrito?.hint,
        });
        throw new Error('Failed to create carrito');
      }

      carritoCreado = nuevoCarrito;
      console.warn('✅ [Service crearCarrito] Carrito creado:', {
        carritoId: carritoCreado.id,
        restauranteId: carritoCreado.restaurante_id,
        tipoPedidoId: carritoCreado.tipo_pedido_id,
        estado: carritoCreado.estado,
      });
    }

    const paso2Duration = Date.now() - paso2StartTime;
    console.warn(`✅ [Service crearCarrito] PASO 2 completado en ${paso2Duration}ms`);

    // Paso 3: Agregar productos al carrito (usar upsert para manejar productos existentes)
    console.warn('📝 [Service crearCarrito] PASO 3: Agregando productos al carrito...');
    const productosParaUpsert = carritoData.productos.map((prod) => {
      const productoRestauranteId = mapaProductos.get(prod.productoId);
      return {
        carrito_id: carritoCreado.id,
        producto_restaurante_id: productoRestauranteId!,
        cantidad: prod.cantidad,
        precio_unitario: prod.precioUnitario,
        subtotal: prod.subtotal,
      };
    });

    console.warn('📦 [Service crearCarrito] Preparando UPSERT de productos:', {
      carritoId: carritoCreado.id,
      productosCount: productosParaUpsert.length,
      productos: productosParaUpsert.map((p, idx) => ({
        indice: idx + 1,
        productoRestauranteId: p.producto_restaurante_id,
        cantidad: p.cantidad,
        precioUnitario: p.precio_unitario,
        subtotal: p.subtotal,
      })),
      accion: 'Si el producto ya existe, se actualizará la cantidad',
    });

    const paso3StartTime = Date.now();

    // Usar upsert para insertar o actualizar productos
    // Si el producto ya existe (mismo carrito_id + producto_restaurante_id), actualiza cantidad y subtotal
    const { data: productosUpserted, error: errorProductos } = await supabase
      .from('carrito_producto')
      .upsert(productosParaUpsert, {
        onConflict: 'carrito_id,producto_restaurante_id',
        ignoreDuplicates: false,
      })
      .select();

    const paso3Duration = Date.now() - paso3StartTime;

    if (errorProductos) {
      console.error('❌ [Service crearCarrito] Error upserting carrito_producto:', {
        error: errorProductos,
        mensaje: errorProductos?.message,
        detalles: errorProductos?.details,
        hint: errorProductos?.hint,
      });
      throw new Error('Failed to upsert carrito_producto');
    }

    console.warn(`✅ [Service crearCarrito] ${productosUpserted?.length || 0} productos agregados/actualizados en ${paso3Duration}ms`);

    // Paso 4: Si es mesa, actualizar estado a 'ocupada' (si es carrito nuevo o reabierto)
    if (tipoPedido.tipo === 'mesa' && tipoPedido.mesaId) {
      // Actualizar si es un carrito nuevo O si fue reabierto
      if (!carritoExistente || carritoReabierto) {
        const razon = !carritoExistente ? 'carrito nuevo' : 'carrito reabierto';
        console.warn(`📝 [Service crearCarrito] PASO 4: Actualizando mesa a OCUPADA (${razon})...`);
        console.warn(`  ↳ UPDATE mesa SET estado='ocupada' WHERE id=${tipoPedido.mesaId}`);

        const paso4StartTime = Date.now();
        const { data: mesaActualizada, error: errorMesa } = await supabase
          .from('mesa')
          .update({ estado: 'ocupada' })
          .eq('id', tipoPedido.mesaId)
          .select();
        const paso4Duration = Date.now() - paso4StartTime;

        if (errorMesa) {
          console.error(`❌ [Service crearCarrito] Error updating mesa estado después de ${paso4Duration}ms:`, {
            error: errorMesa,
            mensaje: errorMesa?.message,
            detalles: errorMesa?.details,
            hint: errorMesa?.hint,
            mesaId: tipoPedido.mesaId,
          });
          // No lanzar error, el carrito ya está creado
        } else {
          console.warn(`✅ [Service crearCarrito] Mesa actualizada a OCUPADA en ${paso4Duration}ms:`, {
            mesaId: tipoPedido.mesaId,
            estadoAnterior: mesaActualizada?.[0]?.estado || 'desconocido',
            estadoNuevo: 'ocupada',
            mesaActualizada: mesaActualizada?.[0],
          });
        }
      } else {
        console.warn('⏭️ [Service crearCarrito] PASO 4: Omitido (carrito activo existente, mesa ya debería estar ocupada)');
      }
    } else {
      console.warn('⏭️ [Service crearCarrito] PASO 4: Omitido (no es mesa o no tiene mesaId)');
    }

    const totalServiceDuration = Date.now() - serviceStartTime;
    console.warn(`🎉 [Service crearCarrito] PROCESO COMPLETADO EXITOSAMENTE en ${totalServiceDuration}ms`);

    let estadoCarrito = 'NO (carrito nuevo)';
    if (carritoExistente) {
      estadoCarrito = carritoReabierto
        ? 'SÍ (carrito reabierto desde cerrado)'
        : 'SÍ (carrito activo existente)';
    }

    console.warn('🎉 [Service crearCarrito] Resumen:', {
      carritoId: carritoCreado.id,
      tipoPedidoId: tipoPedidoCreado.id,
      restauranteId: carritoCreado.restaurante_id,
      estadoCarrito: carritoCreado.estado,
      productosAgregados: productosParaUpsert.length,
      carritoReutilizado: estadoCarrito,
      tipoPedidoReutilizado: tipoPedidoExiste ? 'SÍ (tipo_pedido existente)' : 'NO (tipo_pedido nuevo)',
      mesaActualizada: tipoPedido.tipo === 'mesa' && (!carritoExistente || carritoReabierto)
        ? `SÍ - Mesa ${tipoPedido.mesaId} → OCUPADA`
        : tipoPedido.tipo === 'mesa'
          ? `NO (carrito activo existente, mesa ya ocupada)`
          : 'N/A (domicilio)',
      tiempoTotal: `${totalServiceDuration}ms`,
      siguientePaso: 'API debe revalidar dashboard para que refleje el cambio',
    });
    console.warn('🔨 [Service crearCarrito] ═══════════════════════════════════\n');

    return {
      success: true,
      carritoId: carritoCreado.id,
      tipoPedidoId: tipoPedidoCreado.id,
    };
  } catch (error) {
    const totalServiceDuration = Date.now() - serviceStartTime;
    console.error(`❌ [Service crearCarrito] Error inesperado después de ${totalServiceDuration}ms:`, {
      error,
      mensaje: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'N/A',
    });
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

/**
 * Limpia un carrito cuando queda vacío:
 * - Elimina todos los productos de carrito_producto
 * - Actualiza mesa a 'disponible' si es mesa
 * - Opcionalmente elimina el carrito
 */
export async function limpiarCarritoVacio(
  carritoId: number,
  tipoPedido: TipoPedidoData,
) {
  const supabase = await createClient();
  const serviceStartTime = Date.now();

  console.warn('🧹 [Service limpiarCarritoVacio] INICIO - Limpiando carrito vacío:', {
    carritoId,
    tipo: tipoPedido.tipo,
    mesaId: tipoPedido.mesaId,
    domicilioId: tipoPedido.domicilioId,
  });

  try {
    // Paso 1: Eliminar todos los productos del carrito
    console.warn('📝 [Service limpiarCarritoVacio] PASO 1: Eliminando todos los productos...');
    const paso1StartTime = Date.now();

    const { error: errorEliminarProductos } = await supabase
      .from('carrito_producto')
      .delete()
      .eq('carrito_id', carritoId);

    const paso1Duration = Date.now() - paso1StartTime;

    if (errorEliminarProductos) {
      console.error('❌ [Service limpiarCarritoVacio] Error eliminando productos:', {
        error: errorEliminarProductos,
        mensaje: errorEliminarProductos?.message,
      });
      throw new Error('Failed to delete carrito_producto');
    }

    console.warn(`✅ [Service limpiarCarritoVacio] Productos eliminados en ${paso1Duration}ms`);

    // Paso 2: Si es mesa, actualizar estado a 'disponible'
    if (tipoPedido.tipo === 'mesa' && tipoPedido.mesaId) {
      console.warn('📝 [Service limpiarCarritoVacio] PASO 2: Actualizando mesa a DISPONIBLE...');
      console.warn(`  ↳ UPDATE mesa SET estado='disponible' WHERE id=${tipoPedido.mesaId}`);

      const paso2StartTime = Date.now();
      const { data: mesaActualizada, error: errorMesa } = await supabase
        .from('mesa')
        .update({ estado: 'disponible' })
        .eq('id', tipoPedido.mesaId)
        .select();

      const paso2Duration = Date.now() - paso2StartTime;

      if (errorMesa) {
        console.error(`❌ [Service limpiarCarritoVacio] Error actualizando mesa después de ${paso2Duration}ms:`, {
          error: errorMesa,
          mensaje: errorMesa?.message,
          detalles: errorMesa?.details,
          hint: errorMesa?.hint,
          mesaId: tipoPedido.mesaId,
        });
        // No lanzar error, los productos ya fueron eliminados
      } else {
        console.warn(`✅ [Service limpiarCarritoVacio] Mesa actualizada a DISPONIBLE en ${paso2Duration}ms:`, {
          mesaId: tipoPedido.mesaId,
          estadoAnterior: mesaActualizada?.[0]?.estado || 'desconocido',
          estadoNuevo: 'disponible',
          mesaActualizada: mesaActualizada?.[0],
        });
      }
    } else {
      console.warn('⏭️ [Service limpiarCarritoVacio] PASO 2: Omitido (no es mesa o no tiene mesaId)');
    }

    // Paso 3: Opcionalmente, eliminar el carrito (o marcarlo como cerrado)
    // Por ahora, dejamos el carrito en la BD pero sin productos
    // Si quieres eliminarlo completamente, descomenta esto:
    /*
    console.warn('📝 [Service limpiarCarritoVacio] PASO 3: Eliminando carrito...');
    const { error: errorEliminarCarrito } = await supabase
      .from('carrito')
      .delete()
      .eq('id', carritoId);

    if (errorEliminarCarrito) {
      console.error('❌ [Service limpiarCarritoVacio] Error eliminando carrito:', errorEliminarCarrito);
      // No lanzar error, los productos ya fueron eliminados
    } else {
      console.warn('✅ [Service limpiarCarritoVacio] Carrito eliminado');
    }
    */

    const totalServiceDuration = Date.now() - serviceStartTime;
    console.warn(`🎉 [Service limpiarCarritoVacio] PROCESO COMPLETADO EXITOSAMENTE en ${totalServiceDuration}ms`);
    console.warn('🎉 [Service limpiarCarritoVacio] Resumen:', {
      carritoId,
      productosEliminados: 'TODOS',
      mesaActualizada: tipoPedido.tipo === 'mesa' && tipoPedido.mesaId
        ? `SÍ - Mesa ${tipoPedido.mesaId} → DISPONIBLE`
        : 'N/A (domicilio)',
      tiempoTotal: `${totalServiceDuration}ms`,
      siguientePaso: 'API debe revalidar dashboard para que refleje el cambio',
    });
    console.warn('🧹 [Service limpiarCarritoVacio] ═══════════════════════════════════\n');

    return {
      success: true,
      carritoId,
    };
  } catch (error) {
    const totalServiceDuration = Date.now() - serviceStartTime;
    console.error(`❌ [Service limpiarCarritoVacio] Error inesperado después de ${totalServiceDuration}ms:`, {
      error,
      mensaje: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'N/A',
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
