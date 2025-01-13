import React from 'react';
import { Link } from 'react-router-dom';
import ElementLabel from '../../../UI/ElementLabel';

import { convertPrice } from '../../../../utils/Prices';
import DisplayDateTime from '../../../UI/dates/DisplayDateTime';
import { FaLink } from 'react-icons/fa';
import { MdGarage } from 'react-icons/md';
import Button from '../../../UI/buttons/Button';

const generateUrl = (reservation) => {
  return `/dashboard/prenotazioni/${reservation._id}`;
};

const lateRent = (reservation) => {
  const check =
    reservation.state.includes('aperto', 'draft') && new Date(reservation.dropOffDate) < new Date();
  return check;
};

const ActivitiesReservationsTableItem = ({ reservation }) => {
  return (
    <tr className={`${lateRent(reservation) ? 'bg-red-100' : ''}`}>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">
          {reservation.vehicle !== undefined &&
            reservation.code.substring(reservation.code.length - 8)}
        </p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">
          {' '}
          <Link
            className="flex space-x-1"
            to={`/dashboard/veicoli/flotta/${reservation?.vehicle?._id}`}
          >
            <span className="font-semibold">
              {reservation?.vehicle?.plate ? reservation?.vehicle.plate.toUpperCase() : ''}
            </span>
            <span className="text-xs text-blue-600 mt-1">
              <FaLink />
            </span>
          </Link>
        </p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="font-semibold text-gray-600 uppercase">
          {reservation.state === 'aperto' ? (
            <ElementLabel bgColor="bg-green-500">{reservation.state}</ElementLabel>
          ) : reservation.state === 'attivo' ? (
            <ElementLabel bgColor="bg-green-600">{reservation.state}</ElementLabel>
          ) : reservation.state === 'no show' ? (
            <ElementLabel bgColor="bg-red-600">{reservation.state}</ElementLabel>
          ) : reservation.state === 'chiuso' ? (
            <ElementLabel bgColor="bg-yellow-600">{reservation.state}</ElementLabel>
          ) : (
            <ElementLabel>{reservation.state}</ElementLabel>
          )}
        </p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">
          {reservation.movementType === 'NOL' ? (
            <ElementLabel bgColor="bg-blue-500">NOLEGGIO</ElementLabel>
          ) : reservation.movementType === 'COM' ? (
            <ElementLabel bgColor="bg-orange-600">COMODATO</ElementLabel>
          ) : reservation.movementType === 'MNP' ? (
            <ElementLabel bgColor="bg-gray-600">MOV NON PROD</ElementLabel>
          ) : (
            <ElementLabel>{reservation.movementType}</ElementLabel>
          )}
        </p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <DisplayDateTime date={reservation.pickUpDate} displayType={'flat'} />
        <div className="text-xs">
          <Link
            className="flex space-x-1"
            to={`/settings/puntinolo/${reservation?.pickUpLocation?._id}`}
          >
            <span className="font-semibold">{reservation?.pickUpLocation?.name}</span>
            <span className="text-sm text-blue-600 mt-0.5">
              <MdGarage />
            </span>
          </Link>
        </div>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        {lateRent(reservation) ? (
          <DisplayDateTime date={reservation.dropOffDate} displayType={'flat'} alert={true} />
        ) : (
          <DisplayDateTime date={reservation.dropOffDate} displayType={'flat'} />
        )}

        <div className="text-xs">
          <Link
            className="flex space-x-1"
            to={`/settings/puntinolo/${reservation?.dropOffLocation?._id}`}
          >
            <span className="font-semibold">{reservation?.dropOffLocation?.name}</span>
            <span className="text-sm text-blue-600 mt-0.5">
              <MdGarage />
            </span>
          </Link>
        </div>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <DisplayDateTime date={reservation.createdAt} />
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">
          {reservation?.price?.totalAmount ? (
            <>{convertPrice(reservation?.price?.totalAmount)} </>
          ) : reservation?.price?.amount ? (
            <>{convertPrice(reservation?.price?.amount)} </>
          ) : (
            '-'
          )}
        </p>
      </td>
      <td>
        <Button to={generateUrl(reservation)} btnStyle="tableItemAction">
          Dettagli &raquo;
        </Button>
      </td>
    </tr>
  );
};

export default ActivitiesReservationsTableItem;
