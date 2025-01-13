import React, { useRef } from 'react';
import EventSegment from './EventSegment';
import CalendarCell from './CalendarCell';
import moment from 'moment';

const CalendarRow = ({
  children,
  rowIndex = 0,
  displayDates = [],
  isHeader = false,
  events = [],
  parentData = {},
  onDragStart = () => {},
  hoursMode = '24',
  ...props
}) => {
  const containerRef = useRef(null);
  const sameDay = (date, hourFrom = false, hourTo = false) =>
    date.isSame(new Date(), 'day') &&
    (hourFrom !== false && hourTo !== false
      ? moment().get('hour') >= hourFrom && moment().get('hour') <= hourTo
      : true);

  const closingDays = parentData.rental?.availabilityClosingDays;

  const hours = hoursMode === '12' ? [11, 14, 17, 20] : [6, 12, 18, 24];

  return (
    <div className="flex border-b border-slate-200" {...props}>
      <div
        className={`w-28 md:w-52 px-1.5 md:px-3 shrink-0 sticky left-0 ${
          isHeader ? 'bg-gray-50' : 'bg-white'
        } bg-opacity-80 border-r border-slate-200 z-[5]`}
      >
        {children || ''}
      </div>
      <div className="flex-1 flex relative" ref={containerRef}>
        {isHeader
          ? displayDates.map((date, index) => (
              <div
                key={index}
                className={`min-w-[70px] md:min-w-[150px] text-sm md:text-base flex-1 ${index > 0 ? 'border-l border-slate-200' : ''}`}
              >
                <div
                  className={`border-b border-slate-200 py-0.5 md:py-1 text-center ${
                    sameDay(date) ? 'bg-green-300 bg-opacity-30 font-medium' : ''
                  }`}
                >
                  {date.locale('it').format('dddd DD/MM')}
                </div>
                <div className="flex text-center text-xs md:text-sm">
                  <div
                    className={`flex-1 md:py-1 ${
                      sameDay(date, 0, hours[0]-1) ? 'bg-green-300 bg-opacity-30 font-medium' : ''
                    }`}
                  >
                    <div className="border-r border-slate-200">{hours[0]}</div>
                  </div>
                  <div
                    className={`flex-1 md:py-1 ${
                      sameDay(date, hours[0], hours[1]-1) ? 'bg-green-300 bg-opacity-30 font-medium' : ''
                    }`}
                  >
                    <div className="border-r border-slate-200">{hours[1]}</div>
                  </div>
                  <div
                    className={`flex-1 md:py-1 ${
                      sameDay(date, hours[1], hours[2]-1) ? 'bg-green-300 bg-opacity-30 font-medium' : ''
                    }`}
                  >
                    <div className="border-r border-slate-200">{hours[2]}</div>
                  </div>
                  <div
                    className={`flex-1 md:py-1 ${
                      sameDay(date, hours[2], hours[3]-1) ? 'bg-green-300 bg-opacity-30 font-medium' : ''
                    }`}
                  >
                    <div>{hours[3]}</div>
                  </div>
                </div>
              </div>
            ))
          : displayDates.map((date, index) => (
              <div
                key={index}
                className={`min-w-[70px] md:min-w-[150px] flex-1 cursor-crosshair ${
                  index > 0 ? 'border-l border-slate-200' : ''
                }`}
                onMouseDown={(e) => onDragStart(e, parentData, containerRef)}
                onTouchStart={(e) => {
                  e.clientX = e.touches[0].clientX;
                  onDragStart(e, parentData, containerRef);
                }}
              >
                <CalendarCell
                  date={date}
                  dayAvailability={parentData.rental.availabilityWeekTable[date.isoWeekday() - 1]}
                  isClosingDay={closingDays.find(cd => date.isBetween(cd.from, cd.to, 'day', '[]')) ? true : false}
                  hoursMode={hoursMode}
                />
              </div>
            ))}

        {events.map((event, index) => (
          <EventSegment key={index} rowIndex={rowIndex} hoursMode={hoursMode} {...event} />
        ))}
      </div>
    </div>
  );
};

export default CalendarRow;
