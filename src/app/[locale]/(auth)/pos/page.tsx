'use client';

import { MapPin, Search, Table } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import CartSidebar from '@/components/cart-sidebar';
import CategorySidebar from '@/components/category-sidebar';
import ProductGrid from '@/components/product-grid';
import { Input } from '@/components/ui/input';

export default function POSPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const searchParams = useSearchParams();

  // Obtener información del tipo de pedido
  const tipo = searchParams.get('tipo');
  const id = searchParams.get('id');
  const numero = searchParams.get('numero');
  const clienteId = searchParams.get('clienteId');

  return (
    <div className="flex h-screen bg-background">
      <CategorySidebar selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />

      <main className="flex h-screen flex-1 flex-col overflow-hidden">
        <div className="sticky top-0 z-10 border-b bg-background p-4">
          {/* Banner de tipo de pedido */}
          {tipo && (
            <div className={`mb-3 rounded-lg border p-3 ${
              tipo === 'mesa'
                ? 'border-green-200 bg-green-50'
                : 'border-blue-200 bg-blue-50'
            }`}
            >
              <div className="flex items-center gap-2">
                {tipo === 'mesa'
                  ? (
                      <>
                        <Table className="h-5 w-5 text-green-700" />
                        <span className="font-semibold text-green-900">
                          Mesa
                          {' '}
                          {numero}
                        </span>
                        <span className="text-xs text-green-700">
                          (ID:
                          {' '}
                          {id}
                          )
                        </span>
                      </>
                    )
                  : (
                      <>
                        <MapPin className="h-5 w-5 text-blue-700" />
                        <span className="font-semibold text-blue-900">
                          Pedido a Domicilio
                        </span>
                        <span className="text-xs text-blue-700">
                          (Cliente ID:
                          {' '}
                          {clienteId}
                          )
                        </span>
                      </>
                    )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Point of Sale</h1>
            <div className="relative w-64">
              <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-8"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <ProductGrid category={selectedCategory} searchQuery={searchQuery} />
        </div>
      </main>

      <CartSidebar />
    </div>
  );
}
