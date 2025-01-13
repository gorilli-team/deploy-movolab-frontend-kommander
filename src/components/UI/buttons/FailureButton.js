import React from 'react';

const FailureButton = ({ children, ...props }) => {
  return (
    <button
      className={`btn btn-sm text-white rounded-lg bg-red-600 hover:bg-red-700 w-full mb-1 sm:w-auto sm:mb-0 p-2 ${props.buttonEnabled}`}
      onClick={(e) => props.onClick(e)}
    >
      {children}
    </button>
  );
};

export default FailureButton;
