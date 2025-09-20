// User table component
import React from 'react';
import UserAvatar from '../UserAvatar';
import Badge from '../common/Badge';
import { USER_STATUS, USER_ROLES } from '../../constants/app';
import { formatDateShort } from '../../utils/helpers';

const UserTable = ({ users, onApprove, onReject, onChangeRole, onDeactivate }) => {
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case USER_STATUS.ACTIVE: return 'success';
      case USER_STATUS.PENDING: return 'warning';
      case USER_STATUS.REJECTED: return 'danger';
      case USER_STATUS.INACTIVE: return 'default';
      default: return 'default';
    }
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case USER_ROLES.SUPER_ADMIN: return 'danger';
      case USER_ROLES.ADMIN: return 'primary';
      case USER_ROLES.USER: return 'default';
      default: return 'default';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Usuario
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rol
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Departamento
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Registrado
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <UserAvatar user={user} size="md" />
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {user.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {user.email}
                    </div>
                    {user.employee_id && (
                      <div className="text-xs text-gray-400">
                        ID: {user.employee_id}
                      </div>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge variant={getRoleBadgeVariant(user.role)}>
                  {user.role === USER_ROLES.SUPER_ADMIN && 'Super Admin'}
                  {user.role === USER_ROLES.ADMIN && 'Admin'}
                  {user.role === USER_ROLES.USER && 'Usuario'}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge variant={getStatusBadgeVariant(user.status)}>
                  {user.status === USER_STATUS.PENDING && 'Pendiente'}
                  {user.status === USER_STATUS.ACTIVE && 'Activo'}
                  {user.status === USER_STATUS.REJECTED && 'Rechazado'}
                  {user.status === USER_STATUS.INACTIVE && 'Inactivo'}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {user.department || 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDateShort(user.created_at)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                {user.status === USER_STATUS.PENDING && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onApprove(user.id)}
                      className="text-green-600 hover:text-green-900"
                    >
                      Aprobar
                    </button>
                    <button
                      onClick={() => onReject(user.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Rechazar
                    </button>
                  </div>
                )}
                {user.status === USER_STATUS.ACTIVE && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onChangeRole(user.id)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Cambiar Rol
                    </button>
                    <button
                      onClick={() => onDeactivate(user.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Desactivar
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;