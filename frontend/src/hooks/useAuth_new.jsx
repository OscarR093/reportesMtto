// Updated useAuth hook with service layer integration
import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import AuthService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar si hay un token almacenado al cargar la aplicación
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      verifyToken(token);
    } else {
      setLoading(false);
      setIsAuthenticated(false);
    }
  }, []);

  const verifyToken = async (token) => {
    try {
      const response = await AuthService.verifyToken(token);
      if (response.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error verificando token:', error);
      localStorage.removeItem('token');
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (employee_id, password) => {
    try {
      const response = await AuthService.login(employee_id, password);
      
      if (response.success) {
        localStorage.setItem('token', response.token);
        setUser(response.user);
        setIsAuthenticated(true);
        toast.success('¡Inicio de sesión exitoso!');
        return { success: true };
      } else {
        toast.error(response.message || 'Error en el inicio de sesión');
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Error en login:', error);
      toast.error('Error de conexión');
      return { success: false, message: 'Error de conexión' };
    }
  };

  const loginWithGoogle = () => {
    AuthService.loginWithGoogle();
  };

  const logout = async () => {
    try {
      await AuthService.logout();
    } catch (error) {
      console.warn('Error during logout:', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Sesión cerrada correctamente');
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await AuthService.updateProfile(profileData);
      
      if (response.success) {
        setUser(response.user);
        toast.success('Perfil actualizado correctamente');
        return { success: true };
      } else {
        toast.error(response.message || 'Error al actualizar el perfil');
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      toast.error('Error de conexión');
      return { success: false, message: 'Error de conexión' };
    }
  };

  const changePassword = async (passwordData) => {
    try {
      const response = await AuthService.changePassword(passwordData);
      
      if (response.success) {
        toast.success('Contraseña actualizada correctamente');
        return { success: true };
      } else {
        toast.error(response.message || 'Error al cambiar la contraseña');
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      toast.error('Error de conexión');
      return { success: false, message: 'Error de conexión' };
    }
  };

  const uploadPhoto = async (formData) => {
    try {
      const response = await AuthService.uploadPhoto(formData);
      
      if (response.success) {
        setUser(response.user);
        toast.success('Foto actualizada correctamente');
        return { success: true };
      } else {
        toast.error(response.message || 'Error al subir la foto');
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Error subiendo foto:', error);
      toast.error('Error de conexión');
      return { success: false, message: 'Error de conexión' };
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  const value = {
    user,
    setUser,
    loading,
    isAuthenticated,
    login,
    loginWithGoogle,
    logout,
    updateProfile,
    changePassword,
    uploadPhoto,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};