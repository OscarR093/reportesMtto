import { userService } from '../services/userService.js';
import { authService } from '../services/authService.js';
import User from '../models/User.js';

class UserController {
  /**
   * Helper para cargar el usuario completo desde la BD
   */
  async _loadCurrentUser(req) {
    if (!req.user || !req.user.id) {
      return null;
    }
    return await User.findByPk(req.user.id);
  }

  /**
   * Obtener usuarios pendientes (solo administradores)
   */
  getPendingUsers = async (req, res, next) => {
    try {
      // Cargar el usuario completo desde la BD
      const currentUser = await this._loadCurrentUser(req);
      
      if (!currentUser) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      if (!currentUser.canManageUsers()) {
        return res.status(403).json({
          success: false,
          message: 'No autorizado para ver usuarios pendientes'
        });
      }

      const pendingUsers = await userService.getPendingUsers();

      res.json({
        success: true,
        message: 'Usuarios pendientes obtenidos exitosamente',
        data: {
          users: pendingUsers.map(user => user.toSafeJSON()),
          count: pendingUsers.length
        }
      });

    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtener todos los usuarios activos (solo administradores)
   */
  getActiveUsers = async (req, res, next) => {
    try {
      // Cargar el usuario completo desde la BD
      const currentUser = await this._loadCurrentUser(req);
      
      if (!currentUser) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      if (!currentUser.canManageUsers()) {
        return res.status(403).json({
          success: false,
          message: 'No autorizado para ver usuarios'
        });
      }

      const activeUsers = await userService.getActiveUsers();

      res.json({
        success: true,
        message: 'Usuarios activos obtenidos exitosamente',
        data: {
          users: activeUsers.map(user => user.toSafeJSON()),
          count: activeUsers.length
        }
      });

    } catch (error) {
      next(error);
    }
  };

  /**
   * Completar registro de usuario (cuando proporciona displayName)
   */
  completeRegistration = async (req, res, next) => {
    try {
      const { displayName, employeeId, department, position, phone } = req.body;
      const userId = req.user.id;

      if (!displayName) {
        return res.status(400).json({
          success: false,
          message: 'El nombre para identificarse es requerido'
        });
      }

      const user = await userService.completeUserRegistration(userId, {
        displayName,
        employeeId,
        department,
        position,
        phone
      });

      res.json({
        success: true,
        message: 'Registro completado exitosamente',
        data: {
          user: user.toSafeJSON()
        }
      });

    } catch (error) {
      next(error);
    }
  };

  /**
   * Aprobar usuario pendiente (solo administradores)
   */
  approveUser = async (req, res, next) => {
    try {
      const { userId } = req.params;

      // Cargar el usuario completo desde la BD
      const currentUser = await this._loadCurrentUser(req);
      
      if (!currentUser) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      if (!currentUser.canManageUsers()) {
        return res.status(403).json({
          success: false,
          message: 'No autorizado para aprobar usuarios'
        });
      }

      const user = await userService.approveUser(userId, req.user.id);

      res.json({
        success: true,
        message: 'Usuario aprobado exitosamente',
        data: {
          user: user.toSafeJSON()
        }
      });

    } catch (error) {
      next(error);
    }
  };

  /**
   * Rechazar usuario pendiente (solo administradores)
   */
  rejectUser = async (req, res, next) => {
    try {
      const { userId } = req.params;
      const { reason } = req.body;

      if (!req.user || !req.user.canManageUsers?.()) {
        return res.status(403).json({
          success: false,
          message: 'No autorizado para rechazar usuarios'
        });
      }

      const user = await userService.rejectUser(userId, req.user.id, reason);

      res.json({
        success: true,
        message: 'Usuario rechazado exitosamente',
        data: {
          user: user.toSafeJSON()
        }
      });

    } catch (error) {
      next(error);
    }
  };

  /**
   * Cambiar rol de usuario (solo superadmin)
   */
  changeUserRole = async (req, res, next) => {
    try {
      const { userId } = req.params;
      const { role } = req.body;

      if (!req.user || !req.user.canGrantAdminRights?.()) {
        return res.status(403).json({
          success: false,
          message: 'Solo el superadministrador puede cambiar roles'
        });
      }

      const user = await userService.changeUserRole(userId, role, req.user.id);

      res.json({
        success: true,
        message: 'Rol de usuario actualizado exitosamente',
        data: {
          user: user.toSafeJSON()
        }
      });

    } catch (error) {
      next(error);
    }
  };

  /**
   * Desactivar usuario (solo administradores)
   */
  deactivateUser = async (req, res, next) => {
    try {
      const { userId } = req.params;

      if (!req.user || !req.user.canManageUsers?.()) {
        return res.status(403).json({
          success: false,
          message: 'No autorizado para desactivar usuarios'
        });
      }

      const user = await userService.deactivateUser(userId, req.user.id);

      res.json({
        success: true,
        message: 'Usuario desactivado exitosamente',
        data: {
          user: user.toSafeJSON()
        }
      });

    } catch (error) {
      next(error);
    }
  };

  /**
   * Actualizar perfil de usuario
   */
  updateProfile = async (req, res, next) => {
    try {
      const { department, position, phone, displayName } = req.body;
      const userId = req.user.id;

      // Solo permitir ciertos campos para actualización
      const allowedUpdates = {
        department,
        position,
        phone,
        display_name: displayName
      };

      // Filtrar campos undefined
      const updates = Object.fromEntries(
        Object.entries(allowedUpdates).filter(([_, value]) => value !== undefined)
      );

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      await user.update(updates);

      res.json({
        success: true,
        message: 'Perfil actualizado exitosamente',
        data: {
          user: user.toSafeJSON()
        }
      });

    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtener estadísticas de usuarios (solo administradores)
   */
  getUserStats = async (req, res, next) => {
    try {
      if (!req.user || !req.user.canManageUsers?.()) {
        return res.status(403).json({
          success: false,
          message: 'No autorizado para ver estadísticas'
        });
      }

      const [pending, active, admins] = await Promise.all([
        userService.getPendingUsers(),
        userService.getActiveUsers(),
        User.findAdmins()
      ]);

      res.json({
        success: true,
        message: 'Estadísticas obtenidas exitosamente',
        data: {
          stats: {
            pending: pending.length,
            active: active.length,
            admins: admins.length,
            total: pending.length + active.length
          }
        }
      });

    } catch (error) {
      next(error);
    }
  };
}

export const userController = new UserController();
