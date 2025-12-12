import type { Product } from '@/app/[locale]/(auth)/pos/context/cart-context';
import { createClient } from '@/libs/supabase/server';

// Imágenes disponibles para asignar aleatoriamente
const IMAGENES_DISPONIBLES = [
  '/classic-beef-burger.png',
  '/delicious-pizza.png',
  '/vibrant-mixed-salad.png',
  '/crispy-chicken-wings.png',
  '/crispy-french-fries.png',
  '/refreshing-cola.png',
  '/iced-tea.png',
  '/glass-of-orange-juice.png',
  '/latte-coffee.png',
  '/bottled-water.png',
  '/chocolate-cake-slice.png',
  '/cheesecake-slice.png',
  '/ice-cream-sundae.png',
  '/apple-pie-slice.png',
  '/chocolate-brownie.png',
];

/**
 * Asigna una imagen aleatoria basada en el ID del producto (determinista)
 */
function asignarImagenAProducto(productoId: number): string {
  const index = productoId % IMAGENES_DISPONIBLES.length;
  return IMAGENES_DISPONIBLES[index] || '/placeholder.svg';
}

/**
 * Determina la categoría del producto basándose en su nombre
 */
function determinarCategoria(nombre: string): string {
  const nombreLower = nombre.toLowerCase();

  if (nombreLower.includes('burger') || nombreLower.includes('hamburguesa')
    || nombreLower.includes('pizza') || nombreLower.includes('salad')
    || nombreLower.includes('ensalada') || nombreLower.includes('wings')
    || nombreLower.includes('alitas') || nombreLower.includes('fries')
    || nombreLower.includes('papas')) {
    return 'food';
  }

  if (nombreLower.includes('cake') || nombreLower.includes('pastel')
    || nombreLower.includes('ice cream') || nombreLower.includes('helado')
    || nombreLower.includes('pie') || nombreLower.includes('brownie')
    || nombreLower.includes('cheese')) {
    return 'desserts';
  }

  if (nombreLower.includes('cola') || nombreLower.includes('coffee')
    || nombreLower.includes('café') || nombreLower.includes('tea')
    || nombreLower.includes('té') || nombreLower.includes('juice')
    || nombreLower.includes('jugo') || nombreLower.includes('water')
    || nombreLower.includes('agua') || nombreLower.includes('latte')) {
    return 'drinks';
  }

  return 'food'; // Default
}

/**
 * Obtiene todos los productos disponibles de un restaurante
 */
export async function getProductosByRestaurante(
  restauranteId: number,
): Promise<Product[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('producto_restaurante')
    .select(`
      id,
      disponible,
      producto:producto_id (
        id,
        nombre,
        descripcion,
        precio
      )
    `)
    .eq('restaurante_id', restauranteId)
    .eq('disponible', true);

  if (error) {
    console.error('Error fetching productos by restaurante:', error);
    return [];
  }

  if (!data || data.length === 0) {
    console.warn(`No hay productos disponibles para restaurante ${restauranteId}`);
    return [];
  }

  // Transformar los datos al formato Product
  const productos: Product[] = data
    .filter(item => item.producto) // Filtrar items sin producto
    .map((item) => {
      const producto = Array.isArray(item.producto) ? item.producto[0] : item.producto;

      // Type guard: asegurar que producto existe
      if (!producto) {
        throw new Error('Producto no encontrado después del filtro');
      }

      return {
        id: producto.id,
        name: producto.nombre,
        price: Number(producto.precio),
        image: asignarImagenAProducto(producto.id),
        category: determinarCategoria(producto.nombre),
      };
    });

  console.warn(`✅ Cargados ${productos.length} productos para restaurante ${restauranteId}`);

  return productos;
}

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
