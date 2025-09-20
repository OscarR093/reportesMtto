// Textarea component
import React from 'react';

const Textarea = ({ 
  label = '', 
  error = '', 
  helperText = '', 
  required = false, 
  className = '', 
  id,
  ...props 
}) => {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className={className}>
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`block w-full rounded-md border ${
          error 
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
        } shadow-sm focus:ring-2 focus:ring-opacity-50 sm:text-sm`}
        rows="4"
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export default Textarea;