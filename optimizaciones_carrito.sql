-- ==============================
-- OPTIMIZACIONES PARA CARRITO
-- ==============================

-- 1. ÍNDICE COMPUESTO para carrito_producto
-- Este índice acelera la búsqueda de productos en un carrito específico
-- Usado por: agregarProductoACarrito, actualizarCantidadProducto
CREATE INDEX IF NOT EXISTS idx_carritoprod_carrito_prodrest 
ON carrito_producto (carrito_id, producto_restaurante_id);

-- 2. FUNCIÓN RPC para UPSERT optimizado de carrito_producto
-- Esta función usa INSERT ... ON CONFLICT para hacer todo en una sola operación
-- Es más rápido que SELECT + UPDATE/INSERT porque evita el round-trip adicional
CREATE OR REPLACE FUNCTION upsert_carrito_producto(
  p_carrito_id INT,
  p_producto_restaurante_id INT,
  p_cantidad INT,
  p_precio_unitario NUMERIC(10,2)
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO carrito_producto (
    carrito_id,
    producto_restaurante_id,
    cantidad,
    precio_unitario,
    subtotal
  ) VALUES (
    p_carrito_id,
    p_producto_restaurante_id,
    p_cantidad,
    p_precio_unitario,
    p_cantidad * p_precio_unitario
  )
  ON CONFLICT (carrito_id, producto_restaurante_id)
  DO UPDATE SET
    cantidad = carrito_producto.cantidad + p_cantidad,
    subtotal = (carrito_producto.cantidad + p_cantidad) * p_precio_unitario;
END;
$$ LANGUAGE plpgsql;

-- 3. ÍNDICE ADICIONAL para producto_restaurante
-- Acelera la búsqueda de productos por restaurante
CREATE INDEX IF NOT EXISTS idx_prodrest_rest_producto 
ON producto_restaurante (restaurante_id, producto_id);

-- 4. ÍNDICE ADICIONAL para producto_categoria
-- Acelera la búsqueda de categorías por producto
CREATE INDEX IF NOT EXISTS idx_prodcat_producto_categoria 
ON producto_categoria (producto_id, categoria_id);