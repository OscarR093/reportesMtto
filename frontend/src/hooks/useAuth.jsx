import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

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

  const API_URL = '/api'; // Usar URL relativa con proxy

  // Verificar si hay un token almacenado al cargar la aplicación
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (token) => {
    try {
      const response = await fetch(`${API_URL}/auth/verify-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.data.user);
      } else {
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Error verificando token:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (employee_id, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ employee_id, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        toast.success('¡Inicio de sesión exitoso!');
        return { success: true };
      } else {
        toast.error(data.message || 'Error en el inicio de sesión');
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Error en login:', error);
      toast.error('Error de conexión');
      return { success: false, message: 'Error de conexión' };
    }
  };

  const loginWithGoogle = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Sesión cerrada correctamente');
  };

  const register = async (userData) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Registro exitoso. Tu cuenta está pendiente de aprobación.');
        return { success: true };
      } else {
        toast.error(data.message || 'Error en el registro');
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Error en registro:', error);
      toast.error('Error de conexión');
      return { success: false, message: 'Error de conexión' };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        toast.success('Perfil actualizado correctamente');
        return { success: true };
      } else {
        toast.error(data.message || 'Error al actualizar el perfil');
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Error actualizando perfil:', error);
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
    login,
    loginWithGoogle,
    logout,
    register,
    updateProfile,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
