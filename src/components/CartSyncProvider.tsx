'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useCart } from '@/app/[locale]/(auth)/pos/context/cart-context';

type ProductoSincronizado = {
  id: number;
  quantity: number;
};

/**
 * Componente que sincroniza el carrito del localStorage con Supabase
 * Crea tipo_pedido, carrito y carrito_producto cuando se agrega el primer producto
 * Agrega productos subsecuentes usando la API de agregar-producto
 */
export function CartSyncProvider({ children }: { children: React.ReactNode }) {
  const { cart } = useCart();
  const searchParams = useSearchParams();
  // Obtener información del pedido
  const tipo = searchParams.get('tipo') as 'mesa' | 'domicilio' | null;
  const id = searchParams.get('id');
  const clienteId = searchParams.get('clienteId');
  const restauranteIdFromUrl = searchParams.get('restauranteId');

  // Derivar restauranteId directamente desde la URL (sin estado)
  const restauranteId = restauranteIdFromUrl ? Number.parseInt(restauranteIdFromUrl) : null;

  const [carritoId, setCarritoId] = useState<number | null>(null);
  const isCreating = useRef(false);
  // Rastrear productos que ya están sincronizados en Supabase
  const productosSincronizados = useRef<ProductoSincronizado[]>([]);

  useEffect(() => {
    // Solo sincronizar si hay productos en el carrito y tenemos tipo/id/restauranteId
    if (cart.length === 0 || !tipo || !id || !restauranteId) {
      return;
    }

    // Evitar múltiples llamadas simultáneas
    if (isCreating.current) {
      return;
    }

    const syncCarrito = async () => {
      try {
        if (!carritoId) {
          // ========================================
          // CASO 1: Crear nuevo carrito con todos los productos
          // ========================================
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
              productoId: item.id,
              cantidad: item.quantity,
              precioUnitario: item.price,
              subtotal: item.price * item.quantity,
            })),
          };

          console.warn('🛒 Creando carrito con datos:', {
            tipo,
            id,
            restauranteId,
            productos: cart.length,
          });

          const response = await fetch('/api/carrito/crear', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tipoPedido, carritoData }),
          });

          const data = await response.json();

          if (data.success) {
            setCarritoId(data.carritoId);
            // Marcar todos los productos como sincronizados
            productosSincronizados.current = cart.map(item => ({
              id: item.id,
              quantity: item.quantity,
            }));
            console.warn('✅ Carrito creado:', {
              carritoId: data.carritoId,
              productos: cart.length,
            });
          } else {
            console.error('❌ Error creando carrito:', data.error);
          }

          isCreating.current = false;
        } else {
          // ========================================
          // CASO 2: Agregar/actualizar productos en carrito existente
          // ========================================

          // Detectar productos nuevos o con cantidad diferente
          const productosNuevos = cart.filter((cartItem) => {
            const sincronizado = productosSincronizados.current.find(
              p => p.id === cartItem.id,
            );
            // Es nuevo si no está sincronizado o si la cantidad cambió
            return !sincronizado || sincronizado.quantity !== cartItem.quantity;
          });

          if (productosNuevos.length === 0) {
            return; // No hay cambios que sincronizar
          }

          isCreating.current = true;

          console.warn('➕ Agregando productos al carrito:', {
            carritoId,
            productosNuevos: productosNuevos.length,
          });

          // Agregar cada producto nuevo
          for (const producto of productosNuevos) {
            const response = await fetch('/api/carrito/agregar-producto', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                carritoId,
                restauranteId,
                productoId: producto.id,
                cantidad: producto.quantity,
                precioUnitario: producto.price,
              }),
            });

            const data = await response.json();

            if (data.success) {
              // Actualizar el producto en la lista de sincronizados
              const index = productosSincronizados.current.findIndex(
                p => p.id === producto.id,
              );
              if (index >= 0 && productosSincronizados.current[index]) {
                productosSincronizados.current[index]!.quantity = producto.quantity;
              } else {
                productosSincronizados.current.push({
                  id: producto.id,
                  quantity: producto.quantity,
                });
              }
              console.warn('✅ Producto agregado:', {
                productoId: producto.id,
                cantidad: producto.quantity,
              });
            } else {
              console.error('❌ Error agregando producto:', data.error);
            }
          }

          isCreating.current = false;
        }
      } catch (error) {
        console.error('❌ Error syncing carrito:', error);
        isCreating.current = false;
      }
    };

    syncCarrito();
  }, [cart, carritoId, tipo, id, clienteId, restauranteId]);

  // Limpiar estado cuando se sale del POS o cambia de mesa/domicilio
  useEffect(() => {
    return () => {
      setCarritoId(null);
      isCreating.current = false;
      productosSincronizados.current = [];
    };
  }, [tipo, id]);

  return <>{children}</>;
}
