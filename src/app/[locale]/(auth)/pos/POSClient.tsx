'use client';

import type { Product } from './context/cart-context';
import type { CategoriaConSlug } from '@/services/producto.service';
import { MapPin, Search, Table } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
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
  const router = useRouter();

  // Obtener información del tipo de pedido
  const tipo = searchParams.get('tipo');
  const id = searchParams.get('id');
  const numero = searchParams.get('numero');
  const clienteId = searchParams.get('clienteId');
  const restauranteId = searchParams.get('restauranteId');

  // Función para navegar al dashboard (misma lógica que el botón "Back to Dashboard")
  const handleBackToDashboard = useCallback(() => {
    console.warn('🔄 [POSClient] Navegando a dashboard y refrescando datos...');
    // Construir URL del dashboard con restauranteId si existe
    const dashboardUrl = restauranteId
      ? `/dashboard?restauranteId=${restauranteId}`
      : '/dashboard';
    
    // Navegar al dashboard y refrescar
    router.push(dashboardUrl);
    router.refresh();
  }, [restauranteId, router]);

  // Interceptar el botón "atrás" del navegador
  useEffect(() => {
    // Agregar una entrada en el historial cuando se carga el POS
    // Esto nos permite detectar cuando el usuario presiona "atrás"
    const currentState = window.history.state;
    if (!currentState || !currentState.posEntry) {
      // Agregar una entrada en el historial con un flag para identificar que es del POS
      window.history.pushState({ posEntry: true }, '', window.location.href);
    }

    // Función que se ejecuta cuando el usuario presiona "atrás"
    const handlePopState = (event: PopStateEvent) => {
      // Verificar si estamos en el POS (la URL contiene '/pos')
      const isInPOS = window.location.pathname.includes('/pos');
      
      // Si el estado anterior no tiene el flag posEntry y estamos en el POS,
      // significa que el usuario está intentando salir del POS
      if (isInPOS && !event.state?.posEntry) {
        // Volver a agregar la entrada del POS para mantener la posición
        window.history.pushState({ posEntry: true }, '', window.location.href);
        // Ejecutar nuestra lógica de navegación al dashboard
        handleBackToDashboard();
      }
    };

    // Escuchar el evento popstate (se dispara cuando el usuario presiona "atrás")
    window.addEventListener('popstate', handlePopState);

    // Limpiar el listener cuando el componente se desmonte
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [handleBackToDashboard]);

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
            <h1 className="text-2xl font-bold">Point of Sale</h1>
            <div className="relative w-64">
              <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
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
