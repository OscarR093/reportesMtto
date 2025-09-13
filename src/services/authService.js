import jwt from 'jsonwebtoken';
import config from '../config/index.js';

class AuthService {
  /**
   * Genera un token JWT para un usuario
   * @param {Object} user - Datos del usuario
   * @returns {String} Token JWT
   */
  generateToken = (user) => {
    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      provider: user.provider || 'google'
    };

    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
      issuer: 'reportesMtto-api',
      audience: 'reportesMtto-client'
    });
  };

  /**
   * Verifica un token JWT
   * @param {String} token - Token a verificar
   * @returns {Object} Datos del usuario decodificados
   */
  verifyToken = (token) => {
    try {
      return jwt.verify(token, config.jwt.secret);
    } catch (error) {
      throw new Error('Token inválido o expirado');
    }
  };

  /**
   * Decodifica un token sin verificar (para debugging)
   * @param {String} token - Token a decodificar
   * @returns {Object} Datos decodificados
   */
  decodeToken = (token) => {
    return jwt.decode(token);
  };

  /**
   * Verifica si un token está próximo a expirar
   * @param {String} token - Token a verificar
   * @returns {Boolean} True si expira en menos de 1 hora
   */
  isTokenExpiringSoon = (token) => {
    try {
      const decoded = this.decodeToken(token);
      const now = Math.floor(Date.now() / 1000);
      const expiresIn = decoded.exp - now;
      return expiresIn < 3600; // Menos de 1 hora
    } catch (error) {
      return true;
    }
  };

  /**
   * Extrae el token del header Authorization
   * @param {String} authHeader - Header de autorización
   * @returns {String|null} Token extraído o null
   */
  extractTokenFromHeader = (authHeader) => {
    if (!authHeader) return null;
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
    return parts[1];
  };

  /**
   * Genera un payload estándar para respuestas de autenticación
   * @param {Object} user - Datos del usuario
   * @param {String} token - Token JWT
   * @returns {Object} Payload estandarizado
   */
  generateAuthResponse = (user, token) => {
    return {
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          photo: user.photo,
          provider: user.provider
        },
        expiresIn: config.jwt.expiresIn
      }
    };
  };
}

export const authService = new AuthService();
