# 🚨 Solución al Error 404 en Rutas API

## Problema
Las rutas API `/api/carrito/crear` y `/api/carrito/agregar-producto` están devolviendo **404 Not Found**.

## Causa
Next.js no está reconociendo las rutas API porque el servidor dev no se reinició correctamente después de los cambios.

---

## ✅ **SOLUCIÓN PASO A PASO**

### **Opción 1: Usar el script de reinicio (MÁS FÁCIL)**

```bash
# En la carpeta del proyecto
cd /home/andrew/Documents/proyectos-ana-gourmet/template-para-mis-saas

# Ejecutar el script de limpieza
./restart-dev.sh

# Esperar 3 segundos

# Iniciar el servidor
npm run dev
```

---

### **Opción 2: Manual (Paso a Paso)**

#### **1. Detener TODOS los procesos de Next.js**

```bash
# Buscar procesos
ps aux | grep "next dev"

# Matar todos los procesos
pkill -9 -f "next dev"

# Verificar que no quedan procesos
ps aux | grep "next dev"  # Debe estar vacío
```

#### **2. Limpiar cachés COMPLETAMENTE**

```bash
cd /home/andrew/Documents/proyectos-ana-gourmet/template-para-mis-saas

# Eliminar caché de Next.js
rm -rf .next

# Eliminar caché de node_modules
rm -rf node_modules/.cache

# Verificar que se eliminaron
ls -la | grep .next  # No debe aparecer
```

#### **3. Limpiar terminal y variables de entorno**

```bash
# Cerrar la terminal actual
exit

# Abrir una nueva terminal

# Navegar al proyecto
cd /home/andrew/Documents/proyectos-ana-gourmet/template-para-mis-saas
```

#### **4. Reiniciar el servidor**

```bash
# Iniciar fresh
npm run dev
```

#### **5. Esperar a que compile COMPLETAMENTE**

Espera hasta ver:
```
✓ Ready in Xs
○ Compiling / ...
✓ Compiled / in Xms
```

#### **6. Forzar recarga del navegador**

- Presiona `Ctrl + Shift + R` (Linux/Windows)
- O `Cmd + Shift + R` (Mac)
- O abre el navegador en modo incógnito

---

## 🔍 **VERIFICACIÓN**

### **1. Verifica que las rutas existen:**

```bash
ls -la src/app/api/carrito/crear/route.ts
ls -la src/app/api/carrito/agregar-producto/route.ts
```

Ambos deben existir.

### **2. Verifica la sintaxis del archivo:**

```bash
head -n 10 src/app/api/carrito/crear/route.ts
```

Debe empezar con:
```typescript
import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { crearCarrito } from '@/services/carrito.service';

export async function POST(request: Request) {
```

### **3. Verifica que el servidor arrancó correctamente:**

En la terminal donde corre `npm run dev`, debe mostrar:
```
✓ Ready in Xs
○ Compiling / ...
✓ Compiled / in Xms
```

### **4. Prueba las rutas directamente:**

Abre una nueva terminal y ejecuta:

```bash
curl -X POST http://localhost:3000/api/carrito/crear \
  -H "Content-Type: application/json" \
  -d '{
    "tipoPedido": {
      "tipo": "mesa",
      "mesaId": 18
    },
    "carritoData": {
      "restauranteId": 17,
      "productos": []
    }
  }'
```

**Respuesta esperada:** JSON (no HTML de error 404)

---

## 🐛 **Si TODAVÍA no funciona**

### **Opción 3: Reinstalar dependencias**

```bash
# Detener servidor
pkill -9 -f "next dev"

# Limpiar TODO
rm -rf .next node_modules/.cache node_modules

# Reinstalar
npm install

# Reiniciar
npm run dev
```

---

## 📊 **Logs Esperados**

Cuando agregues un producto al carrito, deberías ver:

```
📥 [API /carrito/crear] ═══════════════════════════════════
📥 [API /carrito/crear] Recibida petición POST para crear carrito
📋 [API /carrito/crear] Datos recibidos del cliente: {...}
🔨 [API /carrito/crear] Llamando a crearCarrito() service...
🔨 [Service crearCarrito] ═══════════════════════════════════
🔨 [Service crearCarrito] INICIO - Creando carrito completo
...
✅ [Service crearCarrito] Mesa actualizada a OCUPADA exitosamente
🎉 [Service crearCarrito] PROCESO COMPLETADO EXITOSAMENTE
```

**Si ves esto → ✅ TODO FUNCIONA**

**Si ves `404 Not Found` → ❌ El servidor no se reinició correctamente**

---

## 🆘 **Último Recurso**

Si nada funciona:

```bash
# 1. Detener TODO
pkill -9 -f "next"

# 2. Limpiar COMPLETAMENTE
cd /home/andrew/Documents/proyectos-ana-gourmet/template-para-mis-saas
rm -rf .next node_modules/.cache

# 3. Reiniciar el sistema (opcional pero efectivo)
sudo reboot

# 4. Después del reinicio
cd /home/andrew/Documents/proyectos-ana-gourmet/template-para-mis-saas
npm run dev
```

---

## ✅ **Checklist de Verificación**

- [ ] Detuve TODOS los procesos de Next.js (`pkill -f "next dev"`)
- [ ] Eliminé la carpeta `.next` (`rm -rf .next`)
- [ ] Cerré y abrí una nueva terminal
- [ ] Esperé a que Next.js compile COMPLETAMENTE antes de probar
- [ ] Recargué el navegador con `Ctrl + Shift + R`
- [ ] Verifiqué los logs del servidor
- [ ] Las rutas API existen en `src/app/api/carrito/*/route.ts`

---

## 📝 **Notas Importantes**

1. **NO uses `--turbo`** durante el desarrollo si tienes problemas con las rutas API
2. **Cierra TODAS las terminales** donde corrió `npm run dev` antes
3. **Espera a la compilación completa** antes de probar
4. **Usa una ventana de incógnito** si el navegador cachea errores
5. **Verifica los logs del servidor** en la terminal

---

**Última actualización**: 12 de diciembre de 2025

