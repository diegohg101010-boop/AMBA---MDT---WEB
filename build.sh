#!/bin/bash
set -e

echo "🔨 Iniciando build para Render..."

# Limpiar caché global de npm
npm cache clean --force 2>/dev/null || true
rm -rf ~/.npm 2>/dev/null || true

# Compilar frontend
echo "📦 Compilando frontend..."
cd mdt-sistema-web/frontend
rm -rf node_modules package-lock.json 2>/dev/null || true
npm install
npm run build
echo "✓ Frontend compilado exitosamente"
cd ../..

# Instalar dependencias del backend
echo "📦 Instalando dependencias del backend..."
cd mdt-sistema-web/backend
rm -rf node_modules package-lock.json 2>/dev/null || true
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
