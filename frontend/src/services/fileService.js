// File service
import apiService from './apiService';
import API_CONFIG from '../config/api';

class FileService {
  /**
   * Upload evidence
   * @param {FormData} formData - Form data with evidence file
   * @returns {Promise} Upload response
   */
  async uploadEvidence(formData) {
    return apiService.upload(API_CONFIG.ENDPOINTS.FILES_EVIDENCE, formData);
  }

  /**
   * Upload multiple evidence
   * @param {FormData} formData - Form data with evidence files
   * @returns {Promise} Upload response
   */
  async uploadMultipleEvidence(formData) {
    return apiService.upload(API_CONFIG.ENDPOINTS.FILES_EVIDENCE_MULTIPLE, formData);
  }

  /**
   * Upload avatar
   * @param {FormData} formData - Form data with avatar file
   * @returns {Promise} Upload response
   */
  async uploadAvatar(formData) {
    return apiService.upload(API_CONFIG.ENDPOINTS.FILES_AVATAR, formData);
  }

  /**
   * Upload document
   * @param {FormData} formData - Form data with document file
   * @returns {Promise} Upload response
   */
  async uploadDocument(formData) {
    return apiService.upload(API_CONFIG.ENDPOINTS.FILES_DOCUMENT, formData);
  }

  /**
   * Get file info
   * @param {string} bucket - Bucket name
   * @param {string} fileName - File name
   * @returns {Promise} File info response
   */
  async getFileInfo(bucket, fileName) {
    return apiService.get(API_CONFIG.ENDPOINTS.FILES_INFO(bucket, fileName));
  }

  /**
   * Generate download URL
   * @param {string} bucket - Bucket name
   * @param {string} fileName - File name
   * @returns {Promise} Download URL response
   */
  async generateDownloadUrl(bucket, fileName) {
    return apiService.get(API_CONFIG.ENDPOINTS.FILES_DOWNLOAD(bucket, fileName));
  }

  /**
   * List files in bucket
   * @param {string} bucket - Bucket name
   * @returns {Promise} File list response
   */
  async listFiles(bucket) {
    return apiService.get(API_CONFIG.ENDPOINTS.FILES_LIST(bucket));
  }

  /**
   * Delete file
   * @param {string} bucket - Bucket name
   * @param {string} fileName - File name
   * @returns {Promise} Delete response
   */
  async deleteFile(bucket, fileName) {
    return apiService.delete(API_CONFIG.ENDPOINTS.FILES_DELETE(bucket, fileName));
  }

  /**
   * Get storage statistics
   * @returns {Promise} Storage stats response
   */
  async getStorageStats() {
    return apiService.get(API_CONFIG.ENDPOINTS.FILES_STORAGE_STATS);
  }
}

// Export singleton instance
export default new FileService();