import jwt from 'jsonwebtoken';
import config from '../config/index.js';

export const authenticateToken = (req, res, next) => {
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

  jwt.verify(token, config.jwt.secret, (err, user) => {
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
    
    req.user = user;
    next();
  });
};

export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, config.jwt.secret, (err, user) => {
      if (!err) {
        req.user = user;
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
