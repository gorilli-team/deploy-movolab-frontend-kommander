import React from 'react';

const LightGrayButton = ({ children, ...props }) => {
  return (
    <button
      className={`rounded-lg w-full text-sm sm:w-auto xs:w-auto sm:mb-0 px-3 py-1 whitespace-nowrap ${
        props.buttonDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-400'
      } ${
        props.selected ? 'border-2 border-black bg-gray-500 text-white' : 'bg-gray-200 text-black'
      }
      ${props.small ? 'text-sm mt-1' : 'text-md'}
      `}
      onClick={props.onClick ? (e) => props.onClick(e) : null}
      disabled={props.buttonDisabled}
    >
      {children}
    </button>
  );
};

export default LightGrayButton;
