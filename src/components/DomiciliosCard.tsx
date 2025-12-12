'use client';

import type { DomicilioConRestaurantes } from '@/services/restaurante.service';
import Link from 'next/link';

type EstadoVisual = 'disponible' | 'con-pedido';

const EMPTY_ARRAY: number[] = [];

export function DomiciliosCard({
  domicilios,
  domiciliosConCarrito = EMPTY_ARRAY,
}: {
  domicilios: DomicilioConRestaurantes[];
  domiciliosConCarrito?: number[];
}) {
  // Función para determinar el estado visual de un domicilio
  const getEstadoVisual = (domicilio: DomicilioConRestaurantes): EstadoVisual => {
    // Si tiene carrito activo con productos, mostrar "con-pedido"
    if (domiciliosConCarrito.includes(domicilio.id)) {
      return 'con-pedido';
    }
    // Por defecto, "disponible"
    return 'disponible';
  };

  const domiciliosDisponibles = domicilios.filter(d => getEstadoVisual(d) === 'disponible');
  const domiciliosConPedido = domicilios.filter(d => getEstadoVisual(d) === 'con-pedido');

  // Obtener el restauranteId del primer restaurante asociado (o usar 1 como fallback)
  const getRestauranteId = (domicilio: DomicilioConRestaurantes): number => {
    return domicilio.restaurantes_ids && domicilio.restaurantes_ids.length > 0
      ? domicilio.restaurantes_ids[0]!
      : 1;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          Domicilios
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

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="hide-scrollbar overflow-x-auto">
          {domicilios.length === 0
            ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No hay domicilios registrados
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
                        <span className="text-xs font-semibold text-muted-foreground">Cliente ID</span>
                      </th>
                      <th className="px-3 py-2 text-left">
                        <span className="text-xs font-semibold text-muted-foreground">Estado</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {domicilios.map((domicilio) => {
                      const estadoVisual = getEstadoVisual(domicilio);

                      const coloresBadge = {
                        'disponible': 'bg-blue-100 text-blue-800',
                        'con-pedido': 'bg-amber-200 text-amber-800',
                      };

                      const textoEstado = {
                        'disponible': 'Disponible',
                        'con-pedido': 'Con pedido',
                      };

                      return (
                        <tr
                          key={domicilio.id}
                          className="border-b border-border/50 transition-colors hover:bg-muted/20"
                        >
                          <td className="px-3 py-2">
                            <Link
                              href={`/pos?tipo=domicilio&id=${domicilio.id}&clienteId=${domicilio.cliente_id}&restauranteId=${getRestauranteId(domicilio)}`}
                              className="cursor-pointer text-sm font-medium text-foreground hover:text-primary"
                            >
                              {domicilio.direccion}
                            </Link>
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
                            <span className="text-sm text-muted-foreground">
                              {domicilio.cliente_id}
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
