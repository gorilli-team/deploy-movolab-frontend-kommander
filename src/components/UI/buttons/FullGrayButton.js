import React from 'react';

const FullGrayButton = ({ children, ...props }) => {
  return (
    <button
      className="btn rounded-lg border text-white bg-gray-500 hover:bg-gray-700 w-full"
      onClick={props.onClick ? (e) => props.onClick(e) : null}
    >
      {children}
    </button>
  );
};

export default FullGrayButton;
