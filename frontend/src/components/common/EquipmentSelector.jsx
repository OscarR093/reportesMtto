// Equipment selection component
import React, { useState, useEffect } from 'react';
import Select from '../common/Select';

const EquipmentSelector = ({ 
  value = {}, 
  onChange, 
  error,
  required = false 
}) => {
  const [equipmentHierarchy, setEquipmentHierarchy] = useState(null);
  const [equipmentOptions, setEquipmentOptions] = useState({
    areas: [],
    machines: [],
    elements: [],
    components: []
  });
  const [selectedEquipment, setSelectedEquipment] = useState({
    area: value.equipment_area || '',
    machine: value.equipment_machine || '',
    element: value.equipment_element || '',
    component: value.equipment_component || ''
  });

  // Fetch equipment hierarchy on component mount
  useEffect(() => {
    fetchEquipmentHierarchy();
  }, []);

  // Initialize equipment options when hierarchy is loaded
  useEffect(() => {
    if (equipmentHierarchy) {
      setEquipmentOptions(prev => ({
        ...prev,
        areas: Object.keys(equipmentHierarchy)
      }));
      
      // If there's an initial area selected, populate machines
      if (selectedEquipment.area && equipmentHierarchy[selectedEquipment.area]) {
        setEquipmentOptions(prev => ({
          ...prev,
          machines: Object.keys(equipmentHierarchy[selectedEquipment.area])
        }));
        
        // If there's an initial machine selected, populate elements
        if (selectedEquipment.machine && equipmentHierarchy[selectedEquipment.area][selectedEquipment.machine]) {
          const machineData = equipmentHierarchy[selectedEquipment.area][selectedEquipment.machine];
          if (Array.isArray(machineData)) {
            setEquipmentOptions(prev => ({
              ...prev,
              elements: machineData
            }));
          } else if (typeof machineData === 'object') {
            setEquipmentOptions(prev => ({
              ...prev,
              elements: Object.keys(machineData)
            }));
          }
        }
      }
    }
  }, [equipmentHierarchy, selectedEquipment.area, selectedEquipment.machine]);

  const fetchEquipmentHierarchy = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/equipment/hierarchy', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data && typeof data.data === 'object') {
          setEquipmentHierarchy(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching equipment hierarchy:', error);
    }
  };

  // Handle area change
  const handleAreaChange = (area) => {
    const newEquipment = {
      equipment_area: area,
      equipment_machine: '',
      equipment_element: '',
      equipment_component: ''
    };
    
    setSelectedEquipment({
      area: area,
      machine: '',
      element: '',
      component: ''
    });
    
    // Update machines options
    if (area && equipmentHierarchy && equipmentHierarchy[area]) {
      setEquipmentOptions(prev => ({
        ...prev,
        machines: Object.keys(equipmentHierarchy[area]),
        elements: [],
        components: []
      }));
    } else {
      setEquipmentOptions(prev => ({
        ...prev,
        machines: [],
        elements: [],
        components: []
      }));
    }

    // Notify parent of changes
    if (onChange) {
      onChange(newEquipment);
    }
  };

  // Handle machine change
  const handleMachineChange = (machine) => {
    const newEquipment = {
      equipment_area: selectedEquipment.area,
      equipment_machine: machine,
      equipment_element: '',
      equipment_component: ''
    };
    
    setSelectedEquipment(prev => ({
      ...prev,
      machine: machine,
      element: '',
      component: ''
    }));

    // Update elements options
    if (machine && equipmentHierarchy && equipmentHierarchy[selectedEquipment.area]?.[machine]) {
      const machineData = equipmentHierarchy[selectedEquipment.area][machine];
      if (Array.isArray(machineData)) {
        // If it's an array, these are direct elements
        setEquipmentOptions(prev => ({
          ...prev,
          elements: machineData,
          components: []
        }));
      } else if (typeof machineData === 'object') {
        // If it's an object, these are sub-machines/elements
        setEquipmentOptions(prev => ({
          ...prev,
          elements: Object.keys(machineData),
          components: []
        }));
      }
    } else {
      setEquipmentOptions(prev => ({
        ...prev,
        elements: [],
        components: []
      }));
    }

    // Notify parent of changes
    if (onChange) {
      onChange(newEquipment);
    }
  };

  // Handle element change
  const handleElementChange = (element) => {
    const newEquipment = {
      equipment_area: selectedEquipment.area,
      equipment_machine: selectedEquipment.machine,
      equipment_element: element,
      equipment_component: ''
    };
    
    setSelectedEquipment(prev => ({
      ...prev,
      element: element,
      component: ''
    }));

    // Update components options
    const machineData = equipmentHierarchy?.[selectedEquipment.area]?.[selectedEquipment.machine];
    if (machineData && typeof machineData === 'object' && machineData[element]) {
      if (Array.isArray(machineData[element])) {
        setEquipmentOptions(prev => ({
          ...prev,
          components: machineData[element]
        }));
      } else if (typeof machineData[element] === 'object') {
        setEquipmentOptions(prev => ({
          ...prev,
          components: Object.keys(machineData[element])
        }));
      }
    } else {
      setEquipmentOptions(prev => ({
        ...prev,
        components: []
      }));
    }

    // Notify parent of changes
    if (onChange) {
      onChange(newEquipment);
    }
  };

  // Handle component change
  const handleComponentChange = (component) => {
    const newEquipment = {
      equipment_area: selectedEquipment.area,
      equipment_machine: selectedEquipment.machine,
      equipment_element: selectedEquipment.element,
      equipment_component: component
    };
    
    setSelectedEquipment(prev => ({
      ...prev,
      component: component
    }));

    // Notify parent of changes
    if (onChange) {
      onChange(newEquipment);
    }
  };

  return (
    <div className="space-y-4">
      <Select
        label="Área del Equipo"
        value={selectedEquipment.area}
        onChange={(e) => handleAreaChange(e.target.value)}
        error={error?.equipment_area}
        required={required}
      >
        <option value="">Seleccionar área</option>
        {equipmentOptions.areas.map((area) => (
          <option key={area} value={area}>
            {area.charAt(0).toUpperCase() + area.slice(1)}
          </option>
        ))}
      </Select>

      {selectedEquipment.area && (
        <Select
          label="Máquina"
          value={selectedEquipment.machine}
          onChange={(e) => handleMachineChange(e.target.value)}
          error={error?.equipment_machine}
        >
          <option value="">Seleccionar máquina</option>
          {equipmentOptions.machines.map((machine) => (
            <option key={machine} value={machine}>
              {machine}
            </option>
          ))}
        </Select>
      )}

      {selectedEquipment.machine && equipmentOptions.elements.length > 0 && (
        <Select
          label="Elemento"
          value={selectedEquipment.element}
          onChange={(e) => handleElementChange(e.target.value)}
          error={error?.equipment_element}
        >
          <option value="">Seleccionar elemento</option>
          {equipmentOptions.elements.map((element) => (
            <option key={element} value={element}>
              {element}
            </option>
          ))}
        </Select>
      )}

      {selectedEquipment.element && equipmentOptions.components.length > 0 && (
        <Select
          label="Componente"
          value={selectedEquipment.component}
          onChange={(e) => handleComponentChange(e.target.value)}
          error={error?.equipment_component}
        >
          <option value="">Seleccionar componente</option>
          {equipmentOptions.components.map((component) => (
            <option key={component} value={component}>
              {component}
            </option>
          ))}
        </Select>
      )}
    </div>
  );
};

export default EquipmentSelector;