#!/bin/bash

echo "🛑 Deteniendo todos los procesos de Next.js..."
pkill -f "next dev" 2>/dev/null || echo "No hay procesos Next.js corriendo"
sleep 2

echo "🗑️ Eliminando caché de Next.js..."
rm -rf .next

echo "🗑️ Eliminando node_modules/.cache..."
rm -rf node_modules/.cache

echo "✅ Limpieza completa"
echo ""
echo "🚀 Para iniciar el servidor, ejecuta:"
echo "   npm run dev"
echo ""

