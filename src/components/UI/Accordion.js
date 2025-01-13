import React, { useState } from "react";
import { FaAngleDown } from "react-icons/fa6";
import { IS_MOBILE } from "../../utils/Utils";

const Accordion = ({
  className = '',
  titleClassName = '',
  innerClassName = '',
  textOpen = 'Espandi',
  textClose = 'Chiudi',
  mobileOnly = false,
  children = null
}) => {
  const [isOpen, setIsOpen] = useState();

  if (mobileOnly && !IS_MOBILE) {
    return (
      <div className={`${className} ${innerClassName}`}>
        {children}
      </div>
    )
  }

  return (
    <div className={className}>
      <div className={`text-center ${titleClassName}`}>
        <button
          className="text-xs opacity-70 hover:opacity-100"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? textOpen : textClose}{' '}
          <FaAngleDown className={`inline mb-1 ${isOpen && 'transform rotate-180'}`} />
        </button>
      </div>
      {isOpen ? (
        <div className={`mt-1 ${innerClassName}`}>
          {children}
        </div>
      ) : null}
    </div>
  );
}

export default Accordion;