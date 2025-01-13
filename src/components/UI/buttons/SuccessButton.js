import React from 'react';

const SuccessButton = ({ children, ...props }) => {
  return (
    <button
      className={`btn btn-sm text-white rounded-lg bg-green-600 hover:bg-green-700 w-full mb-1 sm:w-auto sm:mb-0 p-2 ${props.buttonEnabled}`}
      onClick={(e) => props.onClick(e)}
    >
      {children}
    </button>
  );
};

export default SuccessButton;
