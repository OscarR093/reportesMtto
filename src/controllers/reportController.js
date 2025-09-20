import reportService from '../services/reportService.js';

class ReportController {
  /**
   * Crear nuevo reporte
   */
  async createReport(req, res, next) {
    try {
      const reportData = req.body;
      const user = req.user;

      console.log('🔍 Datos del usuario en createReport:', {
        id: user?.id,
        email: user?.email,
        status: user?.status,
        role: user?.role,
        userObject: user
      });

      // El título ya no es requerido, se auto-genera si está vacío
      if (!reportData.equipment_area) {
        return res.status(400).json({
          success: false,
          error: 'El área del equipo es requerida'
        });
      }

      const report = await reportService.createReport(reportData, user);
      
      res.status(201).json({
        success: true,
        data: report,
        message: 'Reporte creado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener reporte por ID
   */
  async getReportById(req, res, next) {
    try {
      const { id } = req.params;
      const report = await reportService.getReportById(id);
      
      res.status(200).json({
        success: true,
        data: report
      });
    } catch (error) {
      if (error.message.includes('no encontrado')) {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }
      next(error);
    }
  }

  /**
   * Actualizar reporte
   */
  async updateReport(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const user = req.user;

      const report = await reportService.updateReport(id, updateData, user);
      
      res.status(200).json({
        success: true,
        data: report,
        message: 'Reporte actualizado exitosamente'
      });
    } catch (error) {
      if (error.message.includes('no encontrado')) {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }
      if (error.message.includes('permisos') || error.message.includes('inmutable')) {
        return res.status(403).json({
          success: false,
          error: error.message
        });
      }
      next(error);
    }
  }

  /**
   * Asignar reporte a técnico
   */
  async assignReport(req, res, next) {
    try {
      const { id } = req.params;
      const { assigned_to } = req.body;
      const user = req.user;

      if (!assigned_to) {
        return res.status(400).json({
          success: false,
          error: 'El ID del técnico asignado es requerido'
        });
      }

      const report = await reportService.assignReport(id, assigned_to, user);
      
      res.status(200).json({
        success: true,
        data: report,
        message: 'Reporte asignado exitosamente'
      });
    } catch (error) {
      if (error.message.includes('no encontrado')) {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }
      if (error.message.includes('permisos')) {
        return res.status(403).json({
          success: false,
          error: error.message
        });
      }
      next(error);
    }
  }

  /**
   * Cambiar estado del reporte
   */
  async changeStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;
      const user = req.user;

      if (!status) {
        return res.status(400).json({
          success: false,
          error: 'El nuevo estado es requerido'
        });
      }

      const validStatuses = ['abierto', 'en_proceso', 'resuelto', 'cerrado', 'cancelado'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Estado no válido'
        });
      }

      const report = await reportService.changeReportStatus(id, status, user, notes);
      
      res.status(200).json({
        success: true,
        data: report,
        message: 'Estado del reporte actualizado exitosamente'
      });
    } catch (error) {
      if (error.message.includes('no encontrado')) {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }
      if (error.message.includes('permisos') || error.message.includes('inmutable')) {
        return res.status(403).json({
          success: false,
          error: error.message
        });
      }
      next(error);
    }
  }

  /**
   * Obtener lista de reportes con filtros
   */
  async getReports(req, res, next) {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        priority,
        issue_type,
        equipment_area,
        equipment_machine,
        search,
        sort_by,
        sort_order,
        date, // Nueva fecha para filtrar
        shift // Nuevo turno para filtrar
      } = req.query;

      const filters = {};
      
      // Aplicar filtros simples
      if (status && status !== 'all') filters.status = status;
      if (priority && priority !== 'all') filters.priority = priority;
      if (issue_type && issue_type !== 'all') filters.issue_type = issue_type;
      if (equipment_area && equipment_area !== 'all') filters.equipment_area = equipment_area;
      if (equipment_machine && equipment_machine !== 'all') filters.equipment_machine = equipment_machine;
      if (search) filters.search = search;
      if (date) filters.date = date; // Filtro por fecha
      if (shift && shift !== 'all') filters.shift = shift; // Filtro por turno

      const pagination = {
        page: parseInt(page),
        limit: parseInt(limit)
      };

      const result = await reportService.getReports({ ...filters, sort_by, sort_order }, pagination);
      
      res.status(200).json({
        success: true,
        data: result.reports.map(report => report.toSafeJSON()),
        pagination: result.pagination,
        message: 'Reportes obtenidos exitosamente'
      });
    } catch (error) {
      console.error('Error obteniendo reportes:', error);
      next(error);
    }
  }

  /**
   * Obtener reportes del usuario actual
   */
  async getMyReports(req, res, next) {
    try {
      const user = req.user;
      const {
        page = 1,
        limit = 20,
        status,
        priority,
        issue_type,
        equipment_area
      } = req.query;

      const filters = { user_id: user.id };
      const pagination = { 
        page: parseInt(page), 
        limit: Math.min(parseInt(limit), 100)
      };

      // Aplicar filtros adicionales
      if (status) filters.status = status.split(',');
      if (priority) filters.priority = priority.split(',');
      if (issue_type) filters.issue_type = issue_type.split(',');
      if (equipment_area) filters.equipment_area = equipment_area;

      const result = await reportService.getReports(filters, pagination);
      
      res.status(200).json({
        success: true,
        data: result.reports,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener reportes asignados al usuario actual
   */
  async getAssignedReports(req, res, next) {
    try {
      const user = req.user;
      const {
        page = 1,
        limit = 20,
        status,
        priority,
        issue_type
      } = req.query;

      const filters = { assigned_to: user.id };
      const pagination = { 
        page: parseInt(page), 
        limit: Math.min(parseInt(limit), 100)
      };

      // Aplicar filtros adicionales
      if (status) filters.status = status.split(',');
      if (priority) filters.priority = priority.split(',');
      if (issue_type) filters.issue_type = issue_type.split(',');

      const result = await reportService.getReports(filters, pagination);
      
      res.status(200).json({
        success: true,
        data: result.reports,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener estadísticas de reportes
   */
  async getStats(req, res, next) {
    try {
      const { date_from, date_to } = req.query;
      
      const filters = {};
      if (date_from) filters.date_from = date_from;
      if (date_to) filters.date_to = date_to;

      const stats = await reportService.getReportStats(filters);
      
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Eliminar reporte
   */
  async deleteReport(req, res, next) {
    try {
      const { id } = req.params;
      const user = req.user;

      const result = await reportService.deleteReport(id, user);
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'Reporte eliminado exitosamente'
      });
    } catch (error) {
      if (error.message.includes('no encontrado')) {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }
      if (error.message.includes('permisos') || error.message.includes('inmutable')) {
        return res.status(403).json({
          success: false,
          error: error.message
        });
      }
      next(error);
    }
  }

  /**
   * Obtener reportes abiertos de alta prioridad
   */
  async getHighPriorityReports(req, res, next) {
    try {
      const filters = {
        status: ['abierto', 'en_proceso'],
        priority: ['alta', 'critica'],
        sort_by: 'priority',
        sort_order: 'desc'
      };

      const pagination = { page: 1, limit: 50 };

      const result = await reportService.getReports(filters, pagination);
      
      res.status(200).json({
        success: true,
        data: result.reports,
        total: result.pagination.total
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener reportes por equipo específico
   */
  async getReportsByEquipment(req, res, next) {
    try {
      const { areaKey } = req.params;
      const { machine, element } = req.query;
      const {
        page = 1,
        limit = 20,
        status,
        priority
      } = req.query;

      const filters = { equipment_area: areaKey };
      if (machine) filters.equipment_machine = machine;
      if (element) filters.equipment_element = element;
      if (status) filters.status = status.split(',');
      if (priority) filters.priority = priority.split(',');

      const pagination = { 
        page: parseInt(page), 
        limit: Math.min(parseInt(limit), 100)
      };

      const result = await reportService.getReports(filters, pagination);
      
      res.status(200).json({
        success: true,
        data: result.reports,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ReportController();
