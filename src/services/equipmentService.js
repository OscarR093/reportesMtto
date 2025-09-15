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
    return data; // Los datos están directamente en el JSON
  }

  /**
   * Obtener lista de áreas disponibles
   */
  async getAreas() {
    const hierarchy = await this.getEquipmentHierarchy();
    return Object.keys(hierarchy).map(areaKey => ({
      key: areaKey,
      name: areaKey.charAt(0).toUpperCase() + areaKey.slice(1),
      description: `Área de ${areaKey}`
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

    const machines = hierarchy[areaKey];
    return Object.keys(machines).map(machineKey => ({
      key: machineKey,
      name: machineKey.charAt(0).toUpperCase() + machineKey.slice(1),
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

    if (!hierarchy[areaKey][machineKey]) {
      throw new Error(`Máquina '${machineKey}' no encontrada en área '${areaKey}'`);
    }

    const elements = hierarchy[areaKey][machineKey];
    
    if (Array.isArray(elements)) {
      // Si es un array, son elementos directos
      return elements.map((element, index) => ({
        key: element.toString(),
        name: element.toString(),
        machine: machineKey,
        area: areaKey
      }));
    } else if (typeof elements === 'object') {
      // Si es un objeto, son elementos con sub-elementos
      return Object.keys(elements).map(elementKey => ({
        key: elementKey,
        name: elementKey.charAt(0).toUpperCase() + elementKey.slice(1),
        machine: machineKey,
        area: areaKey
      }));
    }

    return [];
  }

  /**
   * Obtener componentes de un elemento específico
   */
  async getComponentsByElement(areaKey, machineKey, elementKey) {
    const hierarchy = await this.getEquipmentHierarchy();
    
    if (!hierarchy[areaKey] || !hierarchy[areaKey][machineKey]) {
      throw new Error(`Ruta de equipo no válida: ${areaKey}/${machineKey}`);
    }

    const machine = hierarchy[areaKey][machineKey];
    
    // Si la máquina contiene un objeto con el elemento
    if (typeof machine === 'object' && machine[elementKey]) {
      const element = machine[elementKey];
      
      if (Array.isArray(element)) {
        return element.map(component => ({
          key: component.toString(),
          name: component.toString(),
          element: elementKey,
          machine: machineKey,
          area: areaKey
        }));
      } else if (typeof element === 'object') {
        return Object.keys(element).map(componentKey => ({
          key: componentKey,
          name: componentKey.charAt(0).toUpperCase() + componentKey.slice(1),
          element: elementKey,
          machine: machineKey,
          area: areaKey
        }));
      }
    }

    return [];
  }

  /**
   * Construir la ruta completa de un equipo
   */
  async getEquipmentPath(areaKey, machineKey = null, elementKey = null, componentName = null) {
    const path = [areaKey];
    const display = [areaKey.charAt(0).toUpperCase() + areaKey.slice(1)];

    if (machineKey) {
      path.push(machineKey);
      display.push(machineKey.charAt(0).toUpperCase() + machineKey.slice(1));
    }

    if (elementKey) {
      path.push(elementKey);
      display.push(elementKey.toString());
    }

    if (componentName) {
      path.push(componentName);
      display.push(componentName.toString());
    }

    return {
      path: JSON.stringify(path),
      display: display.join(' > '),
      area: areaKey,
      machine: machineKey,
      element: elementKey,
      component: componentName
    };
  }

  /**
   * Buscar equipos por término
   */
  async searchEquipment(searchTerm) {
    const hierarchy = await this.getEquipmentHierarchy();
    const results = [];
    const term = searchTerm.toLowerCase();

    for (const [areaKey, area] of Object.entries(hierarchy)) {
      // Buscar en área
      if (areaKey.toLowerCase().includes(term)) {
        results.push({
          type: 'area',
          area: areaKey,
          path: areaKey,
          display: areaKey.charAt(0).toUpperCase() + areaKey.slice(1)
        });
      }

      // Buscar en máquinas
      for (const [machineKey, machine] of Object.entries(area)) {
        if (machineKey.toLowerCase().includes(term)) {
          results.push({
            type: 'machine',
            area: areaKey,
            machine: machineKey,
            path: `${areaKey} > ${machineKey}`,
            display: `${areaKey.charAt(0).toUpperCase() + areaKey.slice(1)} > ${machineKey}`
          });
        }

        // Buscar en elementos
        if (Array.isArray(machine)) {
          machine.forEach(element => {
            if (element.toString().toLowerCase().includes(term)) {
              results.push({
                type: 'element',
                area: areaKey,
                machine: machineKey,
                element: element.toString(),
                path: `${areaKey} > ${machineKey} > ${element}`,
                display: `${areaKey} > ${machineKey} > ${element}`
              });
            }
          });
        } else if (typeof machine === 'object') {
          for (const [elementKey, element] of Object.entries(machine)) {
            if (elementKey.toLowerCase().includes(term)) {
              results.push({
                type: 'element',
                area: areaKey,
                machine: machineKey,
                element: elementKey,
                path: `${areaKey} > ${machineKey} > ${elementKey}`,
                display: `${areaKey} > ${machineKey} > ${elementKey}`
              });
            }
          }
        }
      }
    }

    return results;
  }

  /**
   * Validar si una ruta de equipo es válida
   */
  async validateEquipmentPath(areaKey, machineKey = null, elementKey = null, componentName = null) {
    try {
      const hierarchy = await this.getEquipmentHierarchy();

      if (!hierarchy[areaKey]) {
        return false;
      }

      if (machineKey && !hierarchy[areaKey][machineKey]) {
        return false;
      }

      if (elementKey && machineKey) {
        const machine = hierarchy[areaKey][machineKey];
        if (Array.isArray(machine)) {
          return machine.includes(elementKey) || machine.includes(parseInt(elementKey));
        } else if (typeof machine === 'object') {
          return machine.hasOwnProperty(elementKey);
        }
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtener metadatos de la jerarquía
   */
  async getMetadata() {
    const hierarchy = await this.getEquipmentHierarchy();
    const areas = Object.keys(hierarchy);
    let totalMachines = 0;
    let totalElements = 0;

    areas.forEach(areaKey => {
      const machines = Object.keys(hierarchy[areaKey]);
      totalMachines += machines.length;

      machines.forEach(machineKey => {
        const machine = hierarchy[areaKey][machineKey];
        if (Array.isArray(machine)) {
          totalElements += machine.length;
        } else if (typeof machine === 'object') {
          totalElements += Object.keys(machine).length;
        }
      });
    });

    return {
      totalAreas: areas.length,
      totalMachines,
      totalElements,
      areas: areas
    };
  }

  /**
   * Obtener estadísticas de la jerarquía
   */
  async getHierarchyStats() {
    const metadata = await this.getMetadata();
    const hierarchy = await this.getEquipmentHierarchy();

    const areaStats = Object.keys(hierarchy).map(areaKey => {
      const machines = Object.keys(hierarchy[areaKey]);
      let elements = 0;

      machines.forEach(machineKey => {
        const machine = hierarchy[areaKey][machineKey];
        if (Array.isArray(machine)) {
          elements += machine.length;
        } else if (typeof machine === 'object') {
          elements += Object.keys(machine).length;
        }
      });

      return {
        area: areaKey,
        machines: machines.length,
        elements
      };
    });

    return {
      ...metadata,
      areaStats
    };
  }
}

export default new EquipmentService();
