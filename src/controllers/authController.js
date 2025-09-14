import { authService } from '../services/authService.js';
import { userService } from '../services/userService.js';
import User from '../models/User.js';
import { Op } from 'sequelize';
import bcrypt from 'bcryptjs';
import minioService from '../services/minioService.js';

class AuthController {
  /**
   * Login tradicional usando número de empleado y contraseña
   */
  login = async (req, res, next) => {
    try {
      const { employee_id, password } = req.body;

      console.log('🔐 Intento de login tradicional para empleado:', employee_id);

      // Validar campos requeridos
      if (!employee_id || !password) {
        return res.status(400).json({
          success: false,
          message: 'Número de empleado y contraseña son requeridos'
        });
      }

      // Buscar usuario por número de empleado
      const user = await User.findOne({
        where: { 
          employee_id: employee_id,
          status: 'active'
        }
      });

      if (!user) {
        console.log('❌ Usuario no encontrado o inactivo:', employee_id);
        return res.status(401).json({
          success: false,
          message: 'Número de empleado o contraseña incorrectos'
        });
      }

      // Verificar que el usuario tenga contraseña configurada
      if (!user.password) {
        console.log('❌ Usuario sin contraseña configurada:', employee_id);
        return res.status(401).json({
          success: false,
          message: 'Este usuario no tiene contraseña configurada. Use Google OAuth para acceder.'
        });
      }

      // Verificar contraseña
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        console.log('❌ Contraseña incorrecta para:', employee_id);
        return res.status(401).json({
          success: false,
          message: 'Número de empleado o contraseña incorrectos'
        });
      }

      // Actualizar último login
      await user.update({ last_login: new Date() });

      // Generar token JWT
      const tokenPayload = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status
      };

      const token = authService.generateToken(tokenPayload);

      console.log('✅ Login exitoso para empleado:', employee_id);

      res.json({
        success: true,
        message: 'Login exitoso',
        token,
        user: {
          id: user.id,
          name: user.name,
          displayName: user.display_name,
          email: user.email,
          photo: user.photo,
          role: user.role,
          status: user.status,
          department: user.department,
          position: user.position,
          phone: user.phone,
          employeeId: user.employee_id,
          firstTime: user.firstTime || false
        }
      });

    } catch (error) {
      console.error('❌ Error en login tradicional:', error);
      next(error);
    }
  };

  /**
   * Callback de OAuth exitoso - Maneja lógica de usuarios
   */
  oauthCallback = async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(400).json({
          success: false,
          message: 'No se pudo obtener información del usuario'
        });
      }

      console.log('Usuario OAuth recibido:', req.user);
      
      // Buscar o crear usuario en la base de datos
      const { user, isNew, isSuperAdmin } = await userService.findOrCreateFromOAuth(req.user);
      
      // Verificar acceso del usuario
      const accessCheck = userService.checkUserAccess(user);
      
      if (!accessCheck.hasAccess) {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
        const redirectUrl = `${frontendUrl}/auth/callback?error=access_denied&message=${encodeURIComponent(accessCheck.message)}`;
        return res.redirect(redirectUrl);
      }

      // Generar token JWT con datos del usuario de la DB
      const tokenPayload = {
        id: user.id,
        email: user.email,
        name: user.name,
        googleId: user.google_id,
        role: user.role,
        status: user.status,
        canManageUsers: user.canManageUsers(),
        canGrantAdminRights: user.canGrantAdminRights()
      };

      const token = authService.generateToken(tokenPayload);

      // En lugar de devolver JSON, redirigir al frontend con el token
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
      const redirectUrl = `${frontendUrl}/auth/callback?token=${token}&success=true`;
      
      res.redirect(redirectUrl);

    } catch (error) {
      console.error('Error en OAuth callback:', error);
      next(error);
    }
  };

  /**
   * Verificar token JWT
   */
  verifyToken = async (req, res, next) => {
    try {
      console.log('🔍 Verificando token...');
      const { token } = req.body;
      
      if (!token) {
        console.log('❌ No se recibió token en el body');
        return res.status(400).json({ 
          success: false, 
          message: 'Token requerido en el body' 
        });
      }

      console.log('🎯 Token recibido:', token.substring(0, 50) + '...');
      const decoded = authService.verifyToken(token);
      console.log('✅ Token decodificado:', { id: decoded.id, email: decoded.email, role: decoded.role });
      
      // Obtener datos completos del usuario desde la base de datos
      const user = await User.findByPk(decoded.id);
      
      if (!user) {
        console.log('❌ Usuario no encontrado en DB:', decoded.id);
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      console.log('👤 Usuario encontrado:', user.email, user.role);

      res.json({ 
        success: true, 
        message: 'Token válido',
        data: {
          user: {
            id: user.id,
            name: user.name,
            displayName: user.display_name,
            email: user.email,
            photo: user.photo,
            role: user.role,
            status: user.status,
            department: user.department,
            position: user.position,
            firstTime: user.firstTime,
            permissions: {
              canManageUsers: user.canManageUsers(),
              canGrantAdminRights: user.canGrantAdminRights()
            }
          },
          expiresAt: new Date(decoded.exp * 1000).toISOString(),
          isValid: true
        }
      });

    } catch (error) {
      console.log('❌ Error verificando token:', error.message);
      res.status(401).json({ 
        success: false, 
        message: error.message,
        data: {
          isValid: false
        }
      });
    }
  };

  /**
   * Refrescar token (opcional para implementar refresh tokens)
   */
  refreshToken = async (req, res, next) => {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token requerido'
        });
      }

      // Aquí implementarías la lógica de refresh token
      // Por ahora retornamos error no implementado
      res.status(501).json({
        success: false,
        message: 'Refresh token no implementado aún'
      });

    } catch (error) {
      next(error);
    }
  };

  /**
   * Logout - Invalidar sesión
   */
  logout = async (req, res, next) => {
    try {
      req.logout((err) => {
        if (err) {
          return next(err);
        }
        
        res.json({ 
          success: true, 
          message: 'Logout exitoso',
          data: {
            loggedOut: true
          }
        });
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtener perfil del usuario autenticado
   */
  getProfile = async (req, res, next) => {
    try {
      const user = req.user;
      res.json({
        success: true,
        message: 'Perfil obtenido exitosamente',
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          employeeId: user.employee_id, // Mapear employee_id a employeeId
          phone: user.phone,
          department: user.department,
          position: user.position,
          role: user.role,
          status: user.status,
          photo: user.photo,
          authProvider: user.auth_provider, // Mapear auth_provider a authProvider
          firstTime: user.first_time
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Manejar error de OAuth - Respuesta JSON
   */
  oauthError = (req, res) => {
    console.log('OAuth falló');
    res.status(401).json({
      success: false,
      message: 'Error en la autenticación con Google',
      data: {
        error: 'oauth_failed'
      }
    });
  };

  /**
   * Actualizar perfil de usuario
   */
  updateProfile = async (req, res) => {
    try {
      const userId = req.user.id;
      const { name, employeeId, phone, department, position } = req.body;

      console.log('📝 Actualizando perfil para usuario:', userId);

      // Validaciones básicas
      if (!name || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: 'El nombre es obligatorio'
        });
      }

      if (!employeeId || !employeeId.trim()) {
        return res.status(400).json({
          success: false,
          message: 'El ID de empleado es obligatorio'
        });
      }

      // Verificar que el ID de empleado no esté en uso por otro usuario
      const existingUser = await User.findOne({
        where: { 
          employee_id: employeeId.trim(),
          id: { [Op.ne]: userId } // Excluir el usuario actual
        }
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'El ID de empleado ya está en uso por otro usuario'
        });
      }

      // Actualizar usuario
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      await user.update({
        name: name.trim(),
        employee_id: employeeId.trim(),
        phone: phone && phone.trim() ? phone.trim() : null,
        department: department && department.trim() ? department.trim() : null,
        position: position && position.trim() ? position.trim() : null
      });

      // Recargar usuario actualizado
      await user.reload();

      console.log('✅ Perfil actualizado exitosamente para:', userId);

      res.json({
        success: true,
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          employeeId: user.employee_id, // Mapear employee_id a employeeId
          phone: user.phone,
          department: user.department,
          position: user.position,
          role: user.role,
          status: user.status,
          photo: user.photo,
          authProvider: user.auth_provider // Mapear auth_provider a authProvider
        }
      });
    } catch (error) {
      console.error('❌ Error actualizando perfil:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al actualizar el perfil'
      });
    }
  };

  /**
   * Cambiar contraseña de usuario
   */
  changePassword = async (req, res) => {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;

      console.log('🔒 Cambiando contraseña para usuario:', userId);

      // Validaciones básicas
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Contraseña actual y nueva contraseña son obligatorias'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'La nueva contraseña debe tener al menos 6 caracteres'
        });
      }

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      // Verificar que el usuario no sea de Google OAuth
      if (user.auth_provider === 'google') {
        return res.status(400).json({
          success: false,
          message: 'Los usuarios de Google OAuth no pueden cambiar su contraseña'
        });
      }

      // Verificar que el usuario tenga contraseña actual
      if (!user.password) {
        return res.status(400).json({
          success: false,
          message: 'Usuario sin contraseña configurada'
        });
      }

      // Verificar contraseña actual
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'La contraseña actual es incorrecta'
        });
      }

      // Verificar que la nueva contraseña sea diferente
      const isSamePassword = await bcrypt.compare(newPassword, user.password);
      if (isSamePassword) {
        return res.status(400).json({
          success: false,
          message: 'La nueva contraseña debe ser diferente a la actual'
        });
      }

      // Hashear nueva contraseña
      const saltRounds = 12;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // Actualizar contraseña
      await user.update({
        password: hashedNewPassword
      });

      console.log('✅ Contraseña cambiada exitosamente para:', userId);

      res.json({
        success: true,
        message: 'Contraseña cambiada exitosamente'
      });
    } catch (error) {
      console.error('❌ Error cambiando contraseña:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al cambiar la contraseña'
      });
    }
  };

  /**
   * Subir foto de perfil
   */
  uploadPhoto = async (req, res) => {
    try {
      const userId = req.user.id;

      console.log('📸 Subiendo foto para usuario:', userId);

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se ha proporcionado ningún archivo'
        });
      }

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      // Validar tipo de archivo
      if (!minioService.isValidAvatarFile(req.file.originalname)) {
        return res.status(400).json({
          success: false,
          message: 'Tipo de archivo no válido. Solo se permiten imágenes (JPG, PNG, GIF, WebP)'
        });
      }

      // Subir archivo a MinIO
      const uploadResult = await minioService.uploadAvatar(
        req.file.buffer,
        userId,
        req.file.originalname
      );

      // Si el usuario tenía una foto anterior, intentar eliminarla
      if (user.photo && user.photo.includes('minio')) {
        try {
          // Extraer el nombre del archivo de la URL anterior
          const oldFileName = user.photo.split('/').pop();
          await minioService.deleteFile('avatars', oldFileName);
        } catch (deleteError) {
          console.warn('⚠️  No se pudo eliminar la foto anterior:', deleteError.message);
        }
      }

      // Actualizar URL de la foto en la base de datos
      await user.update({
        photo: uploadResult.url
      });

      console.log('✅ Foto subida exitosamente para:', userId);

      res.json({
        success: true,
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          employeeId: user.employee_id, // Mapear employee_id a employeeId
          phone: user.phone,
          department: user.department,
          position: user.position,
          role: user.role,
          status: user.status,
          photo: user.photo,
          authProvider: user.auth_provider // Mapear auth_provider a authProvider
        },
        message: 'Foto de perfil actualizada exitosamente'
      });
    } catch (error) {
      console.error('❌ Error subiendo foto:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error interno del servidor al subir la foto'
      });
    }
  };

  /**
   * Endpoint de estado de autenticación
   */
  authStatus = async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
        return res.json({
          success: true,
          data: {
            isAuthenticated: false,
            user: null
          }
        });
      }

      try {
        const decoded = authService.verifyToken(token);
        res.json({
          success: true,
          data: {
            isAuthenticated: true,
            user: decoded
          }
        });
      } catch (error) {
        res.json({
          success: true,
          data: {
            isAuthenticated: false,
            user: null,
            tokenError: error.message
          }
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error verificando estado de autenticación'
      });
    }
  };
}

export const authController = new AuthController();
