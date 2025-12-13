'use client';

import type { Product } from './context/cart-context';
import type { CategoriaConSlug } from '@/services/producto.service';
import { MapPin, Search, Table } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import CartSidebar from '@/components/cart-sidebar';
import CategorySidebar from '@/components/category-sidebar';
import ProductGrid from '@/components/product-grid';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const EMPTY_CATEGORIAS: CategoriaConSlug[] = [];

export function POSClient({
  productos,
  categorias = EMPTY_CATEGORIAS,
}: {
  productos: Product[];
  categorias?: CategoriaConSlug[];
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const searchParams = useSearchParams();

  // Obtener información del tipo de pedido
  const tipo = searchParams.get('tipo');
  const id = searchParams.get('id');
  const numero = searchParams.get('numero');
  const clienteId = searchParams.get('clienteId');
  const restauranteId = searchParams.get('restauranteId');

  // Interceptar el botón "atrás" del navegador
  useEffect(() => {
    let isHandling = false;

    // Función que se ejecuta cuando el usuario presiona "atrás"
    const handlePopState = () => {
      // Prevenir múltiples ejecuciones
      if (isHandling) {
        return;
      }

      // Verificar si todavía estamos en el POS después del popstate
      const currentPath = window.location.pathname;
      const stillInPOS = currentPath.includes('/pos');

      if (stillInPOS) {
        isHandling = true;
        console.warn('🔄 [POSClient] Botón atrás detectado, navegando al dashboard y recargando 2 veces...');

        // Construir URL del dashboard con restauranteId
        const dashboardUrl = restauranteId
          ? `/dashboard?restauranteId=${restauranteId}`
          : '/dashboard';

        // Marcar en sessionStorage que viene del botón atrás y que debe recargar 2 veces
        const timestamp = Date.now();
        sessionStorage.setItem('dashboard_reload_from_back', 'true');
        sessionStorage.setItem('dashboard_reload_timestamp', timestamp.toString());
        sessionStorage.setItem('dashboard_reload_twice', 'true');

        // Navegar al dashboard - las recargas se harán en el dashboard
        window.location.href = dashboardUrl;
      }
    };

    // Escuchar el evento popstate (se dispara cuando el usuario presiona "atrás")
    window.addEventListener('popstate', handlePopState);

    // Limpiar el listener cuando el componente se desmonte
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [restauranteId]);

  return (
    <div className="flex h-screen bg-background">
      <CategorySidebar
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        categorias={categorias}
      />

      <main className="flex h-screen flex-1 flex-col overflow-hidden">
        <div className="sticky top-0 z-10 border-b bg-background p-4">
          {/* Banner de tipo de pedido */}
          {tipo && (
            <div className="group relative mb-3 rounded-lg bg-border p-[1px] transition-transform duration-500 ease-in-out hover:scale-105">
              {/* Gradiente de fondo */}
              <div
                className={cn(
                  'absolute inset-0 rounded-lg bg-gradient-to-bl opacity-80 transition-all duration-500 ease-in-out',
                  tipo === 'mesa'
                    ? 'from-emerald-500 via-emerald-500/20 to-transparent'
                    : 'from-blue-500 via-blue-500/20 to-transparent',
                )}
                style={{
                  maskImage: 'linear-gradient(135deg, black 0%, transparent 50%)',
                  WebkitMaskImage: 'linear-gradient(135deg, black 0%, transparent 50%)',
                }}
              />
              <div
                className={cn(
                  'absolute inset-0 rounded-lg bg-gradient-to-bl opacity-0 group-hover:opacity-80 transition-opacity duration-500 ease-in-out',
                  tipo === 'mesa'
                    ? 'from-emerald-500 via-emerald-500/20 to-transparent'
                    : 'from-blue-500 via-blue-500/20 to-transparent',
                )}
                style={{
                  maskImage: 'linear-gradient(135deg, black 0%, transparent 70%)',
                  WebkitMaskImage: 'linear-gradient(135deg, black 0%, transparent 70%)',
                }}
              />
              {/* Contenido */}
              <div className="relative rounded-lg bg-card p-3">
                <div className="flex items-center gap-2">
                  {tipo === 'mesa'
                    ? (
                        <>
                          <Table className="h-4 w-4 text-emerald-500" />
                          <span className="text-sm font-medium text-foreground">
                            Mesa
                            {' '}
                            {numero}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            (ID:
                            {' '}
                            {id}
                            )
                          </span>
                        </>
                      )
                    : (
                        <>
                          <MapPin className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-medium text-foreground">
                            Pedido a Domicilio
                          </span>
                          <span className="text-xs text-muted-foreground">
                            (Cliente ID:
                            {' '}
                            {clienteId}
                            )
                          </span>
                        </>
                      )}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Punto de Venta</h1>
            <div className="relative w-64">
              <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar productos..."
                className="pl-8"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <ProductGrid
            category={selectedCategory}
            searchQuery={searchQuery}
            productos={productos}
          />
        </div>
      </main>

      <CartSidebar />
    </div>
  );
}
