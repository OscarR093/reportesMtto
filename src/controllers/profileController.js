import bcrypt from 'bcryptjs';
import User from '../models/User.js';

class ProfileController {
  /**
   * Completar perfil por primera vez
   */
  completeProfile = async (req, res, next) => {
    try {
      const userId = req.user.id;
      const {
        displayName,
        password,
        confirmPassword,
        employeeId,
        department,
        position,
        phone
      } = req.body;

      console.log('👤 Completando perfil para usuario:', req.user.email);

      // Validaciones
      if (!displayName || displayName.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'El nombre de visualización debe tener al menos 2 caracteres'
        });
      }

      if (password) {
        if (password.length < 6) {
          return res.status(400).json({
            success: false,
            message: 'La contraseña debe tener al menos 6 caracteres'
          });
        }

        if (password !== confirmPassword) {
          return res.status(400).json({
            success: false,
            message: 'Las contraseñas no coinciden'
          });
        }
      }

      // Verificar que el usuario existe y es su primera vez
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      if (!user.firstTime) {
        return res.status(400).json({
          success: false,
          message: 'El perfil ya ha sido completado'
        });
      }

      // Verificar que el employeeId no esté en uso por otro usuario
      if (employeeId) {
        const existingUser = await User.findOne({
          where: { 
            employee_id: employeeId,
            id: { [User.sequelize.Sequelize.Op.ne]: userId }
          }
        });

        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: 'El ID de empleado ya está en uso'
          });
        }
      }

      // Preparar datos para actualizar
      const updateData = {
        display_name: displayName.trim(),
        employee_id: employeeId || null,
        department: department || null,
        position: position || null,
        phone: phone || null,
        firstTime: false,
        last_login: new Date()
      };

      // Si se proporciona contraseña, hashearla
      if (password) {
        const saltRounds = 12;
        updateData.password = await bcrypt.hash(password, saltRounds);
      }

      // Actualizar usuario
      await user.update(updateData);

      console.log('✅ Perfil completado para:', user.email);

      res.json({
        success: true,
        message: 'Perfil completado exitosamente',
        data: {
          user: {
            id: user.id,
            name: user.name,
            displayName: updateData.display_name,
            email: user.email,
            photo: user.photo,
            role: user.role,
            status: user.status,
            department: updateData.department,
            position: updateData.position,
            phone: updateData.phone,
            employeeId: updateData.employee_id,
            firstTime: false
          }
        }
      });

    } catch (error) {
      console.error('❌ Error completando perfil:', error);
      next(error);
    }
  };

  /**
   * Obtener perfil del usuario
   */
  getProfile = async (req, res, next) => {
    try {
      const userId = req.user.id;
      
      const user = await User.findByPk(userId, {
        attributes: { exclude: ['password'] }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Perfil obtenido exitosamente',
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
            phone: user.phone,
            employeeId: user.employee_id,
            firstTime: user.firstTime,
            createdAt: user.created_at,
            lastLogin: user.last_login
          }
        }
      });

    } catch (error) {
      console.error('❌ Error obteniendo perfil:', error);
      next(error);
    }
  };

  /**
   * Actualizar perfil del usuario
   */
  updateProfile = async (req, res, next) => {
    try {
      const userId = req.user.id;
      const {
        displayName,
        department,
        position,
        phone
      } = req.body;

      console.log('🔄 Actualizando perfil para usuario:', req.user.email);

      // Validaciones
      if (displayName && displayName.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'El nombre de visualización debe tener al menos 2 caracteres'
        });
      }

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      // Preparar datos para actualizar
      const updateData = {};
      if (displayName !== undefined) updateData.display_name = displayName.trim();
      if (department !== undefined) updateData.department = department || null;
      if (position !== undefined) updateData.position = position || null;
      if (phone !== undefined) updateData.phone = phone || null;

      // Actualizar usuario
      await user.update(updateData);

      console.log('✅ Perfil actualizado para:', user.email);

      res.json({
        success: true,
        message: 'Perfil actualizado exitosamente',
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
            phone: user.phone,
            employeeId: user.employee_id,
            firstTime: user.firstTime
          }
        }
      });

    } catch (error) {
      console.error('❌ Error actualizando perfil:', error);
      next(error);
    }
  };
}

export default new ProfileController();
