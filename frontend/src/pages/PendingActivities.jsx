import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/Layout';
import Button from '../components/common/Button';
import EquipmentSelector from '../components/common/EquipmentSelector';

const PendingActivities = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [formData, setFormData] = useState({
    equipment_area: '',
    equipment_machine: '',
    equipment_element: '',
    issue_type: 'correctivo',
    description: ''
  });
  const [message, setMessage] = useState('');

  // Verificar si el usuario es administrador
  const isAdmin = user && (user.role === 'admin' || user.role === 'super_admin');

  // Fetch pending activities
  useEffect(() => {
    if (isAdmin) {
      fetchPendingActivities();
    }
  }, [isAdmin]);

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
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
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
        setShowForm(false);
        // Refresh the activities list
        fetchPendingActivities();
      } else {
        setMessage(`Error: ${result.error || 'Error desconocido'}`);
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
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
        setShowEditModal(false);
        setEditingActivity(null);
        // Limpiar el formulario
        setFormData({
          equipment_area: '',
          equipment_machine: '',
          equipment_element: '',
          issue_type: 'correctivo',
          description: ''
        });
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
          <Button onClick={() => setShowForm(true)}>
            Añadir Actividad
          </Button>
        </div>

        {message && (
          <div className={`p-4 rounded-md ${message.includes('Error') ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'}`}>
            {message}
          </div>
        )}

        {showForm && (
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Nueva Actividad Pendiente
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <EquipmentSelector
                value={formData}
                onChange={handleEquipmentChange}
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tipo de Mantenimiento
                </label>
                <select
                  name="issue_type"
                  value={formData.issue_type}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="preventivo">Preventivo</option>
                  <option value="correctivo">Correctivo</option>
                  <option value="mejora">Mejora</option>
                </select>
              </div>

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
                  onClick={() => setShowForm(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  Crear Actividad
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Modal de edición */}
        {showEditModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Editar Actividad Pendiente
                </h3>
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

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Lista de Actividades Pendientes
          </h2>
          
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay actividades pendientes</h3>
              <p className="mt-1 text-sm text-gray-500">
                Comienza creando una nueva actividad pendiente.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden bg-white shadow sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {activities.map((activity) => (
                  <li key={activity.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="truncate text-sm font-medium text-blue-600">
                          {activity.equipment_display || `${activity.equipment_area}${activity.equipment_machine ? ` - ${activity.equipment_machine}` : ''}`}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex space-x-2">
                          {getStatusBadge(activity.status)}
                          <button
                            onClick={() => handleEdit(activity)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(activity.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
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
                      <div className="mt-2">
                        <p className="text-sm text-gray-700">
                          {activity.description}
                        </p>
                      </div>
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