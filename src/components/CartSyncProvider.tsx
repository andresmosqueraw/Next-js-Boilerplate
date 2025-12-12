'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useCart } from '@/app/[locale]/(auth)/pos/context/cart-context';

type ProductoSincronizado = {
  id: number;
  quantity: number;
};

/**
 * Componente que sincroniza el carrito con Supabase
 * Crea tipo_pedido, carrito y carrito_producto cuando se agrega el primer producto
 * Agrega productos subsecuentes usando la API de agregar-producto
 * NOTA: Todo el estado del carrito se maneja en Supabase, no se usa localStorage
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

    // CASO ESPECIAL: Si el carrito está vacío PERO tenemos un carritoId, limpiar el carrito en Supabase
    if (cart.length === 0 && carritoId && tipo && id && restauranteId) {
      console.warn('🧹 [CartSync] Carrito vacío detectado, limpiando carrito en Supabase...');

      const limpiarCarrito = async () => {
        try {
          isCreating.current = true;

          const tipoPedido = {
            tipo,
            mesaId: tipo === 'mesa' ? Number.parseInt(id) : undefined,
            domicilioId: tipo === 'domicilio' ? Number.parseInt(id) : undefined,
          };

          console.warn('🧹 [CartSync] Llamando a /api/carrito/limpiar-vacio:', {
            carritoId,
            tipoPedido,
          });

          const response = await fetch('/api/carrito/limpiar-vacio', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ carritoId, tipoPedido }),
          });

          console.warn(`📡 [CartSync] Respuesta limpiar-vacio: ${response.status}`);

          if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ [CartSync] Error HTTP al limpiar carrito:', {
              status: response.status,
              errorText,
            });
            isCreating.current = false;
            return;
          }

          const data = await response.json();

          if (data.success) {
            // Limpiar el carritoId y productos sincronizados
            setCarritoId(null);
            productosSincronizados.current = [];
            console.warn('✅ [CartSync] Carrito limpiado exitosamente:', {
              carritoId,
              mesaActualizada: tipo === 'mesa' ? 'DEBERÍA ESTAR DISPONIBLE AHORA' : 'N/A',
              siguientePaso: 'Dashboard debe recargar y mostrar mesa como DISPONIBLE',
            });
          } else {
            console.error('❌ [CartSync] Error en respuesta al limpiar carrito:', data.error);
          }

          isCreating.current = false;
        } catch (error) {
          console.error('❌ [CartSync] Error limpiando carrito:', error);
          isCreating.current = false;
        }
      };

      limpiarCarrito();
      return;
    }

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

          const requestBody = { tipoPedido, carritoData };

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

          console.warn('📤 [CartSync] Body de la petición a /api/carrito/crear:', {
            tipoPedido: {
              tipo: requestBody.tipoPedido.tipo,
              mesaId: requestBody.tipoPedido.mesaId,
              domicilioId: requestBody.tipoPedido.domicilioId,
            },
            carritoData: {
              restauranteId: requestBody.carritoData.restauranteId,
              clienteId: requestBody.carritoData.clienteId,
              productos: requestBody.carritoData.productos.map(p => ({
                productoId: p.productoId,
                cantidad: p.cantidad,
                precioUnitario: p.precioUnitario,
                subtotal: p.subtotal,
              })),
            },
          });

          console.warn('⏱️ [CartSync] Iniciando fetch a /api/carrito/crear...');
          const fetchStartTime = Date.now();

          const response = await fetch('/api/carrito/crear', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
          });

          const fetchDuration = Date.now() - fetchStartTime;
          console.warn(`⏱️ [CartSync] Fetch completado en ${fetchDuration}ms`);

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
          // CASO 2: Agregar/actualizar/eliminar productos en carrito existente
          // ========================================

          // Detectar productos eliminados (estaban sincronizados pero ya no están en cart)
          const productosEliminados = productosSincronizados.current.filter(
            sincronizado => !cart.some(item => item.id === sincronizado.id),
          );

          // Detectar productos nuevos o con cantidad diferente
          const productosNuevos = cart.filter((cartItem) => {
            const sincronizado = productosSincronizados.current.find(
              p => p.id === cartItem.id,
            );
            // Es nuevo si no está sincronizado o si la cantidad cambió
            return !sincronizado || sincronizado.quantity !== cartItem.quantity;
          });

          // Si no hay cambios, no hacer nada
          if (productosNuevos.length === 0 && productosEliminados.length === 0) {
            return; // No hay cambios que sincronizar
          }

          isCreating.current = true;

          // Primero, eliminar productos que ya no están en el carrito
          if (productosEliminados.length > 0) {
            console.warn('🗑️ [CartSync] CASO 2a: Eliminando productos del carrito:', {
              carritoId,
              productosEliminar: productosEliminados.length,
              detalleEliminar: productosEliminados,
            });

            for (const producto of productosEliminados) {
              console.warn(`🗑️ [CartSync] Eliminando producto individual:`, {
                carritoId,
                productoId: producto.id,
              });

              const response = await fetch('/api/carrito/eliminar-producto', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  carritoId,
                  restauranteId,
                  productoId: producto.id,
                }),
              });

              console.warn(`📡 [CartSync] Respuesta eliminar-producto: ${response.status}`);

              if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ [CartSync] Error HTTP al eliminar producto:', {
                  status: response.status,
                  productoId: producto.id,
                  errorText,
                });
                continue;
              }

              const data = await response.json();

              if (data.success) {
                // Remover el producto de la lista de sincronizados
                productosSincronizados.current = productosSincronizados.current.filter(
                  p => p.id !== producto.id,
                );
                console.warn('✅ [CartSync] Producto eliminado exitosamente:', {
                  productoId: producto.id,
                  productosSincronizadosRestantes: productosSincronizados.current.length,
                });
              } else {
                console.error('❌ [CartSync] Error en respuesta al eliminar producto:', data.error);
              }
            }
          }

          // Después de eliminar, verificar si el carrito quedó vacío
          if (cart.length === 0 && productosEliminados.length > 0) {
            console.warn('🧹 [CartSync] Carrito quedó vacío después de eliminar productos, limpiando...');
            // El siguiente useEffect detectará que cart.length === 0 y llamará a limpiar-vacio
            isCreating.current = false;
            return;
          }

          // Agregar cada producto nuevo (solo si hay productos nuevos)
          if (productosNuevos.length > 0) {
            console.warn('➕ [CartSync] CASO 2b: Agregando productos nuevos al carrito existente:', {
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
          } // Cierre del if (productosNuevos.length > 0)

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
