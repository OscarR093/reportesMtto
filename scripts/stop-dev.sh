#!/bin/bash

# Script para detener el entorno de desarrollo

echo "🛑 Deteniendo entorno de desarrollo ReportesMtto..."

# Detener contenedores
docker-compose down

# Opción para eliminar volúmenes también
if [ "$1" = "--clean" ]; then
    echo "🗑️  Eliminando volúmenes y datos..."
    docker-compose down -v
    docker volume prune -f
    echo "✅ Volúmenes eliminados"
fi

echo "✅ Entorno de desarrollo detenido"
