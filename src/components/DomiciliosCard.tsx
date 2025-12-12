'use client';

import type { DomicilioConRestaurantes } from '@/services/restaurante.service';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { Input } from '@/components/ui/input';

type EstadoVisual = 'disponible' | 'con-pedido';

const EMPTY_ARRAY: number[] = [];

export function DomiciliosCard({
  domicilios,
  domiciliosConCarrito = EMPTY_ARRAY,
}: {
  domicilios: DomicilioConRestaurantes[];
  domiciliosConCarrito?: number[];
}) {
  const [filter, setFilter] = React.useState('');
  const router = useRouter();

  // Log para debugging
  React.useEffect(() => {
    console.warn('📊 [DomiciliosCard] Estado de domicilios:', {
      totalDomicilios: domicilios.length,
      domiciliosConCarrito: domiciliosConCarrito.length,
      domiciliosConCarritoIds: domiciliosConCarrito,
      domiciliosDetalle: domicilios.map(d => ({
        id: d.id,
        direccion: d.direccion,
        tieneCarrito: domiciliosConCarrito.includes(d.id),
        estadoVisual: domiciliosConCarrito.includes(d.id) ? 'CON PEDIDO' : 'DISPONIBLE',
      })),
    });
  }, [domicilios, domiciliosConCarrito]);

  // Función para determinar el estado visual de un domicilio
  const getEstadoVisual = (domicilio: DomicilioConRestaurantes): EstadoVisual => {
    // Si tiene carrito activo con productos, mostrar "con-pedido"
    if (domiciliosConCarrito.includes(domicilio.id)) {
      return 'con-pedido';
    }
    // Por defecto, "disponible"
    return 'disponible';
  };

  // Filtrar domicilios basado en el filtro de búsqueda
  const domiciliosFiltrados = React.useMemo(() => {
    if (!filter.trim()) {
      return domicilios;
    }
    const filterLower = filter.toLowerCase();
    return domicilios.filter(domicilio =>
      domicilio.direccion.toLowerCase().includes(filterLower) ||
      domicilio.ciudad?.toLowerCase().includes(filterLower) ||
      domicilio.referencia?.toLowerCase().includes(filterLower) ||
      domicilio.cliente_nombre?.toLowerCase().includes(filterLower) ||
      domicilio.cliente_id.toString().includes(filterLower),
    );
  }, [domicilios, filter]);

  const domiciliosDisponibles = domiciliosFiltrados.filter(d => getEstadoVisual(d) === 'disponible');
  const domiciliosConPedido = domiciliosFiltrados.filter(d => getEstadoVisual(d) === 'con-pedido');

  // Obtener el restauranteId del primer restaurante asociado (o usar 1 como fallback)
  const getRestauranteId = (domicilio: DomicilioConRestaurantes): number => {
    return domicilio.restaurantes_ids && domicilio.restaurantes_ids.length > 0
      ? domicilio.restaurantes_ids[0]!
      : 1;
  };

  const handleRowClick = (domicilio: DomicilioConRestaurantes) => {
    router.push(`/pos?tipo=domicilio&id=${domicilio.id}&clienteId=${domicilio.cliente_id}&restauranteId=${getRestauranteId(domicilio)}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          Domicilios
          {' '}
          (Direcciones de Clientes)
        </h2>
        <div className="relative">
          <Search className="absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Filter domicilios..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="h-8 w-40 pl-8 text-sm"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-sm font-medium text-emerald-500 border border-emerald-500/30 dark:bg-emerald-950/40">
          {domiciliosDisponibles.length}
          {' '}
          Disponibles
        </span>
        <span className="rounded-full bg-red-500/15 px-3 py-1 text-sm font-medium text-red-500 border border-red-500/30 dark:bg-red-950/40">
          {domiciliosConPedido.length}
          {' '}
          Con pedido
        </span>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="hide-scrollbar overflow-x-auto">
          {domiciliosFiltrados.length === 0
            ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  {domicilios.length === 0 ? 'No hay domicilios registrados' : 'No se encontraron domicilios'}
                </div>
              )
            : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="px-3 py-2 text-left">
                        <span className="text-xs font-semibold text-muted-foreground">Dirección</span>
                      </th>
                      <th className="px-3 py-2 text-left">
                        <span className="text-xs font-semibold text-muted-foreground">Ciudad</span>
                      </th>
                      <th className="px-3 py-2 text-left">
                        <span className="text-xs font-semibold text-muted-foreground">Referencia</span>
                      </th>
                      <th className="px-3 py-2 text-left">
                        <span className="text-xs font-semibold text-muted-foreground">Cliente</span>
                      </th>
                      <th className="px-3 py-2 text-left">
                        <span className="text-xs font-semibold text-muted-foreground">Estado</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {domiciliosFiltrados.map((domicilio) => {
                      const estadoVisual = getEstadoVisual(domicilio);

                      const coloresBadge = {
                        'disponible': 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 dark:bg-emerald-950/40',
                        'con-pedido': 'bg-red-500/15 text-red-500 border border-red-500/30 dark:bg-red-950/40',
                      };

                      const textoEstado = {
                        'disponible': 'Disponible',
                        'con-pedido': 'Con pedido',
                      };

                      return (
                        <tr
                          key={domicilio.id}
                          onClick={() => handleRowClick(domicilio)}
                          className="cursor-pointer border-b border-border/50 transition-colors hover:bg-muted/20"
                        >
                          <td className="px-3 py-2">
                            <span className="text-sm font-medium text-foreground">
                              {domicilio.direccion}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <span className="text-sm text-muted-foreground">
                              {domicilio.ciudad || 'N/A'}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <span className="text-sm text-muted-foreground">
                              {domicilio.referencia || 'N/A'}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <span className="text-sm font-medium text-foreground">
                              {domicilio.cliente_nombre || `Cliente #${domicilio.cliente_id}`}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-light ${coloresBadge[estadoVisual]}`}>
                              {textoEstado[estadoVisual]}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
        </div>
      </div>
    </div>
  );
}
