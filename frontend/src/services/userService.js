// User service
import apiService from './apiService';
import API_CONFIG from '../config/api';

class UserService {
  /**
   * Get pending users
   * @returns {Promise} Users response
   */
  async getPendingUsers() {
    return apiService.get(API_CONFIG.ENDPOINTS.USERS_PENDING);
  }

  /**
   * Get active users
   * @returns {Promise} Users response
   */
  async getActiveUsers() {
    return apiService.get(API_CONFIG.ENDPOINTS.USERS_ACTIVE);
  }

  /**
   * Get user statistics
   * @returns {Promise} Stats response
   */
  async getUserStats() {
    return apiService.get(API_CONFIG.ENDPOINTS.USERS_STATS);
  }

  /**
   * Approve user
   * @param {string} userId - User ID
   * @returns {Promise} Approval response
   */
  async approveUser(userId) {
    return apiService.post(API_CONFIG.ENDPOINTS.USERS_APPROVE(userId));
  }

  /**
   * Reject user
   * @param {string} userId - User ID
   * @param {string} reason - Rejection reason
   * @returns {Promise} Rejection response
   */
  async rejectUser(userId, reason) {
    return apiService.post(API_CONFIG.ENDPOINTS.USERS_REJECT(userId), { reason });
  }

  /**
   * Change user role
   * @param {string} userId - User ID
   * @param {string} role - New role
   * @returns {Promise} Role change response
   */
  async changeUserRole(userId, role) {
    return apiService.patch(API_CONFIG.ENDPOINTS.USERS_ROLE(userId), { role });
  }

  /**
   * Deactivate user
   * @param {string} userId - User ID
   * @returns {Promise} Deactivation response
   */
  async deactivateUser(userId) {
    return apiService.patch(API_CONFIG.ENDPOINTS.USERS_DEACTIVATE(userId));
  }

  /**
   * Complete user registration
   * @param {Object} userData - Registration data
   * @returns {Promise} Registration response
   */
  async completeRegistration(userData) {
    return apiService.post(API_CONFIG.ENDPOINTS.USERS_COMPLETE, userData);
  }

  /**
   * Update user profile
   * @param {Object} profileData - Profile data
   * @returns {Promise} Update response
   */
  async updateProfile(profileData) {
    return apiService.patch(API_CONFIG.ENDPOINTS.USERS_UPDATE_PROFILE, profileData);
  }
}

// Export singleton instance
export default new UserService();