'use client';

import type { ReactNode } from 'react';
import { createContext, use, useCallback, useEffect, useMemo, useState } from 'react';

export type Product = {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
};

type CartItem = {
  quantity: number;
} & Product;

type CartContextType = {
  cart: CartItem[];
  addToCart: (product: Product) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  cartTotal: number;
  itemCount: number;
  isLoading: boolean;
  carritoId: number | null;
};

type CartProviderProps = {
  children: ReactNode;
  tipo?: 'mesa' | 'domicilio' | null;
  id?: string | null;
  restauranteId?: string | null;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children, tipo, id, restauranteId }: CartProviderProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [carritoId, setCarritoId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar carrito desde Supabase cuando se monta o cambian los parámetros
  const cargarCarrito = useCallback(async () => {
    if (!tipo || !id || !restauranteId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/carrito/obtener-completo?tipo=${tipo}&id=${id}&restauranteId=${restauranteId}`,
      );

      if (!response.ok) {
        console.error('Error al cargar carrito:', response.statusText);
        setCart([]);
        setCarritoId(null);
        return;
      }

      const data = await response.json();
      if (data.success) {
        setCart(data.productos || []);
        setCarritoId(data.carritoId);
      } else {
        setCart([]);
        setCarritoId(null);
      }
    } catch (error) {
      console.error('Error al cargar carrito:', error);
      setCart([]);
      setCarritoId(null);
    } finally {
      setIsLoading(false);
    }
  }, [tipo, id, restauranteId]);

  // Cargar carrito al montar o cuando cambian los parámetros
  useEffect(() => {
    cargarCarrito();
  }, [cargarCarrito]);

  const addToCart = useCallback(async (product: Product) => {
    if (!tipo || !id || !restauranteId) {
      console.error('Faltan parámetros para agregar al carrito');
      return;
    }

    try {
      // Si no hay carrito, crear uno nuevo
      if (!carritoId) {
        const response = await fetch('/api/carrito/crear', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tipoPedido: {
              tipo,
              mesaId: tipo === 'mesa' ? Number.parseInt(id) : undefined,
              domicilioId: tipo === 'domicilio' ? Number.parseInt(id) : undefined,
            },
            carritoData: {
              restauranteId: Number.parseInt(restauranteId),
              productos: [{
                productoId: product.id,
                cantidad: 1,
                precioUnitario: product.price,
                subtotal: product.price,
              }],
            },
          }),
        });

        if (!response.ok) {
          console.error('Error al crear carrito:', response.statusText);
          return;
        }

        const data = await response.json();
        if (data.success) {
          setCarritoId(data.carritoId);
          // Recargar carrito
          await cargarCarrito();
      }
      } else {
        // Agregar producto al carrito existente
        const response = await fetch('/api/carrito/agregar-producto', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            carritoId,
            restauranteId: Number.parseInt(restauranteId),
            productoId: product.id,
            cantidad: 1,
            precioUnitario: product.price,
          }),
        });

        if (!response.ok) {
          console.error('Error al agregar producto:', response.statusText);
          return;
        }

        // Recargar carrito
        await cargarCarrito();
      }
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
    }
  }, [tipo, id, restauranteId, carritoId, cargarCarrito]);

  const removeFromCart = useCallback(async (productId: number) => {
    if (!carritoId || !restauranteId) {
      console.error('Faltan parámetros para eliminar del carrito');
      return;
    }

    try {
      const response = await fetch('/api/carrito/eliminar-producto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carritoId,
          restauranteId: Number.parseInt(restauranteId),
          productoId: productId,
        }),
      });

      if (!response.ok) {
        console.error('Error al eliminar producto:', response.statusText);
        return;
      }

      // Recargar carrito
      await cargarCarrito();
    } catch (error) {
      console.error('Error al eliminar del carrito:', error);
    }
  }, [carritoId, restauranteId, cargarCarrito]);

  const updateQuantity = useCallback(async (productId: number, quantity: number) => {
    if (!carritoId || !restauranteId) {
      console.error('Faltan parámetros para actualizar cantidad');
      return;
    }

    if (quantity <= 0) {
      // Eliminar producto si la cantidad es 0
      await removeFromCart(productId);
      return;
    }

    try {
      // Primero eliminar el producto y luego agregarlo con la nueva cantidad
      // (o podríamos crear una API de actualizar cantidad)
      const response = await fetch('/api/carrito/agregar-producto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carritoId,
          restauranteId: Number.parseInt(restauranteId),
          productoId: productId,
          cantidad: quantity,
          precioUnitario: cart.find(item => item.id === productId)?.price || 0,
        }),
      });

      if (!response.ok) {
        console.error('Error al actualizar cantidad:', response.statusText);
        return;
      }

      // Recargar carrito
      await cargarCarrito();
    } catch (error) {
      console.error('Error al actualizar cantidad:', error);
    }
  }, [carritoId, restauranteId, cart, removeFromCart, cargarCarrito]);

  const clearCart = useCallback(async () => {
    if (!carritoId || !tipo || !id) {
      console.error('Faltan parámetros para limpiar carrito');
      return;
    }

    try {
      const tipoPedido = {
        tipo,
        mesaId: tipo === 'mesa' ? Number.parseInt(id) : undefined,
        domicilioId: tipo === 'domicilio' ? Number.parseInt(id) : undefined,
      };

      const response = await fetch('/api/carrito/limpiar-vacio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carritoId, tipoPedido }),
      });

      if (!response.ok) {
        console.error('Error al limpiar carrito:', response.statusText);
        return;
      }

      // Recargar carrito (debería estar vacío ahora)
      await cargarCarrito();
    } catch (error) {
      console.error('Error al limpiar carrito:', error);
    }
  }, [carritoId, tipo, id, cargarCarrito]);

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const itemCount = cart.reduce((count, item) => count + item.quantity, 0);

  const contextValue = useMemo(
    () => ({
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        itemCount,
      isLoading,
      carritoId,
    }),
    [cart, cartTotal, itemCount, addToCart, removeFromCart, updateQuantity, clearCart, isLoading, carritoId],
  );

  return <CartContext value={contextValue}>{children}</CartContext>;
}

export function useCart() {
  const context = use(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
