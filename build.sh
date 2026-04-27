#!/bin/bash
set -e

# Force redeploy - v2
echo "🔨 Iniciando build para Render..."

# IMPORTANTE: Forzar NODE_ENV=development para que npm instale devDependencies
export NODE_ENV=development

# Compilar frontend
echo "📦 Compilando frontend..."
cd mdt-sistema-web/frontend
npm ci --include=dev
npm run build
echo "✓ Frontend compilado exitosamente"
cd ../..

# Instalar dependencias del backend
echo "📦 Instalando dependencias del backend..."
cd mdt-sistema-web/backend
npm ci --include=dev
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
