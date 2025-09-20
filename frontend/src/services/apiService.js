// API Service for handling HTTP requests
import API_CONFIG from '../config/api';

class ApiService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.defaultHeaders = API_CONFIG.HEADERS;
  }

  /**
   * Get token from localStorage
   * @returns {string|null} JWT token
   */
  getToken() {
    return localStorage.getItem('token');
  }

  /**
   * Get default headers with authorization
   * @returns {Object} Headers object
   */
  getHeaders(includeAuth = true) {
    const headers = { ...this.defaultHeaders };
    
    if (includeAuth) {
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    return headers;
  }

  /**
   * Make HTTP request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @returns {Promise} Response promise
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(options.includeAuth !== false),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      // Handle empty responses
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = { success: response.ok, message: response.statusText };
      }
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  /**
   * GET request
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Query parameters
   * @returns {Promise} Response promise
   */
  async get(endpoint, params = {}, includeAuth = true) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request(url, { 
      method: 'GET',
      includeAuth 
    });
  }

  /**
   * POST request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   * @returns {Promise} Response promise
   */
  async post(endpoint, data = {}, includeAuth = true) {
    return this.request(endpoint, {
      method: 'POST',
      headers: this.getHeaders(includeAuth),
      body: JSON.stringify(data),
      includeAuth
    });
  }

  /**
   * PUT request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   * @returns {Promise} Response promise
   */
  async put(endpoint, data = {}, includeAuth = true) {
    return this.request(endpoint, {
      method: 'PUT',
      headers: this.getHeaders(includeAuth),
      body: JSON.stringify(data),
      includeAuth
    });
  }

  /**
   * PATCH request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   * @returns {Promise} Response promise
   */
  async patch(endpoint, data = {}, includeAuth = true) {
    return this.request(endpoint, {
      method: 'PATCH',
      headers: this.getHeaders(includeAuth),
      body: JSON.stringify(data),
      includeAuth
    });
  }

  /**
   * DELETE request
   * @param {string} endpoint - API endpoint
   * @returns {Promise} Response promise
   */
  async delete(endpoint, includeAuth = true) {
    return this.request(endpoint, {
      method: 'DELETE',
      headers: this.getHeaders(includeAuth),
      includeAuth
    });
  }

  /**
   * File upload request
   * @param {string} endpoint - API endpoint
   * @param {FormData} formData - Form data with file
   * @returns {Promise} Response promise
   */
  async upload(endpoint, formData, includeAuth = true) {
    const headers = {};
    if (includeAuth) {
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    return this.request(endpoint, {
      method: 'POST',
      headers,
      body: formData,
      includeAuth
    });
  }
}

// Export singleton instance
export default new ApiService();