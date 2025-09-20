// Report form component
import React, { useState } from 'react';
import Input from '../common/Input';
import Select from '../common/Select';
import Textarea from '../common/Textarea';
import Button from '../common/Button';
import {
  PRIORITY_LEVELS,
  PRIORITY_LABELS,
  ISSUE_TYPES,
  ISSUE_TYPE_LABELS
} from '../../constants/app';

const ReportForm = ({ 
  initialData = {}, 
  onSubmit, 
  onCancel, 
  isSubmitting = false 
}) => {
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    issue_type: initialData.issue_type || ISSUE_TYPES.CORRECTIVO,
    priority: initialData.priority || PRIORITY_LEVELS.MEDIA,
    equipment_area: initialData.equipment_area || '',
    equipment_machine: initialData.equipment_machine || '',
    equipment_element: initialData.equipment_element || '',
    notes: initialData.notes || '',
    ...initialData
  });

  const [errors, setErrors] = useState({});

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
    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Input
          label="Título"
          name="title"
          value={formData.title}
          onChange={handleChange}
          error={errors.title}
          required
        />
        
        <Select
          label="Tipo de Reporte"
          name="issue_type"
          value={formData.issue_type}
          onChange={handleChange}
        >
          {Object.entries(ISSUE_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </Select>
        
        <Select
          label="Prioridad"
          name="priority"
          value={formData.priority}
          onChange={handleChange}
        >
          {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </Select>
      </div>
      
      <Textarea
        label="Descripción"
        name="description"
        value={formData.description}
        onChange={handleChange}
        error={errors.description}
        required
        placeholder="Describe el problema o mantenimiento realizado..."
      />
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <Input
          label="Área del Equipo"
          name="equipment_area"
          value={formData.equipment_area}
          onChange={handleChange}
          placeholder="Ej. Planta Principal"
        />
        
        <Input
          label="Máquina"
          name="equipment_machine"
          value={formData.equipment_machine}
          onChange={handleChange}
          placeholder="Ej. Compresor A1"
        />
        
        <Input
          label="Elemento"
          name="equipment_element"
          value={formData.equipment_element}
          onChange={handleChange}
          placeholder="Ej. Motor"
        />
      </div>
      
      <Textarea
        label="Notas Adicionales"
        name="notes"
        value={formData.notes}
        onChange={handleChange}
        placeholder="Cualquier información adicional relevante..."
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
          {initialData.id ? 'Actualizar Reporte' : 'Crear Reporte'}
        </Button>
      </div>
    </form>
  );
};

export default ReportForm;