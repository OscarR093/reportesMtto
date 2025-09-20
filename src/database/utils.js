/**
 * Database utility functions
 */

/**
 * Paginate database query results
 * @param {Model} model - Sequelize model
 * @param {Object} options - Query options
 * @param {number} page - Page number (1-indexed)
 * @param {number} limit - Items per page
 * @returns {Object} Paginated results
 */
export const paginate = async (model, options = {}, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  
  const result = await model.findAndCountAll({
    ...options,
    limit,
    offset
  });
  
  return {
    data: result.rows,
    pagination: {
      page,
      limit,
      total: result.count,
      pages: Math.ceil(result.count / limit)
    }
  };
};

/**
 * Format database error messages
 * @param {Error} error - Database error
 * @returns {string} Formatted error message
 */
export const formatDatabaseError = (error) => {
  if (error.name === 'SequelizeUniqueConstraintError') {
    return 'Ya existe un registro con este valor único';
  }
  
  if (error.name === 'SequelizeValidationError') {
    return 'Error de validación en los datos proporcionados';
  }
  
  if (error.name === 'SequelizeForeignKeyConstraintError') {
    return 'Error de integridad de datos: referencia a registro no existente';
  }
  
  return 'Error en la base de datos';
};

export default {
  paginate,
  formatDatabaseError
};