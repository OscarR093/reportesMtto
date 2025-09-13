import React from 'react';
import Layout from '../components/Layout';

const CreateReport = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Crear Nuevo Reporte</h1>
          <p className="text-gray-600">Crea un nuevo reporte de mantenimiento</p>
        </div>
        
        <div className="card">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">Funcionalidad en desarrollo</h3>
            <p className="mt-2 text-gray-600">
              Esta página estará disponible próximamente con un wizard para crear reportes.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreateReport;
