import React from 'react';
import Button from './buttons/Button';

const Navigation = ({ children, ...props }) => {
  const PAGE_SIZE = props.pageSize || 10;

  return (
    <div className="flex justify-between items-center align px-4 py-3 text-sm">
      {props.length > 0 ? (
        <div className="pr-3">
          {Math.max(0, props.from)} - {Math.min(props.to, props.length)} di {props.length}
        </div>
      ) : (
        <div className="pr-3"></div>
      )}

      <div className="inline-flex rounded-md shadow-sm" role="group">
        <Button
          type="button"
          className="rounded-r-none"
          btnStyle="whiteLightButton"
          onClick={(e) => props.precFunction(e)}
          disabled={props.from - PAGE_SIZE <= 0}
        >
          Precedente
        </Button>
        <Button
          type="button"
          className="rounded-l-none border-l-0"
          btnStyle="whiteLightButton"
          onClick={(e) => props.succFunction(e)}
          disabled={props.from + PAGE_SIZE - 1 >= props.length}
        >
          Successivo
        </Button>
      </div>
    </div>
  );
};

export default Navigation;
