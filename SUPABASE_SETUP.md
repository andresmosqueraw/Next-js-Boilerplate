# Configuración de Supabase para Ana Gourmet

## Variables de Entorno Requeridas

Agrega estas variables a tu archivo `.env.local`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=tu-anon-key-aqui
```

## Cómo obtener las credenciales de Supabase

1. Ve a tu proyecto en [Supabase](https://supabase.com/dashboard)
2. Navega a **Settings** > **API**
3. Copia los valores de:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

## Estructura de la Base de Datos

El dashboard ahora carga datos de las siguientes tablas:

### Mesa
- `id` (SERIAL PRIMARY KEY)
- `restaurante_id` (INT)
- `numero_mesa` (INT)
- `capacidad` (INT)
- `estado` (VARCHAR)
- `creado_en` (TIMESTAMP)

### Domicilio
- `id` (SERIAL PRIMARY KEY)
- `cliente_id` (INT)
- `direccion` (TEXT)
- `ciudad` (VARCHAR)
- `referencia` (TEXT)
- `creado_en` (TIMESTAMP)

## Scripts SQL para Crear las Tablas

Si aún no has creado las tablas en Supabase, ejecuta estos scripts en el **SQL Editor** de tu proyecto:

```sql
-- DEFINICIÓN DE TIPOS
CREATE TYPE tipo_pedido_enum AS ENUM ('MESA', 'DOMICILIO');

-- ==============================
-- 1. CLIENTE
-- ==============================
CREATE TABLE cliente (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE,
    telefono VARCHAR(20),
    creado_en TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_cliente_telefono ON cliente (telefono);

-- ==============================
-- 2. RESTAURANTE
-- ==============================
CREATE TABLE restaurante (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL UNIQUE,
    direccion TEXT,
    telefono VARCHAR(20),
    creado_en TIMESTAMP DEFAULT NOW()
);

-- ==============================
-- 3. MESA
-- ==============================
CREATE TABLE mesa (
    id SERIAL PRIMARY KEY,
    restaurante_id INT NOT NULL REFERENCES restaurante(id) ON DELETE CASCADE,
    numero_mesa INT NOT NULL,
    capacidad INT,
    estado VARCHAR(30) DEFAULT 'disponible',
    creado_en TIMESTAMP DEFAULT NOW(),
    UNIQUE (restaurante_id, numero_mesa)
);
CREATE INDEX idx_mesa_rest_estado ON mesa (restaurante_id, estado);

-- ==============================
-- 4. DOMICILIO
-- ==============================
CREATE TABLE domicilio (
    id SERIAL PRIMARY KEY,
    cliente_id INT NOT NULL REFERENCES cliente(id) ON DELETE CASCADE,
    direccion TEXT NOT NULL,
    ciudad VARCHAR(100),
    referencia TEXT,
    creado_en TIMESTAMP DEFAULT NOW(),
    UNIQUE (cliente_id, direccion)
);
CREATE INDEX idx_domicilio_cliente ON domicilio (cliente_id);
```

## Insertar Datos de Prueba

Para probar el dashboard, puedes insertar algunos datos de prueba:

```sql
-- Insertar un restaurante
INSERT INTO restaurante (nombre, direccion, telefono)
VALUES ('Ana Gourmet Centro', 'Calle Principal 123', '555-1234');

-- Insertar un cliente
INSERT INTO cliente (nombre, email, telefono)
VALUES ('Juan Pérez', 'juan@example.com', '555-5678');

-- Insertar algunas mesas
INSERT INTO mesa (restaurante_id, numero_mesa, capacidad, estado) VALUES
(1, 1, 4, 'disponible'),
(1, 2, 2, 'disponible'),
(1, 3, 6, 'ocupada'),
(1, 4, 4, 'disponible');

-- Insertar algunos domicilios
INSERT INTO domicilio (cliente_id, direccion, ciudad, referencia) VALUES
(1, 'Av. Libertador 456, Apt 3B', 'Caracas', 'Edificio azul, al lado del supermercado'),
(1, 'Calle 72 #10-34', 'Bogotá', 'Casa blanca con portón negro');
```

## Uso en el Dashboard

El dashboard ahora muestra:

1. **Tarjeta de Mesas**: Muestra todas las mesas con su estado (disponible/ocupada), capacidad y número
2. **Tarjeta de Domicilios**: Muestra todas las direcciones de entrega registradas

Los datos se cargan automáticamente desde Supabase usando Server Components de Next.js.

## Archivos Creados

- `src/types/database.ts` - Tipos TypeScript para las entidades de la base de datos
- `src/services/restaurante.service.ts` - Funciones para consultar datos de Supabase
- `src/components/MesasCard.tsx` - Componente para mostrar las mesas
- `src/components/DomiciliosCard.tsx` - Componente para mostrar los domicilios
- `src/libs/Env.ts` - Actualizado con variables de Supabase

## Solución de Problemas

### Error: "Invalid URL"
- Verifica que `NEXT_PUBLIC_SUPABASE_URL` tenga el formato correcto: `https://tu-proyecto.supabase.co`

### Error: "Invalid API Key"
- Asegúrate de usar la key **anon public**, no la service role key

### No se muestran datos
- Verifica que las tablas existan en Supabase
- Comprueba que tengas datos insertados
- Revisa los logs del servidor para ver errores de Supabase
