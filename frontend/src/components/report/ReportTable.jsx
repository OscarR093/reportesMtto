// Report table component
import React from 'react';
import { Link } from 'react-router-dom';
import Badge from '../common/Badge';
import { 
  PRIORITY_COLORS, 
  PRIORITY_LABELS, 
  REPORT_STATUS_COLORS, 
  REPORT_STATUS_LABELS 
} from '../../constants/app';
import { formatDateTime } from '../../utils/helpers';

const ReportTable = ({ reports, showActions = true }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Reporte
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Equipo
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Prioridad
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fecha
            </th>
            {showActions && (
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {reports.map((report) => (
            <tr key={report.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {report.title}
                  </div>
                  <div className="text-sm text-gray-500">
                    #{report.id?.substring(0, 8)}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {report.equipment_display || 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge variant="default" className={PRIORITY_COLORS[report.priority]}>
                  {PRIORITY_LABELS[report.priority] || report.priority}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge variant="default" className={REPORT_STATUS_COLORS[report.status]}>
                  {REPORT_STATUS_LABELS[report.status] || report.status}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDateTime(report.createdAt || report.created_at || report.date || null)}
              </td>
              {showActions && (
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link 
                    to={`/reports/${report.id}/edit`} 
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Ver
                  </Link>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReportTable;