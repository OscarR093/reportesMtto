import { Sequelize } from 'sequelize';
import User from '../models/User.js';
import Pending from '../models/Pending.js';

class MyPendingActivitiesService {
  /**
   * Obtener actividades pendientes asignadas al usuario actual
   */
  async getMyPendingActivities(user) {
    // Buscar actividades pendientes asignadas al usuario
    // Se consideran actividades del usuario si está en el campo assigned_to o en el array assigned_users
    // Para simplificar, vamos a usar una búsqueda de texto en el campo JSON
    const activities = await Pending.findAll({
      where: {
        status: {
          [Sequelize.Op.in]: ['pendiente', 'asignado', 'realizado'] // Pendientes, asignados y realizados
        },
        [Sequelize.Op.or]: [
          { assigned_to: user.id },
          Sequelize.literal(`POSITION('${user.id.toString()}' IN "assigned_users") > 0`)
        ]
      },
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

    // Agregar información adicional sobre los usuarios asignados a cada actividad
    const activitiesWithUserInfo = await Promise.all(activitiesList.map(async (activity) => {
      let assignedUsers = [];
      
      if (activity.assigned_users) {
        try {
          const userIds = JSON.parse(activity.assigned_users);
          if (Array.isArray(userIds) && userIds.length > 0) {
            const users = await User.findAll({
              where: {
                id: userIds
              },
              attributes: ['id', 'name', 'display_name', 'email']
            });
            
            assignedUsers = users.map(user => ({
              id: user.id,
              name: user.display_name || user.name,
              email: user.email
            }));
          }
        } catch (error) {
          console.error('Error parsing assigned users:', error);
        }
      }

      return {
        ...activity,
        assigned_users_parsed: assignedUsers,
        is_assigned_to_me: activity.assigned_to === user.id || 
                           (Array.isArray(assignedUsers) && 
                            assignedUsers.some(assignedUser => assignedUser.id === user.id))
      };
    }));

    return {
      activities: activitiesWithUserInfo
    };
  }
}

export default new MyPendingActivitiesService();