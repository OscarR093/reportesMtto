// Dashboard service
import apiService from './apiService';
import API_CONFIG from '../config/api';

class DashboardService {
  /**
   * Get dashboard data
   * @returns {Promise} Dashboard data response
   */
  async getDashboardData() {
    return apiService.get(API_CONFIG.ENDPOINTS.DASHBOARD);
  }
}

// Export singleton instance
export default new DashboardService();