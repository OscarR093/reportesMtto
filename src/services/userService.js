import User from '../models/User.js';
import config from '../config/index.js';

class UserService {
  /**
   * Crear o encontrar usuario por datos de OAuth
   * @param {Object} oauthData - Datos del OAuth de Google
   * @returns {Object} Usuario y si es nuevo
   */
  findOrCreateFromOAuth = async (oauthData) => {
    try {
      const { id: googleId, email, name, photo } = oauthData;
      
      // Buscar usuario existente por Google ID
      let user = await User.findByGoogleId(googleId);
      
      if (user) {
        // Actualizar último login
        await user.update({ last_login: new Date() });
        return { user, isNew: false };
      }

      // Buscar por email (por si cambió el Google ID)
      user = await User.findByEmail(email);
      
      if (user) {
        // Actualizar Google ID y último login
        await user.update({ 
          google_id: googleId,
          last_login: new Date()
        });
        return { user, isNew: false };
      }

      // Determinar si es superadministrador
      const isSuperAdmin = email === config.superAdmin.email;
      
      // Crear nuevo usuario
      user = await User.create({
        google_id: googleId,
        email,
        name,
        photo,
        status: isSuperAdmin ? 'active' : 'pending',
        role: isSuperAdmin ? 'super_admin' : 'user',
        last_login: new Date(),
        ...(isSuperAdmin && {
          approved_at: new Date(),
          approved_by: null // Se auto-aprueba
        })
      });

      return { user, isNew: true, isSuperAdmin };
      
    } catch (error) {
      console.error('Error en findOrCreateFromOAuth:', error);
      throw new Error('Error al procesar usuario de OAuth');
    }
  };

  /**
   * Completar registro de usuario pendiente
   * @param {String} userId - ID del usuario
   * @param {Object} userData - Datos adicionales del usuario
   * @returns {Object} Usuario actualizado
   */
  completeUserRegistration = async (userId, userData) => {
    try {
      const { displayName, employeeId, department, position, phone } = userData;
      
      const user = await User.findByPk(userId);
      
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      if (user.status !== 'pending') {
        throw new Error('El usuario no está en estado pendiente');
      }

      // Actualizar datos del usuario
      await user.update({
        display_name: displayName,
        employee_id: employeeId,
        department,
        position,
        phone
      });

      return user;
      
    } catch (error) {
      console.error('Error en completeUserRegistration:', error);
      throw error;
    }
  };

  /**
   * Aprobar solicitud de usuario
   * @param {String} userId - ID del usuario a aprobar
   * @param {String} approvedById - ID del administrador que aprueba
   * @returns {Object} Usuario aprobado
   */
  approveUser = async (userId, approvedById) => {
    try {
      const user = await User.findByPk(userId);
      const approver = await User.findByPk(approvedById);
      
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      if (!approver || !approver.canManageUsers()) {
        throw new Error('No autorizado para aprobar usuarios');
      }

      if (user.status !== 'pending') {
        throw new Error('El usuario no está pendiente de aprobación');
      }

      await user.update({
        status: 'active',
        approved_by: approvedById,
        approved_at: new Date()
      });

      return user;
      
    } catch (error) {
      console.error('Error en approveUser:', error);
      throw error;
    }
  };

  /**
   * Rechazar solicitud de usuario
   * @param {String} userId - ID del usuario a rechazar
   * @param {String} rejectedById - ID del administrador que rechaza
   * @param {String} reason - Razón del rechazo
   * @returns {Object} Usuario rechazado
   */
  rejectUser = async (userId, rejectedById, reason = '') => {
    try {
      const user = await User.findByPk(userId);
      const rejector = await User.findByPk(rejectedById);
      
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      if (!rejector || !rejector.canManageUsers()) {
        throw new Error('No autorizado para rechazar usuarios');
      }

      if (user.status !== 'pending') {
        throw new Error('El usuario no está pendiente de aprobación');
      }

      await user.update({
        status: 'rejected',
        rejected_by: rejectedById,
        rejected_at: new Date(),
        rejection_reason: reason
      });

      return user;
      
    } catch (error) {
      console.error('Error en rejectUser:', error);
      throw error;
    }
  };

  /**
   * Cambiar rol de usuario (solo superadmin)
   * @param {String} userId - ID del usuario
   * @param {String} newRole - Nuevo rol
   * @param {String} changedById - ID del superadmin
   * @returns {Object} Usuario actualizado
   */
  changeUserRole = async (userId, newRole, changedById) => {
    try {
      const user = await User.findByPk(userId);
      const changer = await User.findByPk(changedById);
      
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      if (!changer || !changer.canGrantAdminRights()) {
        throw new Error('Solo el superadministrador puede cambiar roles');
      }

      if (!['user', 'admin'].includes(newRole)) {
        throw new Error('Rol inválido');
      }

      await user.update({ role: newRole });

      return user;
      
    } catch (error) {
      console.error('Error en changeUserRole:', error);
      throw error;
    }
  };

  /**
   * Desactivar usuario
   * @param {String} userId - ID del usuario
   * @param {String} deactivatedById - ID del administrador
   * @returns {Object} Usuario desactivado
   */
  deactivateUser = async (userId, deactivatedById) => {
    try {
      const user = await User.findByPk(userId);
      const deactivator = await User.findByPk(deactivatedById);
      
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      if (!deactivator || !deactivator.canManageUsers()) {
        throw new Error('No autorizado para desactivar usuarios');
      }

      if (user.isSuperAdmin()) {
        throw new Error('No se puede desactivar al superadministrador');
      }

      await user.update({ status: 'inactive' });

      return user;
      
    } catch (error) {
      console.error('Error en deactivateUser:', error);
      throw error;
    }
  };

  /**
   * Obtener usuarios pendientes
   * @returns {Array} Lista de usuarios pendientes
   */
  getPendingUsers = async () => {
    try {
      return await User.findPendingUsers();
    } catch (error) {
      console.error('Error en getPendingUsers:', error);
      throw error;
    }
  };

  /**
   * Obtener todos los usuarios activos
   * @returns {Array} Lista de usuarios activos
   */
  getActiveUsers = async () => {
    try {
      return await User.findActiveUsers();
    } catch (error) {
      console.error('Error en getActiveUsers:', error);
      throw error;
    }
  };

  /**
   * Verificar permisos de acceso
   * @param {Object} user - Usuario a verificar
   * @returns {Object} Estado de acceso
   */
  checkUserAccess = (user) => {
    if (!user) {
      return {
        hasAccess: false,
        reason: 'user_not_found',
        message: 'Usuario no encontrado'
      };
    }

    if (user.status === 'pending') {
      return {
        hasAccess: false,
        reason: 'access_pending',
        message: 'Acceso pendiente de aprobación'
      };
    }

    if (user.status === 'rejected') {
      return {
        hasAccess: false,
        reason: 'access_rejected',
        message: 'Acceso rechazado'
      };
    }

    if (user.status === 'inactive') {
      return {
        hasAccess: false,
        reason: 'account_inactive',
        message: 'Cuenta desactivada'
      };
    }

    if (user.status === 'active') {
      return {
        hasAccess: true,
        reason: 'access_granted',
        message: 'Acceso permitido'
      };
    }

    return {
      hasAccess: false,
      reason: 'unknown_status',
      message: 'Estado de usuario desconocido'
    };
  };
}

export const userService = new UserService();
