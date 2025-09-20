/**
 * Validation middleware functions
 */

/**
 * Validate required fields in request body
 * @param {...string} fields - Fields to validate
 * @returns {Function} Express middleware
 */
export const validateRequiredFields = (...fields) => {
  return (req, res, next) => {
    const missingFields = fields.filter(field => !(field in req.body) || req.body[field] === undefined || req.body[field] === null);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        data: {
          missingFields
        }
      });
    }
    
    next();
  };
};

/**
 * Validate UUID format
 * @param {string} uuid - UUID to validate
 * @returns {boolean} True if valid UUID
 */
export const validateUUID = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Validate equipment path structure
 * @param {Object} path - Equipment path object
 * @returns {boolean} True if valid structure
 */
export const validateEquipmentPath = (path) => {
  // Basic validation - check if it's an object with required properties
  if (!path || typeof path !== 'object') {
    return false;
  }
  
  // Check for minimum required properties
  return 'area' in path;
};

export default {
  validateRequiredFields,
  validateUUID,
  validateEquipmentPath
};