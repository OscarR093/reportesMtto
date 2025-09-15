'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Verificar si las columnas ya existen antes de agregarlas
    const tableDescription = await queryInterface.describeTable('reports');
    
    if (!tableDescription.created_at) {
      await queryInterface.addColumn('reports', 'created_at', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      });
    }
    
    if (!tableDescription.updated_at) {
      await queryInterface.addColumn('reports', 'updated_at', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      });
    }

    // Crear índice para created_at si no existe
    try {
      await queryInterface.addIndex('reports', ['created_at'], {
        name: 'reports_created_at_idx'
      });
    } catch (error) {
      console.log('Índice created_at ya existe o no se pudo crear:', error.message);
    }
  },

  async down(queryInterface, Sequelize) {
    // Eliminar índice
    try {
      await queryInterface.removeIndex('reports', 'reports_created_at_idx');
    } catch (error) {
      console.log('Error eliminando índice:', error.message);
    }

    // Eliminar columnas
    await queryInterface.removeColumn('reports', 'updated_at');
    await queryInterface.removeColumn('reports', 'created_at');
  }
};
