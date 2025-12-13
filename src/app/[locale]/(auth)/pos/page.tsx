import { getCategoriasConSlug, getProductosByRestaurante } from '@/services/producto.service';
import { POSClient } from './POSClient';

export default async function POSPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const restauranteId = params.restauranteId;

  // Obtener productos y categorías del restaurante
  const [productos, categorias] = restauranteId
    ? await Promise.all([
        getProductosByRestaurante(Number(restauranteId)),
        getCategoriasConSlug(Number(restauranteId)),
      ])
    : [[], []];

  if (!restauranteId) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="text-muted-foreground">
            No se especificó el restaurante
          </p>
        </div>
      </div>
    );
  }

  if (productos.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Sin Productos</h1>
          <p className="text-muted-foreground">
            Este restaurante no tiene productos disponibles
          </p>
        </div>
      </div>
    );
  }

  return <POSClient productos={productos} categorias={categorias} />;
}
