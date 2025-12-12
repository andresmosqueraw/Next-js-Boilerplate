'use client';

import { ArrowLeft, CreditCard, MapPin, Table, Wallet } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useCart } from '../context/cart-context';

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cart, cartTotal } = useCart();
  const [paymentMethod, setPaymentMethod] = useState('card');

  // Obtener información del tipo de pedido
  const tipo = searchParams.get('tipo');
  const id = searchParams.get('id');
  const numero = searchParams.get('numero');
  const clienteId = searchParams.get('clienteId');

  const tax = cartTotal * 0.1;
  const grandTotal = cartTotal + tax;

  const handlePayment = () => {
    // In a real app, you would process payment here
    // Aquí se guardaría en la base de datos el pedido con:
    // - tipo_pedido (mesa_id o domicilio_id)
    // - carrito con productos
    // - venta final

    const successParams = new URLSearchParams();
    if (tipo) {
      successParams.set('tipo', tipo);
    }
    if (id) {
      successParams.set('id', id);
    }
    if (numero) {
      successParams.set('numero', numero);
    }
    if (clienteId) {
      successParams.set('clienteId', clienteId);
    }
    successParams.set('metodo', paymentMethod);

    router.push(`/pos/success?${successParams.toString()}`);
  };

  // Construir URL de regreso al POS con parámetros
  const getPosUrl = () => {
    const params = new URLSearchParams();
    if (tipo) {
      params.set('tipo', tipo);
    }
    if (id) {
      params.set('id', id);
    }
    if (numero) {
      params.set('numero', numero);
    }
    if (clienteId) {
      params.set('clienteId', clienteId);
    }
    return `/pos?${params.toString()}`;
  };

  if (cart.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Your cart is empty</h1>
          <p className="mt-2 text-muted-foreground">Add some items to your cart before checkout</p>
          <Button className="mt-4" onClick={() => router.push(getPosUrl())}>
            Return to POS
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <Button variant="ghost" className="mb-6" onClick={() => router.push(getPosUrl())}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to POS
      </Button>

      {/* Banner de tipo de pedido */}
      {tipo && (
        <div
          className={`mb-6 rounded-lg border p-4 ${
            tipo === 'mesa' ? 'border-green-200 bg-green-50' : 'border-blue-200 bg-blue-50'
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
                    <span className="text-sm text-green-700">
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
                    <span className="font-semibold text-blue-900">Pedido a Domicilio</span>
                    <span className="text-sm text-blue-700">
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

      <h1 className="mb-6 text-3xl font-bold">Checkout</h1>

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="mb-4 text-xl font-semibold">Order Summary</h2>
          <div className="rounded-lg border bg-white p-4">
            {cart.map(item => (
              <div key={item.id} className="mb-3 flex justify-between">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    $
                    {item.price.toFixed(2)}
                    {' '}
                    ×
                    {' '}
                    {item.quantity}
                  </p>
                </div>
                <p className="font-medium">
                  $
                  {(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}

            <Separator className="my-4" />

            <div className="space-y-2">
              <div className="flex justify-between">
                <p>Subtotal</p>
                <p>
                  $
                  {cartTotal.toFixed(2)}
                </p>
              </div>
              <div className="flex justify-between">
                <p>Tax (10%)</p>
                <p>
                  $
                  {tax.toFixed(2)}
                </p>
              </div>
              <div className="flex justify-between font-bold">
                <p>Total</p>
                <p>
                  $
                  {grandTotal.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-xl font-semibold">Payment Method</h2>
          <div className="rounded-lg border bg-white p-4">
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
              <div className="flex items-center space-x-2 rounded-md border p-3">
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card" className="flex items-center">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Credit/Debit Card
                </Label>
              </div>

              <div className="mt-3 flex items-center space-x-2 rounded-md border p-3">
                <RadioGroupItem value="cash" id="cash" />
                <Label htmlFor="cash" className="flex items-center">
                  <Wallet className="mr-2 h-4 w-4" />
                  Cash
                </Label>
              </div>
            </RadioGroup>

            <Button className="mt-6 w-full" size="lg" onClick={handlePayment}>
              Complete Payment
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
