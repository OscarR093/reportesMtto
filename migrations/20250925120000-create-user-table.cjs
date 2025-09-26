'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      google_id: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
        comment: 'ID único de Google OAuth'
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true
        },
        comment: 'Email del usuario obtenido de Google'
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Nombre del usuario'
      },
      display_name: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Nombre que el usuario ingresó para identificarse'
      },
      password: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Contraseña hasheada para login tradicional (opcional)'
      },
      photo: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'URL de la foto de perfil de Google'
      },
      first_time: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
        comment: 'Indica si es la primera vez que el usuario inicia sesión'
      },
      status: {
        type: Sequelize.ENUM('pending', 'active', 'inactive', 'rejected'),
        defaultValue: 'pending',
        allowNull: false,
        comment: 'Estado del usuario: pending (solicitud), active (aprobado), inactive (deshabilitado), rejected (rechazado)'
      },
      role: {
        type: Sequelize.ENUM('user', 'admin', 'super_admin'),
        defaultValue: 'user',
        allowNull: false,
        comment: 'Rol del usuario: user (técnico), admin (administrador), super_admin (superadministrador)'
      },
      employee_id: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
        comment: 'ID de empleado asignado por la empresa'
      },
      department: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Departamento al que pertenece el usuario'
      },
      position: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Cargo o posición del usuario'
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Teléfono de contacto'
      },
      hire_date: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de contratación'
      },
      last_login: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Último inicio de sesión'
      },
      approved_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        comment: 'ID del administrador que aprobó la solicitud'
      },
      approved_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de aprobación de la solicitud'
      },
      rejected_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        comment: 'ID del administrador que rechazó la solicitud'
      },
      rejected_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de rechazo de la solicitud'
      },
      rejection_reason: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Razón del rechazo de la solicitud'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Notas adicionales del administrador'
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

    // Crear índice para google_id
    await queryInterface.addIndex('users', ['google_id'], {
      unique: true,
      name: 'users_google_id_unique'
    });

    // Crear índice para email
    await queryInterface.addIndex('users', ['email'], {
      unique: true,
      name: 'users_email_unique'
    });

    // Crear índice para status
    await queryInterface.addIndex('users', ['status'], {
      name: 'users_status_index'
    });

    // Crear índice para role
    await queryInterface.addIndex('users', ['role'], {
      name: 'users_role_index'
    });

    // Crear índice para department
    await queryInterface.addIndex('users', ['department'], {
      name: 'users_department_index'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  }
};