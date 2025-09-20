// Report service
import apiService from './apiService';
import API_CONFIG from '../config/api';

class ReportService {
  /**
   * Get reports
   * @param {Object} params - Query parameters
   * @returns {Promise} Reports response
   */
  async getReports(params = {}) {
    return apiService.get(API_CONFIG.ENDPOINTS.REPORTS, params);
  }

  /**
   * Get report by ID
   * @param {string} id - Report ID
   * @returns {Promise} Report response
   */
  async getReportById(id) {
    return apiService.get(API_CONFIG.ENDPOINTS.REPORTS_BY_ID(id));
  }

  /**
   * Create report
   * @param {Object} reportData - Report data
   * @returns {Promise} Create response
   */
  async createReport(reportData) {
    return apiService.post(API_CONFIG.ENDPOINTS.REPORTS, reportData);
  }

  /**
   * Update report
   * @param {string} id - Report ID
   * @param {Object} reportData - Report data
   * @returns {Promise} Update response
   */
  async updateReport(id, reportData) {
    return apiService.put(API_CONFIG.ENDPOINTS.REPORTS_BY_ID(id), reportData);
  }

  /**
   * Delete report
   * @param {string} id - Report ID
   * @returns {Promise} Delete response
   */
  async deleteReport(id) {
    return apiService.delete(API_CONFIG.ENDPOINTS.REPORTS_BY_ID(id));
  }

  /**
   * Assign report
   * @param {string} id - Report ID
   * @param {string} userId - User ID to assign to
   * @returns {Promise} Assign response
   */
  async assignReport(id, userId) {
    return apiService.patch(API_CONFIG.ENDPOINTS.REPORTS_ASSIGN(id), { assigned_to: userId });
  }

  /**
   * Change report status
   * @param {string} id - Report ID
   * @param {string} status - New status
   * @param {string} notes - Status change notes
   * @returns {Promise} Status change response
   */
  async changeStatus(id, status, notes = null) {
    return apiService.patch(API_CONFIG.ENDPOINTS.REPORTS_STATUS(id), { status, notes });
  }

  /**
   * Get report statistics
   * @param {Object} params - Query parameters
   * @returns {Promise} Stats response
   */
  async getStats(params = {}) {
    return apiService.get(API_CONFIG.ENDPOINTS.REPORTS_STATS, params);
  }

  /**
   * Get high priority reports
   * @returns {Promise} High priority reports response
   */
  async getHighPriorityReports() {
    return apiService.get(API_CONFIG.ENDPOINTS.REPORTS_HIGH_PRIORITY);
  }

  /**
   * Get user's reports
   * @returns {Promise} User reports response
   */
  async getMyReports() {
    return apiService.get(API_CONFIG.ENDPOINTS.REPORTS_MY);
  }

  /**
   * Get assigned reports
   * @returns {Promise} Assigned reports response
   */
  async getAssignedReports() {
    return apiService.get(API_CONFIG.ENDPOINTS.REPORTS_ASSIGNED);
  }

  /**
   * Get reports by equipment
   * @param {string} areaKey - Area key
   * @returns {Promise} Reports response
   */
  async getReportsByEquipment(areaKey) {
    return apiService.get(API_CONFIG.ENDPOINTS.REPORTS_BY_EQUIPMENT(areaKey));
  }
}

// Export singleton instance
export default new ReportService();