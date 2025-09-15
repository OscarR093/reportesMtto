#!/bin/bash

# Script de desarrollo para Sistema de Reportes de Mantenimiento
# Autor: GitHub Copilot
# Fecha: $(date)

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Banner
echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║              Sistema de Reportes de Mantenimiento           ║"
echo "║                    Script de Desarrollo                     ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Verificar Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js no está instalado. Por favor instala Node.js 18+ primero."
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version $NODE_VERSION detectada. Se requiere Node.js 18 o superior."
    exit 1
fi

print_success "Node.js $(node --version) detectado"

# Verificar si estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    print_error "No se encontró package.json. Asegúrate de estar en el directorio raíz del proyecto."
    exit 1
fi

# Función para verificar servicios
check_postgres() {
    print_status "Verificando PostgreSQL..."
    if command -v psql &> /dev/null; then
        if pg_isready &> /dev/null; then
            print_success "PostgreSQL está ejecutándose"
            return 0
        else
            print_warning "PostgreSQL está instalado pero no está ejecutándose"
            return 1
        fi
    else
        print_warning "PostgreSQL no está instalado"
        return 1
    fi
}

check_redis() {
    print_status "Verificando Redis..."
    if command -v redis-cli &> /dev/null; then
        if redis-cli ping &> /dev/null; then
            print_success "Redis está ejecutándose"
            return 0
        else
            print_warning "Redis está instalado pero no está ejecutándose"
            return 1
        fi
    else
        print_warning "Redis no está instalado (opcional)"
        return 1
    fi
}

check_minio() {
    print_status "Verificando MinIO..."
    if curl -s http://localhost:9000/minio/health/live &> /dev/null; then
        print_success "MinIO está ejecutándose"
        return 0
    else
        print_warning "MinIO no está ejecutándose en localhost:9000"
        return 1
    fi
}

# Función para instalar dependencias
install_dependencies() {
    print_status "Instalando dependencias del backend..."
    npm install
    
    print_status "Instalando dependencias del frontend..."
    cd frontend
    npm install
    cd ..
    
    print_success "Dependencias instaladas correctamente"
}

# Función para verificar archivo .env
check_env() {
    print_status "Verificando configuración..."
    
    if [ ! -f ".env" ]; then
        print_warning "Archivo .env no encontrado. Creando archivo de ejemplo..."
        cat > .env << EOF
# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=reportes_mtto
DB_USER=reportes_user
DB_PASSWORD=password_segura

# Redis (opcional)
REDIS_HOST=localhost
REDIS_PORT=6379

# MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123

# OAuth Google (CONFIGURAR CON TUS CREDENCIALES)
GOOGLE_CLIENT_ID=tu_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu_client_secret

# JWT y Session
JWT_SECRET=$(openssl rand -base64 32)
SESSION_SECRET=$(openssl rand -base64 32)

# Super Admin
SUPER_ADMIN_EMAIL=admin@tuempresa.com

# URLs
BACKEND_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3001
EOF
        print_warning "Archivo .env creado. ¡IMPORTANTE: Configura tus credenciales de Google OAuth!"
        return 1
    else
        print_success "Archivo .env encontrado"
        return 0
    fi
}

# Función para crear base de datos
setup_database() {
    if check_postgres; then
        print_status "Configurando base de datos..."
        
        # Verificar si la base de datos existe
        if psql -lqt | cut -d \| -f 1 | grep -qw "reportes_mtto"; then
            print_success "Base de datos 'reportes_mtto' ya existe"
        else
            print_status "Creando base de datos..."
            createdb reportes_mtto 2>/dev/null || print_warning "No se pudo crear la base de datos automáticamente"
        fi
        
        # Ejecutar migración si existe
        if [ -f "migration_reports_multiple_evidence.sql" ]; then
            print_status "Ejecutando migración..."
            psql -d reportes_mtto -f migration_reports_multiple_evidence.sql &> /dev/null || print_warning "Migración ya aplicada"
        fi
    else
        print_error "PostgreSQL no está disponible. Por favor inicia PostgreSQL primero."
    fi
}

# Función para iniciar servicios en desarrollo
start_dev() {
    print_status "Iniciando sistema en modo desarrollo..."
    
    # Verificar que los puertos estén libres
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null; then
        print_warning "Puerto 3000 está en uso. Deteniendo proceso..."
        kill $(lsof -t -i:3000) 2>/dev/null || true
        sleep 2
    fi
    
    if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null; then
        print_warning "Puerto 3001 está en uso. Deteniendo proceso..."
        kill $(lsof -t -i:3001) 2>/dev/null || true
        sleep 2
    fi
    
    print_success "Iniciando backend en puerto 3000..."
    print_success "Iniciando frontend en puerto 3001..."
    print_success "Sistema listo en http://localhost:3001"
    
    # Usar tmux si está disponible, sino usar trap para cleanup
    if command -v tmux &> /dev/null; then
        tmux new-session -d -s reportes-mtto \; \
            send-keys 'npm run dev' Enter \; \
            split-window -h \; \
            send-keys 'cd frontend && npm run dev' Enter \; \
            select-pane -t 0
        
        print_success "Sesión tmux 'reportes-mtto' creada"
        print_status "Para ver los logs: tmux attach -t reportes-mtto"
        print_status "Para detener: tmux kill-session -t reportes-mtto"
    else
        # Trap para cleanup
        trap 'echo "Deteniendo servicios..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit' INT TERM EXIT
        
        # Iniciar backend
        npm run dev &
        BACKEND_PID=$!
        
        # Esperar un poco y iniciar frontend
        sleep 5
        cd frontend
        npm run dev &
        FRONTEND_PID=$!
        cd ..
        
        # Esperar a que terminen
        wait
    fi
}

# Función para mostrar ayuda
show_help() {
    echo "Uso: $0 [opción]"
    echo ""
    echo "Opciones:"
    echo "  setup     - Configurar proyecto completo (instalar deps, crear BD, etc.)"
    echo "  install   - Solo instalar dependencias"
    echo "  check     - Verificar servicios requeridos"
    echo "  start     - Iniciar en modo desarrollo"
    echo "  stop      - Detener servicios"
    echo "  reset     - Limpiar cache y reinstalar"
    echo "  help      - Mostrar esta ayuda"
    echo ""
}

# Función para detener servicios
stop_services() {
    print_status "Deteniendo servicios..."
    
    # Detener tmux session si existe
    if command -v tmux &> /dev/null && tmux has-session -t reportes-mtto 2>/dev/null; then
        tmux kill-session -t reportes-mtto
        print_success "Sesión tmux detenida"
    fi
    
    # Matar procesos en puertos
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null; then
        kill $(lsof -t -i:3000) 2>/dev/null
        print_success "Proceso en puerto 3000 detenido"
    fi
    
    if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null; then
        kill $(lsof -t -i:3001) 2>/dev/null
        print_success "Proceso en puerto 3001 detenido"
    fi
}

# Función para reset completo
reset_project() {
    print_status "Reseteando proyecto..."
    
    stop_services
    
    print_status "Limpiando cache..."
    rm -rf node_modules/.cache
    rm -rf frontend/node_modules/.vite
    rm -rf frontend/dist
    
    print_status "Reinstalando dependencias..."
    npm install
    cd frontend && npm install && cd ..
    
    print_success "Proyecto reseteado"
}

# Función principal de setup
setup_project() {
    print_status "Configurando proyecto completo..."
    
    # Instalar dependencias
    install_dependencies
    
    # Verificar .env
    if ! check_env; then
        print_error "Por favor configura el archivo .env antes de continuar"
        return 1
    fi
    
    # Configurar base de datos
    setup_database
    
    # Verificar servicios
    print_status "Verificando servicios..."
    check_postgres
    check_redis
    check_minio
    
    print_success "Setup completado!"
    print_status "Ejecuta '$0 start' para iniciar el sistema"
}

# Main
case "${1:-help}" in
    "setup")
        setup_project
        ;;
    "install")
        install_dependencies
        ;;
    "check")
        check_postgres
        check_redis
        check_minio
        ;;
    "start")
        start_dev
        ;;
    "stop")
        stop_services
        ;;
    "reset")
        reset_project
        ;;
    "help"|*)
        show_help
        ;;
esac
