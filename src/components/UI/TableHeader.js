import React from 'react';
import Button from './buttons/Button';

const TableHeader = ({ tableName, buttons, length, className = '', children = '', ...props }) => {
  return (
    <div className={`p-6 flex flex-wrap items-center gap-2 ${className}`} {...props}>
      <div>
        {tableName && (
          <h2 className="font-semibold text-gray-800 text-2xl">
            {tableName}{' '}
            <span className="font-medium">{length !== undefined ? `(${length})` : ''}</span>
          </h2>
        )}
      </div>

      {buttons &&
        buttons.map((button, index) => {
          if (button.hidden) return null;
          return (
            <Button
              type="button"
              btnStyle="whiteLightButton"
              onClick={() => {
                if (button.function)
                  button.function();
              }}
              key={index}
              {...button}
            >
              {button.svgIco ?? ''} {button.label}
            </Button>
          );
        })}

      {children}
    </div>
  );
};

export default TableHeader;
