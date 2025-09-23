import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import User from '../models/User.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Token de acceso requerido',
      data: {
        isAuthenticated: false
      }
    });
  }

  jwt.verify(token, config.jwt.secret, async (err, tokenUser) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        message: 'Token inválido o expirado',
        data: {
          isAuthenticated: false,
          error: err.name
        }
      });
    }
    
    try {
      // Cargar información completa del usuario desde la base de datos
      const fullUser = await User.findByPk(tokenUser.id);
      
      if (!fullUser) {
        return res.status(403).json({
          success: false,
          message: 'Usuario no encontrado',
          data: {
            isAuthenticated: false
          }
        });
      }

      req.user = fullUser; // Mantener la instancia del modelo
      next();
    } catch (error) {
      console.error('Error cargando usuario:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  });
};

export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, config.jwt.secret, async (err, tokenUser) => {
      if (!err && tokenUser) {
        try {
          const fullUser = await User.findByPk(tokenUser.id);
          if (fullUser) {
            req.user = fullUser; // Mantener la instancia del modelo
          }
        } catch (error) {
          console.error('Error cargando usuario en optionalAuth:', error);
        }
      }
    });
  }
  
  next();
};

// Middleware para validar que el usuario sea el propietario del recurso
export const validateOwnership = (req, res, next) => {
  const { userId } = req.params;
  
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Usuario no autenticado'
    });
  }

  if (req.user.id !== userId) {
    return res.status(403).json({
      success: false,
      message: 'No autorizado para acceder a este recurso'
    });
  }

  next();
};

// Middleware para requerir rol de administrador
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Usuario no autenticado'
    });
  }

  if (!req.user.isAdmin()) {
    return res.status(403).json({
      success: false,
      message: 'Se requiere rol de administrador'
    });
  }

  next();
};
