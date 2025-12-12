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
    <div className="rounded-xl border bg-card p-6 text-card-foreground shadow">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Mesas</h2>
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

      <div className="space-y-2">
        {mesas.length === 0
          ? (
              <p className="py-8 text-center text-muted-foreground">
                No hay mesas registradas
              </p>
            )
          : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {mesas.map((mesa) => {
                  const estadoVisual = getEstadoVisual(mesa);

                  const coloresCard = {
                    disponible: 'border-green-200 bg-green-50 hover:border-green-300 hover:bg-green-100',
                    ocupada: 'border-red-200 bg-red-50 hover:border-red-300 hover:bg-red-100',
                  };

                  const coloresBadge = {
                    disponible: 'bg-green-200 text-green-800',
                    ocupada: 'bg-red-200 text-red-800',
                  };

                  const textoEstado = {
                    disponible: 'Disponible',
                    ocupada: 'Ocupada',
                  };

                  return (
                    <Link
                      key={mesa.id}
                      href={`/pos?tipo=mesa&id=${mesa.id}&numero=${mesa.numero_mesa}&restauranteId=${mesa.restaurante_id}`}
                      className={`block cursor-pointer rounded-lg border p-4 transition-all hover:shadow-lg ${coloresCard[estadoVisual]}`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">
                            Mesa
                            {' '}
                            {mesa.numero_mesa}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Capacidad:
                            {' '}
                            {mesa.capacidad || 'N/A'}
                            {' '}
                            personas
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Restaurante ID:
                            {' '}
                            {mesa.restaurante_id}
                          </p>
                        </div>
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${coloresBadge[estadoVisual]}`}>
                          {textoEstado[estadoVisual]}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
      </div>
    </div>
  );
}
