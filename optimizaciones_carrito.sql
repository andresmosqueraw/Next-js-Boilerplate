-- ==============================
-- OPTIMIZACIONES PARA CARRITO
-- ==============================

-- 1. ÍNDICE COMPUESTO para carrito_producto
-- Este índice acelera la búsqueda de productos en un carrito específico
-- Usado por: agregarProductoACarrito, actualizarCantidadProducto
CREATE INDEX IF NOT EXISTS idx_carritoprod_carrito_prodrest 
ON carrito_producto (carrito_id, producto_restaurante_id);

-- 2. FUNCIÓN RPC para UPSERT optimizado de carrito_producto
-- Esta función hace INSERT o UPDATE en una sola operación, evitando el SELECT previo
CREATE OR REPLACE FUNCTION upsert_carrito_producto(
  p_carrito_id INT,
  p_producto_restaurante_id INT,
  p_cantidad INT,
  p_precio_unitario NUMERIC(10,2)
)
RETURNS VOID AS $$
DECLARE
  v_cantidad_actual INT;
  v_nueva_cantidad INT;
BEGIN
  -- Intentar obtener la cantidad actual
  SELECT cantidad INTO v_cantidad_actual
  FROM carrito_producto
  WHERE carrito_id = p_carrito_id
    AND producto_restaurante_id = p_producto_restaurante_id;

  IF v_cantidad_actual IS NOT NULL THEN
    -- Producto existe: actualizar cantidad
    v_nueva_cantidad := v_cantidad_actual + p_cantidad;
    UPDATE carrito_producto
    SET 
      cantidad = v_nueva_cantidad,
      subtotal = v_nueva_cantidad * p_precio_unitario
    WHERE carrito_id = p_carrito_id
      AND producto_restaurante_id = p_producto_restaurante_id;
  ELSE
    -- Producto no existe: insertar nuevo
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
    );
  END IF;
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

