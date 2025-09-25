import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/Layout';
import Button from '../components/common/Button';
import EquipmentSelector from '../components/common/EquipmentSelector';

const PendingActivities = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [assigningActivity, setAssigningActivity] = useState(null);
  const [formData, setFormData] = useState({
    equipment_area: '',
    equipment_machine: '',
    equipment_element: '',
    issue_type: 'correctivo',
    description: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignData, setAssignData] = useState({
    assigned_users: [],
    scheduled_date: '',
    shift: '1'
  });
  const [filters, setFilters] = useState({
    status: 'all' // all, pendiente, asignado, realizado
  });
  const [message, setMessage] = useState('');

  // Verificar si el usuario es administrador
  const isAdmin = user && (user.role === 'admin' || user.role === 'super_admin');

  // Fetch pending activities
  useEffect(() => {
    if (isAdmin) {
      fetchPendingActivities();
      fetchActiveUsers();
    }
  }, [isAdmin]);

  // Apply filters when activities or filters change
  useEffect(() => {
    applyFilters();
  }, [activities, filters]);

  const fetchPendingActivities = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/pending', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        console.log('Activities data:', result.data); // For debugging
        setActivities(result.data);
      }
    } catch (error) {
      console.error('Error fetching pending activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/pending/users/active', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        setUsers(result.data);
      }
    } catch (error) {
      console.error('Error fetching active users:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...activities];
    
    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(activity => activity.status === filters.status);
    }
    
    setFilteredActivities(filtered);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/pending/export', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al exportar actividades');
      }

      // Obtener el blob del archivo Excel
      const blob = await response.blob();
      
      // Crear un enlace para descargar el archivo
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `actividades_asignadas_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      
      // Limpiar
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      setMessage('Archivo exportado exitosamente');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error exporting activities:', error);
      setMessage(`Error al exportar actividades: ${error.message}`);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (!user || !isAdmin) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900">Acceso Denegado</h1>
          <p className="mt-2 text-gray-600">
            No tienes permiso para acceder a esta sección.
          </p>
        </div>
      </Layout>
    );
  }

  const handleEquipmentChange = (equipment) => {
    setFormData(prev => ({
      ...prev,
      ...equipment
    }));
    
    // Limpiar errores de equipo cuando se actualiza
    if (formErrors.equipment_area || formErrors.equipment_machine || formErrors.equipment_element) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.equipment_area;
        delete newErrors.equipment_machine;
        delete newErrors.equipment_element;
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
    
    // Limpiar errores específicos cuando el usuario corrige un campo
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleAssignChange = (e) => {
    const { name, value } = e.target;
    setAssignData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación del formulario antes de enviar
    const errors = {};
    if (!formData.equipment_area) {
      errors.equipment_area = 'El área del equipo es requerida';
    }
    if (!formData.description.trim()) {
      errors.description = 'La descripción es requerida';
    }
    if (formData.description.trim().length < 10) {
      errors.description = 'La descripción debe tener al menos 10 caracteres';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setMessage('Por favor corrija los errores en el formulario');
      return;
    }

    setIsSubmitting(true);
    setFormErrors({});
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/pending', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        setMessage('Actividad creada exitosamente');
        // Limpiar el formulario
        setFormData({
          equipment_area: '',
          equipment_machine: '',
          equipment_element: '',
          issue_type: 'correctivo',
          description: ''
        });
        setFormErrors({});
        setShowForm(false);
        // Refresh the activities list
        fetchPendingActivities();
      } else {
        setMessage(`Error: ${result.error || 'Error desconocido'}`);
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (activity) => {
    setEditingActivity(activity);
    setFormData({
      equipment_area: activity.equipment_area || '',
      equipment_machine: activity.equipment_machine || '',
      equipment_element: activity.equipment_element || '',
      issue_type: activity.issue_type || 'correctivo',
      description: activity.description || ''
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/pending/${editingActivity.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          equipment_area: formData.equipment_area,
          equipment_machine: formData.equipment_machine,
          equipment_element: formData.equipment_element,
          description: formData.description
        })
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        setMessage('Actividad actualizada exitosamente');
        // Limpiar el formulario
        setFormData({
          equipment_area: '',
          equipment_machine: '',
          equipment_element: '',
          issue_type: 'correctivo',
          description: ''
        });
        setShowEditModal(false);
        setEditingActivity(null);
        // Refresh the activities list
        fetchPendingActivities();
      } else {
        setMessage(`Error: ${result.error || 'Error desconocido'}`);
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta actividad?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/pending/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        setMessage('Actividad eliminada exitosamente');
        // Refresh the activities list
        fetchPendingActivities();
      } else {
        setMessage(`Error: ${result.error || 'Error desconocido'}`);
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  const handleAssign = (activity) => {
    setAssigningActivity(activity);
    
    // Si la actividad ya está asignada, cargar los datos existentes
    if (activity.status === 'asignado' && activity.assigned_users_parsed) {
      setAssignData({
        assigned_users: activity.assigned_users_parsed,
        scheduled_date: activity.scheduled_date ? activity.scheduled_date.split('T')[0] : '',
        shift: activity.shift || '1'
      });
    } else {
      // Inicializar datos de asignación con valores por defecto
      setAssignData({
        assigned_users: [],
        scheduled_date: '',
        shift: '1'
      });
    }
    setShowAssignModal(true);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/pending/${assigningActivity.id}/assign`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(assignData)
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        setMessage('Actividad asignada exitosamente');
        // Limpiar datos de asignación
        setAssignData({
          assigned_users: [],
          scheduled_date: '',
          shift: '1'
        });
        setShowAssignModal(false);
        setAssigningActivity(null);
        // Refresh the activities list
        fetchPendingActivities();
      } else {
        setMessage(`Error: ${result.error || 'Error desconocido'}`);
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  const addUserToAssignment = (userId) => {
    if (!assignData.assigned_users.includes(userId)) {
      setAssignData(prev => ({
        ...prev,
        assigned_users: [...prev.assigned_users, userId]
      }));
    }
  };

  const removeUserFromAssignment = (userId) => {
    setAssignData(prev => ({
      ...prev,
      assigned_users: prev.assigned_users.filter(id => id !== userId)
    }));
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      'pendiente': 'bg-yellow-100 text-yellow-800',
      'asignado': 'bg-blue-100 text-blue-800',
      'realizado': 'bg-green-100 text-green-800'
    };
    
    const statusLabels = {
      'pendiente': 'Pendiente',
      'asignado': 'Asignado',
      'realizado': 'Realizado'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
        {statusLabels[status] || status}
      </span>
    );
  };

  const getShiftLabel = (shift) => {
    const shiftLabels = {
      '1': 'Matutino',
      '2': 'Vespertino'
    };
    
    return shiftLabels[shift] || shift;
  };

  // Get users not yet assigned (for selection list)
  const getAvailableUsers = () => {
    return users.filter(user => 
      !assignData.assigned_users.includes(user.id)
    );
  };

  // Get assigned users with full info
  const getAssignedUsers = () => {
    return users.filter(user => 
      assignData.assigned_users.includes(user.id)
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Actividades Pendientes
            </h1>
            <p className="text-gray-600">
              Gestiona las actividades pendientes de mantenimiento
            </p>
          </div>
          <div className="flex space-x-2">
            <Button onClick={handleExport} variant="secondary">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Exportar a Excel
            </Button>
            <Button onClick={() => setShowForm(true)}>
              Añadir Actividad
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <div className="card">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="all">Todos</option>
                <option value="pendiente">Pendiente</option>
                <option value="asignado">Asignado</option>
                <option value="realizado">Realizado</option>
              </select>
            </div>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-md ${message.includes('Error') ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'}`}>
            {message}
          </div>
        )}

        {/* Modal de creación */}
        {showForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Nueva Actividad Pendiente
                  </h3>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setFormErrors({});
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {message && (
                  <div className={`mb-4 p-3 rounded-md ${
                    message.includes('Error') 
                      ? 'bg-red-50 text-red-800 border border-red-200' 
                      : 'bg-green-50 text-green-800 border border-green-200'
                  }`}>
                    {message}
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Equipo <span className="text-red-500">*</span>
                      </label>
                      {formErrors.equipment_area && (
                        <span className="text-sm text-red-600">{formErrors.equipment_area}</span>
                      )}
                    </div>
                    <EquipmentSelector
                      value={formData}
                      onChange={handleEquipmentChange}
                      required
                    />
                    {formErrors.equipment_area && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.equipment_area}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Mantenimiento <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {[
                        { value: 'preventivo', label: 'Preventivo', color: 'bg-blue-100 text-blue-800' },
                        { value: 'correctivo', label: 'Correctivo', color: 'bg-yellow-100 text-yellow-800' },
                        { value: 'mejora', label: 'Mejora', color: 'bg-purple-100 text-purple-800' }
                      ].map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, issue_type: type.value }));
                            // Limpiar error si existía
                            if (formErrors.issue_type) {
                              setFormErrors(prev => {
                                const newErrors = { ...prev };
                                delete newErrors.issue_type;
                                return newErrors;
                              });
                            }
                          }}
                          className={`p-3 rounded-md border text-center transition-colors ${
                            formData.issue_type === type.value
                              ? `${type.color} border-transparent shadow-inner`
                              : 'bg-white border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <span className="font-medium">{type.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Descripción <span className="text-red-500">*</span>
                      </label>
                      {formErrors.description && (
                        <span className="text-sm text-red-600">{formErrors.description}</span>
                      )}
                    </div>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={5}
                      className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                        formErrors.description 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                      }`}
                      placeholder="Describe detalladamente la actividad pendiente..."
                      minLength={10}
                    />
                    {formErrors.description && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      {formData.description.length}/10 caracteres mínimos
                    </p>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setShowForm(false);
                        setFormErrors({});
                        setMessage(''); // Limpiar el mensaje al cerrar
                      }}
                      disabled={isSubmitting}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Procesando...
                        </span>
                      ) : (
                        'Crear Actividad'
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal de edición */}
        {showEditModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Editar Actividad Pendiente
                  </h3>
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingActivity(null);
                      setMessage(''); // Limpiar el mensaje al cerrar
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {message && (
                  <div className={`mb-4 p-3 rounded-md ${
                    message.includes('Error') 
                      ? 'bg-red-50 text-red-800 border border-red-200' 
                      : 'bg-green-50 text-green-800 border border-green-200'
                  }`}>
                    {message}
                  </div>
                )}
                
                <form onSubmit={handleUpdate} className="space-y-4">
                  <EquipmentSelector
                    value={formData}
                    onChange={handleEquipmentChange}
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Descripción
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={4}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setShowEditModal(false);
                        setEditingActivity(null);
                        setMessage(''); // Limpiar el mensaje al cerrar
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit">
                      Actualizar Actividad
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal de asignación */}
        {showAssignModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {assigningActivity?.status === 'asignado' ? 'Modificar Asignación' : 'Asignar Actividad Pendiente'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowAssignModal(false);
                      setAssigningActivity(null);
                      setMessage(''); // Limpiar el mensaje al cerrar
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {message && (
                  <div className={`mb-4 p-3 rounded-md ${
                    message.includes('Error') 
                      ? 'bg-red-50 text-red-800 border border-red-200' 
                      : 'bg-green-50 text-green-800 border border-green-200'
                  }`}>
                    {message}
                  </div>
                )}
                
                <form onSubmit={handleAssignSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Columna izquierda - Usuarios disponibles */}
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-2">
                        Usuarios Disponibles
                      </h4>
                      <div className="border rounded-md p-3 max-h-60 overflow-y-auto">
                        {getAvailableUsers().length > 0 ? (
                          getAvailableUsers().map((user) => (
                            <div 
                              key={user.id} 
                              className="flex items-center justify-between p-2 hover:bg-gray-50 cursor-pointer"
                              onClick={() => addUserToAssignment(user.id)}
                            >
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  <span className="text-blue-800 font-medium">
                                    {user.display_name ? user.display_name.charAt(0).toUpperCase() : user.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div className="ml-3">
                                  <p className="text-sm font-medium text-gray-900">
                                    {user.display_name || user.name}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {user.email}
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                              </button>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 text-center py-4">
                            No hay usuarios disponibles
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Columna derecha - Usuarios asignados */}
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-2">
                        Usuarios Asignados
                      </h4>
                      <div className="border rounded-md p-3 min-h-[200px]">
                        {getAssignedUsers().length > 0 ? (
                          getAssignedUsers().map((user) => (
                            <div 
                              key={user.id} 
                              className="flex items-center justify-between p-2 bg-blue-50 rounded-md mb-2"
                            >
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  <span className="text-blue-800 font-medium">
                                    {user.display_name ? user.display_name.charAt(0).toUpperCase() : user.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div className="ml-3">
                                  <p className="text-sm font-medium text-gray-900">
                                    {user.display_name || user.name}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {user.email}
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeUserFromAssignment(user.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <p className="text-sm text-gray-500 text-center">
                              No hay usuarios asignados
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Fecha programada
                      </label>
                      <input
                        type="date"
                        name="scheduled_date"
                        value={assignData.scheduled_date}
                        onChange={handleAssignChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Turno
                      </label>
                      <select
                        name="shift"
                        value={assignData.shift}
                        onChange={handleAssignChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      >
                        <option value="1">Matutino</option>
                        <option value="2">Vespertino</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 mt-6">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setShowAssignModal(false);
                        setAssigningActivity(null);
                        setMessage(''); // Limpiar el mensaje al cerrar
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit">
                      {assigningActivity?.status === 'asignado' ? 'Actualizar Asignación' : 'Asignar Actividad'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Lista de Actividades Pendientes
          </h2>
          
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay actividades</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filters.status === 'all' 
                  ? 'No hay actividades pendientes.' 
                  : `No hay actividades con estado "${filters.status}".`}
              </p>
            </div>
          ) : (
            <div className="overflow-hidden bg-white shadow sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {filteredActivities.map((activity) => (
                  <li key={activity.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="truncate text-sm font-medium text-blue-600">
                          {activity.equipment_display || `${activity.equipment_area}${activity.equipment_machine ? ` - ${activity.equipment_machine}` : ''}`}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex space-x-2">
                          {getStatusBadge(activity.status)}
                          {activity.status === 'pendiente' && (
                            <button
                              onClick={() => handleAssign(activity)}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                              title="Asignar"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                              </svg>
                              Asignar
                            </button>
                          )}
                          {activity.status === 'asignado' && (
                            <button
                              onClick={() => handleAssign(activity)}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              title="Modificar asignación"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Modificar
                            </button>
                          )}
                          <button
                            onClick={() => handleEdit(activity)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            title="Editar"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(activity.id)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            title="Eliminar"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1v3M4 7h16" />
                            </svg>
                            Eliminar
                          </button>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-base font-medium text-gray-900">
                          {activity.description}
                        </p>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            {activity.issue_type === 'preventivo' && 'Preventivo'}
                            {activity.issue_type === 'correctivo' && 'Correctivo'}
                            {activity.issue_type === 'mejora' && 'Mejora'}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          {(() => {
                            // Try different possible date field names
                            const dateValue = activity.created_at || activity.createdAt;
                            if (!dateValue) return 'Fecha no disponible';
                            const date = new Date(dateValue);
                            return isNaN(date.getTime()) 
                              ? 'Fecha no válida' 
                              : `Creado: ${date.toLocaleDateString('es-ES')}`;
                          })()}
                        </div>
                      </div>
                      {activity.status === 'asignado' && activity.scheduled_date && (
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Programado para: {new Date(activity.scheduled_date + 'T00:00:00').toLocaleDateString('es-ES')} ({getShiftLabel(activity.shift)})
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PendingActivities;