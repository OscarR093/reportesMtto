import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/Layout';
import Button from '../components/common/Button';

const MyPendingActivities = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all' // all, asignado, realizado (pendiente ya no tiene sentido)
  });
  const [message, setMessage] = useState('');

  // Fetch my pending activities
  useEffect(() => {
    if (user) {
      fetchMyPendingActivities();
    }
  }, [user]);

  // Apply filters when activities or filters change
  useEffect(() => {
    applyFilters();
  }, [activities, filters]);

  const fetchMyPendingActivities = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/my-pending/my', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        setActivities(result.data);
      }
    } catch (error) {
      console.error('Error fetching my pending activities:', error);
      setMessage(`Error al cargar actividades: ${error.message}`);
    } finally {
      setLoading(false);
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

  const markAsCompleted = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas marcar esta actividad como realizada?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/my-pending/my/${id}/complete`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        setMessage('Actividad marcada como realizada exitosamente');
        // Recargar las actividades para reflejar el cambio
        fetchMyPendingActivities();
      } else {
        setMessage(`Error: ${result.error || 'Error desconocido'}`);
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
    
    // Ocultar el mensaje después de 3 segundos
    setTimeout(() => setMessage(''), 3000);
  };

  if (!user) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900">Acceso Requerido</h1>
          <p className="mt-2 text-gray-600">
            Por favor inicie sesión para ver sus actividades pendientes.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Mis Actividades Pendientes
            </h1>
            <p className="text-gray-600">
              Actividades pendientes asignadas a ti
            </p>
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

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No hay actividades pendientes</h3>
            <p className="mt-2 text-gray-500">
              No tienes actividades pendientes asignadas actualmente.
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredActivities.map((activity) => (
              <div key={activity.id} className="bg-white shadow rounded-lg p-6 border border-gray-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {activity.equipment_display || `${activity.equipment_area}${activity.equipment_machine ? ` - ${activity.equipment_machine}` : ''}`}
                      </h3>
                      {getStatusBadge(activity.status)}
                    </div>
                    
                    <p className="text-gray-800 font-semibold mb-4">{activity.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Tipo:</span>
                        <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {activity.issue_type === 'preventivo' ? 'Preventivo' : 
                           activity.issue_type === 'correctivo' ? 'Correctivo' : 
                           activity.issue_type === 'mejora' ? 'Mejora' : activity.issue_type}
                        </span>
                      </div>
                      
                      <div>
                        <span className="font-medium text-gray-700">Creada:</span>
                        <span className="ml-2 font-semibold text-gray-800">
                          {new Date(activity.created_at).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                      
                      {activity.scheduled_date && (
                        <div>
                          <span className="font-medium text-gray-700">Fecha programada:</span>
                          <span className="ml-2 font-semibold text-gray-800">
                            {/* Manejar la fecha programada para evitar el cambio de día por zona horaria */}
                            {activity.scheduled_date instanceof Date 
                              ? activity.scheduled_date.toLocaleDateString('es-ES')
                              : new Date(activity.scheduled_date + 'T00:00:00').toLocaleDateString('es-ES')}
                            ({getShiftLabel(activity.shift)})
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {activity.assigned_users_parsed && activity.assigned_users_parsed.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <span className="font-medium text-gray-700">Asignada a:</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {activity.assigned_users_parsed.map((assignedUser) => (
                            <span 
                              key={assignedUser.id} 
                              className={`px-3 py-1 rounded-full text-xs ${
                                assignedUser.id === user.id 
                                  ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {assignedUser.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Botón para marcar como realizado si el estado es asignado */}
                    {activity.status === 'asignado' && (
                      <div className="mt-6 flex justify-end">
                        <button
                          onClick={() => markAsCompleted(activity.id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                        >
                          Marcar como Realizado
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyPendingActivities;