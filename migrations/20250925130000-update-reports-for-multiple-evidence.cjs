'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Esta migración es para actualizar la tabla de reportes existente
    // para soportar múltiples evidencias, si la tabla ya existía con campos antiguos
    
    // Agregar columnas para soporte de múltiples evidencias si no existen
    await queryInterface.sequelize.query(`
      ALTER TABLE reports 
      ADD COLUMN IF NOT EXISTS evidence_images TEXT,
      ADD COLUMN IF NOT EXISTS evidence_filenames TEXT
    `);

    // Actualizar datos existentes si hay evidencia en los campos antiguos
    // Nota: En esta implementación específica, asumimos que si existen datos antiguos, se migrarían
    // pero como en nuestra migración de creación ya incluimos estos campos nuevos,
    // normalmente no habría datos antiguos que migrar
    
    // Añadir índices para mejor rendimiento
    await queryInterface.addIndex('reports', ['equipment_area'], {
      name: 'idx_reports_equipment_area'
    });

    await queryInterface.addIndex('reports', ['priority'], {
      name: 'idx_reports_priority'
    });

    await queryInterface.addIndex('reports', ['status'], {
      name: 'idx_reports_status'
    });

    await queryInterface.addIndex('reports', ['created_at'], {
      name: 'idx_reports_created_at'
    });

    await queryInterface.addIndex('reports', ['user_id'], {
      name: 'idx_reports_user_id'
    });
  },

  async down (queryInterface, Sequelize) {
    // Revertir los cambios
    await queryInterface.sequelize.query(`
      ALTER TABLE reports 
      DROP COLUMN IF EXISTS evidence_images,
      DROP COLUMN IF EXISTS evidence_filenames
    `);

    // Eliminar índices
    await queryInterface.removeIndex('reports', 'idx_reports_equipment_area');
    await queryInterface.removeIndex('reports', 'idx_reports_priority');
    await queryInterface.removeIndex('reports', 'idx_reports_status');
    await queryInterface.removeIndex('reports', 'idx_reports_created_at');
    await queryInterface.removeIndex('reports', 'idx_reports_user_id');
  }
};