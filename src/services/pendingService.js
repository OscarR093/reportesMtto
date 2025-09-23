import models from '../models/index.js';
import User from '../models/User.js';
import Pending from '../models/Pending.js';
import equipmentService from './equipmentService.js';

class PendingService {
  /**
   * Crear nueva actividad pendiente
   */
  async createPendingActivity(activityData, user) {
    // Verificar que el usuario sea administrador
    if (!user.isAdmin()) {
      throw new Error('Solo los administradores pueden crear actividades pendientes');
    }

    // Validar equipo si se proporcionó
    if (activityData.equipment_area) {
      const isValidEquipment = await equipmentService.validateEquipmentPath(
        activityData.equipment_area,
        activityData.equipment_machine,
        activityData.equipment_element
      );

      if (!isValidEquipment) {
        throw new Error('La ruta del equipo especificada no es válida');
      }

      // Obtener la ruta completa del equipo
      const equipmentPath = await equipmentService.getEquipmentPath(
        activityData.equipment_area,
        activityData.equipment_machine,
        activityData.equipment_element
      );

      activityData.equipment_path = equipmentPath.path;
      activityData.equipment_display = equipmentPath.display;
    }

    // Preparar datos de la actividad
    const pendingData = {
      ...activityData,
      created_by: user.id,
      status: 'pendiente'
    };

    // Crear la actividad pendiente
    const activity = await Pending.create(pendingData);
    
    // Cargar datos del creador
    const creator = await User.findByPk(user.id, {
      attributes: ['id', 'name', 'email']
    });
    
    // Asegurarnos de que las fechas estén incluidas
    const activityJSON = activity.toSafeJSON();
    
    return {
      ...activityJSON,
      Creator: creator ? creator.toSafeJSON() : null
    };
  }

  /**
   * Obtener lista de actividades pendientes
   */
  async getPendingActivities() {
    const activities = await Pending.findAll({
      order: [['created_at', 'DESC']],
      include: [
        {
          model: User,
          as: 'Creator',
          attributes: ['id', 'name', 'email']
        }
      ]
    });
    
    // Convertir resultados a JSON seguro
    const activitiesList = activities.map(activity => activity.toSafeJSON());
    
    return {
      activities: activitiesList
    };
  }

  /**
   * Actualizar una actividad pendiente
   */
  async updatePendingActivity(id, updateData, user) {
    // Verificar que el usuario sea administrador
    if (!user.isAdmin()) {
      throw new Error('Solo los administradores pueden actualizar actividades pendientes');
    }

    // Buscar la actividad
    const activity = await Pending.findByPk(id);
    if (!activity) {
      throw new Error('Actividad no encontrada');
    }

    // Validar equipo si se proporcionó
    if (updateData.equipment_area) {
      const isValidEquipment = await equipmentService.validateEquipmentPath(
        updateData.equipment_area,
        updateData.equipment_machine,
        updateData.equipment_element
      );

      if (!isValidEquipment) {
        throw new Error('La ruta del equipo especificada no es válida');
      }

      // Obtener la ruta completa del equipo
      const equipmentPath = await equipmentService.getEquipmentPath(
        updateData.equipment_area,
        updateData.equipment_machine,
        updateData.equipment_element
      );

      updateData.equipment_path = equipmentPath.path;
      updateData.equipment_display = equipmentPath.display;
    }

    // Actualizar solo los campos permitidos
    const allowedFields = ['equipment_area', 'equipment_machine', 'equipment_element', 
                          'equipment_path', 'equipment_display', 'description'];
    const filteredData = {};
    
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    });

    // Actualizar la actividad
    await activity.update(filteredData);
    
    // Devolver la actividad actualizada
    return activity.toSafeJSON();
  }

  /**
   * Eliminar una actividad pendiente
   */
  async deletePendingActivity(id, user) {
    // Verificar que el usuario sea administrador
    if (!user.isAdmin()) {
      throw new Error('Solo los administradores pueden eliminar actividades pendientes');
    }

    // Buscar la actividad
    const activity = await Pending.findByPk(id);
    if (!activity) {
      throw new Error('Actividad no encontrada');
    }

    // Eliminar la actividad
    await activity.destroy();
    
    return { message: 'Actividad eliminada exitosamente' };
  }

  /**
   * Asignar una actividad pendiente a usuarios
   */
  async assignPendingActivity(id, assignData, user) {
    // Verificar que el usuario sea administrador
    if (!user.isAdmin()) {
      throw new Error('Solo los administradores pueden asignar actividades pendientes');
    }

    // Buscar la actividad
    const activity = await Pending.findByPk(id);
    if (!activity) {
      throw new Error('Actividad no encontrada');
    }

    // Validar datos de asignación
    if (!assignData.assigned_users || assignData.assigned_users.length === 0) {
      throw new Error('Debe asignar la actividad a al menos un usuario');
    }

    if (!assignData.scheduled_date) {
      throw new Error('La fecha programada es requerida');
    }

    if (!assignData.shift) {
      throw new Error('El turno es requerido');
    }

    // Verificar que los usuarios asignados existan y estén activos
    const assignedUserIds = assignData.assigned_users;
    const users = await User.findAll({
      where: {
        id: assignedUserIds,
        status: 'active'
      }
    });

    if (users.length !== assignedUserIds.length) {
      throw new Error('Algunos usuarios asignados no existen o no están activos');
    }

    // Preparar datos para actualizar
    const updateData = {
      assigned_to: assignedUserIds[0], // Primer usuario asignado como referencia principal
      assigned_users: JSON.stringify(assignedUserIds),
      scheduled_date: new Date(assignData.scheduled_date),
      shift: assignData.shift,
      status: 'asignado'
    };

    // Actualizar la actividad
    await activity.update(updateData);
    
    // Devolver la actividad actualizada con información de usuarios asignados
    const activityJSON = activity.toSafeJSON();
    
    return {
      ...activityJSON,
      assigned_users_info: users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        display_name: user.display_name
      }))
    };
  }

  /**
   * Obtener usuarios activos para asignación
   */
  async getActiveUsersForAssignment() {
    const users = await User.findActiveUsers();
    return users.map(user => user.toSafeJSON());
  }
}

export default new PendingService();