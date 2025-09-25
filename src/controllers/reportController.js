import reportService from '../services/reportService.js';
import ExcelJS from 'exceljs';

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
        data: result.reports,
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

  /**
   * Exportar reportes a Excel (solo administradores)
   */
  async exportReports(req, res, next) {
    try {
      console.log('🔧 exportReports called!');
      console.log('🔧 this context:', this);
      console.log('🔧 this.generateExcel exists:', typeof this.generateExcel);
      
      // Verificar permisos de administrador
      if (!req.user || !req.user.canManageUsers?.()) {
        return res.status(403).json({
          success: false,
          message: 'No autorizado para exportar reportes'
        });
      }

      const { date, status, priority, issue_type, equipment_area, equipment_machine, search } = req.query;

      // Aplicar filtros
      const filters = {};
      if (date) filters.date = date;
      if (status && status !== 'all') filters.status = status;
      if (priority && priority !== 'all') filters.priority = priority;
      if (issue_type && issue_type !== 'all') filters.issue_type = issue_type;
      if (equipment_area && equipment_area !== 'all') filters.equipment_area = equipment_area;
      if (equipment_machine && equipment_machine !== 'all') filters.equipment_machine = equipment_machine;
      if (search) filters.search = search;

      // Obtener datos para ambos turnos (sin paginación)
      const morningResult = await reportService.getReports({ 
        ...filters, 
        shift: 'morning' 
      }, { page: 1, limit: 1000 });
      
      const eveningResult = await reportService.getReports({ 
        ...filters, 
        shift: 'evening' 
      }, { page: 1, limit: 1000 });

      // Generar Excel con ambos conjuntos de datos
      console.log('🔧 About to call generateExcel');
      console.log('🔧 this context:', this);
      console.log('🔧 this.generateExcel exists:', typeof this.generateExcel);
      const controller = this;
      console.log('🔧 controller context:', controller);
      console.log('🔧 controller.generateExcel exists:', typeof controller.generateExcel);
      const excelBuffer = await controller.generateExcel(morningResult.reports, eveningResult.reports, date);
      const filename = `reportes_mantenimiento_${date || 'fecha'}.xlsx`;
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      res.send(excelBuffer);
    } catch (error) {
      console.error("Error exportando reportes:", error);
      console.error("Error stack:", error.stack);
      next(error);
    }
  }
  /**
   * Generar archivo Excel con reportes de ambos turnos
   */
  async generateExcel(morningReports, eveningReports, date) {
    const workbook = new ExcelJS.Workbook();
    
    // Configurar propiedades del libro
    workbook.creator = 'Sistema de Reportes de Mantenimiento';
    workbook.lastModifiedBy = 'Sistema de Reportes de Mantenimiento';
    workbook.created = new Date();
    workbook.modified = new Date();
    
    // Hoja combinada con ambos turnos
    const worksheet = workbook.addWorksheet(`Reportes ${date || ''}`, {
      views: [{ zoomScale: 70 }]
    });
    
    // Columnas optimizadas para impresión
    worksheet.columns = [
      { header: 'TURNO', key: 'shift', width: 12 },
      { header: 'HORA', key: 'time', width: 15 },
      { header: 'TÉCNICO', key: 'technician', width: 25 },
      { header: 'ÁREA/MÁQUINA', key: 'equipment', width: 25 },
      { header: 'PRIORIDAD', key: 'priority', width: 12 },
      { header: 'ESTADO', key: 'status', width: 12 },
      { header: 'DESCRIPCIÓN DE LA FALLA', key: 'description', width: 50 },
      { header: 'NOTAS/COMENTARIOS', key: 'notes', width: 40 }
    ];
    
    // Estilo para encabezados
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFF' }, size: 11 };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF0000' }  // Rojo
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
    
    // Altura de fila para mejor legibilidad
    worksheet.getRow(1).height = 25;
    
    // Agregar título para turno matutino
    worksheet.addRow(['TURNO MATUTINO (6:00 - 17:59)', '', '', '', '', '', '', '']);
    const morningTitleRow = worksheet.lastRow;
    morningTitleRow.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD966' }
    };
    morningTitleRow.getCell(1).font = { bold: true, size: 12 };
    morningTitleRow.height = 25;
    
    // Agregar datos de turno matutino
    morningReports.forEach(report => {
      const row = worksheet.addRow({
        shift: 'Matutino',
        time: report.createdAt ? new Date(report.createdAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : '',
        technician: report.technician_name || '',
        equipment: `${report.equipment_area || ''}${report.equipment_machine ? ` - ${report.equipment_machine}` : ''}`,
        priority: report.priority || '',
        status: report.status || '',
        description: report.description || '',
        notes: report.notes || ''
      });
      
      // Estilo para filas de turno matutino
      row.eachCell((cell) => {
        cell.font = { size: 11 };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
      // Resaltar la descripción de la falla
      row.getCell('description').font = { bold: true, size: 11 };
      
      // Colorear según prioridad
      const priorityCell = row.getCell('priority');
      switch(report.priority) {
        case 'critica':
          priorityCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
          break;
        case 'alta':
          priorityCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
          break;
        case 'media':
          priorityCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } };
          break;
        case 'baja':
          priorityCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF00FF00' } };
          break;
      }
      
      // Aumentar altura de fila
      row.height = 25;
    });
    
    // Espacio entre turnos
    worksheet.addRow([]);
    
    // Agregar título para turno vespertino
    worksheet.addRow(['TURNO VESPERTINO (18:00 - 5:59)', '', '', '', '', '', '', '']);
    const eveningTitleRow = worksheet.lastRow;
    eveningTitleRow.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '8FAADC' }
    };
    eveningTitleRow.getCell(1).font = { bold: true, size: 12 };
    eveningTitleRow.height = 25;
    
    // Agregar datos de turno vespertino
    eveningReports.forEach(report => {
      const row = worksheet.addRow({
        shift: 'Vespertino',
        time: report.createdAt ? new Date(report.createdAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : '',
        technician: report.technician_name || '',
        equipment: `${report.equipment_area || ''}${report.equipment_machine ? ` - ${report.equipment_machine}` : ''}`,
        priority: report.priority || '',
        status: report.status || '',
        description: report.description || '',
        notes: report.notes || ''
      });
      
      // Estilo para filas de turno vespertino
      row.eachCell((cell) => {
        cell.font = { size: 11 };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
      // Resaltar la descripción de la falla
      row.getCell('description').font = { bold: true, size: 11 };
      
      // Colorear según prioridad
      const priorityCell = row.getCell('priority');
      switch(report.priority) {
        case 'critica':
          priorityCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
          break;
        case 'alta':
          priorityCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
          break;
        case 'media':
          priorityCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } };
          break;
        case 'baja':
          priorityCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF00FF00' } };
          break;
      }
      
      // Aumentar altura de fila
      row.height = 25;
    });
    
    // Configurar página para impresión
    worksheet.pageSetup = {
      paperSize: 9, // A4
      orientation: 'landscape',
      margins: {
        left: 0.7,
        right: 0.7,
        top: 0.75,
        bottom: 0.75,
        header: 0.3,
        footer: 0.3
      },
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0
    };
    
    // Repetir encabezados en cada página
    worksheet.pageSetup.printTitlesRow = '1:1';
    
    // Generar buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }
}

export default new ReportController();
