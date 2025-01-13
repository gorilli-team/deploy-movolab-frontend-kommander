import React from 'react';

const DisplayDateTime = ({ date, displayType, alert }) => {
  return (
    <div className={`${displayType === 'flat' ? 'flex' : ''}`}>
      <div
        className={`text-left ${
          alert ? 'text-red-500 font-bold' : 'text-gray-600 font-semibold'
        }  mr-1`}
      >
        {date !== undefined && new Date(date).toLocaleDateString()}
      </div>{' '}
      <div
        className={`text-left ${
          alert ? 'text-red-500 font-bold' : 'text-gray-600 font-semibold'
        }  mr-1`}
      >
        {date !== undefined && new Date(date).toLocaleTimeString().substring(0, 5)}
      </div>
    </div>
  );
};

export default DisplayDateTime;
