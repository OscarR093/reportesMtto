import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Report = sequelize.define('Report', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'ID del técnico que creó el reporte'
  },
  technician_name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Nombre del técnico tomado de la base de datos (no de Google)'
  },
  technician_email: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Email del técnico (elemento constante de Google OAuth)'
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
      'inspeccion', 
      'emergencia', 
      'mejora',
      'otro'
    ),
    allowNull: false,
    defaultValue: 'correctivo',
    comment: 'Tipo de mantenimiento o reporte'
  },
  priority: {
    type: DataTypes.ENUM('baja', 'media', 'alta', 'critica'),
    allowNull: false,
    defaultValue: 'media',
    comment: 'Prioridad del reporte'
  },
  status: {
    type: DataTypes.ENUM('abierto', 'en_proceso', 'resuelto', 'cerrado', 'cancelado'),
    allowNull: false,
    defaultValue: 'abierto',
    comment: 'Estado actual del reporte'
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Título descriptivo del reporte'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Descripción detallada del problema o trabajo realizado'
  },
  evidence_images: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Arreglo JSON de URLs de evidencias (máximo 3)'
  },
  evidence_filenames: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Arreglo JSON de nombres originales de archivos de evidencia (máximo 3)'
  },
  work_performed: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Descripción del trabajo realizado'
  },
  materials_used: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Materiales utilizados en la reparación'
  },
  time_spent: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Tiempo empleado en minutos'
  },
  cost_estimate: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Estimación del costo de la reparación'
  },
  scheduled_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha programada para el mantenimiento (si aplica)'
  },
  completed_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha de finalización del trabajo'
  },
  assigned_to: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Técnico asignado para resolver el reporte'
  },
  reviewed_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Supervisor que revisó el reporte'
  },
  reviewed_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha de revisión del reporte'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notas adicionales del supervisor o técnico'
  },
  tags: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Etiquetas para categorización (JSON array)'
  }
}, {
  tableName: 'reports',
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['technician_email']
    },
    {
      fields: ['equipment_area']
    },
    {
      fields: ['issue_type']
    },
    {
      fields: ['priority']
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
    }
  ],
  hooks: {
    beforeSave: async (report) => {
      // Si el reporte está siendo marcado como completado, registrar la fecha
      if (report.changed('status') && 
          ['resuelto', 'cerrado'].includes(report.status) && 
          !report.completed_date) {
        report.completed_date = new Date();
      }
    }
  }
});

// Métodos de instancia
Report.prototype.isOpen = function() {
  return this.status === 'abierto';
};

Report.prototype.isCompleted = function() {
  return ['resuelto', 'cerrado'].includes(this.status);
};

Report.prototype.isHighPriority = function() {
  return ['alta', 'critica'].includes(this.priority);
};

Report.prototype.canBeEditedBy = function(user) {
  // Solo el creador puede editar si el reporte está abierto
  if (this.user_id === user.id && this.status === 'abierto') {
    return true;
  }
  return false;
};

Report.prototype.toSafeJSON = function() {
  const values = this.get({ plain: true });
  
  // Parsear campos JSON si existen
  if (values.equipment_path) {
    try {
      values.equipment_path_parsed = JSON.parse(values.equipment_path);
    } catch (e) {
      values.equipment_path_parsed = null;
    }
  }
  
  if (values.tags) {
    try {
      values.tags_parsed = JSON.parse(values.tags);
    } catch (e) {
      values.tags_parsed = [];
    }
  }
  
  return values;
};

// Métodos estáticos
Report.findByUser = function(userId) {
  return this.findAll({ 
    where: { user_id: userId },
    order: [['created_at', 'DESC']]
  });
};

Report.findByEquipment = function(area, machine = null, element = null) {
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

Report.findByStatus = function(status) {
  return this.findAll({ 
    where: { status },
    order: [['created_at', 'DESC']]
  });
};

Report.findOpenReports = function() {
  return this.findAll({ 
    where: { status: ['abierto', 'en_proceso'] },
    order: [['priority', 'DESC'], ['created_at', 'ASC']]
  });
};

Report.findHighPriorityReports = function() {
  return this.findAll({ 
    where: { 
      priority: ['alta', 'critica'],
      status: ['abierto', 'en_proceso']
    },
    order: [['priority', 'DESC'], ['created_at', 'ASC']]
  });
};

export default Report;
