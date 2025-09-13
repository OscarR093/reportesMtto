import React from 'react';
import Layout from '../components/Layout';

const Profile = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
          <p className="text-gray-600">Gestiona tu información personal</p>
        </div>
        
        <div className="card">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">Funcionalidad en desarrollo</h3>
            <p className="mt-2 text-gray-600">
              Esta página estará disponible próximamente para editar tu perfil.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
