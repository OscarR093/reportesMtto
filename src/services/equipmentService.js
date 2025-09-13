import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class EquipmentService {
  constructor() {
    this.equipmentData = null;
    this.equipmentPath = path.join(__dirname, '../data/equipment.json');
  }

  /**
   * Cargar datos de equipos desde el archivo JSON
   */
  async loadEquipmentData() {
    try {
      if (!this.equipmentData) {
        const data = await fs.readFile(this.equipmentPath, 'utf8');
        this.equipmentData = JSON.parse(data);
      }
      return this.equipmentData;
    } catch (error) {
      console.error('Error cargando datos de equipos:', error);
      throw new Error('No se pudieron cargar los datos de equipos');
    }
  }

  /**
   * Obtener toda la jerarquía de equipos
   */
  async getEquipmentHierarchy() {
    const data = await this.loadEquipmentData();
    return data.equipment_hierarchy;
  }

  /**
   * Obtener lista de áreas disponibles
   */
  async getAreas() {
    const hierarchy = await this.getEquipmentHierarchy();
    return Object.keys(hierarchy).map(areaKey => ({
      key: areaKey,
      name: hierarchy[areaKey].display_name,
      description: hierarchy[areaKey].description
    }));
  }

  /**
   * Obtener máquinas de un área específica
   */
  async getMachinesByArea(areaKey) {
    const hierarchy = await this.getEquipmentHierarchy();
    
    if (!hierarchy[areaKey]) {
      throw new Error(`Área '${areaKey}' no encontrada`);
    }

    const machines = hierarchy[areaKey].machines || {};
    return Object.keys(machines).map(machineKey => ({
      key: machineKey,
      name: machines[machineKey].display_name,
      description: machines[machineKey].description,
      area: areaKey
    }));
  }

  /**
   * Obtener elementos de una máquina específica
   */
  async getElementsByMachine(areaKey, machineKey) {
    const hierarchy = await this.getEquipmentHierarchy();
    
    if (!hierarchy[areaKey]) {
      throw new Error(`Área '${areaKey}' no encontrada`);
    }

    if (!hierarchy[areaKey].machines[machineKey]) {
      throw new Error(`Máquina '${machineKey}' no encontrada en área '${areaKey}'`);
    }

    const elements = hierarchy[areaKey].machines[machineKey].elements || {};
    return Object.keys(elements).map(elementKey => ({
      key: elementKey,
      name: elements[elementKey].display_name,
      description: elements[elementKey].description,
      area: areaKey,
      machine: machineKey
    }));
  }

  /**
   * Obtener componentes de un elemento específico
   */
  async getComponentsByElement(areaKey, machineKey, elementKey) {
    const hierarchy = await this.getEquipmentHierarchy();
    
    if (!hierarchy[areaKey]) {
      throw new Error(`Área '${areaKey}' no encontrada`);
    }

    if (!hierarchy[areaKey].machines[machineKey]) {
      throw new Error(`Máquina '${machineKey}' no encontrada en área '${areaKey}'`);
    }

    if (!hierarchy[areaKey].machines[machineKey].elements[elementKey]) {
      throw new Error(`Elemento '${elementKey}' no encontrado en máquina '${machineKey}'`);
    }

    const element = hierarchy[areaKey].machines[machineKey].elements[elementKey];
    const components = element.components || [];
    
    return components.map((component, index) => ({
      key: `component_${index}`,
      name: component,
      area: areaKey,
      machine: machineKey,
      element: elementKey
    }));
  }

  /**
   * Obtener ruta completa de un equipo
   */
  async getEquipmentPath(areaKey, machineKey = null, elementKey = null, componentName = null) {
    const hierarchy = await this.getEquipmentHierarchy();
    
    let path = [];
    let displayPath = [];

    // Área
    if (hierarchy[areaKey]) {
      path.push({ level: 'area', key: areaKey, name: hierarchy[areaKey].display_name });
      displayPath.push(hierarchy[areaKey].display_name);
    } else {
      throw new Error(`Área '${areaKey}' no encontrada`);
    }

    // Máquina
    if (machineKey && hierarchy[areaKey].machines[machineKey]) {
      path.push({ 
        level: 'machine', 
        key: machineKey, 
        name: hierarchy[areaKey].machines[machineKey].display_name 
      });
      displayPath.push(hierarchy[areaKey].machines[machineKey].display_name);
    } else if (machineKey) {
      throw new Error(`Máquina '${machineKey}' no encontrada en área '${areaKey}'`);
    }

    // Elemento
    if (elementKey && machineKey && hierarchy[areaKey].machines[machineKey].elements[elementKey]) {
      path.push({ 
        level: 'element', 
        key: elementKey, 
        name: hierarchy[areaKey].machines[machineKey].elements[elementKey].display_name 
      });
      displayPath.push(hierarchy[areaKey].machines[machineKey].elements[elementKey].display_name);
    } else if (elementKey) {
      throw new Error(`Elemento '${elementKey}' no encontrado`);
    }

    // Componente
    if (componentName) {
      path.push({ level: 'component', key: componentName, name: componentName });
      displayPath.push(componentName);
    }

    return {
      path: JSON.stringify(path),
      display: displayPath.join(' → '),
      area: areaKey,
      machine: machineKey,
      element: elementKey,
      component: componentName
    };
  }

  /**
   * Buscar equipos por texto
   */
  async searchEquipment(searchTerm) {
    const hierarchy = await this.getEquipmentHierarchy();
    const results = [];
    const term = searchTerm.toLowerCase();

    Object.keys(hierarchy).forEach(areaKey => {
      const area = hierarchy[areaKey];
      
      // Buscar en área
      if (area.display_name.toLowerCase().includes(term) || 
          area.description.toLowerCase().includes(term)) {
        results.push({
          type: 'area',
          area: areaKey,
          name: area.display_name,
          description: area.description,
          path: area.display_name
        });
      }

      // Buscar en máquinas
      if (area.machines) {
        Object.keys(area.machines).forEach(machineKey => {
          const machine = area.machines[machineKey];
          
          if (machine.display_name.toLowerCase().includes(term) || 
              machine.description.toLowerCase().includes(term)) {
            results.push({
              type: 'machine',
              area: areaKey,
              machine: machineKey,
              name: machine.display_name,
              description: machine.description,
              path: `${area.display_name} → ${machine.display_name}`
            });
          }

          // Buscar en elementos
          if (machine.elements) {
            Object.keys(machine.elements).forEach(elementKey => {
              const element = machine.elements[elementKey];
              
              if (element.display_name.toLowerCase().includes(term) || 
                  element.description.toLowerCase().includes(term)) {
                results.push({
                  type: 'element',
                  area: areaKey,
                  machine: machineKey,
                  element: elementKey,
                  name: element.display_name,
                  description: element.description,
                  path: `${area.display_name} → ${machine.display_name} → ${element.display_name}`
                });
              }

              // Buscar en componentes
              if (element.components) {
                element.components.forEach((component, index) => {
                  if (component.toLowerCase().includes(term)) {
                    results.push({
                      type: 'component',
                      area: areaKey,
                      machine: machineKey,
                      element: elementKey,
                      component: component,
                      name: component,
                      description: `Componente de ${element.display_name}`,
                      path: `${area.display_name} → ${machine.display_name} → ${element.display_name} → ${component}`
                    });
                  }
                });
              }
            });
          }
        });
      }
    });

    return results;
  }

  /**
   * Validar que una ruta de equipo existe
   */
  async validateEquipmentPath(areaKey, machineKey = null, elementKey = null, componentName = null) {
    try {
      await this.getEquipmentPath(areaKey, machineKey, elementKey, componentName);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtener metadatos del sistema de equipos
   */
  async getMetadata() {
    const data = await this.loadEquipmentData();
    return {
      metadata: data.metadata,
      maintenance_types: data.maintenance_types,
      priority_levels: data.priority_levels,
      status_options: data.status_options
    };
  }

  /**
   * Obtener estadísticas de la jerarquía
   */
  async getHierarchyStats() {
    const hierarchy = await this.getEquipmentHierarchy();
    
    let totalAreas = 0;
    let totalMachines = 0;
    let totalElements = 0;
    let totalComponents = 0;

    Object.keys(hierarchy).forEach(areaKey => {
      totalAreas++;
      const area = hierarchy[areaKey];
      
      if (area.machines) {
        Object.keys(area.machines).forEach(machineKey => {
          totalMachines++;
          const machine = area.machines[machineKey];
          
          if (machine.elements) {
            Object.keys(machine.elements).forEach(elementKey => {
              totalElements++;
              const element = machine.elements[elementKey];
              
              if (element.components) {
                totalComponents += element.components.length;
              }
            });
          }
        });
      }
    });

    return {
      total_areas: totalAreas,
      total_machines: totalMachines,
      total_elements: totalElements,
      total_components: totalComponents
    };
  }
}

export default new EquipmentService();
