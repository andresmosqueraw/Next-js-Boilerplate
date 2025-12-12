import type { Metadata } from 'next';
import type React from 'react';
import { CartSyncProvider } from '@/components/CartSyncProvider';
import { CartProvider } from './context/cart-context';

export const metadata: Metadata = {
  title: 'POS System',
  description: 'Point of Sale System',
};

export default function POSLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <CartProvider>
      <CartSyncProvider>{children}</CartSyncProvider>
    </CartProvider>
  );
}
