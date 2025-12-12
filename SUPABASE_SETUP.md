# Configuración de Supabase para Ana Gourmet

## 🚀 Guía Rápida de Configuración

### Paso 1: Obtener las Credenciales de Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Si no tienes un proyecto, crea uno nuevo
3. Navega a **Settings** > **API**
4. Copia los siguientes valores:
   - **Project URL** (algo como: `https://xxxxx.supabase.co`)
   - **anon public** key (una llave larga que empieza con `eyJ...`)

### Paso 2: Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto con:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGc...tu-anon-key-aqui
```

⚠️ **IMPORTANTE**: Después de crear/modificar `.env.local`, **DEBES REINICIAR** el servidor de desarrollo:

```bash
# Detén el servidor (Ctrl+C) y ejecuta:
npm run dev
```

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

### Paso 3: Crear las Tablas en Supabase

1. En tu proyecto de Supabase, ve a **SQL Editor** (en el menú lateral izquierdo)
2. Haz clic en **New query**
3. Copia y pega el siguiente script SQL:
4. Haz clic en **Run** para ejecutarlo

## 📝 Scripts SQL para Crear las Tablas

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

### Paso 4: Insertar Datos de Prueba

Después de crear las tablas, inserta datos de prueba. En el **SQL Editor**, ejecuta:

```sql
-- 1. Insertar restaurantes
INSERT INTO restaurante (nombre, direccion, telefono) VALUES
('Ana Gourmet Centro', 'Calle Principal 123, Centro', '555-1234'),
('Ana Gourmet Norte', 'Av. Norte 456, Zona Norte', '555-5678'),
('Ana Gourmet Sur', 'Boulevard Sur 789, Zona Sur', '555-9012');

-- 2. Insertar un cliente de prueba
INSERT INTO cliente (nombre, email, telefono) VALUES
('Juan Pérez', 'juan@example.com', '555-5678'),
('María García', 'maria@example.com', '555-8765');

-- 3. Insertar mesas para el restaurante Centro (id=1)
INSERT INTO mesa (restaurante_id, numero_mesa, capacidad, estado) VALUES
(1, 1, 4, 'disponible'),
(1, 2, 2, 'disponible'),
(1, 3, 6, 'ocupada'),
(1, 4, 4, 'disponible'),
(1, 5, 8, 'disponible');

-- 4. Insertar mesas para el restaurante Norte (id=2)
INSERT INTO mesa (restaurante_id, numero_mesa, capacidad, estado) VALUES
(2, 1, 4, 'disponible'),
(2, 2, 6, 'ocupada'),
(2, 3, 4, 'disponible');

-- 5. Insertar domicilios
INSERT INTO domicilio (cliente_id, direccion, ciudad, referencia) VALUES
(1, 'Av. Libertador 456, Apt 3B', 'Caracas', 'Edificio azul, al lado del supermercado'),
(1, 'Calle 72 #10-34', 'Bogotá', 'Casa blanca con portón negro'),
(2, 'Carrera 15 #85-20', 'Bogotá', 'Torre residencial, Apto 502');
```

### Paso 5: Verificar la Configuración

1. Reinicia tu servidor de desarrollo (si aún no lo has hecho)
2. Ve a: **http://localhost:3000/dashboard/test-supabase**
3. Esta página te mostrará:
   - ✅ Estado de las variables de entorno
   - ✅ Conexión a Supabase
   - ✅ Restaurantes en la base de datos

Si todo está bien configurado, deberías ver los 3 restaurantes listados.

### Paso 6: Usar el Dashboard

Una vez verificado que todo funciona, ve al dashboard principal:
- **http://localhost:3000/dashboard**

Deberías ver:
- Selector de restaurantes en el sidebar (arriba)
- Tarjetas con mesas y domicilios

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

## 🔧 Solución de Problemas

### 1. No se muestran restaurantes en el sidebar

**Posibles causas:**

✅ **Verifica las variables de entorno:**
```bash
# En la terminal, ejecuta:
cat .env.local

# Deberías ver:
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGc...
```

✅ **¿Reiniciaste el servidor después de crear .env.local?**
```bash
# Ctrl+C para detener, luego:
npm run dev
```

✅ **Verifica la página de diagnóstico:**
- Ve a: http://localhost:3000/dashboard/test-supabase
- Revisa qué error específico muestra

### 2. Error: "Invalid URL" o "URL must be a valid URL"

**Solución:**
- Asegúrate que la URL empiece con `https://` y termine con `.supabase.co`
- Ejemplo correcto: `https://abcdefghijk.supabase.co`
- No incluyas `/` al final

### 3. Error: "Invalid API Key" o "401 Unauthorized"

**Solución:**
- Verifica que uses la key **anon public** (no la service_role)
- La key debería empezar con `eyJhbGc...`
- Cópiala exactamente como aparece en Supabase (sin espacios)

### 4. Error: "relation 'restaurante' does not exist"

**Solución:**
- Las tablas no han sido creadas en Supabase
- Ve al SQL Editor de Supabase
- Ejecuta el script SQL completo del paso 3

### 5. Restaurantes aparecen vacíos pero sin error

**Solución:**
- Las tablas existen pero no tienen datos
- Ejecuta los scripts de INSERT del paso 4
- Verifica en Supabase: **Table Editor** > **restaurante**

### 6. Error: "Cannot connect to Supabase"

**Solución:**
- Verifica tu conexión a internet
- Comprueba que el proyecto de Supabase esté activo
- Intenta acceder a tu dashboard de Supabase en el navegador

### 7. Los cambios en .env.local no se reflejan

**Solución:**
- Las variables de entorno se cargan al inicio
- **SIEMPRE reinicia el servidor** después de modificar `.env.local`
- Si usas Docker, también reinicia los contenedores
