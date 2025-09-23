import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/Layout';
import Button from '../components/common/Button';

const PendingActivities = () => {
  const { user } = useAuth();
  const [showTestModal, setShowTestModal] = useState(false);

  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900">Acceso Denegado</h1>
          <p className="mt-2 text-gray-600">
            No tienes permiso para acceder a esta sección.
          </p>
        </div>
      </Layout>
    );
  }

  // Modal inline simple
  const InlineTestModal = () => {
    if (!showTestModal) return null;
    
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div 
            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            onClick={() => setShowTestModal(false)}
          ></div>
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
          <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl sm:w-full">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex justify-between items-center border-b border-gray-200 pb-3 mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Test Modal Inline
                </h3>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  onClick={() => setShowTestModal(false)}
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="mt-2">
                <h2>Test Modal Content</h2>
                <p>If you can see this, the inline modal is working correctly.</p>
                <button 
                  onClick={() => setShowTestModal(false)}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Close Modal
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Actividades Pendientes
            </h1>
            <p className="text-gray-600">
              Gestiona las actividades pendientes de mantenimiento
            </p>
          </div>
          <Button onClick={() => setShowTestModal(true)}>
            Abrir Modal de Prueba
          </Button>
        </div>

        {/* Test Modal Inline */}
        <InlineTestModal />
      </div>
    </Layout>
  );
};

export default PendingActivities;