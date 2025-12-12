'use client';

import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { useCart } from '../app/[locale]/(auth)/pos/context/cart-context';

export default function CartSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cart, removeFromCart, updateQuantity, cartTotal, itemCount } = useCart();

  const handleCheckout = () => {
    // Obtener parámetros de la URL actual (tipo de pedido)
    const tipo = searchParams.get('tipo');
    const id = searchParams.get('id');
    const numero = searchParams.get('numero');
    const clienteId = searchParams.get('clienteId');

    // Construir URL del checkout con los parámetros
    const checkoutParams = new URLSearchParams();
    if (tipo) checkoutParams.set('tipo', tipo);
    if (id) checkoutParams.set('id', id);
    if (numero) checkoutParams.set('numero', numero);
    if (clienteId) checkoutParams.set('clienteId', clienteId);

    router.push(`/pos/checkout?${checkoutParams.toString()}`);
  };

  return (
    <div className="flex w-80 flex-col border-l bg-background">
      <div className="flex items-center justify-between border-b p-4">
        <h2 className="flex items-center text-lg font-semibold">
          <ShoppingCart className="mr-2 h-5 w-5" />
          Cart
        </h2>
        <span className="rounded-full bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
          {itemCount}
          {' '}
          items
        </span>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {cart.length === 0
          ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <ShoppingCart className="mb-2 h-12 w-12 text-muted-foreground" />
                <h3 className="font-medium">Your cart is empty</h3>
                <p className="text-sm text-muted-foreground">Add items to get started</p>
              </div>
            )
          : (
              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item.id} className="flex gap-3">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md border">
                      <img src={item.image || '/placeholder.svg'} alt={item.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex flex-1 flex-col">
                      <div className="flex justify-between">
                        <h3 className="line-clamp-1 font-medium">{item.name}</h3>
                        <p className="font-medium">
                          $
                          {(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        $
                        {item.price.toFixed(2)}
                        {' '}
                        each
                      </p>
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
      </div>

      <div className="border-t p-4">
        <div className="mb-4 space-y-2">
          <div className="flex justify-between">
            <p>Subtotal</p>
            <p>
              $
              {cartTotal.toFixed(2)}
            </p>
          </div>
          <div className="flex justify-between font-medium">
            <p>Total</p>
            <p>
              $
              {cartTotal.toFixed(2)}
            </p>
          </div>
        </div>
        <Button className="w-full" size="lg" disabled={cart.length === 0} onClick={handleCheckout}>
          Checkout
        </Button>
      </div>
    </div>
  );
}
