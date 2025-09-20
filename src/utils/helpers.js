/**
 * Utility functions for common operations
 */

/**
 * Parse JSON safely
 * @param {string} jsonString - JSON string to parse
 * @param {*} defaultValue - Default value to return if parsing fails
 * @returns {*} Parsed JSON or default value
 */
export const safeJsonParse = (jsonString, defaultValue = null) => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn('JSON parsing error:', error.message);
    return defaultValue;
  }
};

/**
 * Format equipment path for display
 * @param {Array} pathArray - Array of equipment path components
 * @returns {string} Formatted path string
 */
export const formatEquipmentPath = (pathArray) => {
  if (!Array.isArray(pathArray) || pathArray.length === 0) {
    return '';
  }
  return pathArray.join(' > ');
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Generate random string
 * @param {number} length - Length of the string
 * @returns {string} Random string
 */
export const generateRandomString = (length = 10) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

export default {
  safeJsonParse,
  formatEquipmentPath,
  validateEmail,
  generateRandomString
};