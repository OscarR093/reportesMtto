/**
 * Base service class
 */

class BaseService {
  constructor(model) {
    this.model = model;
  }

  /**
   * Find all records with optional query parameters
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of records
   */
  async findAll(options = {}) {
    return await this.model.findAll(options);
  }

  /**
   * Find record by ID
   * @param {string} id - Record ID
   * @param {Object} options - Query options
   * @returns {Promise<Object|null>} Record or null
   */
  async findById(id, options = {}) {
    return await this.model.findByPk(id, options);
  }

  /**
   * Create new record
   * @param {Object} data - Record data
   * @returns {Promise<Object>} Created record
   */
  async create(data) {
    return await this.model.create(data);
  }

  /**
   * Update record
   * @param {string} id - Record ID
   * @param {Object} data - Updated data
   * @returns {Promise<Object>} Updated record
   */
  async update(id, data) {
    const record = await this.findById(id);
    if (!record) {
      throw new Error('Record not found');
    }
    return await record.update(data);
  }

  /**
   * Delete record
   * @param {string} id - Record ID
   * @returns {Promise<boolean>} True if deleted
   */
  async delete(id) {
    const record = await this.findById(id);
    if (!record) {
      return false;
    }
    await record.destroy();
    return true;
  }
}

export default BaseService;