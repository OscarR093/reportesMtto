// Dashboard stats component
import React from 'react';
import {
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const DashboardStats = ({ stats }) => {
  const statCards = [
    {
      name: 'Total Reportes',
      value: stats?.totalReports || 0,
      icon: DocumentTextIcon,
      color: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200',
      iconColor: 'bg-blue-600',
      textColor: 'text-blue-600',
      valueColor: 'text-blue-900'
    },
    {
      name: 'Pendientes',
      value: stats?.pendingReports || 0,
      icon: ClockIcon,
      color: 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200',
      iconColor: 'bg-yellow-600',
      textColor: 'text-yellow-600',
      valueColor: 'text-yellow-900'
    },
    {
      name: 'Completados',
      value: stats?.completedReports || 0,
      icon: CheckCircleIcon,
      color: 'bg-gradient-to-br from-green-50 to-green-100 border-green-200',
      iconColor: 'bg-green-600',
      textColor: 'text-green-600',
      valueColor: 'text-green-900'
    },
    {
      name: 'Urgentes',
      value: stats?.urgentReports || 0,
      icon: ExclamationTriangleIcon,
      color: 'bg-gradient-to-br from-red-50 to-red-100 border-red-200',
      iconColor: 'bg-red-600',
      textColor: 'text-red-600',
      valueColor: 'text-red-900'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((card) => {
        const Icon = card.icon;
        return (
          <div 
            key={card.name} 
            className={`card ${card.color} border`}
          >
            <div className="flex items-center">
              <div className={`p-3 rounded-full ${card.iconColor}`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${card.textColor}`}>{card.name}</p>
                <p className={`text-2xl font-bold ${card.valueColor}`}>{card.value}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardStats;