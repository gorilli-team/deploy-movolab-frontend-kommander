import React from 'react';
import { Link } from 'react-router-dom';

export const hoursMap = {
  0: 0,
  1: 0,
  2: 0,
  3: 0,
  4: 0,
  5: 0,
  6: 0,
  7: 0,
  8: 0,
  9: 2,
  10: 4,
  11: 6,
  12: 8,
  13: 10,
  14: 12,
  15: 14,
  16: 16,
  17: 18,
  18: 20,
  19: 22,
  20: 24,
  21: 24,
  22: 24,
  23: 24,
};
export const hoursMapInv = {
  0: 8,
  1: 8,
  2: 9,
  3: 9,
  4: 10,
  5: 10,
  6: 11,
  7: 11,
  8: 12,
  9: 12,
  10: 13,
  11: 13,
  12: 14,
  13: 14,
  14: 15,
  15: 15,
  16: 16,
  17: 16,
  18: 17,
  19: 17,
  20: 18,
  21: 18,
  22: 19,
  23: 19,
};

const EventSegment = ({
  startDate,
  endDate,
  displayDates,
  eventTitle,
  eventDesc,
  rowIndex,
  hoursMode = 24,
  eventLink = '',
  className = 'bg-sky-600',
  ...props
}) => {
  if (hoursMode === '12') {
    startDate.set('hour', hoursMap[startDate.hour()]);
    endDate.set('hour', hoursMap[endDate.hour()]);
  }

  const hourUnit = 100 / displayDates.length / 24;
  const eventLength = hourUnit * endDate.diff(startDate, 'hours');
  const startAt = hourUnit * startDate.diff(displayDates[0], 'hours');
  const segmentPos = { left: startAt + '%', width: eventLength + '%' };

  // Se inizia e finisce fuori dal calendario
  if (startAt < 0 && startAt + eventLength > 100) {
    segmentPos.left = '0';
    segmentPos.width = '100%';
    className += ' !rounded-none';
  }

  // Se inizia fuori dal calendario
  else if (startAt < 0) {
    segmentPos.left = 0;
    segmentPos.width = eventLength + startAt + '%';
    className += ' !rounded-l-none';
  }

  // Se finisce fuori dal calendario
  else if (startAt + eventLength > 100) {
    segmentPos.width = 100 - startAt + '%';
    className += ' !rounded-r-none';
  }

  const segmentClasses = `block text-white text-sm whitespace-nowrap w-full pl-2 py-1 h-8 my-2 md:py-2 md:pl-4 md:h-10 md:my-3 overflow-hidden hover:bg-opacity-80 rounded-lg cursor-pointer ${className}`;
  const popupClasses = `hidden group-hover:block absolute ${
    rowIndex === '-1' ? 'top-[0.35rem]' : rowIndex > 0 ? 'bottom-14' : 'top-14'
  } right-1/2 translate-x-1/2 bg-white text-sm whitespace-nowrap py-1.5 px-4 text-center rounded`;

  return (
    <div className={`absolute h-full z-[2] hover:z-[3] group`} style={segmentPos} draggable="true" {...props}>
      {eventLink === '' ? (
        <>
          <div className={popupClasses}>{eventDesc}</div>
          <div className={segmentClasses}>{eventTitle}</div>
        </>
      ) : (
        <>
          <Link to={eventLink} className={popupClasses}>
            {eventDesc}
          </Link>
          <Link to={eventLink} className={segmentClasses} draggable="false">
            {eventTitle}
          </Link>
        </>
      )}
    </div>
  );
};

export default EventSegment;
