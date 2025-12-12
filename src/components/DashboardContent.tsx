'use client';

import type { DomicilioConRestaurantes } from '@/services/restaurante.service';
import type { Mesa } from '@/types/database';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { DashboardRefresh } from '@/components/DashboardRefresh';
import { DomiciliosCard } from '@/components/DomiciliosCard';
import { MesasCard } from '@/components/MesasCard';
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
        <DashboardRefresh />
      </div>

      {selectedRestaurant && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm font-medium text-blue-900">
            📍 Mostrando datos de:
            {' '}
            <span className="font-bold">{selectedRestaurant.nombre}</span>
          </p>
          {selectedRestaurant.direccion && (
            <p className="mt-1 text-xs text-blue-700">
              {selectedRestaurant.direccion}
            </p>
          )}
          <p className="mt-2 text-xs text-blue-600">
            {mesasFiltradas.length}
            {' '}
            {mesasFiltradas.length === 1 ? 'mesa' : 'mesas'}
            {' '}
            •
            {' '}
            {domiciliosFiltrados.length}
            {' '}
            {domiciliosFiltrados.length === 1 ? 'domicilio' : 'domicilios'}
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <MesasCard mesas={mesasFiltradas} mesasConCarrito={mesasConCarrito} />
        <DomiciliosCard domicilios={domiciliosMostrados} domiciliosConCarrito={domiciliosConCarrito} />
      </div>
    </div>
  );
}
