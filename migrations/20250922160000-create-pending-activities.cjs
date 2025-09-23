'use strict';

const { DataTypes } = require('sequelize');

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('pending_activities', {
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
        type: DataTypes.ENUM('preventivo', 'correctivo', 'mejora'),
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
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    });

    // Add indexes
    await queryInterface.addIndex('pending_activities', ['equipment_area'], {
      name: 'pending_activities_equipment_area_idx'
    });
    await queryInterface.addIndex('pending_activities', ['issue_type'], {
      name: 'pending_activities_issue_type_idx'
    });
    await queryInterface.addIndex('pending_activities', ['status'], {
      name: 'pending_activities_status_idx'
    });
    await queryInterface.addIndex('pending_activities', ['created_at'], {
      name: 'pending_activities_created_at_idx'
    });
    await queryInterface.addIndex('pending_activities', ['scheduled_date'], {
      name: 'pending_activities_scheduled_date_idx'
    });
    await queryInterface.addIndex('pending_activities', ['assigned_to'], {
      name: 'pending_activities_assigned_to_idx'
    });
    await queryInterface.addIndex('pending_activities', ['created_by'], {
      name: 'pending_activities_created_by_idx'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('pending_activities');
  }
};