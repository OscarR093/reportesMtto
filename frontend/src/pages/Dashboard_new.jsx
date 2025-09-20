// Updated Dashboard component using new architecture
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DocumentTextIcon,
  UsersIcon,
  PlusIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Card from '../components/common/Card';
import DashboardStats from '../components/dashboard/DashboardStats';
import ReportTable from '../components/report/ReportTable';
import dashboardService from '../services/dashboardService';
import { USER_ROLES } from '../constants/app';

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
      const response = await dashboardService.getDashboardData();
      
      if (response.success && response.data) {
        setStats(response.data.stats);
        setRecentReports(response.data.recentReports || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner message="Cargando dashboard..." />
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
              ¡Bienvenido, {user?.name || user?.email}!
            </h1>
            <p className="text-gray-600">
              Aquí tienes un resumen de tus reportes de mantenimiento
            </p>
          </div>
          <Link
            to="/reports/create"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            <span>Nuevo Reporte</span>
          </Link>
        </div>

        {/* Stats Cards */}
        <DashboardStats stats={stats} />

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <Link to="/reports/create" className="block">
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
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <Link to="/reports" className="block">
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
          </Card>

          {(user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.SUPER_ADMIN) && (
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <Link to="/users" className="block">
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
            </Card>
          )}
        </div>

        {/* Recent Reports */}
        <Card 
          header={
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Reportes Recientes</h2>
              <Link
                to="/reports"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Ver todos
              </Link>
            </div>
          }
        >
          {recentReports.length === 0 ? (
            <div className="text-center py-8">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay reportes</h3>
              <p className="mt-1 text-sm text-gray-500">
                Comienza creando tu primer reporte de mantenimiento.
              </p>
              <div className="mt-6">
                <Link 
                  to="/reports/create" 
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Crear Reporte
                </Link>
              </div>
            </div>
          ) : (
            <ReportTable reports={recentReports} showActions={false} />
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;