import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import CompleteProfile from './pages/CompleteProfile';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import CreateReport from './pages/CreateReport';
import UserManagement from './pages/UserManagement';
import UserProfile from './pages/UserProfile';
import PendingActivities from './pages/PendingActivities';
import { AuthProvider, useAuth } from './hooks/useAuth';

// Componente para rutas protegidas
const ProtectedRoute = ({ children, requiredRole, allowFirstTime = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si el usuario necesita completar su perfil y no está en la página de completar perfil
  if (user.firstTime && !allowFirstTime) {
    return <Navigate to="/complete-profile" replace />;
  }

  // Si el usuario ya completó su perfil pero está en la página de completar perfil
  if (!user.firstTime && allowFirstTime) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requiredRole && user.role !== requiredRole && user.role !== 'super_admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function AppContent() {
  const { user } = useAuth();

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route 
            path="/login" 
            element={!user ? <Login /> : <Navigate to="/dashboard" replace />} 
          />
          <Route 
            path="/auth/callback" 
            element={<AuthCallback />} 
          />
          <Route 
            path="/complete-profile" 
            element={
              <ProtectedRoute allowFirstTime={true}>
                <CompleteProfile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reports" 
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reports/create" 
            element={
              <ProtectedRoute>
                <CreateReport />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reports/:id/edit" 
            element={
              <ProtectedRoute>
                <CreateReport />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/pending" 
            element={
              <ProtectedRoute requiredRole="admin">
                <PendingActivities />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/users" 
            element={
              <ProtectedRoute requiredRole="admin">
                <UserManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            } 
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
