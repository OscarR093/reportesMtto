import React, { useState } from 'react';
import { UserIcon } from '@heroicons/react/24/outline';

const UserAvatar = ({ user, size = 'md', className = '' }) => {
  const [imageError, setImageError] = useState(false);
  
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };
  
  const iconSizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
    xl: 'h-8 w-8'
  };
  
  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  // Función para generar color de fondo basado en el nombre
  const getBackgroundColor = (name) => {
    if (!name) return 'bg-blue-500';
    const colors = [
      'bg-red-500', 'bg-yellow-500', 'bg-green-500', 'bg-blue-500',
      'bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-cyan-500',
      'bg-orange-500', 'bg-teal-500'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const avatarClasses = `${sizeClasses[size]} rounded-full object-cover border-2 border-gray-200 ${className}`;

  // Si hay foto y no hay error, mostrar la imagen
  if (user?.photo && !imageError) {
    return (
      <img 
        className={avatarClasses}
        src={user.photo} 
        alt={user?.name || 'Usuario'}
        onError={() => setImageError(true)}
      />
    );
  }

  // Si hay nombre, mostrar iniciales con color de fondo
  if (user?.name && user.name.trim()) {
    const initials = user.name.trim().split(' ')
      .map(n => n.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
    
    return (
      <div className={`${sizeClasses[size]} rounded-full ${getBackgroundColor(user.name)} flex items-center justify-center border-2 border-gray-200 ${className}`}>
        <span className={`${textSizeClasses[size]} font-medium text-white`}>
          {initials}
        </span>
      </div>
    );
  }

  // Fallback: icono de usuario
  return (
    <div className={`${sizeClasses[size]} rounded-full bg-gray-300 flex items-center justify-center border-2 border-gray-200 ${className}`}>
      <UserIcon className={`${iconSizeClasses[size]} text-gray-600`} />
    </div>
  );
};

export default UserAvatar;
