import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DocumentTextIcon,
  UsersIcon,
  ChartBarIcon,
  CogIcon,
  PlusIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/Layout';
import ReportTable from '../components/report/ReportTable';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalReports: 0,
    pendingReports: 0,
    completedReports: 0,
    urgentReports: 0,
  });
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log('📊 Dashboard data received:', result);
        
        if (result.success && result.data) {
          setStats(result.data.stats);
          setRecentReports(result.data.recentReports);
        } else {
          console.error('❌ Invalid response format:', result);
        }
      } else {
        console.error('❌ Dashboard request failed:', response.status);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critica':
        return 'text-red-600 bg-red-100';
      case 'alta':
        return 'text-orange-600 bg-orange-100';
      case 'media':
        return 'text-yellow-600 bg-yellow-100';
      case 'baja':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'abierto':
        return 'text-yellow-600 bg-yellow-100';
      case 'en_proceso':
        return 'text-blue-600 bg-blue-100';
      case 'resuelto':
        return 'text-green-600 bg-green-100';
      case 'cerrado':
        return 'text-gray-600 bg-gray-100';
      case 'cancelado':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="loading-spinner"></div>
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
            <h1 className="text-2xl font-bold text-gray-900">
              ¡Bienvenido, {user?.firstName}!
            </h1>
            <p className="text-gray-600">
              Aquí tienes un resumen de tus reportes de mantenimiento
            </p>
          </div>
          <Link
            to="/reports/create"
            className="btn-primary flex items-center space-x-2"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Nuevo Reporte</span>
          </Link>
        </div>

        {/* Stats Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="card animate-pulse">
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-600">
                  <DocumentTextIcon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-600">Total Reportes</p>
                  <p className="text-2xl font-bold text-blue-900">{stats?.totalReports || 0}</p>
                </div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-600">
                  <ClockIcon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-yellow-600">Pendientes</p>
                  <p className="text-2xl font-bold text-yellow-900">{stats?.pendingReports || 0}</p>
                </div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-600">
                  <CheckCircleIcon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-600">Completados</p>
                  <p className="text-2xl font-bold text-green-900">{stats?.completedReports || 0}</p>
                </div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-red-600">
                  <ExclamationTriangleIcon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-red-600">Urgentes</p>
                  <p className="text-2xl font-bold text-red-900">{stats?.urgentReports || 0}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/reports/create"
            className="card hover:shadow-lg transition-shadow cursor-pointer group"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors">
                <PlusIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Crear Reporte</h3>
                <p className="text-sm text-gray-600">Nuevo reporte de mantenimiento</p>
              </div>
            </div>
          </Link>

          <Link
            to="/reports"
            className="card hover:shadow-lg transition-shadow cursor-pointer group"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-green-100 group-hover:bg-green-200 transition-colors">
                <DocumentTextIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Ver Reportes</h3>
                <p className="text-sm text-gray-600">Gestionar reportes existentes</p>
              </div>
            </div>
          </Link>

          {(user?.role === 'admin' || user?.role === 'super_admin') && (
            <Link
              to="/users"
              className="card hover:shadow-lg transition-shadow cursor-pointer group"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-purple-100 group-hover:bg-purple-200 transition-colors">
                  <UsersIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Usuarios</h3>
                  <p className="text-sm text-gray-600">Gestionar usuarios del sistema</p>
                </div>
              </div>
            </Link>
          )}
        </div>

        {/* Recent Reports */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Reportes Recientes</h2>
            <Link
              to="/reports"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Ver todos
            </Link>
          </div>

          {recentReports.length === 0 ? (
            <div className="text-center py-8">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay reportes</h3>
              <p className="mt-1 text-sm text-gray-500">
                Comienza creando tu primer reporte de mantenimiento.
              </p>
              <div className="mt-6">
                <Link to="/reports/create" className="btn-primary">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Crear Reporte
                </Link>
              </div>
            </div>
          ) : (
            <ReportTable reports={recentReports} showActions={false} />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
