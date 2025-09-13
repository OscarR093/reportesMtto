import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import {
  UserGroupIcon,
  UserPlusIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  UserIcon
} from '@heroicons/react/24/outline';

const UserManagement = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('active');
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [actionLoading, setActionLoading] = useState(false);

  const API_URL = 'http://localhost:3000/api';

  const roles = [
    { value: 'all', label: 'Todos los roles' },
    { value: 'user', label: 'Usuario' },
    { value: 'admin', label: 'Administrador' },
    { value: 'super_admin', label: 'Super Admin' }
  ];

  useEffect(() => {
    if (user) {
      fetchUsers();
      fetchPendingUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/users/active`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.data.users || []);
      } else {
        toast.error('Error al cargar usuarios activos');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error de conexión');
    }
  };

  const fetchPendingUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/users/pending`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPendingUsers(data.data.users || []);
      } else {
        toast.error('Error al cargar usuarios pendientes');
      }
    } catch (error) {
      console.error('Error fetching pending users:', error);
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (userId) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/users/${userId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success('Usuario aprobado exitosamente');
        fetchUsers();
        fetchPendingUsers();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Error al aprobar usuario');
      }
    } catch (error) {
      console.error('Error approving user:', error);
      toast.error('Error de conexión');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectUser = async (userId, reason) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/users/${userId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });

      if (response.ok) {
        toast.success('Usuario rechazado');
        fetchPendingUsers();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Error al rechazar usuario');
      }
    } catch (error) {
      console.error('Error rejecting user:', error);
      toast.error('Error de conexión');
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      });

      if (response.ok) {
        toast.success('Rol actualizado exitosamente');
        fetchUsers();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Error al cambiar rol');
      }
    } catch (error) {
      console.error('Error changing role:', error);
      toast.error('Error de conexión');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeactivateUser = async (userId) => {
    if (!confirm('¿Estás seguro de que quieres desactivar este usuario?')) {
      return;
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/users/${userId}/deactivate`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success('Usuario desactivado');
        fetchUsers();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Error al desactivar usuario');
      }
    } catch (error) {
      console.error('Error deactivating user:', error);
      toast.error('Error de conexión');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.employeeId?.toString().includes(searchTerm);
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const filteredPendingUsers = pendingUsers.filter(user => {
    return user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           user.email?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="loading-spinner"></div>
        </div>
      </Layout>
    );
  }

  // Verificar permisos
  if (user && user.role !== 'admin' && user.role !== 'super_admin') {
    return (
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
            <p className="text-gray-600">Administra los usuarios del sistema</p>
          </div>
          
          <div className="card">
            <div className="text-center py-12">
              <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-yellow-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">Acceso Restringido</h3>
              <p className="mt-1 text-sm text-gray-500">
                No tienes permisos para acceder a la gestión de usuarios.
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Rol actual:</strong> <span className="font-medium">{user.role}</span>
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Se requiere:</strong> <span className="font-medium">admin</span> o <span className="font-medium">super_admin</span>
                </p>
              </div>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Para acceder a esta funcionalidad:</h4>
                <p className="text-sm text-blue-700">
                  1. Cierra sesión de tu cuenta actual<br/>
                  2. Inicia sesión con número de empleado <strong>1694</strong><br/>
                  3. Usa la contraseña de administrador configurada
                </p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
            <p className="text-gray-600">Administra los usuarios del sistema</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm border">
              <div className="flex items-center space-x-2 text-sm">
                <UserGroupIcon className="h-4 w-4 text-blue-500" />
                <span className="text-gray-600">Total:</span>
                <span className="font-semibold">{users.length}</span>
              </div>
            </div>
            {pendingUsers.length > 0 && (
              <div className="bg-yellow-50 px-4 py-2 rounded-lg border border-yellow-200">
                <div className="flex items-center space-x-2 text-sm">
                  <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />
                  <span className="text-yellow-700">Pendientes:</span>
                  <span className="font-semibold text-yellow-800">{pendingUsers.length}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('active')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'active'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Usuarios Activos ({filteredUsers.length})
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pending'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Usuarios Pendientes ({filteredPendingUsers.length})
            </button>
          </nav>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, email o número de empleado..."
                className="form-input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          {activeTab === 'active' && (
            <div className="w-full sm:w-48">
              <select
                className="form-input"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                {roles.map(role => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="card">
          {activeTab === 'active' ? (
            <ActiveUsersTable 
              users={filteredUsers}
              onChangeRole={handleChangeRole}
              onDeactivate={handleDeactivateUser}
              actionLoading={actionLoading}
              currentUser={user}
            />
          ) : (
            <PendingUsersTable 
              users={filteredPendingUsers}
              onApprove={handleApproveUser}
              onReject={handleRejectUser}
              actionLoading={actionLoading}
            />
          )}
        </div>
      </div>
    </Layout>
  );
};

// Componente para avatar con fallback a icono
const UserAvatar = ({ user, size = 'h-10 w-10' }) => {
  const [imageError, setImageError] = useState(false);
  
  // Generar color de fondo basado en el nombre del usuario
  const getAvatarColor = (name) => {
    if (!name) return 'bg-gray-400';
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 
      'bg-indigo-500', 'bg-red-500', 'bg-yellow-500', 'bg-teal-500'
    ];
    const charCode = name.charCodeAt(0);
    return colors[charCode % colors.length];
  };

  // Obtener iniciales del usuario
  const getInitials = (user) => {
    if (user.name) {
      const names = user.name.split(' ');
      if (names.length >= 2) {
        return `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase();
      }
      return names[0].charAt(0).toUpperCase();
    }
    return user.email ? user.email.charAt(0).toUpperCase() : 'U';
  };
  
  if (!user.photo || imageError) {
    const bgColor = getAvatarColor(user.name || user.email);
    const initials = getInitials(user);
    
    return (
      <div className={`${size} flex-shrink-0 ${bgColor} rounded-full flex items-center justify-center`}>
        <span className={`font-medium text-white ${size === 'h-10 w-10' ? 'text-sm' : 'text-lg'}`}>
          {initials}
        </span>
      </div>
    );
  }

  return (
    <img 
      className={`${size} rounded-full flex-shrink-0 object-cover`} 
      src={user.photo} 
      alt={user.name || 'Usuario'}
      onError={() => setImageError(true)}
    />
  );
};

// Componente para tabla de usuarios activos
const ActiveUsersTable = ({ users, onChangeRole, onDeactivate, actionLoading, currentUser }) => {
  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay usuarios</h3>
        <p className="mt-1 text-sm text-gray-500">No se encontraron usuarios con los filtros aplicados.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Usuario
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Información
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rol
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Último acceso
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <UserAvatar user={user} />
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{user.name || 'Sin nombre'}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {user.employeeId && (
                    <div>ID: {user.employeeId}</div>
                  )}
                  {user.department && (
                    <div className="text-gray-500">{user.department}</div>
                  )}
                  {user.position && (
                    <div className="text-gray-500">{user.position}</div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <select
                  className="text-sm border-0 bg-transparent focus:ring-0 p-1 rounded"
                  value={user.role}
                  onChange={(e) => onChangeRole(user.id, e.target.value)}
                  disabled={actionLoading || user.id === currentUser?.id}
                >
                  <option value="user">Usuario</option>
                  <option value="admin">Administrador</option>
                  {currentUser?.role === 'super_admin' && (
                    <option value="super_admin">Super Admin</option>
                  )}
                </select>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user.status === 'active' ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Nunca'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  {user.id !== currentUser?.id && (
                    <button
                      onClick={() => onDeactivate(user.id)}
                      disabled={actionLoading}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      title="Desactivar usuario"
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
  );
};

// Componente para tabla de usuarios pendientes
const PendingUsersTable = ({ users, onApprove, onReject, actionLoading }) => {
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [userToReject, setUserToReject] = useState(null);

  const handleRejectClick = (user) => {
    setUserToReject(user);
    setShowRejectModal(true);
  };

  const handleRejectConfirm = () => {
    if (userToReject && rejectReason.trim()) {
      onReject(userToReject.id, rejectReason);
      setShowRejectModal(false);
      setRejectReason('');
      setUserToReject(null);
    }
  };

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <UserPlusIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay usuarios pendientes</h3>
        <p className="mt-1 text-sm text-gray-500">Todos los usuarios han sido procesados.</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Información
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha de solicitud
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <UserAvatar user={user} />
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{user.name || 'Sin nombre'}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {user.department && (
                      <div>{user.department}</div>
                    )}
                    {user.position && (
                      <div className="text-gray-500">{user.position}</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => onApprove(user.id)}
                      disabled={actionLoading}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                    >
                      <CheckCircleIcon className="h-4 w-4 mr-1" />
                      Aprobar
                    </button>
                    <button
                      onClick={() => handleRejectClick(user)}
                      disabled={actionLoading}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                    >
                      <XCircleIcon className="h-4 w-4 mr-1" />
                      Rechazar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de rechazo */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Rechazar Usuario
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                ¿Estás seguro de que quieres rechazar a {userToReject?.name}?
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo del rechazo *
                </label>
                <textarea
                  className="form-input"
                  rows="3"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Explica el motivo del rechazo..."
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleRejectConfirm}
                  disabled={!rejectReason.trim() || actionLoading}
                  className="btn-primary bg-red-600 hover:bg-red-700 disabled:opacity-50"
                >
                  Rechazar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserManagement;
