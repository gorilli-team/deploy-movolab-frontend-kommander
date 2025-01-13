import React, { useState } from 'react';
import Button from './Button';

const ButtonDropdown = ({ children, dropdownClass, dropdownItems = [], ...props }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        {...props}
        onClick={() => {
          setIsOpen(!isOpen);
        }}
      >
        {children}
      </Button>

      {isOpen ? (
        <div
          className={`absolute animate-fadein z-10 bg-white rounded-lg shadow min-w-[12em] ${dropdownClass || ''}`}
          style={{ top: '2.65rem', right: '0' }}
        >
          <ul className="py-2 text-sm divide-y divide-slate-100 text-gray-700">
            {dropdownItems.map(
              ({ onClick = () => {}, hiddenIf = false, ...props }, index) =>
                !hiddenIf && (
                  <li key={index}>
                    <Button
                      btnStyle="unstyled"
                      className="block px-4 py-2 hover:bg-gray-100 w-full rounded-none font-normal text-left"
                      onClick={({ ...props }) => {
                        setIsOpen(false);
                        return onClick({ ...props });
                      }}
                      {...props}
                    />
                  </li>
                ),
            )}
          </ul>
        </div>
      ) : (
        ''
      )}
    </div>
  );
};

export default ButtonDropdown;
