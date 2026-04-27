#!/bin/bash
set -e

echo "🔨 Iniciando build para Render..."

# Compilar frontend
echo "📦 Compilando frontend..."
cd mdt-sistema-web/frontend
npm ci
npm run build
echo "✓ Frontend compilado exitosamente"
cd ../..

# Instalar dependencias del backend
echo "📦 Instalando dependencias del backend..."
cd mdt-sistema-web/backend
npm ci
cd ../..

echo "✅ Build completado correctamente"
echo "🚀 Listo para iniciar el servidor"

# Crear script de inicio
cat > start.sh << 'EOF'
#!/bin/bash
cd mdt-sistema-web/backend
npm start
EOF
chmod +x start.sh
