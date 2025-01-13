import React from 'react';

const FormLabel = ({ children, className = '', ...props }) => {
  return (
    <div className={`text-sm font-semibold mt-2 text-nowrap ${className}`} {...props}>
      {children}
    </div>
  );
};

export default FormLabel;
