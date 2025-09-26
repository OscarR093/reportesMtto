'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('reports', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        comment: 'ID del técnico que creó el reporte'
      },
      technician_name: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Nombre del técnico tomado de la base de datos (no de Google)'
      },
      technician_email: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Email del técnico (elemento constante de Google OAuth)'
      },
      equipment_path: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'Ruta completa del equipo: "area > maquina > elemento > ..." en formato JSON'
      },
      equipment_display: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Ruta del equipo en formato legible: "Area, Maquina, Elemento, ..."'
      },
      equipment_area: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Área del equipo (primer nivel de la jerarquía)'
      },
      equipment_machine: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Máquina del equipo (segundo nivel de la jerarquía)'
      },
      equipment_element: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Elemento específico de la máquina'
      },
      issue_type: {
        type: Sequelize.ENUM(
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
        type: Sequelize.ENUM('baja', 'media', 'alta', 'critica'),
        allowNull: false,
        defaultValue: 'media',
        comment: 'Prioridad del reporte'
      },
      status: {
        type: Sequelize.ENUM('abierto', 'en_proceso', 'resuelto', 'cerrado', 'cancelado'),
        allowNull: false,
        defaultValue: 'abierto',
        comment: 'Estado actual del reporte'
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Título descriptivo del reporte'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Descripción detallada del problema o trabajo realizado'
      },
      evidence_images: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Arreglo JSON de URLs de evidencias (máximo 3)'
      },
      evidence_filenames: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Arreglo JSON de nombres originales de archivos de evidencia (máximo 3)'
      },
      work_performed: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Descripción del trabajo realizado'
      },
      materials_used: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Materiales utilizados en la reparación'
      },
      time_spent: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Tiempo empleado en minutos'
      },
      cost_estimate: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Estimación del costo de la reparación'
      },
      scheduled_date: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha programada para el mantenimiento (si aplica)'
      },
      completed_date: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de finalización del trabajo'
      },
      assigned_to: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        comment: 'Técnico asignado para resolver el reporte'
      },
      reviewed_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        comment: 'Supervisor que revisó el reporte'
      },
      reviewed_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de revisión del reporte'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Notas adicionales del supervisor o técnico'
      },
      tags: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Etiquetas para categorización (JSON array)'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Crear índices
    await queryInterface.addIndex('reports', ['user_id'], {
      name: 'reports_user_id_index'
    });

    await queryInterface.addIndex('reports', ['technician_email'], {
      name: 'reports_technician_email_index'
    });

    await queryInterface.addIndex('reports', ['equipment_area'], {
      name: 'reports_equipment_area_index'
    });

    await queryInterface.addIndex('reports', ['issue_type'], {
      name: 'reports_issue_type_index'
    });

    await queryInterface.addIndex('reports', ['priority'], {
      name: 'reports_priority_index'
    });

    await queryInterface.addIndex('reports', ['status'], {
      name: 'reports_status_index'
    });

    await queryInterface.addIndex('reports', ['created_at'], {
      name: 'reports_created_at_index'
    });

    await queryInterface.addIndex('reports', ['scheduled_date'], {
      name: 'reports_scheduled_date_index'
    });

    await queryInterface.addIndex('reports', ['assigned_to'], {
      name: 'reports_assigned_to_index'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('reports');
  }
};