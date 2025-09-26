// Configuración de la API
const API_CONFIG = {
  // En desarrollo, usar la ruta relativa para que funcione con el proxy de Vite
  // En producción, usar la URL completa del backend
  baseUrl: import.meta.env.MODE === 'development' 
    ? '/api' 
    : import.meta.env.VITE_API_URL || 'http://localhost:3002/api'
};

export default API_CONFIG;