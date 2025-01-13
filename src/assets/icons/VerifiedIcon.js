import React from 'react';
import { IconContext } from 'react-icons';
import { RiVerifiedBadgeFill } from 'react-icons/ri';

export default function VerifiedIcon({ color = 'green', size = '22px' }) {
  return (
    <IconContext.Provider value={{ color, size }}>
      <div>
        <RiVerifiedBadgeFill />
      </div>
    </IconContext.Provider>
  );
}
