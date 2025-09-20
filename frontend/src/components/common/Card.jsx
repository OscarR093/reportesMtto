// Card component
import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  header = null, 
  footer = null, 
  variant = 'default',
  ...props 
}) => {
  const baseClasses = 'overflow-hidden rounded-lg shadow';
  
  const variantClasses = {
    default: 'bg-white',
    elevated: 'bg-white shadow-lg',
    outlined: 'bg-white border border-gray-200',
  };
  
  const cardClasses = `${baseClasses} ${variantClasses[variant]} ${className}`;
  
  return (
    <div className={cardClasses} {...props}>
      {header && (
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          {header}
        </div>
      )}
      <div className="px-4 py-5 sm:p-6">
        {children}
      </div>
      {footer && (
        <div className="px-4 py-4 bg-gray-50 sm:px-6">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;