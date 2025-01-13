import React, { useEffect, useState } from 'react';
import { FaAngleDown } from 'react-icons/fa6';
import VehicleCalRow from './VehicleCalRow';
import moment from 'moment';
import { http } from '../../utils/Utils';
import { throttle } from '../../utils/Draggable';

const RentalLocationRow = ({
  rental,
  vehicles,
  onScroll,
  isInit = false,
  isOpen = false,
  startOpen = false,
  rowsProps = {},
  calendarCellUnit = 150,
  pathname,
  userCompany,
  setDropEvent
}) => {
  const [expanded, setExpanded] = useState(startOpen);
  const [draggingElement, setDraggingElement] = useState(null);
  const [isHovering, setIsHovering] = useState(null);

  useEffect(() => {
    setExpanded(isOpen);
  }, [isOpen]);

  useEffect(() => {
    setExpanded(startOpen);
    getExpired();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [expiredMovos, setExpiredMovos] = useState([]);

  const getExpired = async () => {
    const response = await http({
      url: `/calendar/expiredRentsByRentalLocation/${rental._id}`,
    });

    if (response.vehicleExpiredRents) {
      setExpiredMovos(response.vehicleExpiredRents);
    }
  };

  if (!vehicles || vehicles.length === 0) {
    return null;
  }

  rental.availabilityWeekTable = Array(7).fill(0, 0, 7);
  for (var i = 0; i < 7; i++) {
    rental.availabilityWeekTable[i] = Array(24).fill(0, 0, 24);
  }
  rental.openingHours.forEach((opening) => {
    const opensAt = moment('2000-01-01T' + opening.openingHour).get('hour');
    const closesAt = moment('2000-01-01T' + opening.closingHour).get('hour');
    if (opensAt <= closesAt) {
      for (var i = opensAt; i < closesAt; i++) {
        rental.availabilityWeekTable[opening.day - 1][i] = 1;
      }
    }
  });

  rental.availabilityClosingDays = rental?.closingDays.map(({ from, to }) => ({
    from: moment(from).set({ hour: 1, minute: 0 }),
    to: moment(to),
  }));

  const onSegmentDrag = (_, event) => 
    event.type == 'reservation' ? setDraggingElement(event) : null;

  const onRowEnter = (_, vehicle) => setIsHovering(vehicle._id);

  const cancelSegmentDrag = () => {
    setIsHovering(null);
    setDraggingElement(null);
  };

  const onRowDrop = (_, vehicle) => {
    cancelSegmentDrag();

    if (draggingElement) {
      setDropEvent({ eventData: draggingElement.eventData, vehicle });
    }
  }

  return (
    <div>
      <div
        className="px-3 py-1.5 md:px-5 md:py-3 bg-slate-200 relative cursor-pointer hover:bg-slate-100 border-white border-t-2"
        onClick={() => {
          setExpanded(!expanded);
        }}
      >
        <div className="flex justify-between items-center">
          <div className="text-sm md:text-base">
            <strong className="font-semibold">{rental.name}</strong>{' '}
            <small className="block md:inline">
              {rental.address}, {rental.city} {startOpen}
            </small>
          </div>
          {isInit && (
            <div className="pr-8 text-sm md:text-base">
              {vehicles.length} {vehicles.length === 1 ? 'veicolo' : 'veicoli'}
            </div>
          )}
        </div>

        <div className="font-bold absolute top-0 right-0 px-5 py-4">
          <button>
            <FaAngleDown
              className={`text-lg transition-transform duration-200 ${
                expanded && 'transform rotate-180'
              }`}
            />
          </button>
        </div>
      </div>

      <div
        className={`overflow-hidden xl:overflow-auto overflow-y-hidden calendarScroll transition-max-height duration-500 ${
          expanded ? 'max-h-[300vh]' : 'max-h-[0]'
        }`}
        onScroll={onScroll}
      >
        <div
          className="flex flex-col items-stretch w-full bg-gray-50"
          style={{ minWidth: 250 + calendarCellUnit * rowsProps.displayDates.length + 'px' }}
        >
          {vehicles.length > 0 &&
            vehicles.map((vehicle, index) => (
              <VehicleCalRow
                key={index}
                rowIndex={vehicles.length === 1 ? '-1' : index}
                vehicle={vehicle}
                pathname={pathname}
                userCompany={userCompany}
                parentData={{ vehicle, rental }}
                hasExpiredMovo={expiredMovos.find((m) => m.vehicle === vehicle._id)}
                onSegmentDrag={onSegmentDrag}
                onSegmentDragEnd={cancelSegmentDrag}
                onDrop={(e) => onRowDrop(e, vehicle)}
                onDragEnter={e => onRowEnter(e, vehicle)}
                isHovering={isHovering == vehicle._id}
                draggingElement={draggingElement}
                {...rowsProps}
              />
            ))}
        </div>
      </div>
    </div>
  );
};

export default RentalLocationRow;
