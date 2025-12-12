import { setRequestLocale } from 'next-intl/server';
import { SupabaseHealthCheck } from '@/components/SupabaseHealthCheck';
import { createClient } from '@/libs/supabase/server';

type ITestProps = {
  params: Promise<{ locale: string }>;
};

export default async function SupabaseTestPage(props: ITestProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  // Test desde servidor
  let serverStatus = 'checking...';
  let serverMessage = '';

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.getSession();

    if (error) {
      serverStatus = '❌ Error';
      serverMessage = error.message;
    } else {
      serverStatus = '✅ Connected';
      serverMessage = 'Server connection working!';
    }
  } catch (error) {
    serverStatus = '❌ Error';
    serverMessage = error instanceof Error ? error.message : 'Unknown error';
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>
        Supabase Connection Test
      </h1>

      {/* Test desde servidor (Server Component) */}
      <div style={{
        padding: '1rem',
        marginBottom: '2rem',
        border: '2px solid',
        borderColor: serverStatus.includes('✅') ? 'green' : 'red',
        borderRadius: '8px',
      }}
      >
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          Server Component Test
        </h2>
        <p>
          <strong>Status:</strong>
          {' '}
          {serverStatus}
        </p>
        <p>
          <strong>Message:</strong>
          {' '}
          {serverMessage}
        </p>
      </div>

      {/* Test desde cliente (Client Component) */}
      <SupabaseHealthCheck />

      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
        <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>¿Qué verifican estos tests?</h3>
        <ul style={{ listStyle: 'disc', marginLeft: '1.5rem' }}>
          <li>
            <strong>Server Component:</strong>
            {' '}
            Verifica que el servidor puede conectarse a Supabase usando las credenciales del .env.local
          </li>
          <li>
            <strong>Client Component:</strong>
            {' '}
            Verifica que el navegador puede conectarse a Supabase usando las variables públicas
          </li>
        </ul>
        <p style={{ marginTop: '1rem' }}>
          Si ambos muestran ✅, tu integración con Supabase está funcionando correctamente.
        </p>
      </div>
    </div>
  );
}
