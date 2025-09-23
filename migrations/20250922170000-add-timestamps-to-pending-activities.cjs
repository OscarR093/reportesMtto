'use strict';

const { DataTypes } = require('sequelize');

module.exports = {
  async up (queryInterface, Sequelize) {
    // Check if columns exist before adding them
    const tableInfo = await queryInterface.describeTable('pending_activities');
    
    // Add created_at column if it doesn't exist
    if (!tableInfo.created_at) {
      await queryInterface.addColumn('pending_activities', 'created_at', {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      });
    } else {
      // Update existing records to have a proper created_at value if needed
      await queryInterface.sequelize.query(
        "UPDATE pending_activities SET created_at = NOW() WHERE created_at IS NULL OR created_at = '0001-01-01 00:00:00'"
      );
    }

    // Add updated_at column if it doesn't exist
    if (!tableInfo.updated_at) {
      await queryInterface.addColumn('pending_activities', 'updated_at', {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      });
    }
  },

  async down (queryInterface, Sequelize) {
    // Note: We won't remove the columns in the down migration to avoid data loss
    // The columns will remain but won't be used
  }
};