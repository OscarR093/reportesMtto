// Equipment service
import apiService from './apiService';
import API_CONFIG from '../config/api';

class EquipmentService {
  /**
   * Get equipment hierarchy
   * @returns {Promise} Hierarchy response
   */
  async getHierarchy() {
    return apiService.get(API_CONFIG.ENDPOINTS.EQUIPMENT_HIERARCHY);
  }

  /**
   * Get equipment areas
   * @returns {Promise} Areas response
   */
  async getAreas() {
    return apiService.get(API_CONFIG.ENDPOINTS.EQUIPMENT_AREAS);
  }

  /**
   * Get equipment metadata
   * @returns {Promise} Metadata response
   */
  async getMetadata() {
    return apiService.get(API_CONFIG.ENDPOINTS.EQUIPMENT_METADATA);
  }

  /**
   * Get equipment statistics
   * @returns {Promise} Stats response
   */
  async getStats() {
    return apiService.get(API_CONFIG.ENDPOINTS.EQUIPMENT_STATS);
  }

  /**
   * Search equipment
   * @param {Object} params - Search parameters
   * @returns {Promise} Search response
   */
  async searchEquipment(params) {
    return apiService.get(API_CONFIG.ENDPOINTS.EQUIPMENT_SEARCH, params);
  }

  /**
   * Get machines by area
   * @param {string} areaKey - Area key
   * @returns {Promise} Machines response
   */
  async getMachinesByArea(areaKey) {
    return apiService.get(API_CONFIG.ENDPOINTS.EQUIPMENT_MACHINES(areaKey));
  }

  /**
   * Get elements by machine
   * @param {string} areaKey - Area key
   * @param {string} machineKey - Machine key
   * @returns {Promise} Elements response
   */
  async getElementsByMachine(areaKey, machineKey) {
    return apiService.get(API_CONFIG.ENDPOINTS.EQUIPMENT_ELEMENTS(areaKey, machineKey));
  }

  /**
   * Get components by element
   * @param {string} areaKey - Area key
   * @param {string} machineKey - Machine key
   * @param {string} elementKey - Element key
   * @returns {Promise} Components response
   */
  async getComponentsByElement(areaKey, machineKey, elementKey) {
    return apiService.get(API_CONFIG.ENDPOINTS.EQUIPMENT_COMPONENTS(areaKey, machineKey, elementKey));
  }

  /**
   * Get equipment path
   * @param {string} areaKey - Area key
   * @returns {Promise} Path response
   */
  async getEquipmentPath(areaKey) {
    return apiService.get(API_CONFIG.ENDPOINTS.EQUIPMENT_PATH(areaKey));
  }

  /**
   * Validate equipment path
   * @param {string} areaKey - Area key
   * @returns {Promise} Validation response
   */
  async validatePath(areaKey) {
    return apiService.get(API_CONFIG.ENDPOINTS.EQUIPMENT_VALIDATE(areaKey));
  }
}

// Export singleton instance
export default new EquipmentService();