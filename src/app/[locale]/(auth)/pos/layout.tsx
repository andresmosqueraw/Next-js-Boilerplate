import type { Metadata } from 'next';
import type React from 'react';
import { Inter } from 'next/font/google';
import { CartProvider } from './context/cart-context';
import '../../globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'POS System',
  description: 'Point of Sale System',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-100`}>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
