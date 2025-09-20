// API Configuration
const API_CONFIG = {
  // Use relative URL for proxy
  BASE_URL: '/api',
  
  // API endpoints
  ENDPOINTS: {
    // Auth endpoints
    AUTH_LOGIN: '/auth/login',
    AUTH_LOGOUT: '/auth/logout',
    AUTH_VERIFY: '/auth/verify-token',
    AUTH_PROFILE: '/auth/profile',
    AUTH_GOOGLE: '/auth/google',
    AUTH_CALLBACK: '/auth/google/callback',
    AUTH_REFRESH: '/auth/refresh',
    
    // User endpoints
    USERS_PENDING: '/users/pending',
    USERS_ACTIVE: '/users/active',
    USERS_STATS: '/users/stats',
    USERS_APPROVE: (userId) => `/users/${userId}/approve`,
    USERS_REJECT: (userId) => `/users/${userId}/reject`,
    USERS_ROLE: (userId) => `/users/${userId}/role`,
    USERS_DEACTIVATE: (userId) => `/users/${userId}/deactivate`,
    USERS_COMPLETE: '/users/complete-registration',
    USERS_UPDATE_PROFILE: '/users/profile',
    
    // Equipment endpoints
    EQUIPMENT_HIERARCHY: '/equipment/hierarchy',
    EQUIPMENT_AREAS: '/equipment/areas',
    EQUIPMENT_METADATA: '/equipment/metadata',
    EQUIPMENT_STATS: '/equipment/stats',
    EQUIPMENT_SEARCH: '/equipment/search',
    EQUIPMENT_MACHINES: (areaKey) => `/equipment/${areaKey}/machines`,
    EQUIPMENT_ELEMENTS: (areaKey, machineKey) => `/equipment/${areaKey}/${machineKey}/elements`,
    EQUIPMENT_COMPONENTS: (areaKey, machineKey, elementKey) => `/equipment/${areaKey}/${machineKey}/${elementKey}/components`,
    EQUIPMENT_PATH: (areaKey) => `/equipment/${areaKey}/path`,
    EQUIPMENT_VALIDATE: (areaKey) => `/equipment/${areaKey}/validate`,
    
    // Report endpoints
    REPORTS: '/reports',
    REPORTS_STATS: '/reports/stats',
    REPORTS_HIGH_PRIORITY: '/reports/high-priority',
    REPORTS_MY: '/reports/my',
    REPORTS_ASSIGNED: '/reports/assigned',
    REPORTS_BY_EQUIPMENT: (areaKey) => `/reports/equipment/${areaKey}`,
    REPORTS_BY_ID: (id) => `/reports/${id}`,
    REPORTS_ASSIGN: (id) => `/reports/${id}/assign`,
    REPORTS_STATUS: (id) => `/reports/${id}/status`,
    
    // File endpoints
    FILES_EVIDENCE: '/files/evidence',
    FILES_EVIDENCE_MULTIPLE: '/files/evidence/multiple',
    FILES_AVATAR: '/files/avatar',
    FILES_DOCUMENT: '/files/document',
    FILES_INFO: (bucket, fileName) => `/files/${bucket}/${fileName}/info`,
    FILES_DOWNLOAD: (bucket, fileName) => `/files/${bucket}/${fileName}/download`,
    FILES_LIST: (bucket) => `/files/${bucket}/list`,
    FILES_DELETE: (bucket, fileName) => `/files/${bucket}/${fileName}`,
    FILES_STORAGE_STATS: '/files/storage/stats',
    
    // Dashboard endpoints
    DASHBOARD: '/dashboard',
  },
  
  // Default headers
  HEADERS: {
    'Content-Type': 'application/json',
  },
};

export default API_CONFIG;