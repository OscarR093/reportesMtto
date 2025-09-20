// Main App component
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import RouteGuard from './routes/RouteGuard';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { routes } from './routes/routes';

// Import pages
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';

function AppContent() {
  const { user, loading, isAuthenticated } = useAuth();

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public routes */}
          <Route 
            path="/login" 
            element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />} 
          />
          <Route 
            path="/auth/callback" 
            element={<AuthCallback />} 
          />
          
          {/* Protected routes */}
          {routes
            .filter(route => route.isProtected)
            .map((route) => {
              const Component = route.component;
              return (
                <Route
                  key={route.path}
                  path={route.path}
                  element={
                    <RouteGuard
                      requiredRole={route.requiredRole}
                      allowFirstTime={route.allowFirstTime}
                      user={user}
                      loading={loading}
                      isAuthenticated={isAuthenticated}
                    >
                      <Component />
                    </RouteGuard>
                  }
                />
              );
            })}
          
          {/* Redirect root to dashboard */}
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