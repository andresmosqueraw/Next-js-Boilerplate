'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useCart } from '@/app/[locale]/(auth)/pos/context/cart-context';

/**
 * Componente que sincroniza el carrito del localStorage con Supabase
 * Crea tipo_pedido, carrito y carrito_producto cuando se agrega el primer producto
 */
export function CartSyncProvider({ children }: { children: React.ReactNode }) {
  const { cart } = useCart();
  const searchParams = useSearchParams();
  const [carritoId, setCarritoId] = useState<number | null>(null);
  const [restauranteId, setRestauranteId] = useState<number | null>(null);
  const isCreating = useRef(false);
  const lastSyncedCart = useRef<string>('');

  // Obtener información del pedido
  const tipo = searchParams.get('tipo') as 'mesa' | 'domicilio' | null;
  const id = searchParams.get('id');
  const clienteId = searchParams.get('clienteId');

  // Obtener restauranteId de la mesa cuando sea necesario
  useEffect(() => {
    if (tipo === 'mesa' && id && !restauranteId) {
      const obtenerRestauranteDeMesa = async () => {
        try {
          const response = await fetch(`/api/mesa/${id}`);
          const data = await response.json();
          if (data.success && data.mesa) {
            setRestauranteId(data.mesa.restaurante_id);
          }
        } catch (error) {
          console.error('Error obteniendo restaurante de mesa:', error);
        }
      };
      obtenerRestauranteDeMesa();
    }
  }, [tipo, id, restauranteId]);

  useEffect(() => {
    // Solo sincronizar si hay productos en el carrito y tenemos tipo/id/restauranteId
    if (cart.length === 0 || !tipo || !id || !restauranteId) {
      return;
    }

    const cartString = JSON.stringify(cart);
    if (cartString === lastSyncedCart.current) {
      return;
    } // Evitar sincronizaciones duplicadas

    const syncCarrito = async () => {
      try {
        if (!carritoId && !isCreating.current) {
          // Crear nuevo carrito en Supabase
          isCreating.current = true;

          const tipoPedido = {
            tipo,
            mesaId: tipo === 'mesa' ? Number.parseInt(id) : undefined,
            domicilioId: tipo === 'domicilio' ? Number.parseInt(id) : undefined,
          };

          const carritoData = {
            restauranteId,
            clienteId: clienteId ? Number.parseInt(clienteId) : undefined,
            productos: cart.map(item => ({
              productoRestauranteId: item.id, // TODO: Mapear al producto_restaurante_id real
              cantidad: item.quantity,
              precioUnitario: item.price,
              subtotal: item.price * item.quantity,
            })),
          };

          const response = await fetch('/api/carrito/crear', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tipoPedido, carritoData }),
          });

          const data = await response.json();

          if (data.success) {
            setCarritoId(data.carritoId);
            lastSyncedCart.current = cartString;
            console.warn('✅ Carrito creado:', {
              carritoId: data.carritoId,
              mesaId: tipo === 'mesa' ? id : null,
              restauranteId,
              productos: cart.length,
            });
          } else {
            console.error('❌ Error creating carrito:', data.error);
          }

          isCreating.current = false;
        } else if (carritoId) {
          // TODO: Actualizar productos en carrito existente
          lastSyncedCart.current = cartString;
        }
      } catch (error) {
        console.error('Error syncing carrito:', error);
        isCreating.current = false;
      }
    };

    syncCarrito();
  }, [cart, carritoId, tipo, id, clienteId, restauranteId]);

  return <>{children}</>;
}
