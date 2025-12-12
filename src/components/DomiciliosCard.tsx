'use client';

import type { Domicilio } from '@/types/database';
import Link from 'next/link';

type EstadoVisual = 'disponible' | 'con-pedido';

export function DomiciliosCard({
  domicilios,
  domiciliosConCarrito = [],
}: {
  domicilios: Domicilio[];
  domiciliosConCarrito?: number[];
}) {
  // Función para determinar el estado visual de un domicilio
  const getEstadoVisual = (domicilio: Domicilio): EstadoVisual => {
    // Si tiene carrito activo con productos, mostrar "con-pedido"
    if (domiciliosConCarrito.includes(domicilio.id)) {
      return 'con-pedido';
    }
    // Por defecto, "disponible"
    return 'disponible';
  };

  const domiciliosDisponibles = domicilios.filter(d => getEstadoVisual(d) === 'disponible');
  const domiciliosConPedido = domicilios.filter(d => getEstadoVisual(d) === 'con-pedido');

  return (
    <div className="rounded-xl border bg-card p-6 text-card-foreground shadow">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          Domicilios
          <br />
          {' '}
          (Direcciones de Clientes)
        </h2>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
            {domiciliosDisponibles.length}
            {' '}
            Disponibles
          </span>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800">
            {domiciliosConPedido.length}
            {' '}
            Con pedido
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {domicilios.length === 0
          ? (
              <p className="py-8 text-center text-muted-foreground">
                No hay domicilios registrados
              </p>
            )
          : (
              <div className="space-y-3">
                {domicilios.map((domicilio) => {
                  const estadoVisual = getEstadoVisual(domicilio);

                  const coloresCard = {
                    'disponible': 'border-blue-200 bg-white hover:border-blue-300 hover:bg-blue-50',
                    'con-pedido': 'border-amber-200 bg-amber-50 hover:border-amber-300 hover:bg-amber-100',
                  };

                  const coloresBadge = {
                    'disponible': 'bg-blue-100 text-blue-800',
                    'con-pedido': 'bg-amber-200 text-amber-800',
                  };

                  const textoEstado = {
                    'disponible': 'Disponible',
                    'con-pedido': 'Con pedido',
                  };

                  return (
                    <Link
                      key={domicilio.id}
                      href={`/pos?tipo=domicilio&id=${domicilio.id}&clienteId=${domicilio.cliente_id}`}
                      className={`block cursor-pointer rounded-lg border p-4 transition-all hover:shadow-lg ${coloresCard[estadoVisual]}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-base font-semibold">
                            {domicilio.direccion}
                          </h3>
                          {domicilio.ciudad && (
                            <p className="mt-1 text-sm text-muted-foreground">
                              📍
                              {' '}
                              {domicilio.ciudad}
                            </p>
                          )}
                          {domicilio.referencia && (
                            <p className="mt-1 text-sm text-muted-foreground">
                              ℹ️
                              {' '}
                              {domicilio.referencia}
                            </p>
                          )}
                          <p className="mt-2 text-xs text-muted-foreground">
                            Cliente ID:
                            {' '}
                            {domicilio.cliente_id}
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
