import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PhotoIcon,
  ClockIcon,
  UserIcon,
  WrenchScrewdriverIcon,
  XMarkIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import Layout from '../components/Layout';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { formatDateTime } from '../utils/helpers';

const Reports = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [morningReports, setMorningReports] = useState([]);
  const [eveningReports, setEveningReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterArea, setFilterArea] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [imageViewerSrc, setImageViewerSrc] = useState(null);
  const [exporting, setExporting] = useState(false);

  // Verificar si el usuario puede exportar (es admin o super_admin)
  const canExportReports = user?.role && ['admin', 'super_admin'].includes(user.role);

  const statusOptions = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'abierto', label: 'Abiertos' },
    { value: 'cerrado', label: 'Cerrados' }
  ];

  const priorityOptions = [
    { value: 'all', label: 'Todas las prioridades' },
    { value: 'baja', label: 'Baja' },
    { value: 'media', label: 'Media' },
    { value: 'alta', label: 'Alta' },
    { value: 'critica', label: 'Crítica' }
  ];

  const areaOptions = [
    { value: 'all', label: 'Todas las áreas' },
    { value: 'fusion', label: 'Fusión' },
    { value: 'moldeo', label: 'Moldeo' },
    { value: 'mecanizado', label: 'Mecanizado' }
  ];

  // Función simplificada para obtener reportes por turno
  const fetchReportsByShift = async (shift) => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: 1,
        limit: 100,
        date: selectedDate,
        shift: shift
      });
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterPriority !== 'all') params.append('priority', filterPriority);
      if (filterArea !== 'all') params.append('equipment_area', filterArea);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/reports?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        return data.data || [];
      } else {
        toast.error(`Error al cargar los reportes del turno ${shift}`);
        return [];
      }
    } catch (error) {
      console.error(`Error fetching reports for shift ${shift}:`, error);
      toast.error('Error de conexión');
      return [];
    }
  };

  // Función simplificada para obtener todos los reportes
  const fetchAllReports = async () => {
    setLoading(true);
    try {
      const [morning, evening] = await Promise.all([
        fetchReportsByShift('morning'),
        fetchReportsByShift('evening')
      ]);
      setMorningReports(morning);
      setEveningReports(evening);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllReports();
  }, [selectedDate, filterStatus, filterPriority, filterArea, searchTerm]);

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este reporte?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchAllReports();
        toast.success('Reporte eliminado correctamente');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al eliminar el reporte');
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error('Error de conexión');
    }
  };

  const handleStatusChange = async (reportId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/reports/${reportId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchAllReports();
        toast.success('Estado actualizado correctamente');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al actualizar el estado');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error de conexión');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critica': return 'text-red-600 bg-red-100';
      case 'alta': return 'text-orange-600 bg-orange-100';
      case 'media': return 'text-yellow-600 bg-yellow-100';
      case 'baja': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'abierto': return 'text-blue-600 bg-blue-100';
      case 'en_proceso': return 'text-yellow-600 bg-yellow-100';
      case 'resuelto': return 'text-green-600 bg-green-100';
      case 'cerrado': return 'text-gray-600 bg-gray-100';
      case 'cancelado': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString) => formatDateTime(dateString);
  const canEditReport = (report) => user?.id === report.user_id && report.status === 'abierto';
  const canDeleteReport = (report) => user?.id === report.user_id && report.status === 'abierto';
  const canChangeStatus = (report) => user?.role && ['admin', 'super_admin'].includes(user.role);
  
  const viewReportDetails = (report) => {
    setSelectedReport(report);
    setShowModal(true);
  };

  const renderReportsTable = (reports, shiftTitle) => {
    if (loading) {
      return (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (reports.length === 0) {
      return (
        <div className="text-center py-8">
          <WrenchScrewdriverIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay reportes</h3>
          <p className="text-gray-600">No se encontraron reportes para este turno</p>
        </div>
      );
    }

    const sortedReports = [...reports].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return (
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipo</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prioridad</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Técnico</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedReports.map((report) => (
              <tr key={report.id} className="hover:bg-gray-50 cursor-pointer transition-colors duration-150" onClick={() => viewReportDetails(report)}>
                <td className="px-4 py-3 max-w-xs">
                  <div className="text-sm font-bold text-gray-900 truncate" title={report.description || 'Sin descripción'}>
                    {report.description || 'Sin descripción'}
                  </div>
                  {report.evidence_images && (() => {
                    try {
                      const images = JSON.parse(report.evidence_images);
                      return images.length > 0 && (
                        <div className="flex items-center mt-1">
                          <PhotoIcon className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-xs text-gray-500">{images.length}</span>
                        </div>
                      );
                    } catch { return null; }
                  })()}
                </td>
                <td className="px-4 py-3 max-w-xs">
                  <div className="text-sm text-gray-900 truncate" title={report.equipment_display || report.equipment_element || report.equipment_machine || report.equipment_area}>
                    {report.equipment_display || report.equipment_element || report.equipment_machine || report.equipment_area}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(report.priority)}`}>
                    {report.priority.charAt(0).toUpperCase() + report.priority.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {canChangeStatus(report) && report.status !== 'cerrado' ? (
                    <select
                      value={report.status}
                      onChange={(e) => { e.stopPropagation(); handleStatusChange(report.id, e.target.value); }}
                      className={`text-xs font-semibold rounded-full px-2 py-1 border-0 ${getStatusColor(report.status)}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="abierto">Abierto</option>
                      <option value="cerrado">Cerrado</option>
                    </select>
                  ) : (
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.status)}`}>
                      {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 max-w-xs">
                  <div className="flex items-center">
                    <div className="text-sm text-gray-900 truncate" title={report.technician_name}>
                      {report.technician_name}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Date(report.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-1" onClick={(e) => e.stopPropagation()}>
                    {canEditReport(report) && (
                      <button onClick={(e) => { e.stopPropagation(); navigate(`/reports/${report.id}/edit`); }} className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50" title="Editar"><PencilIcon className="h-4 w-4" /></button>
                    )}
                    {canDeleteReport(report) && (
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteReport(report.id); }} className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50" title="Eliminar"><TrashIcon className="h-4 w-4" /></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const handleDownload = async (url) => {
    try {
      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) throw new Error('No se pudo descargar la imagen');
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = url.split('/').pop();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (err) {
      toast.error('Error al descargar la imagen');
    }
  };

  // Función para exportar reportes a Excel
  const handleExport = async () => {
    if (!canExportReports) {
      toast.error('No tienes permisos para exportar reportes');
      return;
    }

    try {
      setExporting(true);
      const token = localStorage.getItem('token');
      
      // Construir parámetros de filtro
      const params = new URLSearchParams({
        date: selectedDate
      });
      
      // Agregar filtros solo si no son 'all'
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterPriority !== 'all') params.append('priority', filterPriority);
      if (filterArea !== 'all') params.append('equipment_area', filterArea);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/reports/export?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al exportar reportes');
      }

      // Descargar el archivo
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reportes_mantenimiento_${selectedDate}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success('Reporte exportado exitosamente');
    } catch (error) {
      console.error('Error exporting reports:', error);
      toast.error(error.message || 'Error al exportar reportes');
    } finally {
      setExporting(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reportes de Mantenimiento</h1>
            <p className="text-gray-600">Gestiona y supervisa todos los reportes por turno</p>
          </div>
          <div className="flex space-x-2">
            {canExportReports && (
              <button 
                onClick={handleExport}
                disabled={exporting}
                className="btn-secondary flex items-center"
              >
                {exporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Exportando...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Exportar a Excel
                  </>
                )}
              </button>
            )}
            <Link to="/reports/create" className="btn-primary flex items-center">
              <PlusIcon className="h-5 w-5 mr-2" />
              Nuevo Reporte
            </Link>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtros de Búsqueda</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
              <input 
                type="date" 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)} 
                className="input-field w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)} 
                className="input-field w-full"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
              <select 
                value={filterPriority} 
                onChange={(e) => setFilterPriority(e.target.value)} 
                className="input-field w-full"
              >
                {priorityOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Área</label>
              <select 
                value={filterArea} 
                onChange={(e) => setFilterArea(e.target.value)} 
                className="input-field w-full"
              >
                {areaOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            
            <div className="xl:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                <input 
                  type="text" 
                  placeholder="Buscar reportes..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className="input-field-with-icon w-full"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Turno Matutino (6:00 - 17:59)</h2>
                <p className="text-sm text-gray-500">Reportes del turno matutino</p>
              </div>
            </div>
            <div className="flex items-center">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                <span className="h-2 w-2 rounded-full bg-blue-600 mr-2"></span>
                {morningReports.length} reportes
              </span>
            </div>
          </div>
          {renderReportsTable(morningReports, 'Matutino')}
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="bg-orange-100 p-2 rounded-lg mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Turno Vespertino (18:00 - 5:59)</h2>
                <p className="text-sm text-gray-500">Reportes del turno vespertino</p>
              </div>
            </div>
            <div className="flex items-center">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                <span className="h-2 w-2 rounded-full bg-orange-600 mr-2"></span>
                {eveningReports.length} reportes
              </span>
            </div>
          </div>
          {renderReportsTable(eveningReports, 'Vespertino')}
        </div>

        {showModal && selectedReport && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowModal(false)}
          >
            <div 
              className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">Detalles del Reporte</h3>
                  <button 
                    onClick={() => setShowModal(false)} 
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    title="Cerrar"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                
                {/* Descripción principal con énfasis */}
                {selectedReport.description && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <h4 className="font-semibold text-blue-800 mb-2">Descripción del Problema</h4>
                    <p className="text-lg font-medium text-gray-900 leading-relaxed">{selectedReport.description}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                        <ClockIcon className="h-5 w-5 mr-2 text-gray-500" />
                        Información Temporal
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Hora registrada:</span>
                          <span className="font-semibold text-gray-900">
                            {new Date(selectedReport.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Fecha:</span>
                          <span className="font-semibold text-gray-900">
                            {new Date(selectedReport.createdAt).toLocaleDateString('es-ES')}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-700 mb-3">Prioridad y Estado</h4>
                      <div className="flex space-x-4">
                        <div>
                          <span className="text-gray-600">Prioridad:</span>
                          <span className={`ml-2 px-2 py-1 rounded-full text-sm font-semibold ${getPriorityColor(selectedReport.priority)}`}>
                            {selectedReport.priority.charAt(0).toUpperCase() + selectedReport.priority.slice(1)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Estado:</span>
                          <span className={`ml-2 px-2 py-1 rounded-full text-sm font-semibold ${getStatusColor(selectedReport.status)}`}>
                            {selectedReport.status.charAt(0).toUpperCase() + selectedReport.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                        <UserIcon className="h-5 w-5 mr-2 text-gray-500" />
                        Información del Técnico
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Técnico:</span>
                          <span className="font-semibold text-gray-900">{selectedReport.technician_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tipo de Reporte:</span>
                          <span className="font-semibold text-gray-900 capitalize">{selectedReport.issue_type}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                        <WrenchScrewdriverIcon className="h-5 w-5 mr-2 text-gray-500" />
                        Equipo
                      </h4>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Área:</span>
                          <span className="font-semibold text-gray-900">{selectedReport.equipment_area}</span>
                        </div>
                        {selectedReport.equipment_machine && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Máquina:</span>
                            <span className="font-semibold text-gray-900">{selectedReport.equipment_machine}</span>
                          </div>
                        )}
                        {selectedReport.equipment_element && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Elemento:</span>
                            <span className="font-semibold text-gray-900">{selectedReport.equipment_element}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {selectedReport.title && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-700 mb-2">Título del Reporte</h4>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedReport.title}</p>
                  </div>
                )}
                
                {selectedReport.notes && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-700 mb-2">Comentarios</h4>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedReport.notes}</p>
                  </div>
                )}
                
                {selectedReport.evidence_images && (() => {
                  try {
                    const images = JSON.parse(selectedReport.evidence_images);
                    return images.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Evidencias</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {images.map((image, index) => (<img key={index} src={image} alt={`Evidencia ${index + 1}`} className="w-full h-32 object-cover rounded-lg cursor-pointer" onClick={() => { setImageViewerSrc(image); setImageViewerOpen(true); }}/>))}
                        </div>
                      </div>
                    );
                  } catch { return null; }
                })()}
              </div>
            </div>
          </div>
        )}

        {imageViewerOpen && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4"
            onClick={() => setImageViewerOpen(false)}
          >
            <div 
              className="relative max-w-6xl w-full h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4 p-2">
                <div className="text-white text-sm">
                  Clic en el fondo para cerrar
                </div>
                <button 
                  className="text-white hover:text-gray-300 transition-colors bg-black bg-opacity-50 rounded-full p-2"
                  onClick={() => setImageViewerOpen(false)} 
                  title="Cerrar"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
                <img 
                  src={imageViewerSrc} 
                  alt="Evidencia" 
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              
              <div className="mt-4 flex justify-center p-4">
                <a 
                  href={imageViewerSrc} 
                  onClick={(e) => { e.preventDefault(); handleDownload(imageViewerSrc); }} 
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center"
                  title="Descargar imagen"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Descargar
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Reports;