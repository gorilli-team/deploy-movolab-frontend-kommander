import React from 'react';
import moment from 'moment';

const CalendarCell = ({ date, dayAvailability, hoursMode = '24', isClosingDay }) => {
  const cellContent = [];
  const daySegmentLen = 100 / parseInt(hoursMode);

  const hours = hoursMode === '12' ? [11, 14, 17, 20] : [6, 12, 18, 24];

  if (isClosingDay) {
    cellContent.push(
      <div
        className="absolute h-[65px] bg-opacity-40 bg-gray-100 z-[1] cursor-not-allowed"
        style={{ left: '0%', width: '100%' }}
        title="Giorno di chiusura"
      ></div>,
    );
  } else {
    // Questo obrobrio crea i segmentini degli orari di apertura durante la giornata
    var curSegmentLen = 0;
    var startAt = 0;
    var allDay = 0;
    dayAvailability.forEach((available, hour) => {
      if (hoursMode === '12') {
        if (!available) {
          allDay++;
        }

        if (allDay === 24) {
          cellContent.push(
            <div
              className="absolute h-[65px] bg-opacity-40 bg-gray-100 z-[1] cursor-not-allowed"
              style={{ left: '0%', width: '100%' }}
              title="Chiuso"
            ></div>,
          );
          return;
        }

        if (hour < 8 || hour >= 20) {
          return;
        }

        hour -= 8;
      }

      if (!available) {
        if (curSegmentLen === 0) {
          startAt = hour * daySegmentLen;
        }
        curSegmentLen += daySegmentLen;
      }

      if (curSegmentLen !== 0 && (hour >= 23 || (hour < 24 && dayAvailability[hour + 1]))) {
        cellContent.push(
          <div
            className="absolute h-[65px] bg-opacity-40 bg-gray-100 z-[1] cursor-not-allowed"
            style={{ left: startAt + '%', width: curSegmentLen + '%' }}
            key={hour}
            title="Chiuso"
          ></div>,
        );
        curSegmentLen = 0;
      }
    });
  }

  var hourNow = date.isSame(moment(), 'date') ? moment().get('hour') : 24;

  // Riga con l'ora corrente
  if (hourNow !== 24) {
    if (hoursMode === '12') {
      hourNow -= 8;
    }

    cellContent.push(
      <div
        className="absolute h-[65px] bg-green-300 z-[1]"
        style={{ left: hourNow * daySegmentLen + '%', width: '1px' }}
        key="curhour"
        title="Adesso"
      ></div>,
    );
  }

  return (
    <>
      <div className="relative">{cellContent.map((cell) => cell)}</div>
      {!isClosingDay ? (
        <div className="flex py-1 text-center text-slate-300 h-full items-center opacity-0 hover:opacity-100">
          <div className="flex-1 py-2 text-sm select-none border-r border-slate-300">
            {hourNow < hours[0] ? (
              <div className="rotate-[270deg] text-slate-400">Movo</div>
            ) : (
              hours[0]
            )}
          </div>
          <div className="flex-1 py-2 text-sm select-none border-r border-slate-300">
            {hourNow >= hours[0] && hourNow < hours[1] ? (
              <div className="rotate-[270deg] text-slate-400">Movo</div>
            ) : (
              hours[1]
            )}
          </div>
          <div className="flex-1 py-2 text-sm select-none border-r border-slate-300">
            {hourNow >= hours[1] && hourNow < hours[2] ? (
              <div className="rotate-[270deg] text-slate-400">Movo</div>
            ) : (
              hours[2]
            )}
          </div>
          <div className="flex-1 py-2 text-sm select-none">
            {hourNow >= hours[3] && hourNow < hours[4] ? (
              <div className="rotate-[270deg] text-slate-400">Movo</div>
            ) : (
              hours[3]
            )}
          </div>
        </div>
      ) : null}
    </>
  );
};

export default CalendarCell;
