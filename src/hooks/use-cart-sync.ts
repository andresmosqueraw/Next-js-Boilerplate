'use client';

import type { Product } from '@/app/[locale]/(auth)/pos/context/cart-context';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

export function useCartSync() {
  const searchParams = useSearchParams();
  const [carritoId, setCarritoId] = useState<number | null>(null);
  const [restauranteId, setRestauranteId] = useState<number | null>(null);
  const isCreatingCarrito = useRef(false);

  // Obtener información del pedido de la URL
  const tipo = searchParams.get('tipo') as 'mesa' | 'domicilio' | null;
  const id = searchParams.get('id');
  const clienteId = searchParams.get('clienteId');

  // Intentar cargar carrito activo al montar el componente
  useEffect(() => {
    if (!tipo || !id) {
      return;
    }

    const cargarCarritoActivo = async () => {
      try {
        const response = await fetch(
          `/api/carrito/obtener-activo?tipo=${tipo}&id=${id}`,
        );
        const data = await response.json();

        if (data.success && data.carrito) {
          setCarritoId(data.carrito.id);
          setRestauranteId(data.carrito.restaurante_id);
        }
      } catch (error) {
        console.error('Error loading carrito activo:', error);
      }
    };

    cargarCarritoActivo();
  }, [tipo, id]);

  const crearCarritoEnSupabase = useCallback(
    async (productos: Array<Product & { quantity: number }>) => {
      if (!tipo || !id) {
        console.error('Missing tipo or id');
        return { success: false };
      }

      if (isCreatingCarrito.current) {
        return { success: false };
      }

      isCreatingCarrito.current = true;

      try {
        // Necesitamos obtener el restaurante_id
        // Por ahora usamos un valor por defecto (deberías obtenerlo del contexto)
        const restaurante = restauranteId || 1; // TODO: Obtener del contexto de restaurante

        const tipoPedido = {
          tipo,
          mesaId: tipo === 'mesa' ? Number.parseInt(id) : undefined,
          domicilioId: tipo === 'domicilio' ? Number.parseInt(id) : undefined,
        };

        const carritoData = {
          restauranteId: restaurante,
          clienteId: clienteId ? Number.parseInt(clienteId) : undefined,
          productos: productos.map(p => ({
            productoRestauranteId: p.id, // TODO: Mapear al producto_restaurante_id correcto
            cantidad: p.quantity,
            precioUnitario: p.price,
            subtotal: p.price * p.quantity,
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
          setRestauranteId(restaurante);
          return { success: true, carritoId: data.carritoId };
        }

        return { success: false, error: data.error };
      } catch (error) {
        console.error('Error creating carrito:', error);
        return { success: false, error: String(error) };
      } finally {
        isCreatingCarrito.current = false;
      }
    },
    [tipo, id, clienteId, restauranteId],
  );

  const agregarProductoASupabase = useCallback(
    async (producto: Product & { quantity: number }) => {
      if (!carritoId) {
        console.error('No carrito ID available');
        return { success: false };
      }

      try {
        const response = await fetch('/api/carrito/agregar-producto', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            carritoId,
            productoRestauranteId: producto.id,
            cantidad: producto.quantity,
            precioUnitario: producto.price,
          }),
        });

        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error adding product to carrito:', error);
        return { success: false, error: String(error) };
      }
    },
    [carritoId],
  );

  return {
    carritoId,
    tipo,
    crearCarritoEnSupabase,
    agregarProductoASupabase,
  };
}
