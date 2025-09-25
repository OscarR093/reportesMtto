import pendingService from '../services/pendingService.js';

class PendingController {
  /**
   * Crear nueva actividad pendiente
   */
  async createPendingActivity(req, res, next) {
    try {
      const activityData = req.body;
      const user = req.user;

      // Validar datos requeridos
      if (!activityData.equipment_area) {
        return res.status(400).json({
          success: false,
          error: 'El área del equipo es requerida'
        });
      }

      if (!activityData.description) {
        return res.status(400).json({
          success: false,
          error: 'La descripción de la actividad es requerida'
        });
      }

      const activity = await pendingService.createPendingActivity(activityData, user);
      
      res.status(201).json({
        success: true,
        data: activity,
        message: 'Actividad pendiente creada exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener lista de actividades pendientes
   */
  async getPendingActivities(req, res, next) {
    try {
      const user = req.user;
      
      // Solo administradores pueden ver todas las actividades
      if (!user.isAdmin()) {
        return res.status(403).json({
          success: false,
          error: 'No autorizado'
        });
      }

      const result = await pendingService.getPendingActivities();
      
      res.status(200).json({
        success: true,
        data: result.activities,
        message: 'Actividades pendientes obtenidas exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualizar una actividad pendiente
   */
  async updatePendingActivity(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const user = req.user;

      const activity = await pendingService.updatePendingActivity(id, updateData, user);
      
      res.status(200).json({
        success: true,
        data: activity,
        message: 'Actividad pendiente actualizada exitosamente'
      });
    } catch (error) {
      if (error.message === 'Actividad no encontrada') {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }
      
      if (error.message === 'Solo los administradores pueden actualizar actividades pendientes') {
        return res.status(403).json({
          success: false,
          error: error.message
        });
      }
      
      next(error);
    }
  }

  /**
   * Eliminar una actividad pendiente
   */
  async deletePendingActivity(req, res, next) {
    try {
      const { id } = req.params;
      const user = req.user;

      const result = await pendingService.deletePendingActivity(id, user);
      
      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      if (error.message === 'Actividad no encontrada') {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }
      
      if (error.message === 'Solo los administradores pueden eliminar actividades pendientes') {
        return res.status(403).json({
          success: false,
          error: error.message
        });
      }
      
      next(error);
    }
  }

  /**
   * Asignar una actividad pendiente a usuarios
   */
  async assignPendingActivity(req, res, next) {
    try {
      const { id } = req.params;
      const assignData = req.body;
      const user = req.user;

      const activity = await pendingService.assignPendingActivity(id, assignData, user);
      
      res.status(200).json({
        success: true,
        data: activity,
        message: 'Actividad asignada exitosamente'
      });
    } catch (error) {
      if (error.message === 'Actividad no encontrada') {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }
      
      if (error.message === 'Solo los administradores pueden asignar actividades pendientes') {
        return res.status(403).json({
          success: false,
          error: error.message
        });
      }
      
      if (error.message === 'Debe asignar la actividad a al menos un usuario' ||
          error.message === 'La fecha programada es requerida' ||
          error.message === 'El turno es requerido' ||
          error.message === 'Algunos usuarios asignados no existen o no están activos') {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }
      
      next(error);
    }
  }

  /**
   * Obtener usuarios activos para asignación
   */
  async getActiveUsersForAssignment(req, res, next) {
    try {
      const users = await pendingService.getActiveUsersForAssignment();
      
      res.status(200).json({
        success: true,
        data: users,
        message: 'Usuarios obtenidos exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Exportar actividades asignadas a Excel
   */
  async exportAssignedActivities(req, res, next) {
    try {
      const user = req.user;
      
      // Solo administradores pueden exportar
      if (!user.isAdmin()) {
        return res.status(403).json({
          success: false,
          error: 'No autorizado'
        });
      }

      const excelBuffer = await pendingService.exportAssignedActivitiesToExcel();
      
      // Configurar headers para descarga
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=actividades_asignadas.xlsx');
      
      // Enviar el archivo Excel
      res.send(excelBuffer);
    } catch (error) {
      next(error);
    }
  }
}

export default new PendingController();