import { createClient } from '@/libs/supabase/server';

export default async function TestSupabasePage() {
  let connectionStatus = 'Unknown';
  let restaurantes = [];
  let error = null;
  const envVars = {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET',
    hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  };

  try {
    const supabase = await createClient();

    // Test connection by fetching restaurantes
    const { data, error: fetchError } = await supabase
      .from('restaurante')
      .select('*')
      .limit(10);

    if (fetchError) {
      throw fetchError;
    }

    connectionStatus = 'Connected ✅';
    restaurantes = data || [];
  } catch (err: any) {
    connectionStatus = 'Failed ❌';
    error = err.message || String(err);
  }

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-3xl font-bold">Diagnóstico de Supabase</h1>

        {/* Environment Variables */}
        <div className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-xl font-semibold">Variables de Entorno</h2>
          <div className="space-y-2 font-mono text-sm">
            <div>
              <span className="font-bold">NEXT_PUBLIC_SUPABASE_URL:</span>
              {' '}
              <span className={envVars.url === 'NOT SET' ? 'text-red-500' : 'text-green-600'}>
                {envVars.url}
              </span>
            </div>
            <div>
              <span className="font-bold">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:</span>
              {' '}
              <span className={!envVars.hasKey ? 'text-red-500' : 'text-green-600'}>
                {envVars.hasKey ? 'SET ✅' : 'NOT SET ❌'}
              </span>
            </div>
          </div>
        </div>

        {/* Connection Status */}
        <div className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-xl font-semibold">Estado de Conexión</h2>
          <p className="text-lg">{connectionStatus}</p>
          {error && (
            <div className="mt-4 rounded bg-red-50 p-4">
              <p className="font-bold text-red-800">Error:</p>
              <pre className="mt-2 text-sm whitespace-pre-wrap text-red-600">
                {error}
              </pre>
            </div>
          )}
        </div>

        {/* Restaurantes Data */}
        <div className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-xl font-semibold">
            Restaurantes (
            {restaurantes.length}
            )
          </h2>
          {restaurantes.length === 0
            ? (
                <p className="text-muted-foreground">
                  No hay restaurantes en la base de datos o no se pudo conectar.
                </p>
              )
            : (
                <div className="space-y-3">
                  {restaurantes.map((rest: any) => (
                    <div key={rest.id} className="rounded border bg-gray-50 p-3">
                      <p className="font-semibold">{rest.nombre}</p>
                      {rest.direccion && (
                        <p className="text-sm text-muted-foreground">{rest.direccion}</p>
                      )}
                      <p className="mt-1 text-xs text-muted-foreground">
                        ID:
                        {' '}
                        {rest.id}
                        {' '}
                        | Teléfono:
                        {' '}
                        {rest.telefono || 'N/A'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
        </div>

        {/* Instructions */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
          <h2 className="mb-4 text-xl font-semibold text-blue-900">
            📋 Instrucciones de Configuración
          </h2>
          <div className="space-y-3 text-sm text-blue-800">
            <div>
              <p className="font-semibold">1. Configura las variables de entorno:</p>
              <p className="ml-4">
                Crea un archivo
                <code className="rounded bg-blue-100 px-1">.env.local</code>
                {' '}
                con:
              </p>
              <pre className="mt-2 ml-4 rounded bg-blue-100 p-2">
                {`NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=tu-anon-key-aqui`}
              </pre>
            </div>
            <div>
              <p className="font-semibold">2. Crea las tablas en Supabase:</p>
              <p className="ml-4">
                Ve al SQL Editor de Supabase y ejecuta el script en
                <code className="rounded bg-blue-100 px-1">SUPABASE_SETUP.md</code>
              </p>
            </div>
            <div>
              <p className="font-semibold">3. Inserta datos de prueba:</p>
              <pre className="mt-2 ml-4 rounded bg-blue-100 p-2">
                {`INSERT INTO restaurante (nombre, direccion, telefono) 
VALUES ('Ana Gourmet Centro', 'Calle Principal 123', '555-1234');`}
              </pre>
            </div>
            <div>
              <p className="font-semibold">4. Reinicia el servidor de desarrollo:</p>
              <p className="ml-4"><code className="rounded bg-blue-100 px-1">npm run dev</code></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
