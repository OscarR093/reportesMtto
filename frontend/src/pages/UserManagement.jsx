import React from 'react';
import Layout from '../components/Layout';

const UserManagement = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600">Administra los usuarios del sistema</p>
        </div>
        
        <div className="card">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">Funcionalidad en desarrollo</h3>
            <p className="mt-2 text-gray-600">
              Esta página estará disponible próximamente para gestionar usuarios.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UserManagement;
