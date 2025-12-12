# 🛒 Sistema de Sincronización del Carrito con Supabase

## 📋 Resumen

Este sistema gestiona el carrito de compras completamente en Supabase. Todo el estado del carrito se almacena y sincroniza con la base de datos de Supabase cuando un usuario agrega productos en el POS. **NO se usa localStorage** - todo el estado se maneja en Supabase.

## 🎯 Flujo de Trabajo

### 1. Usuario Selecciona Mesa o Domicilio
- Desde el dashboard, el usuario hace clic en una mesa o domicilio
- La navegación incluye parámetros: `tipo`, `id`, `numero` (mesa) o `clienteId` (domicilio)
- Ejemplo: `/pos?tipo=mesa&id=1&numero=5`

### 2. Usuario Agrega Primer Producto
Cuando se agrega el primer producto al carrito, el `CartSyncProvider` detecta el cambio y ejecuta:

#### a) Obtener el `restaurante_id`
- El `restaurante_id` se obtiene directamente de los parámetros de la URL (`restauranteId`)
- Se pasa desde el dashboard cuando se hace clic en una mesa o domicilio
- No se necesita hacer llamadas adicionales a la API

#### b) Crear `tipo_pedido`
```sql
INSERT INTO tipo_pedido (mesa_id, domicilio_id)
VALUES (1, NULL) -- Para mesa
-- o
VALUES (NULL, 5) -- Para domicilio
```

#### c) Crear `carrito`
```sql
INSERT INTO carrito (restaurante_id, tipo_pedido_id, cliente_id, estado)
VALUES (2, 10, 3, 'pendiente')
```

#### d) Actualizar estado de `mesa` a 'ocupada'
```sql
UPDATE mesa
SET estado = 'ocupada'
WHERE id = 1
```

#### e) Insertar productos en `carrito_producto`
```sql
INSERT INTO carrito_producto (carrito_id, producto_restaurante_id, cantidad, precio_unitario, subtotal)
VALUES
  (10, 5, 2, 12.50, 25.00),
  (10, 8, 1, 8.00, 8.00)
```

### 3. Usuario Agrega Más Productos
- El sistema detecta que `carritoId` ya existe
- Solo registra en el log por ahora (TODO: implementar actualización de productos)

### 4. Usuario Paga (TODO)
- Cambiar estado del `carrito` a 'servido'
- Crear registro en `venta`
- Cambiar estado de la `mesa` a 'sucia' o 'disponible'

## 🗂️ Estructura de Archivos

### Servicios
```
src/services/carrito.service.ts
```
Funciones para interactuar con Supabase:
- `crearCarrito()` - Crea tipo_pedido, carrito y carrito_producto
- `agregarProductoACarrito()` - Agrega un producto a carrito existente
- `actualizarCantidadProducto()` - Actualiza cantidad de un producto
- `eliminarProductoDeCarrito()` - Elimina un producto del carrito
- `obtenerCarritoActivo()` - Obtiene el carrito activo de una mesa/domicilio

### API Routes
```
src/app/api/carrito/crear/route.ts
src/app/api/carrito/agregar-producto/route.ts
src/app/api/carrito/obtener-activo/route.ts
src/app/api/mesa/[id]/route.ts
```

### Componentes
```
src/components/CartSyncProvider.tsx
```
Wrapper que detecta cambios en el carrito y sincroniza con Supabase.

### Hooks
```
src/hooks/use-cart-sync.ts
```
Hook personalizado para manejar la sincronización (opcional, actualmente no usado).

## 🔄 Estados del Carrito

| Estado | Descripción |
|--------|-------------|
| **pendiente** | Pedido tomado, esperando ser procesado |
| **en preparación** | Cocina está trabajando en el pedido |
| **listo para servir** | Comida terminada, esperando ser entregada |
| **servido** | Entregado al cliente, listo para pagar |
| **cancelado** | Pedido anulado |

## 🛋️ Estados de la Mesa

| Estado | Descripción |
|--------|-------------|
| **disponible** | Mesa limpia y lista |
| **ocupada** | Hay clientes o orden activa |
| **sucia** | Clientes se fueron, necesita limpieza |
| **fuera de servicio** | Mesa rota o en mantenimiento |

## 🔗 Relaciones Clave

```
Mesa/Domicilio
    ↓
tipo_pedido
    ↓
carrito → carrito_producto → producto_restaurante → producto
    ↓
venta
```

## ⚠️ TODO / Pendientes

1. **Mapear productos a `producto_restaurante_id`**
   - Actualmente se usa el `product.id` directamente
   - Debe buscarse el `producto_restaurante.id` correspondiente

2. **Implementar actualización de productos existentes**
   - Cuando ya existe un `carritoId`, actualizar `carrito_producto`

3. **Obtener `restaurante_id` de domicilios**
   - Implementar lógica similar a la de mesas para domicilios

4. **Implementar flujo de pago completo**
   - Crear `venta`
   - Actualizar estados de mesa y carrito

5. **Manejo de errores más robusto**
   - Reintentos en caso de fallos
   - Notificaciones al usuario

6. **Carga del carrito desde Supabase**
   - Cargar carrito existente al entrar al POS desde Supabase
   - El estado del carrito siempre se mantiene sincronizado con Supabase
   - No se usa localStorage - todo se almacena en Supabase

## 🧪 Cómo Probar

1. Asegúrate de tener datos de prueba en Supabase (mesas, productos, restaurantes)
2. Ve al dashboard `/dashboard`
3. Haz clic en una mesa o domicilio
4. Agrega productos al carrito
5. Abre la consola del navegador para ver los logs:
   - ✅ Carrito creado en Supabase: [carritoId]
6. Verifica en Supabase:
   - Tabla `tipo_pedido` - nuevo registro
   - Tabla `carrito` - nuevo registro con estado 'pendiente'
   - Tabla `carrito_producto` - productos agregados
   - Tabla `mesa` - estado cambiado a 'ocupada'

## 📚 Referencias

- [Supabase Client Library](https://supabase.com/docs/reference/javascript/introduction)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [React useEffect](https://react.dev/reference/react/useEffect)
