import models from '../models/index.js';
import User from '../models/User.js';
import Pending from '../models/Pending.js';
import equipmentService from './equipmentService.js';
import ExcelJS from 'exceljs';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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

  /**
   * Exportar actividades asignadas a Excel
   */
  async exportAssignedActivitiesToExcel() {
    // Obtener actividades asignadas con información de usuarios
    const activities = await Pending.findAll({
      where: { 
        status: 'asignado'
      },
      order: [['scheduled_date', 'ASC']],
      include: [
        {
          model: User,
          as: 'Creator',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    // Crear workbook y worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Actividades Asignadas');

    // Definir estilos para el encabezado
    const headerStyle = {
      font: { bold: true, color: { argb: 'FFFFFF' },
      size: 12 },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '4F46E5' } },
      alignment: { horizontal: 'center', vertical: 'middle' }
    };

    // Definir estilos para las filas
    const rowStyle = {
      font: { size: 11 },
      alignment: { vertical: 'middle', wrapText: true }
    };

    // Configurar columnas
    worksheet.columns = [
      { header: 'Nombre del Equipo', key: 'equipment', width: 30 },
      { header: 'Descripción de la Actividad', key: 'description', width: 45 },
      { header: 'Personal Asignado', key: 'assigned_personnel', width: 35 },
      { header: 'Fecha Programada', key: 'scheduled_date', width: 35 },
      { header: 'Turno', key: 'shift', width: 15 }
    ];

    // Aplicar estilos al encabezado
    worksheet.getRow(1).eachCell((cell) => {
      cell.style = headerStyle;
    });

    // Formatear y agregar datos
    for (const activity of activities) {
      // Obtener información de usuarios asignados
      let assignedUsers = [];
      if (activity.assigned_users) {
        try {
          const userIds = JSON.parse(activity.assigned_users);
          const users = await User.findAll({
            where: {
              id: userIds
            },
            attributes: ['id', 'name', 'display_name']
          });
          
          assignedUsers = users.map(user => user.display_name || user.name);
        } catch (error) {
          console.error('Error parsing assigned users:', error);
        }
      }

      // Formatear fecha programada con día de la semana
      let formattedDate = '';
      if (activity.scheduled_date) {
        try {
          // Extraer la fecha en formato ISO y mantenerla en la misma fecha
          const date = new Date(activity.scheduled_date);
          // Aseguramos que trabajamos con la fecha local sin alterar el día
          const year = date.getFullYear();
          const month = date.getMonth();
          const day = date.getDate();
          // Crear una nueva fecha local para evitar efectos de zona horaria
          const localDate = new Date(year, month, day);
          formattedDate = format(localDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: es });
        } catch (error) {
          console.error('Error formatting date:', error);
          formattedDate = activity.scheduled_date;
        }
      }

      // Obtener turno
      const shift = activity.shift === '1' ? 'Matutino' : activity.shift === '2' ? 'Vespertino' : activity.shift;

      worksheet.addRow({
        equipment: (activity.equipment_display || `${activity.equipment_area}${activity.equipment_machine ? ` - ${activity.equipment_machine}` : ''}`).replace(/>/g, ','),
        description: activity.description,
        assigned_personnel: assignedUsers.join(', '),
        scheduled_date: formattedDate,
        shift: shift
      });
    }

    // Aplicar estilos a las filas de datos y ajustar altura automáticamente
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) { // Saltar el encabezado
        row.eachCell((cell) => {
          cell.style = rowStyle;
        });
        // Ajustar altura automáticamente según el contenido
        row.height = 25; // Altura mínima
      }
    });

    // Ajustar altura del encabezado
    worksheet.getRow(1).height = 30;

    // Generar buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }
}

export default new PendingService();