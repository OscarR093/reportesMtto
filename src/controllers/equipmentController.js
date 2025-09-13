import equipmentService from '../services/equipmentService.js';

class EquipmentController {
  /**
   * Obtener toda la jerarquía de equipos
   */
  async getHierarchy(req, res, next) {
    try {
      const hierarchy = await equipmentService.getEquipmentHierarchy();
      
      res.status(200).json({
        success: true,
        data: hierarchy
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener lista de áreas
   */
  async getAreas(req, res, next) {
    try {
      const areas = await equipmentService.getAreas();
      
      res.status(200).json({
        success: true,
        data: areas
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener máquinas por área
   */
  async getMachinesByArea(req, res, next) {
    try {
      const { areaKey } = req.params;
      const machines = await equipmentService.getMachinesByArea(areaKey);
      
      res.status(200).json({
        success: true,
        data: machines
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener elementos por máquina
   */
  async getElementsByMachine(req, res, next) {
    try {
      const { areaKey, machineKey } = req.params;
      const elements = await equipmentService.getElementsByMachine(areaKey, machineKey);
      
      res.status(200).json({
        success: true,
        data: elements
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener componentes por elemento
   */
  async getComponentsByElement(req, res, next) {
    try {
      const { areaKey, machineKey, elementKey } = req.params;
      const components = await equipmentService.getComponentsByElement(areaKey, machineKey, elementKey);
      
      res.status(200).json({
        success: true,
        data: components
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener ruta completa de un equipo
   */
  async getEquipmentPath(req, res, next) {
    try {
      const { areaKey } = req.params;
      const { machine, element, component } = req.query;
      
      const path = await equipmentService.getEquipmentPath(areaKey, machine, element, component);
      
      res.status(200).json({
        success: true,
        data: path
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Buscar equipos por texto
   */
  async searchEquipment(req, res, next) {
    try {
      const { q } = req.query;
      
      if (!q || q.trim().length < 2) {
        return res.status(400).json({
          success: false,
          error: 'El término de búsqueda debe tener al menos 2 caracteres'
        });
      }

      const results = await equipmentService.searchEquipment(q.trim());
      
      res.status(200).json({
        success: true,
        data: results,
        total: results.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Validar ruta de equipo
   */
  async validatePath(req, res, next) {
    try {
      const { areaKey } = req.params;
      const { machine, element, component } = req.query;
      
      const isValid = await equipmentService.validateEquipmentPath(areaKey, machine, element, component);
      
      res.status(200).json({
        success: true,
        data: {
          valid: isValid,
          area: areaKey,
          machine: machine || null,
          element: element || null,
          component: component || null
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener metadatos del sistema
   */
  async getMetadata(req, res, next) {
    try {
      const metadata = await equipmentService.getMetadata();
      
      res.status(200).json({
        success: true,
        data: metadata
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener estadísticas de la jerarquía
   */
  async getStats(req, res, next) {
    try {
      const stats = await equipmentService.getHierarchyStats();
      
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new EquipmentController();
