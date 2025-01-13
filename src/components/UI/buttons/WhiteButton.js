import React from 'react';

const WhiteButton = ({ children, ...props }) => {
  return (
    <button
      type={props.type || 'button'}
      className={`btn btn-sm rounded-lg mb-1 sm:mb-0 p-2 bg-white ${
        props.buttonDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'
      } ${props.selected ? 'border-2 border-black text-black' : 'border-gray-600 text-gray-600'}
      ${props.small ? 'text-sm mt-1' : 'text-md'}
      `}
      onClick={(e) => (props.onClick ? props.onClick(e) : null)}
    >
      {children}
    </button>
  );
};

export default WhiteButton;
