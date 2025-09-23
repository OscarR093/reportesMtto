// Custom hook for equipment selection
import { useState, useEffect } from 'react';

const useEquipmentSelection = (initialEquipmentData = null) => {
  const [equipmentData, setEquipmentData] = useState(initialEquipmentData);
  const [equipmentOptions, setEquipmentOptions] = useState({
    areas: [],
    machines: [],
    elements: [],
    components: []
  });
  const [selectedEquipment, setSelectedEquipment] = useState({
    area: '',
    machine: '',
    element: '',
    component: ''
  });

  // Initialize equipment data
  useEffect(() => {
    if (initialEquipmentData) {
      setEquipmentData(initialEquipmentData);
      setEquipmentOptions(prev => ({
        ...prev,
        areas: Object.keys(initialEquipmentData)
      }));
    }
  }, [initialEquipmentData]);

  // Handle area change
  const handleAreaChange = (area) => {
    setSelectedEquipment(prev => ({
      ...prev,
      area: area,
      machine: '',
      element: '',
      component: ''
    }));

    if (area && equipmentData && equipmentData[area]) {
      setEquipmentOptions(prev => ({
        ...prev,
        machines: Object.keys(equipmentData[area]),
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
  };

  // Handle machine change
  const handleMachineChange = (machine) => {
    setSelectedEquipment(prev => ({
      ...prev,
      machine: machine,
      element: '',
      component: ''
    }));

    if (machine && equipmentData && equipmentData[selectedEquipment.area]?.[machine]) {
      const machineData = equipmentData[selectedEquipment.area][machine];
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
  };

  // Handle element change
  const handleElementChange = (element) => {
    setSelectedEquipment(prev => ({
      ...prev,
      element: element,
      component: ''
    }));

    const machineData = equipmentData?.[selectedEquipment.area]?.[selectedEquipment.machine];
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
  };

  // Handle component change
  const handleComponentChange = (component) => {
    setSelectedEquipment(prev => ({
      ...prev,
      component: component
    }));
  };

  // Set initial equipment values
  const setInitialEquipment = (area, machine, element, component) => {
    setSelectedEquipment({
      area: area || '',
      machine: machine || '',
      element: element || '',
      component: component || ''
    });

    // Update options based on initial values
    if (area && equipmentData && equipmentData[area]) {
      setEquipmentOptions(prev => ({
        ...prev,
        areas: Object.keys(equipmentData),
        machines: Object.keys(equipmentData[area])
      }));

      if (machine && equipmentData[area][machine]) {
        const machineData = equipmentData[area][machine];
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
  };

  return {
    equipmentData,
    setEquipmentData,
    equipmentOptions,
    selectedEquipment,
    handleAreaChange,
    handleMachineChange,
    handleElementChange,
    handleComponentChange,
    setInitialEquipment
  };
};

export default useEquipmentSelection;