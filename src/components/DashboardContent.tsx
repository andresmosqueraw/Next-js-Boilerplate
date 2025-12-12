'use client';

import type { DomicilioConRestaurantes } from '@/services/restaurante.service';
import type { Mesa } from '@/types/database';
import { Activity } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { DomiciliosCard } from '@/components/DomiciliosCard';
import { MesasCard } from '@/components/MesasCard';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useRestaurant } from '@/contexts/RestaurantContext';

export function DashboardContent({
  todasLasMesas,
  todosLosDomicilios,
  mesasConCarrito,
  domiciliosConCarrito,
}: {
  todasLasMesas: Mesa[];
  todosLosDomicilios: DomicilioConRestaurantes[];
  mesasConCarrito: number[];
  domiciliosConCarrito: number[];
}) {
  const { selectedRestaurant } = useRestaurant();
  const router = useRouter();

  // Auto-refresh cuando la página se vuelve visible (usuario regresa del POS o cambia de pestaña)
  React.useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.warn('🔄 [DashboardContent] Página visible, refrescando datos...');
        router.refresh();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [router]);

  // Filtrar mesas por restaurante seleccionado
  const mesasFiltradas = React.useMemo(() => {
    if (!selectedRestaurant) {
      return todasLasMesas;
    }
    return todasLasMesas.filter(mesa => mesa.restaurante_id === selectedRestaurant.id);
  }, [todasLasMesas, selectedRestaurant]);

  // Filtrar domicilios por restaurante seleccionado
  // Los domicilios están relacionados con restaurantes a través de: domicilio → tipo_pedido → carrito → restaurante
  const domiciliosFiltrados = React.useMemo(() => {
    if (!selectedRestaurant) {
      return todosLosDomicilios;
    }
    return todosLosDomicilios.filter(domicilio =>
      domicilio.restaurantes_ids.includes(selectedRestaurant.id),
    );
  }, [todosLosDomicilios, selectedRestaurant]);

  const domiciliosMostrados = domiciliosFiltrados;

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mesas y Domicilios</h1>
      </div>

      {selectedRestaurant && (
        <div className="group relative rounded-lg bg-border p-[1px] transition-transform duration-500 ease-in-out hover:scale-105">
          <div
            className={cn(
              'absolute inset-0 rounded-lg bg-gradient-to-bl opacity-80 transition-all duration-500 ease-in-out',
              'from-blue-500 via-blue-500/20 to-transparent',
            )}
            style={{
              maskImage: 'linear-gradient(135deg, black 0%, transparent 50%)',
              WebkitMaskImage: 'linear-gradient(135deg, black 0%, transparent 50%)',
            }}
          />
          <div
            className={cn(
              'absolute inset-0 rounded-lg bg-gradient-to-bl opacity-0 group-hover:opacity-80 transition-opacity duration-500 ease-in-out',
              'from-blue-500 via-blue-500/20 to-transparent',
            )}
            style={{
              maskImage: 'linear-gradient(135deg, black 0%, transparent 70%)',
              WebkitMaskImage: 'linear-gradient(135deg, black 0%, transparent 70%)',
            }}
          />
          <div className="relative rounded-lg bg-card">
            <CardHeader className="px-4 pt-4 pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Activity className="h-4 w-4 text-blue-500" />
                Mostrando datos de:
                {' '}
                <span className="font-bold">{selectedRestaurant.nombre}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="space-y-2">
                {selectedRestaurant.direccion && (
                  <p className="text-sm text-muted-foreground">
                    {selectedRestaurant.direccion}
                  </p>
                )}
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-light text-muted-foreground tabular-nums">
                    {mesasFiltradas.length}
                    {' '}
                    {mesasFiltradas.length === 1 ? 'mesa' : 'mesas'}
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <span className="font-mono text-sm font-light text-muted-foreground tabular-nums">
                    {domiciliosFiltrados.length}
                    {' '}
                    {domiciliosFiltrados.length === 1 ? 'domicilio' : 'domicilios'}
                  </span>
                </div>
              </div>
            </CardContent>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <MesasCard mesas={mesasFiltradas} mesasConCarrito={mesasConCarrito} />
        <DomiciliosCard domicilios={domiciliosMostrados} domiciliosConCarrito={domiciliosConCarrito} />
      </div>
    </div>
  );
}
