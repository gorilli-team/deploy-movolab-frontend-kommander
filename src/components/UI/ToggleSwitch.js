import React, { useState } from 'react';
import Button from './buttons/Button';

const ToggleSwitch = ({ switches, disabled = false, ...props }) => {
  const [selectedSwitch, setSelectedSwitch] = useState(0);
  const sw_len = switches.length;

  return (
    <div {...props}>
      <div className="inline-flex rounded-md" role="group">
        {switches.map((curSwitch, index) => {
          const selected = (curSwitch.selected ?? selectedSwitch === index);

          return (
            <Button
              type="button"
              className={` 
              ${
                sw_len > 1 && index === 0
                  ? selected
                    ? 'mr-[-9px] z-[1]'
                    : '!rounded-r-none'
                  : sw_len > 1 && index === sw_len - 1
                  ? selected
                    ? 'ml-[-9px] z-[1] border-l-0'
                    : '!rounded-l-none border-l-0'
                  : selected
                  ? 'ml-[-9px] mr-[-9px] z-[1] border-l-0 px-5'
                  : '!rounded-r-none !rounded-l-none border-l-0'
              }
            `}
              btnStyle="toggleSwitch"
              selected={selected}
              key={index}
              onClick={(e) => {
                setSelectedSwitch(index);
                curSwitch.onClick && curSwitch.onClick(index, e);
              }}
              disabled={ disabled || curSwitch?.disabled }
            >
              {curSwitch.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default ToggleSwitch;
