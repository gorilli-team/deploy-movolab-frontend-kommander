import React, { useState } from 'react';

const ReadMore = ({ children, hellip = '…', btnTextOpen = 'Espandi', btnTextClose = 'Chiudi', truncateAtChars = 100 }) => {
  const [open, setOpen] = useState(0);

  if (React.isValidElement(children) || !children || children?.length <= truncateAtChars) { 
    return (<>{children}</>); 
  }

  const subString = children.slice(0, truncateAtChars - 1);

  return (
    <>
      {open ? children : (<>
        {subString.slice(0, subString.lastIndexOf(' ')) + hellip}
      </>)}&nbsp;

      <button onClick={() => setOpen(!open)} className="hover:underline text-xs">{open ? btnTextClose : btnTextOpen}</button>
    </>
  )
};

export default ReadMore;
