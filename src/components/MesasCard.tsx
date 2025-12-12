'use client';

import type { Mesa } from '@/types/database';
import Link from 'next/link';
import * as React from 'react';

type EstadoVisual = 'disponible' | 'ocupada';

const EMPTY_ARRAY: number[] = [];

export function MesasCard({
  mesas,
  mesasConCarrito = EMPTY_ARRAY,
}: {
  mesas: Mesa[];
  mesasConCarrito?: number[];
}) {
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

  const mesasDisponibles = mesas.filter(m => getEstadoVisual(m) === 'disponible');
  const mesasOcupadas = mesas.filter(m => getEstadoVisual(m) === 'ocupada');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Mesas</h2>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
            {mesasDisponibles.length}
            {' '}
            Disponibles
          </span>
          <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800">
            {mesasOcupadas.length}
            {' '}
            Ocupadas
          </span>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="hide-scrollbar overflow-x-auto">
          {mesas.length === 0
            ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No hay mesas registradas
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
                        <span className="text-xs font-semibold text-muted-foreground">Restaurante ID</span>
                      </th>
                      <th className="px-3 py-2 text-left">
                        <span className="text-xs font-semibold text-muted-foreground">Estado</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {mesas.map((mesa) => {
                      const estadoVisual = getEstadoVisual(mesa);

                      const coloresBadge = {
                        disponible: 'bg-green-200 text-green-800',
                        ocupada: 'bg-red-200 text-red-800',
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
                            <span className="text-sm text-muted-foreground">
                              {mesa.restaurante_id}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <span className={`rounded-full px-2 py-1 text-xs font-medium ${coloresBadge[estadoVisual]}`}>
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
