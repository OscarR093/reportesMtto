// Edit activity modal component
import React from 'react';
import Modal from '../common/Modal';
import PendingActivityForm from './PendingActivityForm';

const EditActivityModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  activity = {},
  isSubmitting = false
}) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={activity.id ? "Editar Actividad" : "Nueva Actividad Pendiente"}
      size="lg"
    >
      <PendingActivityForm
        initialData={activity}
        onSubmit={onSubmit}
        onCancel={onClose}
        isSubmitting={isSubmitting}
      />
    </Modal>
  );
};

export default EditActivityModal;