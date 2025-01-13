import Button from './buttons/Button';
import React from 'react';
import ButtonDropdown from './buttons/ButtonDropdown';

const btnStyleMap = (original) =>
  (({ blue: 'orange', lightSlateTransparent: 'lightSlateTransparentOrange', slate: 'slateOrange' })?.[original]) || original;

const CardsHeader = ({ buttons = [], title = '', children = null, className = '' }) => (
  <div className={`flex flex-wrap justify-between bg-slate-100/90 sticky top-0 z-30 p-3 px-5 pb-2 md:p-6 md:pb-4 gap-y-2 ${className}`}>
    <h2 className="font-bold md:px-4 text-2xl">{title}</h2>

    {children}

    {buttons.length > 0 ? (
      <div className="flex flex-wrap justify-end w-full md:w-auto space-x-1 md:space-x-2">
        {buttons.map(({ hiddenIf, btnStyle = 'blue', isDropdown = false, ...props }, index) =>
          (isDropdown && !props.href) ? (
            <ButtonDropdown key={index} btnStyle={btnStyleMap(btnStyle)} className={`!py-1 md:!py-2 ${props?.className || ''}`} {...props} />
          ) : hiddenIf ? (
            ''
          ) : (
            <Button key={index} btnStyle={btnStyleMap(btnStyle)} className={`!py-1 md:!py-2 !text-xs md:!text-sm ${props?.className || ''}`} {...props} />
          ),
        )}
      </div>
    ) : null}
  </div>
);

export default CardsHeader;
