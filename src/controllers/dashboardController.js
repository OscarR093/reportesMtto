import Report from '../models/Report.js';

class DashboardController {
  /**
   * Obtener datos del dashboard
   */
  getDashboardData = async (req, res, next) => {
    try {
      console.log('📊 Obteniendo datos del dashboard para usuario:', req.user.email);

      // Obtener estadísticas de reportes
      const totalReports = await Report.count({
        where: req.user.role === 'super_admin' || req.user.role === 'admin' 
          ? {} 
          : { user_id: req.user.id }
      });

      const pendingReports = await Report.count({
        where: {
          status: ['abierto', 'en_proceso'],
          ...(req.user.role === 'super_admin' || req.user.role === 'admin' 
            ? {} 
            : { user_id: req.user.id })
        }
      });

      const completedReports = await Report.count({
        where: {
          status: ['resuelto', 'cerrado'],
          ...(req.user.role === 'super_admin' || req.user.role === 'admin' 
            ? {} 
            : { user_id: req.user.id })
        }
      });

      const urgentReports = await Report.count({
        where: {
          priority: ['alta', 'critica'],
          status: ['abierto', 'en_proceso'],
          ...(req.user.role === 'super_admin' || req.user.role === 'admin' 
            ? {} 
            : { user_id: req.user.id })
        }
      });

      // Obtener reportes recientes (últimos 5)
      const recentReports = await Report.findAll({
        where: req.user.role === 'super_admin' || req.user.role === 'admin' 
          ? {} 
          : { user_id: req.user.id },
        order: [['created_at', 'DESC']],
        limit: 5,
        attributes: [
          'id', 'title', 'status', 'priority', 
          'equipment_display', 'created_at'
        ]
      });

      const stats = {
        totalReports,
        pendingReports,
        completedReports,
        urgentReports
      };

      console.log('✅ Stats calculadas:', stats);

      res.json({
        success: true,
        message: 'Datos del dashboard obtenidos exitosamente',
        data: {
          stats,
          recentReports
        }
      });

    } catch (error) {
      console.error('❌ Error obteniendo datos del dashboard:', error);
      next(error);
    }
  };
}

export default new DashboardController();
