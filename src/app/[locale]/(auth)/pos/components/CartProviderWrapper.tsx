'use client';

import { useSearchParams } from 'next/navigation';
import { CartProvider } from '../context/cart-context';

export function CartProviderWrapper({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const tipo = searchParams.get('tipo') as 'mesa' | 'domicilio' | null;
  const id = searchParams.get('id');
  const restauranteId = searchParams.get('restauranteId');

  return (
    <CartProvider tipo={tipo} id={id} restauranteId={restauranteId}>
      {children}
    </CartProvider>
  );
}
