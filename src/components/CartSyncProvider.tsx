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
    console.warn('🔄 [CartSync] Estado del carrito:', {
      productosEnCarrito: cart.length,
      carritoId,
      tipo,
      mesaDomicilioId: id,
      restauranteId,
      isCreating: isCreating.current,
      productosSincronizados: productosSincronizados.current.length,
    });

    // Solo sincronizar si hay productos en el carrito y tenemos tipo/id/restauranteId
    if (cart.length === 0 || !tipo || !id || !restauranteId) {
      console.warn('⏸️ [CartSync] Sincronización pausada - faltan datos o carrito vacío');
      return;
    }

    // Evitar múltiples llamadas simultáneas
    if (isCreating.current) {
      console.warn('⏸️ [CartSync] Sincronización ya en progreso, esperando...');
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

          console.warn('🛒 [CartSync] PASO 1: Creando carrito nuevo en Supabase:', {
            tipo,
            mesaDomicilioId: id,
            restauranteId,
            productosIniciales: cart.length,
            detalleProductos: cart.map(p => ({
              id: p.id,
              nombre: p.name,
              cantidad: p.quantity,
              precio: p.price,
            })),
          });

          const response = await fetch('/api/carrito/crear', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tipoPedido, carritoData }),
          });

          console.warn(`📡 [CartSync] Respuesta del servidor: ${response.status} ${response.statusText}`);

          if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ [CartSync] Error HTTP al crear carrito:', {
              status: response.status,
              url: response.url,
              errorText,
            });
            isCreating.current = false;
            return;
          }

          const data = await response.json();

          if (data.success) {
            setCarritoId(data.carritoId);
            // Marcar todos los productos como sincronizados
            productosSincronizados.current = cart.map(item => ({
              id: item.id,
              quantity: item.quantity,
            }));
            console.warn('✅ [CartSync] PASO 2: Carrito creado exitosamente en Supabase:', {
              carritoId: data.carritoId,
              productos: cart.length,
              estadoMesa: tipo === 'mesa' ? 'DEBERÍA ESTAR OCUPADA AHORA' : 'N/A',
              siguientePaso: 'Dashboard debe recargar y mostrar mesa como OCUPADA',
            });
          } else {
            console.error('❌ [CartSync] Error en respuesta al crear carrito:', data.error);
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

          console.warn('➕ [CartSync] CASO 2: Agregando productos nuevos al carrito existente:', {
            carritoId,
            productosEnCarritoTotal: cart.length,
            productosNuevosAgregar: productosNuevos.length,
            detalleNuevos: productosNuevos.map(p => ({
              id: p.id,
              nombre: p.name,
              cantidad: p.quantity,
            })),
          });

          // Agregar cada producto nuevo
          for (const producto of productosNuevos) {
            console.warn(`➕ [CartSync] Agregando producto individual:`, {
              carritoId,
              productoId: producto.id,
              nombre: producto.name,
              cantidad: producto.quantity,
            });

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

            console.warn(`📡 [CartSync] Respuesta agregar-producto: ${response.status}`);

            if (!response.ok) {
              const errorText = await response.text();
              console.error('❌ [CartSync] Error HTTP al agregar producto:', {
                status: response.status,
                productoId: producto.id,
                errorText,
              });
              continue;
            }

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
              console.warn('✅ [CartSync] Producto agregado exitosamente:', {
                productoId: producto.id,
                nombre: producto.name,
                cantidad: producto.quantity,
                productosSincronizadosTotal: productosSincronizados.current.length,
              });
            } else {
              console.error('❌ [CartSync] Error en respuesta al agregar producto:', data.error);
            }
          }

          console.warn('✅ [CartSync] Finalizada actualización del carrito:', {
            carritoId,
            productosSincronizados: productosSincronizados.current.length,
          });

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
