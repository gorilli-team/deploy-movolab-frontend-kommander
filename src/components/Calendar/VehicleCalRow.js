import React from 'react';
import { Link } from 'react-router-dom';
import { getVehicleGroup } from '../../utils/Vehicles';
import { FaLink } from 'react-icons/fa';
import CalendarRow from './CalendarRow';
import moment from 'moment';
import { convertPrice } from '../../utils/Prices';

const movoTypes = {
  NOL: { label: 'Noleggio', className: 'bg-sky-700' },
  COM: { label: 'Comodato', className: 'bg-green-600' },
  MNP: { label: 'MNP', className: 'bg-gray-600' },
  RES: { label: 'Prenotazione', className: 'bg-orange-500' },
};

const VehicleCalRow = ({ vehicle, pathname, userCompany, isHovering, draggingElement, onSegmentDrag, onSegmentDragEnd, hasExpiredMovo = null, ...props }) => {
  const calendarRowEvents = [];

  const createEvent = (event) => {
    if (event.type === 'reservation' && (event.eventData.rent || false)) {
      return;
    }

    const eventTitle =
      event.type === 'rent'
        ? movoTypes[event.eventData.movementType]?.label || 'Movo'
        : movoTypes['RES']?.label;
    const eventClass =
      event.type === 'rent'
        ? movoTypes[event.eventData.movementType]?.className || ''
        : movoTypes['RES']?.className;
    const pickUpDate = moment(event.pickUpDate);
    const dropOffDate = moment((['draft', 'bozza', 'aperto'].includes(event.state) && event.type !== 'reservation') ? event.expectedDropOffDate : event.dropOffDate);

    if (event.state !== 'annullato' && event.state !== 'no show') {
      if (pathname === 'corporate' && event.eventData.customerCompany !== userCompany) {
        const segmentData = {
          startDate: pickUpDate,
          endDate: dropOffDate,
          displayDates: props.displayDates,
          eventTitle: `Veicolo occupato`,
          eventDesc: (
            <>
              {eventTitle} n. {event.code.slice(-8)} ({event.state})<br />
              <small>
                {pickUpDate.format('DD/MM/YYYY HH:ss')} - {dropOffDate.format('DD/MM/YYYY HH:ss')}
              </small>
            </>
          ),
          className: 'bg-gray-600',
        };

        calendarRowEvents.push(segmentData);
      } else {
        const segmentData = {
          startDate: pickUpDate,
          endDate: dropOffDate,
          displayDates: props.displayDates,
          eventTitle: `${eventTitle} n. ${event.code.slice(-8)}`,
          eventDesc: (
            <>
              {eventTitle} {event.code.slice(-8)} - {convertPrice(event.eventData.price.totalAmount)} ({event.state})<br />
              <small>
                {pickUpDate.format('DD/MM/YYYY HH:ss')} - {dropOffDate.format('DD/MM/YYYY HH:ss')}
              </small>
            </>
          ),
          className: eventClass + (event.state === 'draft' ? ' bg-opacity-30' : ''),
          eventLink:
            event.type === 'rent'
              ? event.state === 'draft'
                ? `/${pathname}/movimenti/crea/2/${event._id}`
                : `/${pathname}/movimenti/${event._id}?from=calendar`
              : `/${pathname}/prenotazioni/${event._id}?from=calendar`,
          onDragStart: (e) => onSegmentDrag(e, event, vehicle),
          onDragEnd: (e) => onSegmentDragEnd(e, event, vehicle)
        };

        calendarRowEvents.push(segmentData);
      }
    }
  };

  vehicle.events.forEach(createEvent);

  if (isHovering && draggingElement) {
    createEvent(draggingElement);
  }

  if (hasExpiredMovo) {
    const id = hasExpiredMovo?._id || hasExpiredMovo;

    calendarRowEvents.push({
      startDate: moment('1/1/2000'),
      endDate: moment('1/1/2100'),
      displayDates: props.displayDates,
      eventTitle: '',
      eventDesc: 'Impegnato da movo scaduto',
      className: 'bg-red-600 bg-opacity-10 !my-1 !py-5 md:!py-7',
      eventLink: `/${pathname}/movimenti/${id}?from=calendar`,
    });
  }

  return (
    <CalendarRow events={calendarRowEvents} {...props}>
      <div className="pt-1 md:pt-0 flex items-center">
        <div className="md:h-10 w-12 flex items-center">
          {vehicle.version?.imageUrl ? (
            <img src={vehicle.version?.imageUrl} alt="brand-logo" />
          ) : null}
        </div>
        <div className="flex-1 pl-2 font-semibold text-sm">
          {pathname === 'corporate' ? (
            vehicle?.plate ? (
              vehicle.plate.toUpperCase()
            ) : (
              ''
            )
          ) : (
            <Link to={`/dashboard/veicoli/flotta/${vehicle._id}`}>
              {vehicle?.plate ? vehicle.plate.toUpperCase() : ''}
              <FaLink className="text-sky-600 mb-1 ml-1 hidden md:inline" />
            </Link>
          )}
        </div>
      </div>
      <div className="pb-1 text-xs md:text-sm whitespace-nowrap overflow-hidden">
        {vehicle.brand.brandName} {vehicle.model.modelName} {' - '}
        {getVehicleGroup(vehicle).group?.mnemonic}
      </div>
    </CalendarRow>
  );
};

export default VehicleCalRow;
