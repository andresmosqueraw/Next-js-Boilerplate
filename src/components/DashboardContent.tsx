'use client';

import type { DomicilioConRestaurantes } from '@/services/restaurante.service';
import type { Mesa } from '@/types/database';
import { useRouter } from 'next/navigation';
import * as React from 'react';
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

  // Filtrar domiciliosConCarrito para incluir solo los que están en los domicilios filtrados
  const domiciliosConCarritoFiltrados = React.useMemo(() => {
    const domiciliosFiltradosIds = new Set(domiciliosFiltrados.map(d => d.id));
    return domiciliosConCarrito.filter(id => domiciliosFiltradosIds.has(id));
  }, [domiciliosFiltrados, domiciliosConCarrito]);

  React.useEffect(() => {
    console.warn('📊 [DashboardContent] Estado de domicilios:', {
      restaurante: selectedRestaurant?.nombre,
      restauranteId: selectedRestaurant?.id,
      totalDomicilios: todosLosDomicilios.length,
      domiciliosFiltrados: domiciliosFiltrados.length,
      domiciliosConCarrito: domiciliosConCarrito.length,
      domiciliosConCarritoIds: domiciliosConCarrito,
      domiciliosConCarritoFiltrados: domiciliosConCarritoFiltrados.length,
      domiciliosConCarritoFiltradosIds: domiciliosConCarritoFiltrados,
      detalleDomicilios: domiciliosFiltrados.map(d => ({
        id: d.id,
        direccion: d.direccion,
        tieneCarrito: domiciliosConCarritoFiltrados.includes(d.id),
        estadoVisual: domiciliosConCarritoFiltrados.includes(d.id) ? 'CON PEDIDO' : 'DISPONIBLE',
      })),
    });
  }, [selectedRestaurant, domiciliosFiltrados, domiciliosConCarrito, domiciliosConCarritoFiltrados, todosLosDomicilios.length]);

  const domiciliosMostrados = domiciliosFiltrados;

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mesas y Domicilios</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <MesasCard mesas={mesasFiltradas} mesasConCarrito={mesasConCarrito} />
        <DomiciliosCard domicilios={domiciliosMostrados} domiciliosConCarrito={domiciliosConCarritoFiltrados} />
      </div>
    </div>
  );
}
