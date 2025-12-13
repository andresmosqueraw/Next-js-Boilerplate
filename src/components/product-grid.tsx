'use client';

import type { Product } from '../app/[locale]/(auth)/pos/context/cart-context';
import { Loader2, PlusCircle } from 'lucide-react';
import Image from 'next/image';

import { Card, CardContent } from '@/components/ui/card';
import { useCart } from '../app/[locale]/(auth)/pos/context/cart-context';
import { products as productosEstaticos } from '../app/[locale]/(auth)/pos/data/products';

type ProductGridProps = {
  category: string;
  searchQuery: string;
  productos?: Product[];
};

export default function ProductGrid({
  category,
  searchQuery,
  productos,
}: ProductGridProps) {
  const { addToCart, updatingItems } = useCart();

  // Usar productos dinámicos si están disponibles, o los estáticos como fallback
  const todosLosProductos = productos || productosEstaticos;

  const filteredProducts = todosLosProductos.filter((product) => {
    const matchesCategory = category === 'all' || product.category === category;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
      {filteredProducts.map(product => {
        const isAdding = updatingItems.has(product.id);
        return (
          <Card
            key={product.id}
            className={`group relative overflow-hidden transition-all duration-200 ${
              isAdding 
                ? 'opacity-60 cursor-wait' 
                : 'cursor-pointer hover:scale-105 hover:shadow-md'
            }`}
            onClick={() => !isAdding && addToCart(product)}
          >
            <div className="relative aspect-square">
              {isAdding ? (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50">
                  <Loader2 className="h-10 w-10 animate-spin text-white" />
                </div>
              ) : (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  <PlusCircle className="h-10 w-10 text-white" />
                </div>
              )}
              <Image src={product.image || '/placeholder.svg'} alt={product.name} fill className="object-cover" />
            </div>
            <CardContent className="p-3">
              <div>
                <h3 className="break-words font-medium leading-tight">{product.name}</h3>
                <p className="text-sm text-muted-foreground">
                  $
                  {product.price.toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {filteredProducts.length === 0 && (
        <div className="col-span-full py-12 text-center">
          <p className="text-muted-foreground">No se encontraron productos</p>
        </div>
      )}
    </div>
  );
}
