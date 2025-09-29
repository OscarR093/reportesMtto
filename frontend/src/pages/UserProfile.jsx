import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserCircleIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  BuildingOfficeIcon,
  ArrowUpTrayIcon,
  UserIcon,
  LockClosedIcon,
  PencilIcon,
  ExclamationTriangleIcon,
  PhotoIcon,
  CheckIcon,
  XMarkIcon,
  EyeSlashIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import Layout from '../components/Layout';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { compressImage } from '../utils/imageCompressor';

const UserProfile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: '',
    employeeId: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    photo: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        employeeId: user.employeeId || '',
        email: user.email || '',
        phone: user.phone || '',
        department: user.department || '',
        position: user.position || '',
        photo: user.photo || ''
      });
    }
  }, [user]);

  // Componente UserAvatar mejorado
  const UserAvatar = ({ user, size = 'xl', editable = false, onEdit }) => {
    const [imageError, setImageError] = useState(false);
    
    const sizeClasses = {
      md: 'h-16 w-16',
      lg: 'h-24 w-24',
      xl: 'h-32 w-32',
      '2xl': 'h-40 w-40'
    };
    
    const iconSizeClasses = {
      md: 'h-8 w-8',
      lg: 'h-12 w-12',
      xl: 'h-16 w-16',
      '2xl': 'h-20 w-20'
    };
    
    const textSizeClasses = {
      md: 'text-lg',
      lg: 'text-2xl',
      xl: 'text-3xl',
      '2xl': 'text-4xl'
    };

    const getBackgroundColor = (name) => {
      if (!name) return 'bg-gray-400';
      const colors = [
        'bg-red-500', 'bg-yellow-500', 'bg-green-500', 'bg-blue-500',
        'bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-cyan-500',
        'bg-orange-500', 'bg-teal-500'
      ];
      const index = name.charCodeAt(0) % colors.length;
      return colors[index];
    };

    const avatarContent = () => {
      if (user.photo && !imageError) {
        return (
          <img 
            className={`${sizeClasses[size]} rounded-full object-cover border-4 border-gray-200`}
            src={user.photo} 
            alt={user.name || 'Usuario'}
            onError={() => setImageError(true)}
          />
        );
      }

      if (user.name && user.name.trim()) {
        const initials = user.name.trim().split(' ')
          .map(n => n.charAt(0).toUpperCase())
          .slice(0, 2)
          .join('');
        
        return (
          <div className={`${sizeClasses[size]} rounded-full ${getBackgroundColor(user.name)} flex items-center justify-center border-4 border-gray-200`}>
            <span className={`${textSizeClasses[size]} font-medium text-white`}>
              {initials}
            </span>
          </div>
        );
      }

      return (
        <div className={`${sizeClasses[size]} rounded-full bg-gray-300 flex items-center justify-center border-4 border-gray-200`}>
          <UserIcon className={`${iconSizeClasses[size]} text-gray-600`} />
        </div>
      );
    };

    return (
      <div className="relative">
        {avatarContent()}
        {editable && (
          <button
            onClick={onEdit}
            className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition-colors"
          >
            <PhotoIcon className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  };

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      // Validaciones básicas
      if (!profileData.name.trim()) {
        toast.error('El nombre es obligatorio');
        return;
      }

      if (!profileData.employeeId.trim()) {
        toast.error('El ID de empleado es obligatorio');
        return;
      }

      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: profileData.name.trim(),
          employeeId: profileData.employeeId.trim(),
          phone: profileData.phone.trim(),
          department: profileData.department.trim(),
          position: profileData.position.trim()
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al actualizar el perfil');
      }

      const result = await response.json();
      const updatedUser = result.data; // Extraer los datos del usuario desde result.data
      updateUser(updatedUser);
      
      // Actualizar también el estado local del perfil
      setProfileData({
        name: updatedUser.name || '',
        employeeId: updatedUser.employeeId || '',
        email: updatedUser.email || '',
        phone: updatedUser.phone || '',
        department: updatedUser.department || '',
        position: updatedUser.position || '',
        photo: updatedUser.photo || ''
      });
      
      setIsEditing(false);
      toast.success('Perfil actualizado exitosamente');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword) {
      toast.error('Ingresa tu contraseña actual');
      return;
    }

    if (!passwordData.newPassword) {
      toast.error('Ingresa una nueva contraseña');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al cambiar la contraseña');
      }

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setIsChangingPassword(false);
      toast.success('Contraseña cambiada exitosamente');
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.message || 'Error al cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten archivos de imagen');
      return;
    }

    // Compress the image to reduce size and convert to WebP
    const compressedFile = await compressImage(file, {
      maxSizeMB: 0.5,           // Smaller size for avatars
      maxWidthOrHeight: 800,    // Lower resolution for avatars
      useWebP: true,           // Convert to WebP
      quality: 0.8             // Good quality for avatars
    });

    // Validate size after compression (3MB limit)
    if (compressedFile.size > 3 * 1024 * 1024) {
      toast.error('La imagen es demasiado pesada después de la compresión. Intente con una imagen más pequeña.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('photo', compressedFile);

      const response = await fetch('/api/auth/upload-photo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al subir la imagen');
      }

      const result = await response.json();
      const updatedUser = result.data; // Extraer los datos del usuario desde result.data
      updateUser(updatedUser);
      
      // Actualizar también el estado local del perfil
      setProfileData(prev => ({ 
        ...prev, 
        photo: updatedUser.photo || '' 
      }));
      
      toast.success('Foto de perfil actualizada');
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error(error.message || 'Error al subir la imagen');
    } finally {
      setLoading(false);
    }
  };

  const canEditEmail = () => {
    // Los usuarios de Google OAuth no pueden cambiar el email
    // Para mayor seguridad, ningún usuario puede cambiar el email
    return false;
  };

  const isGoogleUser = () => {
    return user?.authProvider === 'google';
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <input
                type="file"
                id="photo-upload"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <UserAvatar 
                user={profileData} 
                size="2xl" 
                editable={true}
                onEdit={() => document.getElementById('photo-upload').click()}
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                <p className="text-gray-600">{user.position || 'Sin cargo asignado'}</p>
                <p className="text-sm text-gray-500">{user.department || 'Sin departamento'}</p>
                {isGoogleUser() && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-2">
                    Cuenta Google
                  </span>
                )}
              </div>
            </div>
            <div className="flex space-x-3">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Editar Perfil
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <CheckIcon className="h-4 w-4 mr-2" />
                    {loading ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setProfileData({
                        name: user.name || '',
                        employeeId: user.employeeId || '',
                        email: user.email || '',
                        phone: user.phone || '',
                        department: user.department || '',
                        position: user.position || '',
                        photo: user.photo || ''
                      });
                    }}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    <XMarkIcon className="h-4 w-4 mr-2" />
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información Personal */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Información Personal</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Completo *
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ingresa tu nombre completo"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{user.name || 'No especificado'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID de Empleado *
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.employeeId}
                      onChange={(e) => handleInputChange('employeeId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ingresa tu ID de empleado"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{user.employeeId || 'No especificado'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correo Electrónico
                    {!canEditEmail() && (
                      <span className="text-xs text-gray-500 ml-1">(No editable por seguridad)</span>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={profileData.email}
                      readOnly={!canEditEmail()}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm ${
                        !canEditEmail() 
                          ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                          : 'focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                      }`}
                      placeholder="correo@empresa.com"
                    />
                    {!canEditEmail() && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ingresa tu teléfono"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{user.phone || 'No especificado'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Departamento
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ingresa tu departamento"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{user.department || 'No especificado'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cargo/Posición
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.position}
                      onChange={(e) => handleInputChange('position', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ingresa tu cargo"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{user.position || 'No especificado'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Panel lateral */}
          <div className="space-y-6">
            {/* Información de cuenta */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Información de Cuenta</h3>
              <div className="space-y-3">
                <div>
                  <span className="block text-sm font-medium text-gray-500">Rol</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.role === 'admin' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                  </span>
                </div>
                <div>
                  <span className="block text-sm font-medium text-gray-500">Estado</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {user.status === 'active' ? 'Activo' : 'Pendiente'}
                  </span>
                </div>
                <div>
                  <span className="block text-sm font-medium text-gray-500">Tipo de Autenticación</span>
                  <span className="text-sm text-gray-900">
                    {isGoogleUser() ? 'Google OAuth' : 'Tradicional'}
                  </span>
                </div>
              </div>
            </div>

            {/* Cambiar contraseña - Solo para usuarios no-Google */}
            {!isGoogleUser() && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Seguridad</h3>
                
                {!isChangingPassword ? (
                  <button
                    onClick={() => setIsChangingPassword(true)}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cambiar Contraseña
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contraseña Actual
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={passwordData.currentPassword}
                          onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showCurrentPassword ? (
                            <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                          ) : (
                            <EyeIcon className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nueva Contraseña
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={passwordData.newPassword}
                          onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showNewPassword ? (
                            <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                          ) : (
                            <EyeIcon className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirmar Nueva Contraseña
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={passwordData.confirmPassword}
                          onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showConfirmPassword ? (
                            <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                          ) : (
                            <EyeIcon className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={handleChangePassword}
                        disabled={loading}
                        className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        {loading ? 'Cambiando...' : 'Cambiar'}
                      </button>
                      <button
                        onClick={() => {
                          setIsChangingPassword(false);
                          setPasswordData({
                            currentPassword: '',
                            newPassword: '',
                            confirmPassword: ''
                          });
                        }}
                        className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
