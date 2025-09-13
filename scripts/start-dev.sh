#!/bin/bash

# Script para iniciar el entorno de desarrollo con Docker

echo "🐳 Iniciando entorno de desarrollo ReportesMtto..."

# Verificar que Docker y Docker Compose estén instalados
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Por favor instala Docker primero."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado. Por favor instala Docker Compose primero."
    exit 1
fi

# Detener contenedores existentes si están corriendo
echo "🛑 Deteniendo contenedores existentes..."
docker-compose down

# Eliminar volúmenes si se especifica
if [ "$1" = "--fresh" ]; then
    echo "🗑️  Eliminando volúmenes existentes..."
    docker-compose down -v
    docker volume prune -f
fi

# Crear directorios necesarios
echo "📁 Creando directorios necesarios..."
mkdir -p docker/postgres
mkdir -p docker/logs

# Iniciar servicios
echo "🚀 Iniciando servicios..."
docker-compose up -d

# Esperar a que los servicios estén listos
echo "⏳ Esperando a que los servicios estén listos..."
sleep 10

# Verificar estado de los servicios
echo "🔍 Verificando estado de los servicios..."

# PostgreSQL
if docker-compose exec -T postgres pg_isready -U reportes_user -d reportes_mtto &> /dev/null; then
    echo "✅ PostgreSQL está listo"
else
    echo "❌ PostgreSQL no está listo"
fi

# MinIO
if curl -f http://localhost:9000/minio/health/live &> /dev/null; then
    echo "✅ MinIO está listo"
else
    echo "❌ MinIO no está listo"
fi

# Redis
if docker-compose exec -T redis redis-cli --raw incr ping &> /dev/null; then
    echo "✅ Redis está listo"
else
    echo "❌ Redis no está listo"
fi

echo ""
echo "🎉 Entorno de desarrollo iniciado exitosamente!"
echo ""
echo "📊 Servicios disponibles:"
echo "   • PostgreSQL: localhost:5432"
echo "   • MinIO API: http://localhost:9000"
echo "   • MinIO Console: http://localhost:9001 (admin: minioadmin / minioadmin123)"
echo "   • pgAdmin: http://localhost:5050 (admin@reportes.local / admin123)"
echo "   • Redis: localhost:6379"
echo ""
echo "🚀 Para iniciar la aplicación Node.js:"
echo "   npm run dev"
echo ""
echo "🛑 Para detener todos los servicios:"
echo "   ./scripts/stop-dev.sh"
