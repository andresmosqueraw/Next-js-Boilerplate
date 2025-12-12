'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/libs/supabase/client';

export function SupabaseHealthCheck() {
  const [status, setStatus] = useState<'checking' | 'success' | 'error'>('checking');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const supabase = createClient();
        const { error } = await supabase.auth.getSession();

        if (error) {
          setStatus('error');
          setMessage(`Error: ${error.message}`);
        } else {
          setStatus('success');
          setMessage('Client connection OK!');
        }
      } catch (error) {
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Unknown error');
      }
    };

    checkConnection();
  }, []);

  return (
    <div style={{ padding: '1rem', margin: '1rem', border: '2px solid', borderColor: status === 'success' ? 'green' : status === 'error' ? 'red' : 'gray' }}>
      <h3>Supabase Client Health Check</h3>
      <p>
        Status:
        {status}
      </p>
      <p>{message}</p>
    </div>
  );
}
