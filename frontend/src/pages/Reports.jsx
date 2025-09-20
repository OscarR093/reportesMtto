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
  XMarkIcon
} from '@heroicons/react/24/outline';
import Layout from '../components/Layout';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { formatDateTime } from '../utils/helpers';

const Reports = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterArea, setFilterArea] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [imageViewerSrc, setImageViewerSrc] = useState(null);

  const statusOptions = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'abierto', label: 'Abiertos' },
    { value: 'en_proceso', label: 'En Proceso' },
    { value: 'resuelto', label: 'Resueltos' },
    { value: 'cerrado', label: 'Cerrados' },
    { value: 'cancelado', label: 'Cancelados' }
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        const params = new URLSearchParams({
          page: currentPage,
          limit: 10
        });

        if (filterStatus !== 'all') params.append('status', filterStatus);
        if (filterPriority !== 'all') params.append('priority', filterPriority);
        if (filterArea !== 'all') params.append('equipment_area', filterArea);
        if (searchTerm) params.append('search', searchTerm);

        const response = await fetch(`http://localhost:3000/api/reports?${params}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setReports(data.data || []);
          if (data.pagination) {
            setTotalPages(Math.ceil(data.pagination.total / data.pagination.limit));
          }
        } else {
          toast.error('Error al cargar los reportes');
        }
      } catch (error) {
        console.error('Error fetching reports:', error);
        toast.error('Error de conexión');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, filterStatus, filterPriority, filterArea, searchTerm]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10
      });

      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterPriority !== 'all') params.append('priority', filterPriority);
      if (filterArea !== 'all') params.append('equipment_area', filterArea);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`http://localhost:3000/api/reports?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setReports(data.data || []);
        if (data.pagination) {
          setTotalPages(Math.ceil(data.pagination.total / data.pagination.limit));
        }
      } else {
        toast.error('Error al cargar los reportes');
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este reporte?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/reports/${reportId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setReports(reports.filter(report => report.id !== reportId));
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
      const response = await fetch(`http://localhost:3000/api/reports/${reportId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        await fetchReports(); // Refrescar la lista
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
      case 'critica':
        return 'text-red-600 bg-red-100';
      case 'alta':
        return 'text-orange-600 bg-orange-100';
      case 'media':
        return 'text-yellow-600 bg-yellow-100';
      case 'baja':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'abierto':
        return 'text-blue-600 bg-blue-100';
      case 'en_proceso':
        return 'text-yellow-600 bg-yellow-100';
      case 'resuelto':
        return 'text-green-600 bg-green-100';
      case 'cerrado':
        return 'text-gray-600 bg-gray-100';
      case 'cancelado':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString) => {
    return formatDateTime(dateString);
  };

  const canEditReport = (report) => {
    // El creador puede editar si no está cerrado o cancelado
    if (report.user_id === user?.id && !['cerrado', 'cancelado'].includes(report.status)) {
      return true;
    }
    
    // Los administradores pueden editar cualquier reporte
    if (user?.role && ['admin', 'super_admin'].includes(user.role)) {
      return true;
    }
    
    return false;
  };

  const canDeleteReport = (report) => {
    // El creador puede eliminar si no está cerrado o cancelado
    if (report.user_id === user?.id && !['cerrado', 'cancelado'].includes(report.status)) {
      return true;
    }
    
    // Solo super admin puede eliminar cualquier reporte
    return user?.role === 'super_admin';
  };

  const viewReportDetails = (report) => {
    setSelectedReport(report);
    setShowModal(true);
  };

  // Ordenar los reportes por fecha descendente (más nuevos arriba)
  const sortedReports = [...reports].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

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

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reportes de Mantenimiento</h1>
            <p className="text-gray-600">Gestiona y supervisa todos los reportes</p>
          </div>
          <Link
            to="/reports/create"
            className="btn-primary flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Nuevo Reporte
          </Link>
        </div>

        {/* Filtros */}
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Búsqueda */}
            <div className="lg:col-span-2">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar reportes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>

            {/* Filtros */}
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input-field"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="input-field"
              >
                {priorityOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={filterArea}
                onChange={(e) => setFilterArea(e.target.value)}
                className="input-field"
              >
                {areaOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Reportes */}
        <div className="card">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-12">
              <WrenchScrewdriverIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay reportes</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterStatus !== 'all' || filterPriority !== 'all' || filterArea !== 'all'
                  ? 'No se encontraron reportes con los filtros aplicados'
                  : 'Aún no se han creado reportes'
                }
              </p>
              <Link to="/reports/create" className="btn-primary">
                Crear Primer Reporte
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reporte
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Equipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prioridad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Técnico
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedReports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50 cursor-pointer transition-colors duration-150" onClick={() => viewReportDetails(report)}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col items-start">
                          <div className="text-base font-bold text-gray-900 mb-1">
                            {report.description ? report.description : 'Sin descripción'}
                          </div>
                          <div className="text-sm text-gray-500 mb-1">
                            {report.title} {report.createdAt && `(${formatDate(report.createdAt)})`}
                          </div>
                          <div className="text-xs text-gray-500">
                            {report.issue_type}
                          </div>
                          {report.evidence_images && (() => {
                            try {
                              const images = JSON.parse(report.evidence_images);
                              return images.length > 0 && (
                                <div className="flex items-center mt-1">
                                  <PhotoIcon className="h-4 w-4 text-gray-400 mr-1" />
                                  <span className="text-xs text-gray-500">
                                    {images.length} imagen(es)
                                  </span>
                                </div>
                              );
                            } catch {
                              return null;
                            }
                          })()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {report.equipment_display || `${report.equipment_area}${report.equipment_machine ? ` - ${report.equipment_machine}` : ''}`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(report.priority)}`}>
                          {report.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user?.role && ['admin', 'super_admin'].includes(user.role) ? (
                          <select
                            value={report.status}
                            onChange={(e) => {
                              e.stopPropagation(); // Evitar que se abra el modal
                              handleStatusChange(report.id, e.target.value);
                            }}
                            className={`text-xs font-semibold rounded-full px-2 py-1 border-0 ${getStatusColor(report.status)}`}
                            disabled={report.status === 'cerrado'}
                            onClick={(e) => e.stopPropagation()} // Evitar que se abra el modal
                          >
                            <option value="abierto">Abierto</option>
                            <option value="en_proceso">En Proceso</option>
                            <option value="resuelto">Resuelto</option>
                            <option value="cerrado">Cerrado</option>
                            <option value="cancelado">Cancelado</option>
                          </select>
                        ) : (
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.status)}`}>
                            {report.status}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <div className="text-sm text-gray-900">
                            {report.technician_name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <div className="text-sm text-gray-900">
                            {formatDate(report.createdAt)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                          {canEditReport(report) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/reports/${report.id}/edit`);
                              }}
                              className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                              title="Editar"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                          )}
                          {canDeleteReport(report) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteReport(report.id);
                              }}
                              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                              title="Eliminar"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex justify-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm border rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Anterior
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 text-sm border rounded-md ${
                  currentPage === page 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm border rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        )}

        {/* Modal de Detalles */}
        {showModal && selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Detalles del Reporte
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">Cerrar</span>
                    ✕
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Información General</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Título:</strong> {selectedReport.title}</p>
                      <p><strong>Tipo:</strong> {selectedReport.issue_type}</p>
                      <p><strong>Prioridad:</strong> 
                        <span className={`ml-1 px-2 py-1 rounded-full text-xs ${getPriorityColor(selectedReport.priority)}`}>
                          {selectedReport.priority}
                        </span>
                      </p>
                      <p><strong>Estado:</strong> 
                        <span className={`ml-1 px-2 py-1 rounded-full text-xs ${getStatusColor(selectedReport.status)}`}>
                          {selectedReport.status}
                        </span>
                      </p>
                      <p><strong>Técnico:</strong> {selectedReport.technician_name}</p>
                      <p><strong>Fecha:</strong> {formatDate(selectedReport.createdAt)}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Equipo</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Área:</strong> {selectedReport.equipment_area}</p>
                      {selectedReport.equipment_machine && (
                        <p><strong>Máquina:</strong> {selectedReport.equipment_machine}</p>
                      )}
                      {selectedReport.equipment_element && (
                        <p><strong>Elemento:</strong> {selectedReport.equipment_element}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                {selectedReport.description && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Descripción</h4>
                    <p className="text-sm text-gray-700">{selectedReport.description}</p>
                  </div>
                )}
                
                {selectedReport.notes && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Comentarios</h4>
                    <p className="text-sm text-gray-700">{selectedReport.notes}</p>
                  </div>
                )}
                
                {selectedReport.evidence_images && (() => {
                  try {
                    const images = JSON.parse(selectedReport.evidence_images);
                    return images.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Evidencias</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {images.map((image, index) => (
                            <img
                              key={index}
                              src={image}
                              alt={`Evidencia ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg cursor-pointer"
                              onClick={() => {
                                setImageViewerSrc(image);
                                setImageViewerOpen(true);
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  } catch {
                    return null;
                  }
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Visor de imagen modal */}
        {imageViewerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
            <div className="bg-white rounded-lg shadow-lg p-4 relative max-w-lg w-full flex flex-col items-center">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                onClick={() => setImageViewerOpen(false)}
                title="Cerrar"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
              <img src={imageViewerSrc} alt="Evidencia" className="max-h-[60vh] w-auto rounded mb-4" />
              <a
                href={imageViewerSrc}
                onClick={e => {
                  e.preventDefault();
                  handleDownload(imageViewerSrc);
                }}
                className="btn-primary px-4 py-2 rounded text-white bg-blue-600 hover:bg-blue-700"
              >
                Descargar imagen
              </a>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Reports;
