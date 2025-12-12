import { createClient } from '@/libs/supabase/server';

/**
 * Obtiene el producto_restaurante_id para un producto y restaurante dados
 */
export async function getProductoRestauranteId(
  productoId: number,
  restauranteId: number,
): Promise<number | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('producto_restaurante')
    .select('id')
    .eq('producto_id', productoId)
    .eq('restaurante_id', restauranteId)
    .single();

  if (error || !data) {
    console.error(`Error buscando producto_restaurante:`, error);
    return null;
  }

  return data.id;
}

/**
 * Obtiene todos los IDs de producto_restaurante para una lista de productos
 */
export async function mapearProductosARestaurante(
  productosIds: number[],
  restauranteId: number,
): Promise<Map<number, number>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('producto_restaurante')
    .select('id, producto_id')
    .eq('restaurante_id', restauranteId)
    .in('producto_id', productosIds);

  if (error || !data) {
    console.error('Error mapeando productos:', error);
    return new Map();
  }

  // Crear mapa: producto_id -> producto_restaurante_id
  const mapa = new Map<number, number>();
  data.forEach((item) => {
    mapa.set(item.producto_id, item.id);
  });

  return mapa;
}
