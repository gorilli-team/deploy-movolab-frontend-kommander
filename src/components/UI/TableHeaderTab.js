import React from 'react';

const TableHeaderTab = ({ buttons, children, className = '', ...props }) => (
  <div className={`border-b border-gray-200 ${className}`} {...props}>
    <div className="flex flex-wrap -mb-px">
      {buttons.map((button, index) => {
        if (button?.hiddenIf) return null;

        return (
          <button
            key={index}
            className={`inline-block whitespace-nowrap text-center flex-1 md:flex-initial text-sm font-medium text-gray-400 p-4 py-1 md:py-4 md:w-auto border-b-2 border-transparent rounded-t-lg enabled:hover:text-gray-600 enabled:hover:border-gray-400 group ${
              index === 0 ? 'md:ml-4' : ''
            } ${button.selected ? ' text-gray-800 !border-gray-800' : ''} ${button.disabled ? ' text-gray-300' : ' '}`}
            onClick={button.function ? button.function : () => {}}
            disabled={button.disabled || false}
          >
            {button.svgPath ? (
            <svg className="mr-1 inline" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" style={{width: '1em'}}>
              {button.svgPath}
            </svg>) : ''} {button.label}
          </button>
        );
      })}

      {children ? 
        <div className="flex flex-1 items-center justify-end py-2.5 px-6">{children}</div>
      : null}
    </div>
  </div>
);

export default TableHeaderTab;
