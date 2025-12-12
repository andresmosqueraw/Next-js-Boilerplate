import type { Mesa } from '@/types/database';

export function MesasCard({ mesas }: { mesas: Mesa[] }) {
  const mesasDisponibles = mesas.filter(m => m.estado === 'disponible');
  const mesasOcupadas = mesas.filter(m => m.estado !== 'disponible');

  return (
    <div className="rounded-xl border bg-card p-6 text-card-foreground shadow">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Mesas</h2>
        <div className="flex gap-2">
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
                {mesas.map(mesa => (
                  <div
                    key={mesa.id}
                    className={`rounded-lg border p-4 transition-colors ${
                      mesa.estado === 'disponible'
                        ? 'border-green-200 bg-green-50 hover:bg-green-100'
                        : 'border-red-200 bg-red-50 hover:bg-red-100'
                    }`}
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
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          mesa.estado === 'disponible'
                            ? 'bg-green-200 text-green-800'
                            : 'bg-red-200 text-red-800'
                        }`}
                      >
                        {mesa.estado}
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
