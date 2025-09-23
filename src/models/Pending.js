import { DataTypes } from 'sequelize';
import sequelize from '../database/connection.js';

const Pending = sequelize.define('Pending', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  equipment_path: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Ruta completa del equipo: "area > maquina > elemento > ..." en formato JSON'
  },
  equipment_display: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Ruta del equipo en formato legible: "Area, Maquina, Elemento, ..."'
  },
  equipment_area: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Área del equipo (primer nivel de la jerarquía)'
  },
  equipment_machine: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Máquina del equipo (segundo nivel de la jerarquía)'
  },
  equipment_element: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Elemento específico de la máquina'
  },
  issue_type: {
    type: DataTypes.ENUM(
      'preventivo', 
      'correctivo', 
      'mejora'
    ),
    allowNull: false,
    defaultValue: 'correctivo',
    comment: 'Tipo de mantenimiento pendiente'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Descripción detallada de la actividad pendiente'
  },
  status: {
    type: DataTypes.ENUM('pendiente', 'asignado', 'realizado'),
    allowNull: false,
    defaultValue: 'pendiente',
    comment: 'Estado actual de la actividad pendiente'
  },
  assigned_to: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Usuario(s) asignado(s) para realizar la actividad'
  },
  assigned_users: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Arreglo JSON de IDs de usuarios asignados'
  },
  scheduled_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha programada para realizar la actividad'
  },
  shift: {
    type: DataTypes.ENUM('1', '2'),
    allowNull: true,
    comment: 'Turno programado: 1 (matutino) o 2 (vespertino)'
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Administrador que creó la actividad pendiente'
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha en que se marcó como realizada'
  },
  completed_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Usuario que marcó como realizada'
  }
}, {
  tableName: 'pending_activities',
  timestamps: true, // Esto agrega automáticamente createdAt y updatedAt
  indexes: [
    {
      fields: ['equipment_area']
    },
    {
      fields: ['issue_type']
    },
    {
      fields: ['status']
    },
    {
      fields: ['created_at']
    },
    {
      fields: ['scheduled_date']
    },
    {
      fields: ['assigned_to']
    },
    {
      fields: ['created_by']
    }
  ],
  hooks: {
    beforeSave: async (pending) => {
      // Si la actividad está siendo marcada como realizada, registrar la fecha
      if (pending.changed('status') && pending.status === 'realizado' && !pending.completed_at) {
        pending.completed_at = new Date();
      }
    }
  }
});

// Métodos de instancia
Pending.prototype.isPending = function() {
  return this.status === 'pendiente';
};

Pending.prototype.isAssigned = function() {
  return this.status === 'asignado';
};

Pending.prototype.isCompleted = function() {
  return this.status === 'realizado';
};

Pending.prototype.toSafeJSON = function() {
  const values = this.get({ plain: true });
  
  // Incluir las fechas en formato ISO string
  // Sequelize automatically creates createdAt/updatedAt fields, but we also have created_at/updated_at columns
  if (values.createdAt) {
    values.created_at = values.createdAt.toISOString();
  } else if (values.created_at) {
    values.created_at = values.created_at.toISOString();
  }
  
  if (values.updatedAt) {
    values.updated_at = values.updatedAt.toISOString();
  } else if (values.updated_at) {
    values.updated_at = values.updated_at.toISOString();
  }
  
  if (values.scheduled_date) {
    values.scheduled_date = values.scheduled_date.toISOString();
  }
  
  if (values.completed_at) {
    values.completed_at = values.completed_at.toISOString();
  }
  
  // Parsear campos JSON si existen
  if (values.equipment_path) {
    try {
      values.equipment_path_parsed = JSON.parse(values.equipment_path);
    } catch (e) {
      values.equipment_path_parsed = null;
    }
  }
  
  if (values.assigned_users) {
    try {
      values.assigned_users_parsed = JSON.parse(values.assigned_users);
    } catch (e) {
      values.assigned_users_parsed = [];
    }
  }
  
  return values;
};

// Métodos estáticos
Pending.findByStatus = function(status) {
  return this.findAll({ 
    where: { status },
    order: [['created_at', 'DESC']]
  });
};

Pending.findByEquipment = function(area, machine = null, element = null) {
  const where = { equipment_area: area };
  
  if (machine) {
    where.equipment_machine = machine;
  }
  
  if (element) {
    where.equipment_element = element;
  }
  
  return this.findAll({ 
    where,
    order: [['created_at', 'DESC']]
  });
};

Pending.findPendingActivities = function() {
  return this.findAll({ 
    where: { status: 'pendiente' },
    order: [['created_at', 'DESC']]
  });
};

Pending.findAssignedActivities = function() {
  return this.findAll({ 
    where: { status: 'asignado' },
    order: [['scheduled_date', 'ASC'], ['created_at', 'DESC']]
  });
};

Pending.findCompletedActivities = function() {
  return this.findAll({ 
    where: { status: 'realizado' },
    order: [['completed_at', 'DESC']]
  });
};

export default Pending;