import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');
      const message = searchParams.get('message');

      if (error) {
        toast.error(message || 'Error en la autenticación');
        navigate('/login');
        return;
      }

      if (token) {
        try {
          // Guardar el token
          localStorage.setItem('token', token);

          // Verificar el token y obtener los datos del usuario
          const response = await fetch('http://localhost:3000/api/auth/verify-token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token }),
          });

          if (response.ok) {
            const data = await response.json();
            setUser(data.data.user);
            toast.success('¡Inicio de sesión exitoso!');
            navigate('/dashboard');
          } else {
            localStorage.removeItem('token');
            toast.error('Token inválido');
            navigate('/login');
          }
        } catch (error) {
          console.error('Error verificando token:', error);
          localStorage.removeItem('token');
          toast.error('Error de conexión');
          navigate('/login');
        }
      } else {
        toast.error('No se recibió el token de autenticación');
        navigate('/login');
      }
    };

    handleCallback();
  }, [searchParams, navigate, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="loading-spinner mx-auto mb-4"></div>
        <h2 className="text-lg font-medium text-gray-900">Procesando autenticación...</h2>
        <p className="text-gray-600">Por favor espera mientras completamos tu inicio de sesión.</p>
      </div>
    </div>
  );
};

export default AuthCallback;
