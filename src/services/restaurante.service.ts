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

export async function getDomiciliosConRelaciones(): Promise<DomicilioConRestaurantes[]> {
  const supabase = await createClient();

  // Paso 1: Obtener todos los domicilios
  const { data: domicilios, error: domiciliosError } = await supabase
    .from('domicilio')
    .select('*')
    .order('creado_en', { ascending: false });

  if (domiciliosError) {
    console.error('Error fetching domicilios:', domiciliosError);
    return [];
  }

  if (!domicilios || domicilios.length === 0) {
    return [];
  }

  // Paso 2: Obtener todos los tipo_pedido que tienen domicilio_id
  const { data: tiposPedido, error: tiposError } = await supabase
    .from('tipo_pedido')
    .select('id, domicilio_id')
    .not('domicilio_id', 'is', null);

  if (tiposError) {
    console.error('Error fetching tipos_pedido:', tiposError);
    // Continuar sin relaciones
    return domicilios.map(d => ({ ...d, restaurantes_ids: [] }));
  }

  if (!tiposPedido || tiposPedido.length === 0) {
    return domicilios.map(d => ({ ...d, restaurantes_ids: [] }));
  }

  // Paso 3: Obtener todos los carritos relacionados
  const tipoPedidoIds = tiposPedido.map(tp => tp.id);
  const { data: carritos, error: carritosError } = await supabase
    .from('carrito')
    .select('tipo_pedido_id, restaurante_id')
    .in('tipo_pedido_id', tipoPedidoIds);

  if (carritosError) {
    console.error('Error fetching carritos:', carritosError);
    return domicilios.map(d => ({ ...d, restaurantes_ids: [] }));
  }

  // Paso 4: Crear un mapa de domicilio_id -> restaurante_ids
  const domicilioRestaurantesMap = new Map<number, Set<number>>();

  tiposPedido.forEach((tp) => {
    if (tp.domicilio_id) {
      if (!domicilioRestaurantesMap.has(tp.domicilio_id)) {
        domicilioRestaurantesMap.set(tp.domicilio_id, new Set());
      }

      // Buscar carritos con este tipo_pedido_id
      const carritosRelacionados = carritos?.filter(c => c.tipo_pedido_id === tp.id);
      carritosRelacionados?.forEach((carrito) => {
        if (carrito.restaurante_id) {
          domicilioRestaurantesMap.get(tp.domicilio_id)!.add(carrito.restaurante_id);
        }
      });
    }
  });

  // Paso 5: Combinar la información
  const domiciliosConRestaurantes = domicilios.map((domicilio) => {
    const restaurantesIds = domicilioRestaurantesMap.get(domicilio.id) || new Set();
    return {
      ...domicilio,
      restaurantes_ids: Array.from(restaurantesIds),
    } as DomicilioConRestaurantes;
  });

  return domiciliosConRestaurantes;
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
