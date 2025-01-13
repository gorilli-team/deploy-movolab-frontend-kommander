import React from 'react';
import { Link } from 'react-router-dom';

const GrayLink = ({ children, ...props }) => {
  return (
    <Link
      className={`btn btn-sm text-white rounded-lg hover:bg-gray-700 w-full mb-1 sm:w-auto sm:mb-0 p-2 ${
        props.buttonEnabled
      } ${props.selected ? 'border-2 border-black bg-gray-800' : 'bg-gray-500'}`}
      to={props.to}
    >
      {children}
    </Link>
  );
};

export default GrayLink;
