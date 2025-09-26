// Authentication service
import apiService from './apiService';
import API_CONFIG from '../config/api';

class AuthService {
  /**
   * Login with credentials
   * @param {string} employee_id - Employee ID
   * @param {string} password - Password
   * @returns {Promise} Login response
   */
  async login(employee_id, password) {
    return apiService.post(API_CONFIG.ENDPOINTS.AUTH_LOGIN, { employee_id, password }, false);
  }

  /**
   * Google OAuth login
   */
  loginWithGoogle() {
    window.location.href = `${API_CONFIG.baseUrl}${API_CONFIG.ENDPOINTS.AUTH_GOOGLE}`;
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token
   * @returns {Promise} Verification response
   */
  async verifyToken(token) {
    return apiService.post(API_CONFIG.ENDPOINTS.AUTH_VERIFY, { token }, false);
  }

  /**
   * Logout user
   * @returns {Promise} Logout response
   */
  async logout() {
    try {
      await apiService.post(API_CONFIG.ENDPOINTS.AUTH_LOGOUT, {});
    } catch (error) {
      console.warn('Error during logout:', error);
    } finally {
      localStorage.removeItem('token');
    }
  }

  /**
   * Refresh JWT token
   * @returns {Promise} Refresh response
   */
  async refreshToken() {
    return apiService.post(API_CONFIG.ENDPOINTS.AUTH_REFRESH);
  }

  /**
   * Get user profile
   * @returns {Promise} Profile response
   */
  async getProfile() {
    return apiService.get(API_CONFIG.ENDPOINTS.AUTH_PROFILE);
  }

  /**
   * Update user profile
   * @param {Object} profileData - Profile data
   * @returns {Promise} Update response
   */
  async updateProfile(profileData) {
    return apiService.put(API_CONFIG.ENDPOINTS.AUTH_PROFILE, profileData);
  }

  /**
   * Change user password
   * @param {Object} passwordData - Password data
   * @returns {Promise} Change password response
   */
  async changePassword(passwordData) {
    return apiService.put('/auth/change-password', passwordData);
  }

  /**
   * Upload user photo
   * @param {FormData} formData - Form data with photo
   * @returns {Promise} Upload response
   */
  async uploadPhoto(formData) {
    return apiService.upload(API_CONFIG.ENDPOINTS.FILES_AVATAR, formData);
  }
}

// Export singleton instance
export default new AuthService();