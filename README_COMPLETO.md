# Sistema de Reportes de Mantenimiento

Un sistema completo para la gestión de reportes de mantenimiento industrial con interfaz intuitiva, autenticación OAuth, selección cascada de equipos y funcionalidades de voz a texto.

## 🚀 Características Principales

### ✅ Sistema de Usuarios
- **Autenticación OAuth con Google** - Login seguro y fácil
- **3 niveles de usuario**: Super Administrador, Administrador, Técnico
- **Gestión de permisos** - Control granular de acceso
- **Aprobación de usuarios** - Los admins aprueban nuevos técnicos
- **Perfiles personalizables** - Información de empleado y departamento

### ✅ Gestión de Reportes
- **Creación intuitiva** - Formulario wizard paso a paso
- **Selección en cascada** - Equipos organizados jerárquicamente
- **Prioridades automáticas** - Área de fusión = prioridad alta por defecto
- **Estados del reporte**: Abierto → En Proceso → Resuelto → Cerrado
- **Múltiples evidencias** - Hasta 3 imágenes por reporte
- **Voz a texto** - Dictado para descripción y comentarios

### ✅ Funcionalidades Avanzadas
- **Filtros inteligentes** - Por estado, prioridad, área, técnico
- **Búsqueda en tiempo real** - Encuentra reportes rápidamente
- **Modal de detalles** - Vista completa del reporte
- **Paginación** - Navegación eficiente
- **Gestión de archivos** - MinIO para almacenamiento de imágenes
- **Base de datos** - PostgreSQL con Redis para cache

## 🏗️ Arquitectura del Sistema

### Backend (Node.js + Express)
```
src/
├── config/          # Configuración DB, OAuth, MinIO
├── controllers/     # Lógica de controladores
├── models/          # Modelos Sequelize (User, Report)
├── services/        # Lógica de negocio
├── middleware/      # Autenticación y manejo de errores
├── routes/          # Rutas API REST
└── data/           # equipment.json - estructura de equipos
```

### Frontend (React + Vite)
```
src/
├── components/     # Layout, UserAvatar, etc.
├── pages/         # CreateReport, Reports, Dashboard
├── hooks/         # useAuth hook personalizado
└── assets/        # Recursos estáticos
```

## 📋 Reglas de Negocio Implementadas

### Permisos por Rol
- **Técnicos**: Pueden crear, ver y editar sus propios reportes (solo si están abiertos)
- **Administradores**: Pueden ver todos los reportes, cambiar estados, asignar técnicos
- **Super Administradores**: Control total + gestión de usuarios y eliminación

### Flujo de Estados
1. **Abierto** - Recién creado, editable por el técnico
2. **En Proceso** - Asignado y siendo trabajado
3. **Resuelto** - Completado, esperando validación
4. **Cerrado** - Finalizado e inmutable
5. **Cancelado** - Descartado (solo admins)

### Prioridades
- **Baja**: Mantenimiento rutinario
- **Media**: Problemas normales (default)
- **Alta**: Urgente o área de fusión (auto-asignada)
- **Crítica**: Emergencias críticas

## 🛠️ Instalación y Configuración

### Prerrequisitos
- Node.js 18+
- PostgreSQL 12+
- Redis (opcional pero recomendado)
- MinIO Server (para almacenamiento de archivos)
- Cuenta de Google Cloud (para OAuth)

### 1. Configuración de Google OAuth

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la Google+ API
4. Crea credenciales OAuth 2.0:
   - **Authorized redirect URIs**: `http://localhost:3000/api/auth/google/callback`
   - **Authorized JavaScript origins**: `http://localhost:3001`

### 2. Configuración de Base de Datos

```sql
-- Crear base de datos
CREATE DATABASE reportes_mtto;
CREATE USER reportes_user WITH PASSWORD 'tu_password_segura';
GRANT ALL PRIVILEGES ON DATABASE reportes_mtto TO reportes_user;
```

### 3. Configuración de MinIO

```bash
# Instalar MinIO
wget https://dl.min.io/server/minio/release/linux-amd64/minio
chmod +x minio
sudo mv minio /usr/local/bin

# Ejecutar MinIO
export MINIO_ROOT_USER=minioadmin
export MINIO_ROOT_PASSWORD=minioadmin123
minio server /data
```

### 4. Instalación del Proyecto

```bash
# Clonar el repositorio
git clone <tu-repositorio>
cd reportesMtto

# Instalar dependencias backend
npm install

# Instalar dependencias frontend
cd frontend
npm install
cd ..
```

### 5. Configuración de Variables de Entorno

Crea un archivo `.env` en la raíz:

```env
# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=reportes_mtto
DB_USER=reportes_user
DB_PASSWORD=tu_password_segura

# Redis (opcional)
REDIS_HOST=localhost
REDIS_PORT=6379

# MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123

# OAuth Google
GOOGLE_CLIENT_ID=tu_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu_client_secret

# JWT y Session
JWT_SECRET=tu_jwt_secret_muy_seguro
SESSION_SECRET=tu_session_secret_muy_seguro

# Super Admin
SUPER_ADMIN_EMAIL=admin@tuempresa.com

# URLs
BACKEND_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3001
```

### 6. Migración de Base de Datos

```bash
# Ejecutar el script de migración
psql -U reportes_user -d reportes_mtto -f migration_reports_multiple_evidence.sql
```

### 7. Ejecutar el Sistema

```bash
# Terminal 1: Backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

## 📖 Guía de Uso

### Para Técnicos

1. **Login**: Usar cuenta de Google empresarial
2. **Completar perfil**: Información de empleado
3. **Crear reporte**:
   - Título descriptivo
   - Seleccionar equipo (cascada: área → máquina → elemento)
   - Describir falla (usar 🎤 para voz a texto)
   - Subir hasta 3 fotos de evidencia
   - Agregar comentarios adicionales
4. **Seguimiento**: Ver estado y comentarios de administradores

### Para Administradores

1. **Gestión de usuarios**: Aprobar/rechazar nuevos técnicos
2. **Supervisión de reportes**:
   - Ver todos los reportes
   - Cambiar estados (En Proceso → Resuelto → Cerrado)
   - Asignar técnicos a reportes
   - Agregar comentarios de supervisión
3. **Análisis**: Dashboard con estadísticas y reportes críticos

### Para Super Administradores

- Todo lo anterior +
- Eliminar reportes
- Gestionar roles de usuario
- Configuración del sistema

## 🔧 API Endpoints

### Autenticación
```
GET  /api/auth/google              # Iniciar OAuth
GET  /api/auth/google/callback     # Callback OAuth
POST /api/auth/verify              # Verificar token
POST /api/auth/logout              # Cerrar sesión
```

### Reportes
```
GET    /api/reports                # Listar reportes (con filtros)
POST   /api/reports                # Crear reporte
GET    /api/reports/:id            # Obtener reporte específico
PUT    /api/reports/:id            # Actualizar reporte
DELETE /api/reports/:id            # Eliminar reporte (super admin)
PATCH  /api/reports/:id/status     # Cambiar estado
PATCH  /api/reports/:id/assign     # Asignar técnico
```

### Usuarios
```
GET   /api/users/pending           # Usuarios pendientes
GET   /api/users/active            # Usuarios activos
POST  /api/users/:id/approve       # Aprobar usuario
POST  /api/users/:id/reject        # Rechazar usuario
PATCH /api/users/:id/role          # Cambiar rol
```

### Equipos
```
GET /api/equipment/hierarchy       # Estructura completa
GET /api/equipment/areas           # Listar áreas
GET /api/equipment/:area/machines  # Máquinas por área
```

### Archivos
```
POST /api/files/evidence           # Subir evidencia
POST /api/files/evidence/multiple  # Subir múltiples evidencias
GET  /api/files/:bucket/:file/download # Descargar archivo
```

## 📊 Estructura de Datos

### equipment.json
```json
{
  "fusion": {
    "hornos": ["horno 1", "horno 2", "horno 3"],
    "torre": {}
  },
  "moldeo": {
    "linea1": {
      "robots": [100, 200, 400],
      "troquel": {},
      "sierraCinta": {}
    }
  },
  "mecanizado": {
    "sw": [514, 433, 604],
    "ensamble1": {
      "prensa1": {},
      "prensa2": {}
    }
  }
}
```

### Modelo de Reporte
```javascript
{
  id: UUID,
  user_id: UUID,                    // Técnico creador
  technician_name: String,          // Nombre del técnico
  equipment_area: String,           // Área seleccionada
  equipment_machine: String,        // Máquina (opcional)
  equipment_element: String,        // Elemento (opcional)
  issue_type: Enum,                // Tipo de mantenimiento
  priority: Enum,                  // Prioridad (auto-alta en fusión)
  status: Enum,                    // Estado actual
  title: String,                   // Título del reporte
  description: Text,               // Descripción de la falla
  evidence_images: JSON,           // Array de URLs de imágenes
  evidence_filenames: JSON,        // Array de nombres originales
  notes: Text,                     // Comentarios adicionales
  created_at: DateTime,
  updated_at: DateTime
}
```

## 🎛️ Personalización

### Agregar Nuevos Equipos
Edita `src/data/equipment.json`:
```json
{
  "nueva_area": {
    "nueva_maquina": {
      "elemento1": {},
      "elemento2": ["componente1", "componente2"]
    }
  }
}
```

### Modificar Prioridades
En `src/services/reportService.js`:
```javascript
determinePriority(specifiedPriority, equipmentArea) {
  // Agregar lógica personalizada
  if (equipmentArea === 'tu_area_critica') {
    return 'critica';
  }
  return specifiedPriority || 'media';
}
```

### Personalizar Estados
En `src/models/Report.js`:
```javascript
status: {
  type: DataTypes.ENUM('abierto', 'en_proceso', 'resuelto', 'cerrado', 'tu_estado_personalizado'),
  allowNull: false,
  defaultValue: 'abierto'
}
```

## 🐛 Solución de Problemas

### Error: "Puerto en uso"
```bash
# Matar proceso en puerto 3000
sudo lsof -t -i:3000 | xargs kill -9
```

### Error de base de datos
```bash
# Verificar conexión PostgreSQL
psql -U reportes_user -d reportes_mtto -c "SELECT version();"
```

### Error de MinIO
```bash
# Verificar estado de MinIO
curl http://localhost:9000/minio/health/live
```

### Problemas de OAuth
1. Verificar que las URLs de callback estén correctas en Google Console
2. Confirmar que `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` estén correctos
3. Verificar que el dominio esté autorizado

## 📈 Próximas Funcionalidades

- [ ] **Reportes PDF**: Generación automática de reportes
- [ ] **Notificaciones**: Email/SMS para reportes críticos
- [ ] **Dashboard avanzado**: Gráficos y métricas
- [ ] **App móvil**: React Native para técnicos en campo
- [ ] **Integración ERP**: Conexión con sistemas existentes
- [ ] **Historial de mantenimiento**: Tracking por equipo
- [ ] **Predicción de fallas**: ML para mantenimiento predictivo
- [ ] **Chat en tiempo real**: Comunicación entre técnicos y supervisores

## 🤝 Contribuciones

1. Fork el proyecto
2. Crea una branch feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la branch (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🙋‍♂️ Soporte

¿Necesitas ayuda? 

- 📧 Email: soporte@tuempresa.com
- 💬 Slack: #reportes-mtto
- 📞 Teléfono: +52 xxx xxx xxxx

---

**Desarrollado con ❤️ para automatizar y optimizar el mantenimiento industrial**
