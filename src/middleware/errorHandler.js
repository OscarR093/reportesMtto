export const errorHandler = (error, req, res, next) => {
  console.error('Error del servidor:', error);

  // Error de JWT
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token inválido',
      data: {
        error: 'invalid_token'
      }
    });
  }

  // Error de expiración de JWT
  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expirado',
      data: {
        error: 'token_expired'
      }
    });
  }

  // Error de validación
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Datos inválidos',
      data: {
        error: 'validation_error',
        details: error.details
      }
    });
  }

  // Error de CORS
  if (error.message && error.message.includes('CORS')) {
    return res.status(403).json({
      success: false,
      message: 'Error de CORS',
      data: {
        error: 'cors_error'
      }
    });
  }

  // Error por defecto
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Error interno del servidor',
    data: {
      error: 'internal_server_error',
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    }
  });
};

export const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} no encontrado`,
    data: {
      error: 'endpoint_not_found',
      availableEndpoints: {
        auth: '/api/auth/*',
        health: '/api/health'
      }
    }
  });
};
