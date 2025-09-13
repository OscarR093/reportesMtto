# 🐳 Entorno de Desarrollo con Docker

Este proyecto incluye un entorno de desarrollo completo con Docker Compose que incluye:

- **PostgreSQL 15**: Base de datos principal
- **MinIO**: Object Storage para archivos (evidencias, avatars, documentos)
- **Redis**: Cache y gestión de sesiones
- **pgAdmin**: Interfaz web para PostgreSQL

## 🚀 Inicio Rápido

### Prerrequisitos

- Docker
- Docker Compose
- Node.js 18+ (para la aplicación)

### Comandos Principales

```bash
# Configuración inicial (instala dependencias e inicia Docker)
npm run setup

# Iniciar entorno de desarrollo
npm run docker:start

# Iniciar con datos limpios (elimina volúmenes existentes)
npm run docker:fresh

# Ver logs de los contenedores
npm run docker:logs

# Ver estado de los contenedores
npm run docker:ps

# Detener entorno
npm run docker:stop

# Detener y limpiar volúmenes
npm run docker:clean
```

### Iniciar la aplicación Node.js

```bash
# Una vez que Docker esté corriendo
npm run dev
```

## 🔗 Servicios y Puertos

| Servicio | Puerto | Credenciales | URL |
|----------|--------|--------------|-----|
| **PostgreSQL** | 5432 | `reportes_user` / `reportes_password_2024` | `localhost:5432` |
| **pgAdmin** | 5050 | `admin@reportes.local` / `admin123` | http://localhost:5050 |
| **MinIO API** | 9000 | `minioadmin` / `minioadmin123` | http://localhost:9000 |
| **MinIO Console** | 9001 | `minioadmin` / `minioadmin123` | http://localhost:9001 |
| **Redis** | 6379 | Password: `redis_password_2024` | `localhost:6379` |
| **API Node.js** | 3000 | - | http://localhost:3000 |

## 🗂️ Configuración de MinIO

### Buckets Creados Automáticamente

- **evidencias**: Para fotografías de evidencia de reportes (público de lectura)
- **avatars**: Para avatares de usuarios (privado)
- **documents**: Para documentos generales (privado)

### URLs de Acceso

- **API MinIO**: http://localhost:9000
- **Consola Web**: http://localhost:9001

### Credenciales por Defecto

- **Access Key**: `minioadmin`
- **Secret Key**: `minioadmin123`

## 🐘 Configuración de PostgreSQL

### Conexión

```
Host: localhost
Port: 5432
Database: reportes_mtto
Username: reportes_user
Password: reportes_password_2024
```

### pgAdmin

Accede a http://localhost:5050 con:
- **Email**: admin@reportes.local
- **Password**: admin123

Para conectar a la base de datos desde pgAdmin:
1. Crear nueva conexión
2. Host: `postgres` (nombre del contenedor)
3. Port: `5432`
4. Database: `reportes_mtto`
5. Username: `reportes_user`
6. Password: `reportes_password_2024`

## 🔄 Redis

### Conexión

```
Host: localhost
Port: 6379
Password: redis_password_2024
Database: 0
```

## 📁 Volúmenes Docker

Los datos se persisten en volúmenes Docker:

- `postgres_data`: Datos de PostgreSQL
- `minio_data`: Archivos de MinIO
- `redis_data`: Datos de Redis
- `pgadmin_data`: Configuración de pgAdmin

## 🔧 Troubleshooting

### Problema: Puerto ya en uso

```bash
# Ver qué proceso usa un puerto
sudo lsof -i :5432
sudo lsof -i :9000

# Detener contenedores conflictivos
docker stop $(docker ps -q)
```

### Problema: Volúmenes corruptos

```bash
# Limpiar completamente
npm run docker:clean
npm run docker:fresh
```

### Problema: Permisos de archivos

```bash
# Dar permisos a scripts
chmod +x scripts/*.sh
```

### Verificar estado de servicios

```bash
# Ver logs de un servicio específico
docker-compose logs postgres
docker-compose logs minio
docker-compose logs redis

# Ejecutar comando en contenedor
docker-compose exec postgres psql -U reportes_user -d reportes_mtto
docker-compose exec redis redis-cli
```

## 🔒 Seguridad

⚠️ **Importante**: Las credenciales incluidas son para desarrollo únicamente. 

Para producción:
1. Cambiar todas las contraseñas
2. Usar variables de entorno seguras
3. Configurar SSL/TLS
4. Restringir acceso de red

## 📊 Monitoring

### Verificar salud de servicios

```bash
# PostgreSQL
docker-compose exec postgres pg_isready -U reportes_user -d reportes_mtto

# MinIO
curl -f http://localhost:9000/minio/health/live

# Redis
docker-compose exec redis redis-cli ping
```
