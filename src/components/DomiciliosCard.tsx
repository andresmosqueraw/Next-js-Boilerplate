import type { Domicilio } from '@/types/database';

export function DomiciliosCard({ domicilios }: { domicilios: Domicilio[] }) {
  return (
    <div className="rounded-xl border bg-card p-6 text-card-foreground shadow">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Domicilios</h2>
        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
          {domicilios.length}
          {' '}
          registros
        </span>
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
                {domicilios.map(domicilio => (
                  <div
                    key={domicilio.id}
                    className="rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:bg-gray-50"
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
                      <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                        ID:
                        {' '}
                        {domicilio.id}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
      </div>
    </div>
  );
}
