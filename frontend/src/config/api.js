// Configuración de la API
const API_CONFIG = {
  // En desarrollo, usar la ruta relativa para que funcione con el proxy de Vite
  // En producción, usar la URL completa del backend
  baseUrl: import.meta.env.MODE === 'development' 
    ? '/api' 
    : import.meta.env.VITE_API_URL || 'http://localhost:3002/api',
  
  // Definir todos los endpoints de la API
  ENDPOINTS: {
    // Auth endpoints
    AUTH_LOGIN: '/auth/login',
    AUTH_GOOGLE: '/auth/google',
    AUTH_VERIFY: '/auth/verify-token',
    AUTH_LOGOUT: '/auth/logout',
    AUTH_REFRESH: '/auth/refresh',
    AUTH_PROFILE: '/auth/profile',
    
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
    REPORTS_EXPORT: '/reports/export',
    REPORTS_MY: '/reports/my',
    REPORTS_ASSIGNED: '/reports/assigned',
    REPORTS_BY_EQUIPMENT: (areaKey) => `/reports/equipment/${areaKey}`,
    
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
    
    // Pending activities endpoints
    PENDING_ACTIVITIES: '/pending',
    MY_PENDING_ACTIVITIES: '/my-pending/my',
    MY_PENDING_COMPLETE: (id) => `/my-pending/my/${id}/complete`,
    
    // Profile endpoints
    PROFILE: '/profile',
    PROFILE_COMPLETE: '/profile/complete'
  }
};

export default API_CONFIG;