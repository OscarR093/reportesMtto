import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  PhotoIcon,
  MicrophoneIcon,
  XMarkIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

const CreateReport = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // ID del reporte para edición
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [equipmentData, setEquipmentData] = useState(null);
  const [isEditMode, setIsEditMode] = useState(!!id);
  const [originalReport, setOriginalReport] = useState(null);
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    issue_type: 'correctivo',
    priority: 'media',
    equipment_area: '',
    equipment_machine: '',
    equipment_element: '',
    equipment_component: '',
    notes: '',
    evidence_images: [],
    evidence_filenames: []
  });

  // Estado para selección en cascada de equipos
  const [equipmentOptions, setEquipmentOptions] = useState({
    areas: [],
    machines: [],
    elements: [],
    components: []
  });

  // ...existing code...

  // Prioridades disponibles
  const priorities = [
    { value: 'baja', label: 'Baja', color: 'bg-green-100 text-green-800' },
    { value: 'media', label: 'Media', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'alta', label: 'Alta', color: 'bg-orange-100 text-orange-800' },
    { value: 'critica', label: 'Crítica', color: 'bg-red-100 text-red-800' }
  ];

  // Tipos de issues
  const issueTypes = [
    { value: 'preventivo', label: 'Mantenimiento Preventivo' },
    { value: 'correctivo', label: 'Mantenimiento Correctivo' },
    { value: 'inspeccion', label: 'Inspección' },
    { value: 'emergencia', label: 'Emergencia' },
    { value: 'mejora', label: 'Mejora' },
    { value: 'otro', label: 'Otro' }
  ];

  useEffect(() => {
    fetchEquipmentData();
  }, []);

  useEffect(() => {
    // Cargar datos del reporte si estamos en modo edición
    if (id && equipmentData) {
      fetchReportData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, equipmentData]);

  useEffect(() => {
    // Auto-ajustar prioridad para área de fusión
    if (formData.equipment_area === 'fusion' && formData.priority === 'media') {
      setFormData(prev => ({ ...prev, priority: 'alta' }));
    }
  }, [formData.equipment_area, formData.priority]);

  const fetchEquipmentData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/equipment/hierarchy', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Equipment data received:', data);
        
        if (data.data && typeof data.data === 'object') {
          setEquipmentData(data.data);
          setEquipmentOptions(prev => ({
            ...prev,
            areas: Object.keys(data.data)
          }));
        } else {
          console.error('Invalid equipment data structure:', data);
          toast.error('Estructura de datos de equipos inválida');
        }
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        toast.error('Error al cargar equipos: ' + (errorData.error || 'Error desconocido'));
      }
    } catch (error) {
      console.error('Error fetching equipment:', error);
      toast.error('Error al cargar equipos');
    }
  };

  const fetchReportData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/reports/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        const report = data.data;
        setOriginalReport(report);

        // Asegurar que evidence_images y evidence_filenames sean siempre arrays
        let images = [];
        let filenames = [];
        if (report.evidence_images) {
          try {
            images = JSON.parse(report.evidence_images);
            if (!Array.isArray(images)) images = images ? [images] : [];
          } catch {
            images = [];
          }
        }
        if (report.evidence_filenames) {
          try {
            filenames = JSON.parse(report.evidence_filenames);
            if (!Array.isArray(filenames)) filenames = filenames ? [filenames] : [];
          } catch {
            filenames = [];
          }
        }

        setFormData({
          equipment_area: report.equipment_area || '',
          equipment_machine: report.equipment_machine || '',
          equipment_element: report.equipment_element || '',
          issue_type: report.issue_type || '',
          priority: report.priority || 'media',
          title: report.title || '',
          description: report.description || '',
          evidence_images: images,
          evidence_filenames: filenames
        });

        // Actualizar opciones de equipos basado en la selección actual
        if (report.equipment_area && equipmentData) {
          handleAreaChange(report.equipment_area);
        }
      } else {
        toast.error('Error al cargar el reporte');
        navigate('/reports');
      }
    } catch (error) {
      console.error('Error fetching report:', error);
      toast.error('Error al cargar el reporte');
      navigate('/reports');
    }
  };

  const handleAreaChange = (area) => {
    setFormData(prev => ({
      ...prev,
      equipment_area: area,
      equipment_machine: '',
      equipment_element: '',
      equipment_component: ''
    }));

    if (area && equipmentData[area]) {
      setEquipmentOptions(prev => ({
        ...prev,
        machines: Object.keys(equipmentData[area]), // <-- CORREGIDO
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

  const handleMachineChange = (machine) => {
    setFormData(prev => ({
      ...prev,
      equipment_machine: machine,
      equipment_element: '',
      equipment_component: ''
    }));

    if (machine && equipmentData[formData.equipment_area]?.[machine]) {
      const machineData = equipmentData[formData.equipment_area][machine];
      if (Array.isArray(machineData)) {
        // Si es un array, son elementos directos
        setEquipmentOptions(prev => ({
          ...prev,
          elements: machineData,
          components: []
        }));
      } else if (typeof machineData === 'object') {
        // Si es un objeto, son sub-máquinas/elementos
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

  const handleElementChange = (element) => {
    setFormData(prev => ({
      ...prev,
      equipment_element: element,
      equipment_component: ''
    }));

    const machineData = equipmentData[formData.equipment_area]?.[formData.equipment_machine];
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

  const handleImageUpload = async (files) => {
    if (formData.evidence_images.length + files.length > 3) {
      toast.error('Máximo 3 imágenes permitidas');
      return;
    }

    const newImages = [];
    const newFilenames = [];

    for (let file of files) {
      if (!file.type.startsWith('image/')) {
        toast.error('Solo se permiten archivos de imagen');
        continue;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast.error('Las imágenes deben ser menores a 5MB');
        continue;
      }

      try {
        const uploadFormData = new FormData();
        uploadFormData.append('evidence', file);

        const token = localStorage.getItem('token');
        const response = await fetch('/api/files/evidence', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: uploadFormData
        });

        if (response.ok) {
          const result = await response.json();
          newImages.push(result.data.url);
          newFilenames.push(result.data.originalName);
        } else {
          // Handle error response with proper error message
          let errorMessage = `Error al subir ${file.name}`;
          try {
            const errorData = await response.json();
            if (errorData.message) {
              errorMessage = errorData.message;
            } else if (errorData.error) {
              errorMessage = errorData.error;
            }
          } catch (parseError) {
            // If response is not JSON, use status text
            errorMessage = response.statusText || errorMessage;
          }
          toast.error(errorMessage);
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.error(`Error de conexión al subir ${file.name}`);
      }
    }

    setFormData(prev => ({
      ...prev,
      evidence_images: [...prev.evidence_images, ...newImages],
      evidence_filenames: [...prev.evidence_filenames, ...newFilenames]
    }));
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      evidence_images: prev.evidence_images.filter((_, i) => i !== index),
      evidence_filenames: prev.evidence_filenames.filter((_, i) => i !== index)
    }));
  };

  // ...existing code...

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.description.trim()) {
      toast.error('La descripción del problema es obligatoria');
      return;
    }
    
    if (!formData.equipment_area) {
      toast.error('Debes seleccionar el área del equipo');
      return;
    }

    setLoading(true);

    try {
      // Auto-generar título si está vacío
      let finalFormData = { ...formData };
      if (!finalFormData.title.trim()) {
        const areaName = finalFormData.equipment_area === 'fusion' ? 'Fusión' : 
                        finalFormData.equipment_area === 'moldeo' ? 'Moldeo' : 'Mecanizado';
        const machineName = finalFormData.equipment_machine || 'Equipo';
        const timestamp = new Date().toLocaleDateString('es-ES');
        finalFormData.title = `Reporte ${areaName} - ${machineName} (${timestamp})`;
      }

      // Determinar prioridad automáticamente para equipos de fusión
      if (finalFormData.equipment_area === 'fusion' && finalFormData.priority === 'media') {
        finalFormData.priority = 'alta';
      }

      // Convertir arrays a string JSON para el backend
      finalFormData.evidence_images = JSON.stringify(finalFormData.evidence_images || []);
      finalFormData.evidence_filenames = JSON.stringify(finalFormData.evidence_filenames || []);

      const token = localStorage.getItem('token');
      const url = id ? `/api/reports/${id}` : '/api/reports';
      const method = id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(finalFormData)
      });

      if (response.ok) {
        toast.success(id ? '¡Reporte actualizado exitosamente!' : '¡Reporte creado exitosamente!');
        navigate('/reports');
      } else {
        const error = await response.json();
        toast.error(error.error || `Error al ${id ? 'actualizar' : 'crear'} el reporte`);
      }
    } catch (error) {
      console.error('Error creating report:', error);
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {id ? 'Editar Reporte' : 'Crear Nuevo Reporte'}
          </h1>
          <p className="text-gray-600">Completa la información del reporte de mantenimiento</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica */}
          <div className="card">
            <h3 className="text-lg font-medium mb-4">¿Qué problema encontraste?</h3>
            
            {/* Descripción - Campo principal y más prominente */}
            <div className="mb-6">
              <label className="block text-lg font-medium text-gray-900 mb-3">
                Describe el problema *
              </label>
              <div className="relative">
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Explica claramente qué está fallando, qué sonidos hace, qué observaste..."
                  required
                />
                {/* Eliminado botón de dictado por voz */}
              </div>
              {/* Eliminado tip de dictado por voz */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título del Reporte <span className="text-gray-400">(opcional)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="input-field pr-10"
                    placeholder="Se generará automáticamente si se deja vacío"
                  />
                  {/* Eliminado botón de dictado por voz en título */}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Reporte
                </label>
                <select
                  value={formData.issue_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, issue_type: e.target.value }))}
                  className="input-field"
                >
                  {issueTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Selección de Equipo */}
          <div className="card">
            <h3 className="text-lg font-medium mb-4">¿Dónde está el problema?</h3>
            
            <div className="space-y-4">
              {/* Área */}
              <div>
                <label className="block text-base font-medium text-gray-900 mb-2">
                  1. Selecciona el área *
                </label>
                <select
                  value={formData.equipment_area}
                  onChange={(e) => handleAreaChange(e.target.value)}
                  className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">-- Elige un área --</option>
                  {equipmentOptions.areas.map(area => (
                    <option key={area} value={area}>
                      📍 {area.charAt(0).toUpperCase() + area.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Máquina */}
              {formData.equipment_area && (
                <div className="animate-fadeIn">
                  <label className="block text-base font-medium text-gray-900 mb-2">
                    2. Selecciona la máquina o línea
                  </label>
                  <select
                    value={formData.equipment_machine}
                    onChange={(e) => handleMachineChange(e.target.value)}
                    className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">-- Elige una máquina --</option>
                    {equipmentOptions.machines.map(machine => (
                      <option key={machine} value={machine}>
                        🔧 {machine.charAt(0).toUpperCase() + machine.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Elemento */}
              {formData.equipment_machine && (
                <div className="animate-fadeIn">
                  <label className="block text-base font-medium text-gray-900 mb-2">
                    3. Selecciona el elemento específico
                  </label>
                  <select
                    value={formData.equipment_element}
                    onChange={(e) => handleElementChange(e.target.value)}
                    className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">-- Elige un elemento --</option>
                    {equipmentOptions.elements.map(element => (
                      <option key={element} value={element}>
                        ⚙️ {element}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Componente */}
              {formData.equipment_element && equipmentOptions.components.length > 0 && (
                <div className="animate-fadeIn">
                  <label className="block text-base font-medium text-gray-900 mb-2">
                    4. Selecciona el componente (opcional)
                  </label>
                  <select
                    value={formData.equipment_component}
                    onChange={(e) => setFormData(prev => ({ ...prev, equipment_component: e.target.value }))}
                    className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">-- Elige un componente --</option>
                    {equipmentOptions.components.map(component => (
                      <option key={component} value={component}>
                        🔩 {component}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Mostrar ruta seleccionada */}
              {formData.equipment_area && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-800">Ubicación seleccionada:</p>
                  <p className="text-blue-700">
                    {[
                      formData.equipment_area,
                      formData.equipment_machine,
                      formData.equipment_element,
                      formData.equipment_component
                    ].filter(Boolean).join(' → ')}
                  </p>
                </div>
              )}
            </div>

            {formData.equipment_area === 'fusion' && (
              <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="h-6 w-6 text-orange-500 mr-3" />
                  <div>
                    <span className="text-base font-medium text-orange-800">
                      Área Crítica Detectada
                    </span>
                    <p className="text-sm text-orange-700 mt-1">
                      Los reportes del área de fusión tienen prioridad alta automáticamente
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Prioridad */}
          <div className="card">
            <h3 className="text-lg font-medium mb-4">¿Qué tan urgente es?</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {priorities.map(priority => (
                <label key={priority.value} className="relative flex items-center cursor-pointer group">
                  <input
                    type="radio"
                    name="priority"
                    value={priority.value}
                    checked={formData.priority === priority.value}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                    className="sr-only"
                  />
                  <div className={`w-full p-4 rounded-xl border-2 text-center transition-all duration-200 group-hover:scale-105 ${
                    formData.priority === priority.value
                      ? 'border-blue-500 ' + priority.color + ' shadow-md'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}>
                    <div className="text-lg mb-1">
                      {priority.value === 'baja' && '🟢'}
                      {priority.value === 'media' && '🟡'}
                      {priority.value === 'alta' && '🟠'}
                      {priority.value === 'critica' && '🔴'}
                    </div>
                    <span className="font-medium text-sm">{priority.label}</span>
                    <div className="text-xs text-gray-600 mt-1">
                      {priority.value === 'baja' && 'Puede esperar'}
                      {priority.value === 'media' && 'Normal'}
                      {priority.value === 'alta' && 'Pronto'}
                      {priority.value === 'critica' && '¡Inmediato!'}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Evidencia Fotográfica */}
          <div className="card">
            <h3 className="text-lg font-medium mb-4">📸 Agrega fotos del problema</h3>
            <p className="text-gray-600 mb-4">Las fotos ayudan mucho a entender el problema (máximo 3)</p>
            
            <div className="space-y-4">
              {formData.evidence_images.length < 3 && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors bg-blue-25"
                >
                  <div className="flex flex-col items-center">
                    <PhotoIcon className="h-12 w-12 text-blue-500 mb-3" />
                    <p className="text-lg font-medium text-blue-700 mb-1">
                      Toca para agregar fotos
                    </p>
                    <p className="text-sm text-blue-600">
                      O arrastra las imágenes aquí
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Formatos: PNG, JPG • Máximo 5MB cada una
                    </p>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleImageUpload(Array.from(e.target.files))}
                className="hidden"
              />

              {formData.evidence_images.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    Fotos agregadas ({formData.evidence_images.length}/3):
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {formData.evidence_images.map((image, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-w-4 aspect-h-3 bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={image}
                            alt={`Evidencia ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Eliminar foto"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                        <p className="text-xs text-gray-500 mt-1 text-center truncate">
                          {formData.evidence_filenames[index]}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Comentarios Adicionales */}
          <div className="card">
            <h3 className="text-lg font-medium mb-4">💬 Comentarios adicionales</h3>
            <p className="text-gray-600 mb-3">¿Algo más que debamos saber? (opcional)</p>
            
            <div className="relative">
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Recomendaciones, observaciones, trabajos previos realizados..."
              />
              {/* Eliminado botón de dictado por voz en comentarios */}
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6">
            <button
              type="button"
              onClick={() => navigate('/reports')}
              className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !formData.description || !formData.equipment_area}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center min-w-[140px]"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  {id ? 'Guardar Cambios' : 'Enviar Reporte'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default CreateReport;
