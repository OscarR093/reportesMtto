import Report from '../models/Report.js';
import User from '../models/User.js';
import equipmentService from './equipmentService.js';
import { Op } from 'sequelize';
import BaseService from './BaseService.js';

class ReportService extends BaseService {
  constructor() {
    super(Report);
  }

  /**
   * Crear un nuevo reporte
   */
  async createReport(reportData, creatorUser) {
    try {
      // Validar que el usuario existe y está activo
      if (!creatorUser || creatorUser.status !== 'active') {
        throw new Error('Usuario no autorizado para crear reportes');
      }

      // Validar equipo si se proporcionó
      if (reportData.equipment_area) {
        const isValidEquipment = await equipmentService.validateEquipmentPath(
          reportData.equipment_area,
          reportData.equipment_machine,
          reportData.equipment_element,
          reportData.equipment_component
        );

        if (!isValidEquipment) {
          throw new Error('La ruta del equipo especificada no es válida');
        }

        // Obtener la ruta completa del equipo
        const equipmentPath = await equipmentService.getEquipmentPath(
          reportData.equipment_area,
          reportData.equipment_machine,
          reportData.equipment_element,
          reportData.equipment_component
        );

        reportData.equipment_path = equipmentPath.path;
        reportData.equipment_display = equipmentPath.display;
      }

      // Preparar datos del reporte
      const reportPayload = {
        user_id: creatorUser.id,
        technician_name: creatorUser.name || creatorUser.email,
        technician_email: creatorUser.email,
        equipment_area: reportData.equipment_area,
        equipment_machine: reportData.equipment_machine,
        equipment_element: reportData.equipment_element,
        equipment_path: reportData.equipment_path,
        equipment_display: reportData.equipment_display,
        issue_type: reportData.issue_type || 'correctivo',
        priority: reportData.priority || 'media',
        status: reportData.status || 'abierto',
        title: reportData.title,
        description: reportData.description,
        evidence_images: Array.isArray(reportData.evidence_images) ? JSON.stringify(reportData.evidence_images) : (reportData.evidence_images || '[]'),
        evidence_filenames: Array.isArray(reportData.evidence_filenames) ? JSON.stringify(reportData.evidence_filenames) : (reportData.evidence_filenames || '[]'),
        work_performed: reportData.work_performed,
        materials_used: reportData.materials_used,
        time_spent: reportData.time_spent,
        cost_estimate: reportData.cost_estimate,
        scheduled_date: reportData.scheduled_date,
        assigned_to: reportData.assigned_to,
        notes: reportData.notes,
        tags: reportData.tags ? JSON.stringify(reportData.tags) : null
      };

      // Crear el reporte
      const report = await Report.create(reportPayload);
      
      // Retornar con datos relacionados
      return await this.getReportById(report.id);
    } catch (error) {
      console.error('Error creando reporte:', error);
      throw new Error(`Error al crear reporte: ${error.message}`);
    }
  }

  /**
   * Obtener reporte por ID con datos relacionados
   */
  async getReportById(reportId) {
    try {
      const report = await Report.findByPk(reportId, {
        include: [
          {
            model: User,
            as: 'Creator',
            attributes: ['id', 'name', 'email', 'role']
          },
          {
            model: User,
            as: 'AssignedTechnician',
            attributes: ['id', 'name', 'email', 'role']
          },
          {
            model: User,
            as: 'Reviewer',
            attributes: ['id', 'name', 'email', 'role']
          }
        ]
      });

      if (!report) {
        throw new Error('Reporte no encontrado');
      }

      return report.toSafeJSON();
    } catch (error) {
      console.error('Error obteniendo reporte:', error);
      throw new Error(`Error al obtener reporte: ${error.message}`);
    }
  }

  /**
   * Actualizar un reporte
   */
  async updateReport(reportId, updateData, user) {
    try {
      const report = await Report.findByPk(reportId);
      
      if (!report) {
        throw new Error('Reporte no encontrado');
      }

      // Verificar permisos
      if (!report.canBeEditedBy(user)) {
        throw new Error('No tienes permisos para editar este reporte');
      }

      // Validar nuevo equipo si se cambió
      if (updateData.equipment_area && updateData.equipment_area !== report.equipment_area) {
        const isValidEquipment = await equipmentService.validateEquipmentPath(
          updateData.equipment_area,
          updateData.equipment_machine,
          updateData.equipment_element,
          updateData.equipment_component
        );

        if (!isValidEquipment) {
          throw new Error('La ruta del equipo especificada no es válida');
        }

        const equipmentPath = await equipmentService.getEquipmentPath(
          updateData.equipment_area,
          updateData.equipment_machine,
          updateData.equipment_element,
          updateData.equipment_component
        );

        updateData.equipment_path = equipmentPath.path;
        updateData.equipment_display = equipmentPath.display;
      }

      // Manejar tags como JSON
      if (updateData.tags && Array.isArray(updateData.tags)) {
        updateData.tags = JSON.stringify(updateData.tags);
      }

      // Actualizar el reporte
      await report.update(updateData);
      
      return await this.getReportById(reportId);
    } catch (error) {
      console.error('Error actualizando reporte:', error);
      throw new Error(`Error al actualizar reporte: ${error.message}`);
    }
  }

  /**
   * Asignar reporte a un técnico
   */
  async assignReport(reportId, assignedToUserId, assignedByUser) {
    try {
      const report = await Report.findByPk(reportId);
      
      if (!report) {
        throw new Error('Reporte no encontrado');
      }

      // Solo administradores pueden asignar reportes
      if (!assignedByUser.canManageUsers()) {
        throw new Error('No tienes permisos para asignar reportes');
      }

      // Verificar que el usuario asignado existe y está activo
      const assignedUser = await User.findByPk(assignedToUserId);
      if (!assignedUser || assignedUser.status !== 'active') {
        throw new Error('El usuario asignado no existe o no está activo');
      }

      await report.update({
        assigned_to: assignedToUserId,
        status: report.status === 'abierto' ? 'en_proceso' : report.status
      });

      return await this.getReportById(reportId);
    } catch (error) {
      console.error('Error asignando reporte:', error);
      throw new Error(`Error al asignar reporte: ${error.message}`);
    }
  }

  /**
   * Cambiar estado de un reporte
   */
  async changeReportStatus(reportId, newStatus, user, notes = null) {
    try {
      const report = await Report.findByPk(reportId);
      
      if (!report) {
        throw new Error('Reporte no encontrado');
      }

      // Verificar permisos
      if (!report.canBeEditedBy(user)) {
        throw new Error('No tienes permisos para cambiar el estado de este reporte');
      }

      const updateData = { 
        status: newStatus,
        ...(notes && { notes })
      };

      // Si se marca como revisado, registrar el revisor
      if (['resuelto', 'cerrado'].includes(newStatus)) {
        updateData.reviewed_by = user.id;
        updateData.reviewed_at = new Date();
      }

      await report.update(updateData);
      
      return await this.getReportById(reportId);
    } catch (error) {
      console.error('Error cambiando estado del reporte:', error);
      throw new Error(`Error al cambiar estado: ${error.message}`);
    }
  }

  /**
   * Obtener reportes con filtros
   */
  async getReports(filters = {}, pagination = { page: 1, limit: 20 }) {
    try {
      const where = {};
      const order = [];

      // Aplicar filtros
      if (filters.user_id) {
        where.user_id = filters.user_id;
      }

      if (filters.assigned_to) {
        where.assigned_to = filters.assigned_to;
      }

      if (filters.status) {
        if (Array.isArray(filters.status)) {
          where.status = { [Op.in]: filters.status };
        } else {
          where.status = filters.status;
        }
      }

      if (filters.priority) {
        if (Array.isArray(filters.priority)) {
          where.priority = { [Op.in]: filters.priority };
        } else {
          where.priority = filters.priority;
        }
      }

      if (filters.issue_type) {
        if (Array.isArray(filters.issue_type)) {
          where.issue_type = { [Op.in]: filters.issue_type };
        } else {
          where.issue_type = filters.issue_type;
        }
      }

      if (filters.equipment_area) {
        where.equipment_area = filters.equipment_area;
      }

      if (filters.equipment_machine) {
        where.equipment_machine = filters.equipment_machine;
      }

      if (filters.date_from) {
        where.created_at = { [Op.gte]: new Date(filters.date_from) };
      }

      if (filters.date_to) {
        where.created_at = { 
          ...where.created_at, 
          [Op.lte]: new Date(filters.date_to) 
        };
      }

      if (filters.search) {
        where[Op.or] = [
          { title: { [Op.iLike]: `%${filters.search}%` } },
          { description: { [Op.iLike]: `%${filters.search}%` } },
          { technician_name: { [Op.iLike]: `%${filters.search}%` } },
          { equipment_display: { [Op.iLike]: `%${filters.search}%` } }
        ];
      }

      // Ordenamiento
      if (filters.sort_by) {
        const sortDirection = filters.sort_order === 'asc' ? 'ASC' : 'DESC';
        order.push([filters.sort_by, sortDirection]);
      } else {
        // Ordenamiento por defecto: prioridad y fecha
        order.push(['priority', 'DESC']);
        order.push(['created_at', 'DESC']);
      }

      // Paginación
      const offset = (pagination.page - 1) * pagination.limit;

      const { count, rows } = await Report.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: 'Creator',
            attributes: ['id', 'name', 'email', 'role']
          },
          {
            model: User,
            as: 'AssignedTechnician',
            attributes: ['id', 'name', 'email', 'role']
          },
          {
            model: User,
            as: 'Reviewer',
            attributes: ['id', 'name', 'email', 'role']
          }
        ],
        order,
        limit: pagination.limit,
        offset
      });

      return {
        reports: rows.map(report => report.toSafeJSON()),
        pagination: {
          total: count,
          page: pagination.page,
          limit: pagination.limit,
          pages: Math.ceil(count / pagination.limit)
        }
      };
    } catch (error) {
      console.error('Error obteniendo reportes:', error);
      throw new Error(`Error al obtener reportes: ${error.message}`);
    }
  }

  /**
   * Obtener estadísticas de reportes
   */
  async getReportStats(filters = {}) {
    try {
      const where = {};

      // Aplicar filtros de fecha si existen
      if (filters.date_from) {
        where.created_at = { [Op.gte]: new Date(filters.date_from) };
      }

      if (filters.date_to) {
        where.created_at = { 
          ...where.created_at, 
          [Op.lte]: new Date(filters.date_to) 
        };
      }

      const [
        totalReports,
        openReports,
        inProgressReports,
        resolvedReports,
        closedReports,
        highPriorityReports,
        byStatus,
        byPriority,
        byIssueType,
        byArea
      ] = await Promise.all([
        Report.count({ where }),
        Report.count({ where: { ...where, status: 'abierto' } }),
        Report.count({ where: { ...where, status: 'en_proceso' } }),
        Report.count({ where: { ...where, status: 'resuelto' } }),
        Report.count({ where: { ...where, status: 'cerrado' } }),
        Report.count({ where: { ...where, priority: ['alta', 'critica'] } }),
        
        // Agrupaciones
        Report.findAll({
          attributes: [
            'status',
            [Report.sequelize.fn('COUNT', '*'), 'count']
          ],
          where,
          group: ['status'],
          raw: true
        }),
        
        Report.findAll({
          attributes: [
            'priority',
            [Report.sequelize.fn('COUNT', '*'), 'count']
          ],
          where,
          group: ['priority'],
          raw: true
        }),
        
        Report.findAll({
          attributes: [
            'issue_type',
            [Report.sequelize.fn('COUNT', '*'), 'count']
          ],
          where,
          group: ['issue_type'],
          raw: true
        }),
        
        Report.findAll({
          attributes: [
            'equipment_area',
            [Report.sequelize.fn('COUNT', '*'), 'count']
          ],
          where,
          group: ['equipment_area'],
          raw: true
        })
      ]);

      return {
        summary: {
          total: totalReports,
          open: openReports,
          in_progress: inProgressReports,
          resolved: resolvedReports,
          closed: closedReports,
          high_priority: highPriorityReports
        },
        by_status: byStatus,
        by_priority: byPriority,
        by_issue_type: byIssueType,
        by_area: byArea
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw new Error(`Error al obtener estadísticas: ${error.message}`);
    }
  }

  /**
   * Eliminar un reporte (solo administradores)
   */
  async deleteReport(reportId, user) {
    try {
      const report = await Report.findByPk(reportId);
      if (!report) {
        throw new Error('Reporte no encontrado');
      }

      // Solo el creador puede eliminar su propio reporte, y solo si está abierto
      if (report.user_id !== user.id) {
        throw new Error('No tienes permisos para eliminar reportes');
      }
      if (report.status !== 'abierto') {
        throw new Error('Solo puedes eliminar reportes en estado abierto');
      }

      await report.destroy();
      return { message: 'Reporte eliminado exitosamente' };
    } catch (error) {
      console.error('Error eliminando reporte:', error);
      throw new Error(`Error al eliminar reporte: ${error.message}`);
    }
  }
}

export default new ReportService();