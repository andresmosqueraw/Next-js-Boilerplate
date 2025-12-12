import type { Metadata } from 'next';
import type React from 'react';
import { CartProviderWrapper } from './components/CartProviderWrapper';

export const metadata: Metadata = {
  title: 'POS System',
  description: 'Point of Sale System',
};

export default function POSLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <CartProviderWrapper>{children}</CartProviderWrapper>;
}
