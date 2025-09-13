# ReportesMtto - Backend API

Backend modular para sistema de reportes de mantenimiento con autenticación OAuth, gestión de usuarios y roles.

## 🚀 Características

- ✅ **Autenticación OAuth con Google** usando Passport.js
- ✅ **Gestión completa de usuarios** con roles y permisos
- ✅ **Sistema de aprobación** para nuevos usuarios
- ✅ **Base de datos PostgreSQL** con Sequelize ORM
- ✅ **JWT tokens** seguros con manejo de sesiones
- ✅ **API REST** preparada para frontend React
- ✅ **ES6 Modules** y sintaxis moderna
- ✅ **Middleware de autorización** granular
- ✅ **Manejo de errores** robusto

## 🏗️ Arquitectura del Sistema

### **Roles de Usuario:**
- **Super Admin** - Acceso completo: gestión de usuarios y otorgamiento de roles de admin
- **Admin** - Gestión de usuarios: aprobar/rechazar solicitudes y desactivar usuarios
- **User** - Usuario técnico: acceso a funcionalidades básicas

### **Flujo de Registro:**
1. Usuario inicia sesión con Google OAuth
2. Si es la primera vez → se crea en estado `pending`
3. Administrador aprueba/rechaza la solicitud
4. Usuario aprobado obtiene acceso al sistema

## 📊 Estructura de Base de Datos

### **Tabla Users:**
```sql
- id (UUID, PK)
- google_id (String, unique)
- email (String, unique)
- name (String)
- display_name (String)
- photo (Text)
- status (ENUM: pending, active, inactive, rejected)
- role (ENUM: user, admin, super_admin)
- employee_id (String)
- department (String)
- position (String)
- phone (String)
- hire_date (Date)
- last_login (Date)
- approved_by (UUID, FK)
- approved_at (Date)
- rejected_by (UUID, FK)
- rejected_at (Date)
- rejection_reason (Text)
- notes (Text)
```

## 🛠️ Instalación y Configuración

### **1. Instalar dependencias**
```bash
npm install
```

### **2. Configurar PostgreSQL**
```bash
# Instalar PostgreSQL (Ubuntu/Debian)
sudo apt update
sudo apt install postgresql postgresql-contrib

# Crear base de datos
sudo -u postgres psql
CREATE DATABASE reportes_mtto;
CREATE USER reportes_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE reportes_mtto TO reportes_user;
\q
```

### **3. Configurar variables de entorno**
Edita el archivo `.env`:
```env
# OAuth Google
GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret

# JWT y Sesión
JWT_SECRET=tu_jwt_secret_muy_seguro
SESSION_SECRET=tu_session_secret_muy_seguro

# Base de datos PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=reportes_mtto
DB_USERNAME=reportes_user
DB_PASSWORD=your_password

# Super Administrador
SUPER_ADMIN_EMAIL=tu_email@gmail.com

# Servidor
PORT=3000
```

### **4. Iniciar el servidor**
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## 📡 Endpoints de la API

### **Autenticación**
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/auth/google` | Iniciar OAuth con Google |
| `GET` | `/api/auth/google/callback` | Callback de OAuth |
| `POST` | `/api/auth/verify` | Verificar token JWT |
| `POST` | `/api/auth/logout` | Cerrar sesión |
| `GET` | `/api/auth/status` | Estado de autenticación |
| `GET` | `/api/auth/profile` | Perfil del usuario autenticado |

### **Gestión de Usuarios**
| Método | Endpoint | Descripción | Permisos |
|--------|----------|-------------|----------|
| `GET` | `/api/users/pending` | Usuarios pendientes | Admin+ |
| `GET` | `/api/users/active` | Usuarios activos | Admin+ |
| `GET` | `/api/users/stats` | Estadísticas de usuarios | Admin+ |
| `POST` | `/api/users/:userId/approve` | Aprobar usuario | Admin+ |
| `POST` | `/api/users/:userId/reject` | Rechazar usuario | Admin+ |
| `PATCH` | `/api/users/:userId/role` | Cambiar rol | Super Admin |
| `PATCH` | `/api/users/:userId/deactivate` | Desactivar usuario | Admin+ |
| `POST` | `/api/users/complete-registration` | Completar registro | Usuario |
| `PATCH` | `/api/users/profile` | Actualizar perfil | Usuario |

## 🔒 Sistema de Permisos

### **Verificación de Acceso:**
```javascript
// En el OAuth callback
const accessCheck = userService.checkUserAccess(user);

if (!accessCheck.hasAccess) {
  // Usuario sin acceso (pending, rejected, inactive)
  return errorResponse(accessCheck.message);
}
```

### **Middleware de Autorización:**
```javascript
// Requiere autenticación
app.get('/api/protected', authenticateToken, handler);

// Verificación de roles en controladores
if (!req.user.canManageUsers()) {
  return res.status(403).json({ message: 'No autorizado' });
}
```

## 🎯 Ejemplos de Uso

### **Estructura de Respuesta Estándar:**
```json
{
  "success": true,
  "message": "Descripción del resultado",
  "data": {
    // Datos específicos de la respuesta
  }
}
```

### **Login exitoso (Super Admin):**
```json
{
  "success": true,
  "message": "Superadministrador registrado y autenticado",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid-123",
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "super_admin",
      "status": "active",
      "permissions": {
        "canManageUsers": true,
        "canGrantAdminRights": true
      }
    },
    "isNewUser": true,
    "isSuperAdmin": true,
    "expiresIn": "24h"
  }
}
```

### **Usuario pendiente:**
```json
{
  "success": false,
  "message": "Acceso pendiente de aprobación",
  "data": {
    "reason": "access_pending",
    "requiresApproval": true,
    "user": {
      "id": "uuid-456",
      "name": "Pending User",
      "email": "user@example.com",
      "status": "pending"
    }
  }
}
```

## 🔧 Scripts Disponibles

```bash
npm start       # Iniciar servidor en producción
npm run dev     # Iniciar servidor en desarrollo con nodemon
npm test        # Ejecutar tests (pendiente implementación)
```

## 🚀 Próximos Pasos

1. **Instalar y configurar PostgreSQL**
2. **Probar flujo completo de usuarios**
3. **Implementar módulo de reportes**
4. **Agregar validaciones con Joi**
5. **Crear frontend React**
6. **Implementar tests unitarios**
7. **Documentación con Swagger**

## 🏃‍♂️ Quick Start

```bash
# Clonar e instalar
git clone <repo>
cd reportesMtto
npm install

# Configurar .env con tus credenciales
cp .env.example .env

# Instalar PostgreSQL y crear base de datos
# ... (ver sección de instalación)

# Iniciar servidor
npm run dev
```

El servidor estará disponible en `http://localhost:3000/api`
