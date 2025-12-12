'use client';

import type { Mesa } from '@/types/database';
import { Search } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';
import { Input } from '@/components/ui/input';

type EstadoVisual = 'disponible' | 'ocupada';

const EMPTY_ARRAY: number[] = [];

export function MesasCard({
  mesas,
  mesasConCarrito = EMPTY_ARRAY,
}: {
  mesas: Mesa[];
  mesasConCarrito?: number[];
}) {
  const [filter, setFilter] = React.useState('');

  // Log para debugging
  React.useEffect(() => {
    console.warn('📊 [MesasCard] Estado de mesas:', {
      totalMesas: mesas.length,
      mesasConCarrito: mesasConCarrito.length,
      mesasConCarritoIds: mesasConCarrito,
      mesasDetalle: mesas.map(m => ({
        id: m.id,
        numero: m.numero_mesa,
        tieneCarrito: mesasConCarrito.includes(m.id),
        estadoVisual: mesasConCarrito.includes(m.id) ? 'OCUPADA' : 'DISPONIBLE',
      })),
    });
  }, [mesas, mesasConCarrito]);

  // Función para determinar el estado visual de una mesa
  const getEstadoVisual = (mesa: Mesa): EstadoVisual => {
    // Si tiene carrito activo con productos → Ocupada
    if (mesasConCarrito.includes(mesa.id)) {
      return 'ocupada';
    }
    // Si no tiene pedidos → Disponible
    return 'disponible';
  };

  // Filtrar mesas basado en el filtro de búsqueda
  const mesasFiltradas = React.useMemo(() => {
    if (!filter.trim()) {
      return mesas;
    }
    const filterLower = filter.toLowerCase();
    return mesas.filter(mesa =>
      mesa.numero_mesa.toString().includes(filterLower) ||
      mesa.capacidad?.toString().includes(filterLower) ||
      mesa.restaurante_id.toString().includes(filterLower),
    );
  }, [mesas, filter]);

  const mesasDisponibles = mesasFiltradas.filter(m => getEstadoVisual(m) === 'disponible');
  const mesasOcupadas = mesasFiltradas.filter(m => getEstadoVisual(m) === 'ocupada');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Mesas</h2>
        <div className="relative">
          <Search className="absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Filter mesas..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="h-8 w-40 pl-8 text-sm"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-sm font-medium text-emerald-500 border border-emerald-500/30 dark:bg-emerald-950/40">
          {mesasDisponibles.length}
          {' '}
          Disponibles
        </span>
        <span className="rounded-full bg-red-500/15 px-3 py-1 text-sm font-medium text-red-500 border border-red-500/30 dark:bg-red-950/40">
          {mesasOcupadas.length}
          {' '}
          Ocupadas
        </span>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="hide-scrollbar overflow-x-auto">
          {mesasFiltradas.length === 0
            ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  {mesas.length === 0 ? 'No hay mesas registradas' : 'No se encontraron mesas'}
                </div>
              )
            : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="px-3 py-2 text-left">
                        <span className="text-xs font-semibold text-muted-foreground">Mesa</span>
                      </th>
                      <th className="px-3 py-2 text-left">
                        <span className="text-xs font-semibold text-muted-foreground">Capacidad</span>
                      </th>
                      <th className="px-3 py-2 text-left">
                        <span className="text-xs font-semibold text-muted-foreground">Estado</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {mesasFiltradas.map((mesa) => {
                      const estadoVisual = getEstadoVisual(mesa);

                      const coloresBadge = {
                        disponible: 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 dark:bg-emerald-950/40',
                        ocupada: 'bg-red-500/15 text-red-500 border border-red-500/30 dark:bg-red-950/40',
                      };

                      const textoEstado = {
                        disponible: 'Disponible',
                        ocupada: 'Ocupada',
                      };

                      return (
                        <tr
                          key={mesa.id}
                          className="border-b border-border/50 transition-colors hover:bg-muted/20"
                        >
                          <td className="px-3 py-2">
                            <Link
                              href={`/pos?tipo=mesa&id=${mesa.id}&numero=${mesa.numero_mesa}&restauranteId=${mesa.restaurante_id}`}
                              className="cursor-pointer text-sm font-medium text-foreground hover:text-primary"
                            >
                              Mesa
                              {' '}
                              {mesa.numero_mesa}
                            </Link>
                          </td>
                          <td className="px-3 py-2">
                            <span className="text-sm text-muted-foreground">
                              {mesa.capacidad || 'N/A'}
                              {' '}
                              personas
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
