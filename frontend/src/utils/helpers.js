// Utility functions

/**
 * Format date to localized string
 * @param {string|Date} dateString - Date string or Date object
 * @param {Object} options - Date format options
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return 'N/A';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  
  const formatOptions = { ...defaultOptions, ...options };
  
  return new Date(dateString).toLocaleDateString('es-ES', formatOptions);
};

/**
 * Format date to short format
 * @param {string|Date} dateString - Date string or Date object
 * @returns {string} Formatted date string
 */
export const formatDateShort = (dateString) => {
  if (!dateString) return 'Fecha no disponible';
  
  // Try to create a Date object
  const date = new Date(dateString);
  
  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return 'Fecha no disponible';
  }
  
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format date with time
 * @param {string|Date} dateString - Date string or Date object
 * @returns {string} Formatted date string with time
 */
export const formatDateTime = (dateString) => {
  if (!dateString) {
    return 'Fecha no disponible';
  }
  
  // Try to create a Date object
  const date = new Date(dateString);
  
  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return 'Fecha no disponible';
  }
  
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength) + '...';
};

/**
 * Generate color based on string
 * @param {string} str - String to generate color from
 * @returns {string} CSS color class
 */
export const stringToColor = (str) => {
  if (!str) return 'bg-blue-500';
  
  const colors = [
    'bg-red-500', 'bg-yellow-500', 'bg-green-500', 'bg-blue-500',
    'bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-cyan-500',
    'bg-orange-500', 'bg-teal-500'
  ];
  
  const index = str.charCodeAt(0) % colors.length;
  return colors[index];
};

/**
 * Extract initials from name
 * @param {string} name - Full name
 * @returns {string} Initials
 */
export const getInitials = (name) => {
  if (!name) return '';
  
  return name.trim()
    .split(' ')
    .map(n => n.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
};

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @returns {string} Formatted currency
 */
export const formatCurrency = (amount, currency = 'USD') => {
  if (amount === null || amount === undefined) return 'N/A';
  
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

/**
 * Format number with commas
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined) return 'N/A';
  
  return new Intl.NumberFormat('es-ES').format(num);
};

/**
 * Capitalize first letter of string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export const capitalize = (str) => {
  if (!str) return '';
  
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Sleep function for delays
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Promise that resolves after ms milliseconds
 */
export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};