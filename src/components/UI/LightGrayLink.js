import React from 'react';
import { Link } from 'react-router-dom';

const LightGrayLink = ({ children, className, buttonEnabled, selected, to }) => {
  return (
    <Link
      className={`text-black w-full rounded-lg hover:bg-gray-400 mb-1 sm:w-auto xs:w-auto sm:mb-0 py-2 px-3 ${ buttonEnabled } 
      ${selected ? 'border-2 border-black bg-gray-500' : 'bg-gray-200'} ${className}`}
      to={to}
    >
      {children}
    </Link>
  );
};

export default LightGrayLink;
