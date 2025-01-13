import React from 'react';
import { Link } from 'react-router-dom';
import ElementLabel from '../../../UI/ElementLabel';
import RentElementLabel from '../../../Rents/rentElements/RentElementLabel';
import { convertPrice } from '../../../../utils/Prices';
import DisplayDateTime from '../../../UI/dates/DisplayDateTime';
import { FaLink } from 'react-icons/fa';
import { MdGarage } from 'react-icons/md';
import Button from '../../../UI/buttons/Button';

const generateUrl = (rent) => {
  const step = rent?.stepDone + 1 || 2;
  if (rent.state === 'draft') return `/dashboard/movimenti/crea/${step}/${rent._id}`;
  return `/dashboard/movimenti/${rent._id}`;
};

const lateRent = (rent) => {
  const check = rent.state.includes('aperto', 'draft') && new Date(rent.dropOffDate) < new Date();
  return check;
};

const ActivitiesRentsTableItem = ({ rent }) => {
  return (
    <tr className={`${lateRent(rent) ? 'bg-red-100' : ''}`}>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">
          {rent.vehicle !== undefined && rent.code.substring(rent.code.length - 8)}
        </p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">
          {' '}
          <Link className="flex space-x-1" to={`/dashboard/veicoli/flotta/${rent?.vehicle?._id}`}>
            <span className="font-semibold">
              {rent?.vehicle?.plate ? rent?.vehicle.plate.toUpperCase() : ''}
            </span>
            <span className="text-xs text-blue-600 mt-1">
              <FaLink />
            </span>
          </Link>
        </p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <RentElementLabel rentState={rent.state} />
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">
          {rent.movementType === 'NOL' ? (
            <ElementLabel bgColor="bg-blue-500">NOLEGGIO</ElementLabel>
          ) : rent.movementType === 'COM' ? (
            <ElementLabel bgColor="bg-orange-600">COMODATO</ElementLabel>
          ) : rent.movementType === 'MNP' ? (
            <ElementLabel bgColor="bg-gray-600">MOV NON PROD</ElementLabel>
          ) : (
            <ElementLabel>{rent.movementType}</ElementLabel>
          )}
        </p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <DisplayDateTime date={rent.pickUpDate} displayType={'flat'} />
        <div className="text-xs">
          <Link className="flex space-x-1" to={`/settings/puntinolo/${rent?.pickUpLocation?._id}`}>
            <span className="font-semibold">{rent?.pickUpLocation?.name}</span>
            <span className="text-sm text-blue-600 mt-0.5">
              <MdGarage />
            </span>
          </Link>
        </div>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        {lateRent(rent) ? (
          <DisplayDateTime date={rent.dropOffDate} displayType={'flat'} alert={true} />
        ) : (
          <DisplayDateTime date={rent.dropOffDate} displayType={'flat'} />
        )}

        <div className="text-xs">
          <Link className="flex space-x-1" to={`/settings/puntinolo/${rent?.dropOffLocation?._id}`}>
            <span className="font-semibold">{rent?.dropOffLocation?.name}</span>
            <span className="text-sm text-blue-600 mt-0.5">
              <MdGarage />
            </span>
          </Link>
        </div>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <DisplayDateTime date={rent.createdAt} />
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">
          {rent?.price?.totalAmount ? (
            <>{convertPrice(rent?.price?.totalAmount)} </>
          ) : rent?.price?.amount ? (
            <>{convertPrice(rent?.price?.amount)} </>
          ) : (
            '-'
          )}
        </p>
      </td>
      <td>
        <Button to={generateUrl(rent)} btnStyle="tableItemAction">
          Dettagli &raquo;
        </Button>
      </td>
    </tr>
  );
};

export default ActivitiesRentsTableItem;
