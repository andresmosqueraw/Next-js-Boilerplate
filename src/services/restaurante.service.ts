import type { Domicilio, Mesa, Restaurante } from '@/types/database';
import { createClient } from '@/libs/supabase/server';

export async function getRestaurantes(): Promise<Restaurante[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('restaurante')
    .select('*')
    .order('id', { ascending: true }); // Ordenar por ID para obtener siempre el primer restaurante creado

  if (error) {
    console.error('Error fetching restaurantes:', error);
    return [];
  }

  return data || [];
}

export async function getMesas(): Promise<Mesa[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('mesa')
    .select('*')
    .order('restaurante_id', { ascending: true })
    .order('numero_mesa', { ascending: true });

  if (error) {
    console.error('Error fetching mesas:', error);
    return [];
  }

  return data || [];
}

export type DomicilioConRestaurantes = Domicilio & {
  restaurantes_ids: number[];
  cliente_nombre?: string;
};

export async function getDomicilios(): Promise<Domicilio[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('domicilio')
    .select('*')
    .order('creado_en', { ascending: false });

  if (error) {
    console.error('Error fetching domicilios:', error);
    return [];
  }

  return data || [];
}

/**
 * Obtiene todos los domicilios de clientes registrados en restaurantes
 * Basado en la consulta SQL optimizada: cliente_restaurante → cliente → domicilio
 * Usa cliente_ranking para priorizar clientes activos (con compras) sobre potenciales
 * 
 * @param restauranteId - Opcional: filtrar por restaurante específico. Si no se proporciona, retorna todos.
 */
export async function getDomiciliosConRelaciones(restauranteId?: number): Promise<DomicilioConRestaurantes[]> {
  const supabase = await createClient();

  // Paso 1: Obtener clientes registrados en restaurantes (cliente_restaurante)
  // Si se proporciona restauranteId, filtrar por ese restaurante
  let clientesRestauranteQuery = supabase
    .from('cliente_restaurante')
    .select('cliente_id, restaurante_id, ultima_interaccion');

  if (restauranteId) {
    clientesRestauranteQuery = clientesRestauranteQuery.eq('restaurante_id', restauranteId);
  }

  // Paso 2: Obtener información de cliente_ranking en paralelo (para priorizar clientes activos)
  let clienteRankingQuery = supabase
    .from('cliente_ranking')
    .select('cliente_id, restaurante_id, numero_compras');

  if (restauranteId) {
    clienteRankingQuery = clienteRankingQuery.eq('restaurante_id', restauranteId);
  }

  const [clientesRestauranteResult, clienteRankingResult] = await Promise.all([
    clientesRestauranteQuery,
    clienteRankingQuery,
  ]);

  const { data: clientesRestaurante, error: clientesRestError } = clientesRestauranteResult;
  const { data: clienteRanking, error: rankingError } = clienteRankingResult;

  if (clientesRestError) {
    console.error('Error fetching cliente_restaurante:', clientesRestError);
    return [];
  }

  if (rankingError) {
    console.warn('⚠️ [getDomiciliosConRelaciones] Error fetching cliente_ranking (continuando sin información de compras):', rankingError);
  }

  if (!clientesRestaurante || clientesRestaurante.length === 0) {
    console.warn(`⚠️ [getDomiciliosConRelaciones] No hay clientes registrados en cliente_restaurante${restauranteId ? ` para restaurante ${restauranteId}` : ''}`);
    return [];
  }

  console.log(`✅ [getDomiciliosConRelaciones] Encontrados ${clientesRestaurante.length} clientes en cliente_restaurante${restauranteId ? ` para restaurante ${restauranteId}` : ''}`);
  console.log(`📊 [getDomiciliosConRelaciones] Encontrados ${clienteRanking?.length || 0} clientes activos en cliente_ranking${restauranteId ? ` para restaurante ${restauranteId}` : ''}`);

  // Crear mapa de cliente_id -> restaurante_ids y ordenar por prioridad
  const clienteRestaurantesMap = new Map<number, Set<number>>();
  const clientePrioridadMap = new Map<number, { restauranteId: number; numeroCompras: number; ultimaInteraccion: Date }[]>();

  clientesRestaurante.forEach((cr) => {
    if (!clienteRestaurantesMap.has(cr.cliente_id)) {
      clienteRestaurantesMap.set(cr.cliente_id, new Set());
    }
    clienteRestaurantesMap.get(cr.cliente_id)!.add(cr.restaurante_id);

    // Guardar información de prioridad
    if (!clientePrioridadMap.has(cr.cliente_id)) {
      clientePrioridadMap.set(cr.cliente_id, []);
    }
    clientePrioridadMap.get(cr.cliente_id)!.push({
      restauranteId: cr.restaurante_id,
      numeroCompras: 0,
      ultimaInteraccion: new Date(cr.ultima_interaccion || Date.now()),
    });
  });

  // Actualizar con información de cliente_ranking (clientes activos)
  // Esto corresponde al LEFT JOIN en la consulta SQL
  // Los clientes que tienen registro en cliente_ranking son ACTIVOS (han comprado)
  // Los que no tienen registro son POTENCIALES (solo registrados)
  clienteRanking?.forEach((rank) => {
    const prioridades = clientePrioridadMap.get(rank.cliente_id);
    if (prioridades) {
      const prioridad = prioridades.find(p => p.restauranteId === rank.restaurante_id);
      if (prioridad) {
        prioridad.numeroCompras = rank.numero_compras || 0;
      } else {
        // Si el cliente está en cliente_ranking pero no en cliente_restaurante para este restaurante,
        // agregarlo (esto no debería pasar normalmente, pero por si acaso)
        console.warn(`⚠️ [getDomiciliosConRelaciones] Cliente ${rank.cliente_id} en cliente_ranking pero no en cliente_restaurante para restaurante ${rank.restaurante_id}`);
      }
    }
  });

  // Contar clientes activos vs potenciales
  const clientesActivos = new Set(clienteRanking?.map(r => r.cliente_id) || []);
  const clientesPotenciales = Array.from(clienteRestaurantesMap.keys()).filter(id => !clientesActivos.has(id));
  console.log(`📈 [getDomiciliosConRelaciones] Clientes ACTIVOS (con compras): ${clientesActivos.size}, POTENCIALES (solo registrados): ${clientesPotenciales.length}`);

  // Paso 3: Obtener todos los domicilios de estos clientes
  const clienteIds = Array.from(clienteRestaurantesMap.keys());
  const { data: domicilios, error: domiciliosError } = await supabase
    .from('domicilio')
    .select(`
      *,
      cliente:cliente_id (
        id,
        nombre
      )
    `)
    .in('cliente_id', clienteIds)
    .order('creado_en', { ascending: false });

  if (domiciliosError) {
    console.error('Error fetching domicilios:', domiciliosError);
    return [];
  }

  if (!domicilios || domicilios.length === 0) {
    console.warn(`⚠️ [getDomiciliosConRelaciones] No hay domicilios para los ${clienteIds.length} clientes encontrados`);
    return [];
  }

  console.log(`✅ [getDomiciliosConRelaciones] Encontrados ${domicilios.length} domicilios para ${clienteIds.length} clientes`);

  // Paso 4: Obtener información de pedidos para determinar restaurantes que han hecho pedidos
  // Esto es para el estado "Con pedido" vs "Disponible"
  const [tiposPedidoResult, carritosResult] = await Promise.all([
    supabase
      .from('tipo_pedido')
      .select('id, domicilio_id')
      .not('domicilio_id', 'is', null)
      .in('domicilio_id', domicilios.map(d => d.id)),
    supabase
      .from('carrito')
      .select('tipo_pedido_id, restaurante_id'),
  ]);

  const { data: tiposPedido } = tiposPedidoResult;
  const { data: carritos } = carritosResult;

  // Crear mapa de tipo_pedido_id -> restaurante_ids (para pedidos históricos)
  const tipoPedidoRestaurantesMap = new Map<number, Set<number>>();
  carritos?.forEach((carrito) => {
    if (!tipoPedidoRestaurantesMap.has(carrito.tipo_pedido_id)) {
      tipoPedidoRestaurantesMap.set(carrito.tipo_pedido_id, new Set());
    }
    if (carrito.restaurante_id) {
      tipoPedidoRestaurantesMap.get(carrito.tipo_pedido_id)!.add(carrito.restaurante_id);
    }
  });

  // Crear mapa de domicilio_id -> restaurante_ids (de pedidos históricos)
  const domicilioPedidosMap = new Map<number, Set<number>>();
  tiposPedido?.forEach((tp) => {
    if (tp.domicilio_id) {
      if (!domicilioPedidosMap.has(tp.domicilio_id)) {
        domicilioPedidosMap.set(tp.domicilio_id, new Set());
      }
      const restaurantes = tipoPedidoRestaurantesMap.get(tp.id);
      if (restaurantes) {
        restaurantes.forEach(restId => {
          domicilioPedidosMap.get(tp.domicilio_id)!.add(restId);
        });
      }
    }
  });

  // Paso 5: Combinar la información y ordenar por prioridad
  const domiciliosConRestaurantes = domicilios.map((domicilio) => {
    const cliente = (domicilio as any).cliente;
    const clienteNombre = cliente?.nombre || undefined;
    const clienteId = domicilio.cliente_id;

    // Restaurantes donde el cliente está registrado
    const restaurantesRegistrados = clienteRestaurantesMap.get(clienteId) || new Set();
    
    // Restaurantes que han hecho pedidos a este domicilio
    const restaurantesConPedidos = domicilioPedidosMap.get(domicilio.id) || new Set();
    
    // Combinar ambos sets (restaurantes registrados + restaurantes con pedidos)
    const todosLosRestaurantes = new Set([
      ...Array.from(restaurantesRegistrados),
      ...Array.from(restaurantesConPedidos),
    ]);

    // Obtener prioridad del cliente (número de compras y última interacción)
    const prioridades = clientePrioridadMap.get(clienteId) || [];
    const maxCompras = Math.max(...prioridades.map(p => p.numeroCompras), 0);
    // Obtener la última interacción más reciente del cliente con cualquier restaurante
    const ultimaInteraccion = prioridades.length > 0
      ? new Date(Math.max(...prioridades.map(p => p.ultimaInteraccion.getTime())))
      : new Date(0);
    
    const { cliente: _, ...domicilioSinCliente } = domicilio as any;
    
    return {
      ...domicilioSinCliente,
      restaurantes_ids: Array.from(todosLosRestaurantes),
      cliente_nombre: clienteNombre,
      _prioridad: maxCompras, // Para ordenamiento por número de compras
      _ultimaInteraccion: ultimaInteraccion, // Para ordenamiento secundario
    } as DomicilioConRestaurantes & { _prioridad: number; _ultimaInteraccion: Date };
  });

  // Ordenar: primero clientes activos (con compras), luego por última interacción
  // Esto corresponde al ORDER BY de la consulta SQL: total_compras DESC, ultima_interaccion DESC
  domiciliosConRestaurantes.sort((a, b) => {
    // 1. Priorizar por número de compras (clientes activos primero)
    if (b._prioridad !== a._prioridad) {
      return b._prioridad - a._prioridad;
    }
    // 2. Luego por última interacción (más recientes primero)
    return b._ultimaInteraccion.getTime() - a._ultimaInteraccion.getTime();
  });

  console.log(`✅ [getDomiciliosConRelaciones] Retornando ${domiciliosConRestaurantes.length} domicilios ordenados (activos primero, luego por última interacción)`);

  // Remover campos temporales de prioridad
  return domiciliosConRestaurantes.map(({ _prioridad, _ultimaInteraccion, ...domicilio }) => domicilio);
}

export async function getMesasByRestaurante(restauranteId: number): Promise<Mesa[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('mesa')
    .select('*')
    .eq('restaurante_id', restauranteId)
    .order('numero_mesa', { ascending: true });

  if (error) {
    console.error('Error fetching mesas by restaurante:', error);
    return [];
  }

  return data || [];
}

export async function getDomiciliosByCliente(clienteId: number): Promise<Domicilio[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('domicilio')
    .select('*')
    .eq('cliente_id', clienteId)
    .order('creado_en', { ascending: false });

  if (error) {
    console.error('Error fetching domicilios by cliente:', error);
    return [];
  }

  return data || [];
}

export async function getDomiciliosByRestaurante(restauranteId: number): Promise<Domicilio[]> {
  const supabase = await createClient();

  // Paso 1: Obtener todos los carritos de este restaurante
  const { data: carritos, error: carritosError } = await supabase
    .from('carrito')
    .select('tipo_pedido_id')
    .eq('restaurante_id', restauranteId);

  if (carritosError || !carritos || carritos.length === 0) {
    console.error('Error fetching carritos:', carritosError);
    return [];
  }

  // Paso 2: Obtener los tipo_pedido_ids
  const tipoPedidoIds = carritos.map(c => c.tipo_pedido_id);

  // Paso 3: Obtener los domicilio_ids desde tipo_pedido
  const { data: tiposPedido, error: tiposError } = await supabase
    .from('tipo_pedido')
    .select('domicilio_id')
    .in('id', tipoPedidoIds)
    .not('domicilio_id', 'is', null);

  if (tiposError || !tiposPedido || tiposPedido.length === 0) {
    console.error('Error fetching tipos_pedido:', tiposError);
    return [];
  }

  // Paso 4: Obtener los domicilios
  const domicilioIds = tiposPedido
    .map(tp => tp.domicilio_id)
    .filter((id): id is number => id !== null);

  if (domicilioIds.length === 0) {
    return [];
  }

  const { data: domicilios, error: domiciliosError } = await supabase
    .from('domicilio')
    .select('*')
    .in('id', domicilioIds)
    .order('creado_en', { ascending: false });

  if (domiciliosError) {
    console.error('Error fetching domicilios:', domiciliosError);
    return [];
  }

  return domicilios || [];
}

/**
 * Obtiene los IDs de las mesas que tienen carritos activos con productos
 * Optimizado: reduce consultas y elimina logs innecesarios
 */
export async function getMesasConCarritoActivo(restauranteId: number): Promise<number[]> {
  const supabase = await createClient();

  // Paso 1: Obtener carritos activos
  const { data: carritos, error: carritosError } = await supabase
    .from('carrito')
    .select('id, tipo_pedido_id')
    .eq('restaurante_id', restauranteId)
    .in('estado', ['pendiente', 'en preparación']);

  if (carritosError || !carritos || carritos.length === 0) {
    return [];
  }

  // Paso 2: Verificar productos (en paralelo con paso 3)
  const carritoIds = carritos.map(c => c.id);
  const [productosResult, tiposPedidoResult] = await Promise.all([
    supabase
      .from('carrito_producto')
      .select('carrito_id')
      .in('carrito_id', carritoIds),
    supabase
      .from('tipo_pedido')
      .select('id, mesa_id')
      .in('id', carritos.map(c => c.tipo_pedido_id))
      .not('mesa_id', 'is', null),
  ]);

  const { data: productos } = productosResult;
  const { data: tiposPedido, error: tiposError } = tiposPedidoResult;

  if (!productos || productos.length === 0 || tiposError || !tiposPedido) {
    return [];
  }

  // Filtrar: solo tipo_pedido de carritos que tienen productos
  const carritosConProductos = new Set(productos.map(p => p.carrito_id));
  const tipoPedidoIdsConProductos = new Set(
    carritos
      .filter(c => carritosConProductos.has(c.id))
      .map(c => c.tipo_pedido_id)
  );

  return tiposPedido
    .filter(tp => tipoPedidoIdsConProductos.has(tp.id))
    .map(tp => tp.mesa_id)
    .filter((id): id is number => id !== null);
}

/**
 * Obtiene los IDs de los domicilios que tienen carritos activos con productos
 * Optimizado: reduce consultas y elimina logs innecesarios
 */
export async function getDomiciliosConCarritoActivo(restauranteId: number): Promise<number[]> {
  const supabase = await createClient();

  // Paso 1: Obtener carritos activos
  const { data: carritos, error: carritosError } = await supabase
    .from('carrito')
    .select('id, tipo_pedido_id')
    .eq('restaurante_id', restauranteId)
    .in('estado', ['pendiente', 'en preparación']);

  if (carritosError || !carritos || carritos.length === 0) {
    return [];
  }

  // Paso 2 y 3: Verificar productos y obtener tipo_pedido en paralelo
  const carritoIds = carritos.map(c => c.id);
  const tipoPedidoIds = carritos.map(c => c.tipo_pedido_id);

  const [productosResult, tiposPedidoResult] = await Promise.all([
    supabase
      .from('carrito_producto')
      .select('carrito_id')
      .in('carrito_id', carritoIds),
    supabase
      .from('tipo_pedido')
      .select('id, domicilio_id')
      .in('id', tipoPedidoIds)
      .not('domicilio_id', 'is', null),
  ]);

  const { data: productos } = productosResult;
  const { data: tiposPedido, error: tiposError } = tiposPedidoResult;

  if (!productos || productos.length === 0 || tiposError || !tiposPedido) {
    return [];
  }

  // Filtrar: solo tipo_pedido de carritos que tienen productos
  const carritosConProductos = new Set(productos.map(p => p.carrito_id));
  const tipoPedidoIdsConProductos = new Set(
    carritos
      .filter(c => carritosConProductos.has(c.id))
      .map(c => c.tipo_pedido_id)
  );

  return tiposPedido
    .filter(tp => tipoPedidoIdsConProductos.has(tp.id))
    .map(tp => tp.domicilio_id)
    .filter((id): id is number => id !== null);
}
