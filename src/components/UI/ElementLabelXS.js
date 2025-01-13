import React from 'react';

const ElementLabelXS = ({ children, bgColor, ...props }) => {
  return (
    <span
      className={`text-white p-1 px-3 rounded-xl uppercase font-bold text-[10px]
     ${bgColor || 'bg-gray-500'}`}
    >
      {props.text}
    </span>
  );
};

export default ElementLabelXS;
