#!/bin/bash
set -e

echo "🔨 Iniciando build para Render..."

# Compilar frontend
echo "📦 Compilando frontend..."
cd frontend
npm install
npm run build
cd ..

echo "✓ Frontend compilado exitosamente"
echo "📁 Contenido de frontend/dist:"
ls -la frontend/dist/ | head -10

# Instalar dependencias del backend
echo "📦 Instalando dependencias del backend..."
cd backend
npm install
cd ..

echo "✅ Build completado correctamente"
echo "🚀 Listo para iniciar el servidor"
