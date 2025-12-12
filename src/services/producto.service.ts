import type { Product } from '@/app/[locale]/(auth)/pos/context/cart-context';
import type { Categoria } from '@/types/database';
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
 * Mapea el nombre de categoría de Supabase a un slug usado en el frontend
 */
function mapearNombreCategoriaASlug(nombreCategoria: string): string {
  const nombreLower = nombreCategoria.toLowerCase();

  // Mapeo directo de nombres comunes
  if (nombreLower === 'comida' || nombreLower === 'food'
    || nombreLower === 'platos' || nombreLower === 'entradas') {
    return 'food';
  }

  if (nombreLower === 'bebidas' || nombreLower === 'drinks'
    || nombreLower === 'refrescos') {
    return 'drinks';
  }

  if (nombreLower === 'postres' || nombreLower === 'desserts'
    || nombreLower === 'dulces') {
    return 'desserts';
  }

  // Por defecto, crear slug (lowercase, sin espacios)
  return nombreCategoria.toLowerCase().replace(/\s+/g, '-');
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
        precio,
        categoria_id,
        categoria:categoria_id (
          nombre
        )
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

      // Obtener nombre de categoría (puede ser objeto o string)
      const categoria = producto.categoria;
      let nombreCategoria = 'food'; // default

      if (categoria) {
        if (Array.isArray(categoria) && categoria[0] && typeof categoria[0] === 'object' && 'nombre' in categoria[0]) {
          nombreCategoria = String(categoria[0].nombre);
        } else if (typeof categoria === 'object' && 'nombre' in categoria && typeof categoria.nombre === 'string') {
          nombreCategoria = categoria.nombre;
        }
      }

      return {
        id: producto.id,
        name: producto.nombre,
        price: Number(producto.precio),
        image: asignarImagenAProducto(producto.id),
        category: mapearNombreCategoriaASlug(nombreCategoria),
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

/**
 * Obtiene todas las categorías ordenadas
 */
export async function getCategorias(): Promise<Categoria[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('categoria')
    .select('*')
    .order('orden', { ascending: true })
    .order('nombre', { ascending: true });

  if (error) {
    console.error('Error fetching categorias:', error);
    return [];
  }

  return data || [];
}

/**
 * Tipo para categorías con slug para el frontend
 */
export type CategoriaConSlug = Categoria & {
  slug: string;
};

/**
 * Obtiene categorías y agrega slug para el frontend
 */
export async function getCategoriasConSlug(): Promise<CategoriaConSlug[]> {
  const categorias = await getCategorias();

  return categorias.map(cat => ({
    ...cat,
    slug: mapearNombreCategoriaASlug(cat.nombre),
  }));
}
