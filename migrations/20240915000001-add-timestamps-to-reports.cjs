'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Verificar si las columnas ya existen antes de agregarlas
    const tableDescription = await queryInterface.describeTable('reports');
    
    if (!tableDescription.created_at) {
      await queryInterface.addColumn('reports', 'created_at', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      });
    }
    
    if (!tableDescription.updated_at) {
      await queryInterface.addColumn('reports', 'updated_at', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('reports', 'created_at');
    await queryInterface.removeColumn('reports', 'updated_at');
  }
};
