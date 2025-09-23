// Pending activity form component
import React, { useState } from 'react';
import Input from '../common/Input';
import Select from '../common/Select';
import Textarea from '../common/Textarea';
import Button from '../common/Button';
import EquipmentSelector from '../common/EquipmentSelector';
import {
  PENDING_ISSUE_TYPES,
  PENDING_ISSUE_TYPE_LABELS
} from '../../constants/app';

const PendingActivityForm = ({ 
  initialData = {}, 
  onSubmit, 
  onCancel, 
  isSubmitting = false 
}) => {
  const [formData, setFormData] = useState({
    issue_type: initialData.issue_type || PENDING_ISSUE_TYPES.CORRECTIVO,
    description: initialData.description || '',
    equipment_area: initialData.equipment_area || '',
    equipment_machine: initialData.equipment_machine || '',
    equipment_element: initialData.equipment_element || '',
    equipment_component: initialData.equipment_component || ''
  });

  const [errors, setErrors] = useState({});

  const handleEquipmentChange = (equipment) => {
    setFormData(prev => ({
      ...prev,
      ...equipment
    }));
    
    // Clear equipment errors when user makes changes
    if (errors.equipment_area || errors.equipment_machine) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.equipment_area;
        delete newErrors.equipment_machine;
        return newErrors;
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    const newErrors = {};
    if (!formData.equipment_area) {
      newErrors.equipment_area = 'El área del equipo es requerida';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'La descripción de la actividad es requerida';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <EquipmentSelector
        value={formData}
        onChange={handleEquipmentChange}
        error={errors}
        required
      />
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Select
          label="Tipo de Mantenimiento"
          name="issue_type"
          value={formData.issue_type}
          onChange={handleChange}
        >
          {Object.entries(PENDING_ISSUE_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </Select>
      </div>
      
      <Textarea
        label="Descripción de la Actividad"
        name="description"
        value={formData.description}
        onChange={handleChange}
        error={errors.description}
        required
        placeholder="Describe la actividad pendiente..."
      />
      
      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          loading={isSubmitting}
        >
          {initialData.id ? 'Actualizar Actividad' : 'Crear Actividad'}
        </Button>
      </div>
    </form>
  );
};

export default PendingActivityForm;