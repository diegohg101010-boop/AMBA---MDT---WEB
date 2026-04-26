#!/bin/bash
set -e

echo "🔨 Iniciando build para Render..."

# Compilar frontend
echo "📦 Compilando frontend..."
cd mdt-sistema-web/frontend
npm install
npm run build
cd ../..

echo "✓ Frontend compilado exitosamente"
echo "📁 Contenido de mdt-sistema-web/frontend/dist:"
ls -la mdt-sistema-web/frontend/dist/ | head -10

# Instalar dependencias del backend
echo "📦 Instalando dependencias del backend..."
cd mdt-sistema-web/backend
npm install
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
