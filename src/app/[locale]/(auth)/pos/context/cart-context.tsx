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
      // OPTIMISTIC UPDATE: Actualizar el estado local inmediatamente
      const existingItemIndex = cart.findIndex(item => item.id === product.id);
      if (existingItemIndex >= 0) {
        // Producto ya existe: incrementar cantidad
        setCart(prev => prev.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      } else {
        // Producto nuevo: agregar al carrito
        setCart(prev => [...prev, {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          category: product.category,
          quantity: 1,
        }]);
      }

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
          // Revertir cambio optimista
          setCart(prev => prev.filter(item => item.id !== product.id));
          console.error('Error al crear carrito:', response.statusText);
          return;
        }

        const data = await response.json();
        if (data.success) {
          setCarritoId(data.carritoId);
          // Sincronizar en segundo plano (no bloquea la UI)
          cargarCarrito().catch(err => {
            console.error('Error al sincronizar carrito:', err);
          });
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
          // Revertir cambio optimista
          if (existingItemIndex >= 0) {
            setCart(prev => prev.map((item, index) =>
              index === existingItemIndex
                ? { ...item, quantity: item.quantity - 1 }
                : item
            ));
          } else {
            setCart(prev => prev.filter(item => item.id !== product.id));
          }
          console.error('Error al agregar producto:', response.statusText);
          return;
        }

        // Sincronizar en segundo plano (no bloquea la UI)
        cargarCarrito().catch(err => {
          console.error('Error al sincronizar carrito:', err);
        });
      }
    } catch (error) {
      // Revertir cambio optimista en caso de error
      const existingItemIndex = cart.findIndex(item => item.id === product.id);
      if (existingItemIndex >= 0) {
        setCart(prev => prev.map((item, index) =>
          index === existingItemIndex && item.quantity > 1
            ? { ...item, quantity: item.quantity - 1 }
            : item
        ).filter(item => item.quantity > 0));
      } else {
        setCart(prev => prev.filter(item => item.id !== product.id));
      }
      console.error('Error al agregar al carrito:', error);
    }
  }, [tipo, id, restauranteId, carritoId, cart, cargarCarrito]);

  const removeFromCart = useCallback(async (productId: number) => {
    if (!carritoId || !restauranteId) {
      console.error('Faltan parámetros para eliminar del carrito');
      return;
    }

    // OPTIMISTIC UPDATE: Eliminar del estado local inmediatamente
    const itemToRemove = cart.find(item => item.id === productId);
    setCart(prev => prev.filter(item => item.id !== productId));

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
        // Revertir cambio optimista
        if (itemToRemove) {
          setCart(prev => [...prev, itemToRemove]);
        }
        console.error('Error al eliminar producto:', response.statusText);
        return;
      }

      // Sincronizar en segundo plano (no bloquea la UI)
      cargarCarrito().catch(err => {
        console.error('Error al sincronizar carrito:', err);
        // Revertir cambio optimista si falla
        if (itemToRemove) {
          setCart(prev => [...prev, itemToRemove]);
        }
      });
    } catch (error) {
      // Revertir cambio optimista en caso de error
      if (itemToRemove) {
        setCart(prev => [...prev, itemToRemove]);
      }
      console.error('Error al eliminar del carrito:', error);
    }
  }, [carritoId, restauranteId, cart, cargarCarrito]);

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

    // OPTIMISTIC UPDATE: Actualizar cantidad en el estado local inmediatamente
    const item = cart.find(item => item.id === productId);
    if (!item) {
      console.error('Producto no encontrado en el carrito');
      return;
    }

    const previousQuantity = item.quantity;
    const precioUnitario = item.price;

    setCart(prev => prev.map(cartItem =>
      cartItem.id === productId
        ? { ...cartItem, quantity }
        : cartItem
    ));

    try {
      const response = await fetch('/api/carrito/actualizar-cantidad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carritoId,
          restauranteId: Number.parseInt(restauranteId),
          productoId: productId,
          cantidad: quantity,
          precioUnitario,
        }),
      });

      if (!response.ok) {
        // Revertir cambio optimista
        setCart(prev => prev.map(cartItem =>
          cartItem.id === productId
            ? { ...cartItem, quantity: previousQuantity }
            : cartItem
        ));
        console.error('Error al actualizar cantidad:', response.statusText);
        return;
      }

      // Sincronizar en segundo plano (no bloquea la UI)
      cargarCarrito().catch(err => {
        console.error('Error al sincronizar carrito:', err);
        // Revertir cambio optimista si falla
        setCart(prev => prev.map(cartItem =>
          cartItem.id === productId
            ? { ...cartItem, quantity: previousQuantity }
            : cartItem
        ));
      });
    } catch (error) {
      // Revertir cambio optimista en caso de error
      setCart(prev => prev.map(cartItem =>
        cartItem.id === productId
          ? { ...cartItem, quantity: previousQuantity }
          : cartItem
      ));
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
