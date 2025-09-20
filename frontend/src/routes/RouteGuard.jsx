// Route guard component
import React from 'react';
import { Navigate } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';

const RouteGuard = ({ 
  children, 
  requiredRole = null, 
  allowFirstTime = false, 
  user, 
  loading,
  isAuthenticated 
}) => {
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Cargando..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If user needs to complete profile and not on complete profile page
  if (user?.firstTime && !allowFirstTime) {
    return <Navigate to="/complete-profile" replace />;
  }

  // If user already completed profile but on complete profile page
  if (!user?.firstTime && allowFirstTime) {
    return <Navigate to="/dashboard" replace />;
  }

  // Role-based access control
  if (requiredRole && user?.role !== requiredRole && user?.role !== 'super_admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default RouteGuard;