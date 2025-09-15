'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Verificar si las columnas ya existen antes de agregarlas
    const tableDescription = await queryInterface.describeTable('Reports');
    
    if (!tableDescription.createdAt) {
      await queryInterface.addColumn('Reports', 'createdAt', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      });
    }
    
    if (!tableDescription.updatedAt) {
      await queryInterface.addColumn('Reports', 'updatedAt', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Reports', 'createdAt');
    await queryInterface.removeColumn('Reports', 'updatedAt');
  }
};
