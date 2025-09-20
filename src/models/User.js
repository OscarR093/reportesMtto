import { DataTypes } from 'sequelize';
import sequelize from '../database/connection.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  google_id: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    comment: 'ID único de Google OAuth'
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    },
    comment: 'Email del usuario obtenido de Google'
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Nombre del usuario'
  },
  display_name: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Nombre que el usuario ingresó para identificarse'
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Contraseña hasheada para login tradicional (opcional)'
  },
  photo: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'URL de la foto de perfil de Google'
  },
  firstTime: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
    comment: 'Indica si es la primera vez que el usuario inicia sesión'
  },
  status: {
    type: DataTypes.ENUM('pending', 'active', 'inactive', 'rejected'),
    defaultValue: 'pending',
    allowNull: false,
    comment: 'Estado del usuario: pending (solicitud), active (aprobado), inactive (deshabilitado), rejected (rechazado)'
  },
  role: {
    type: DataTypes.ENUM('user', 'admin', 'super_admin'),
    defaultValue: 'user',
    allowNull: false,
    comment: 'Rol del usuario: user (técnico), admin (administrador), super_admin (superadministrador)'
  },
  employee_id: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    comment: 'ID de empleado asignado por la empresa'
  },
  department: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Departamento al que pertenece el usuario'
  },
  position: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Cargo o posición del usuario'
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Teléfono de contacto'
  },
  hire_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha de contratación'
  },
  last_login: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Último inicio de sesión'
  },
  approved_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'ID del administrador que aprobó la solicitud'
  },
  approved_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha de aprobación de la solicitud'
  },
  rejected_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'ID del administrador que rechazó la solicitud'
  },
  rejected_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha de rechazo de la solicitud'
  },
  rejection_reason: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Razón del rechazo de la solicitud'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notas adicionales del administrador'
  }
}, {
  tableName: 'users',
  indexes: [
    {
      unique: true,
      fields: ['google_id']
    },
    {
      unique: true,
      fields: ['email']
    },
    {
      fields: ['status']
    },
    {
      fields: ['role']
    },
    {
      fields: ['department']
    }
  ],
  hooks: {
    beforeSave: async (user) => {
      // Si el usuario está siendo activado, registrar la fecha de aprobación
      if (user.changed('status') && user.status === 'active' && !user.approved_at) {
        user.approved_at = new Date();
      }
      
      // Si el usuario está siendo rechazado, registrar la fecha de rechazo
      if (user.changed('status') && user.status === 'rejected' && !user.rejected_at) {
        user.rejected_at = new Date();
      }
    }
  }
});

// Definir asociaciones
User.associate = function(models) {
  // Un usuario puede aprobar muchas solicitudes
  User.hasMany(models.User, {
    as: 'ApprovedUsers',
    foreignKey: 'approved_by'
  });
  
  // Un usuario puede rechazar muchas solicitudes
  User.hasMany(models.User, {
    as: 'RejectedUsers',
    foreignKey: 'rejected_by'
  });
  
  // Un usuario fue aprobado por otro usuario
  User.belongsTo(models.User, {
    as: 'ApprovedBy',
    foreignKey: 'approved_by'
  });
  
  // Un usuario fue rechazado por otro usuario
  User.belongsTo(models.User, {
    as: 'RejectedBy',
    foreignKey: 'rejected_by'
  });
};

// Métodos de instancia
User.prototype.isSuperAdmin = function() {
  return this.role === 'super_admin';
};

User.prototype.isAdmin = function() {
  return this.role === 'admin' || this.role === 'super_admin';
};

User.prototype.canManageUsers = function() {
  return this.role === 'admin' || this.role === 'super_admin';
};

User.prototype.canGrantAdminRights = function() {
  return this.role === 'super_admin';
};

User.prototype.isPending = function() {
  return this.status === 'pending';
};

User.prototype.isActive = function() {
  return this.status === 'active';
};

User.prototype.toSafeJSON = function() {
  const values = this.get({ plain: true });
  delete values.created_at;
  delete values.updated_at;
  return values;
};

// Métodos estáticos
User.findByGoogleId = function(googleId) {
  return this.findOne({ where: { google_id: googleId } });
};

User.findByEmail = function(email) {
  return this.findOne({ where: { email: email } });
};

User.findPendingUsers = function() {
  return this.findAll({ 
    where: { status: 'pending' },
    order: [['created_at', 'ASC']]
  });
};

User.findActiveUsers = function() {
  return this.findAll({ 
    where: { status: 'active' },
    order: [['name', 'ASC']]
  });
};

User.findAdmins = function() {
  return this.findAll({ 
    where: { 
      role: ['admin', 'super_admin'],
      status: 'active'
    },
    order: [['name', 'ASC']]
  });
};

export default User;
