import React from 'react';

import { http } from '../../utils/Utils';
import Table from '../UI/Table';
import { Link } from 'react-router-dom';
import { FaLink } from 'react-icons/fa';
import RentElementLabel from './rentElements/RentElementLabel';
import ElementLabel from '../UI/ElementLabel';
import { MdGarage } from 'react-icons/md';
import DisplayDateTime from '../UI/dates/DisplayDateTime';
import { convertPrice } from '../../utils/Prices';
import Button from '../UI/buttons/Button';

const RentsTable = ({
  selectedRentalLocation,
  selectedState,
  selectedVehicle,
  updateRentsCount,
  userType,
}) => {
  const fetchRents = async (skip = 0, limit = 10, queryProps) => {
    const response = await http({
      url: `${userType === 'corporate' ? '/corporate' : ''}/rents?pickUpLocation=${
        queryProps?.rentalLocation || 'null'
      }&vehicle=${queryProps?.vehicle || 'null'}&state=${
        queryProps?.state || 'null'
      }&skip=${skip}&limit=${limit}`,
    });

    updateRentsCount(response.count);
    return { resource: response.rents, count: response.count };
  };

  const generateUrl = (rent) => {
    let path;
    if (userType === 'corporate') {
      path = '/corporate';
    } else if (userType === 'admin') {
      path = '/admin/clienti';
    } else {
      path = '/dashboard';
    }

    const step = Math.min(rent?.stepDone + 1, 2);
    if (rent.state === 'draft' && path === '/dashboard')
      return `${path}/movimenti/crea/${step}/${rent._id}`;
    if (rent.state === 'chiuso' && path === '/dashboard')
      return `${path}/movimenti/${rent._id}/cassa`;
    return `${path}/movimenti/${rent._id}`;
  };

  const lateRent = (rent) =>
    rent.state.includes('aperto', 'draft') && new Date(rent.expectedDropOffDate) < new Date();

  return (
    <Table
      header={['Codice', 'Targa', 'Stato', 'Tipo', 'Inizio', 'Fine', 'Creazione', 'Prezzo', '']}
      fetchFunction={fetchRents}
      emptyTableMessage="Non è stata creato creato alcun movo"
      itemsLayout={{
        code: (code) => code.substring(code.length - 8),
        vehicle: (vehicle) =>
          userType === 'corporate' ? (
            vehicle?.plate
          ) : (
            <Link className="flex space-x-1" to={`/dashboard/veicoli/flotta/${vehicle?._id}`}>
              <span className="font-semibold">
                {vehicle?.plate ? vehicle.plate.toUpperCase() : ''}
              </span>
              <span className="text-xs text-blue-600 mt-1">
                <FaLink />
              </span>
            </Link>
          ),
        state: (state, rent) => (
          <RentElementLabel rentState={state} rentCustomerCompany={rent?.customerCompany} />
        ),
        movementType: (type) =>
          type === 'NOL' ? (
            <ElementLabel bgColor="bg-blue-500">NOLEGGIO</ElementLabel>
          ) : type === 'COM' ? (
            <ElementLabel bgColor="bg-orange-600">COMODATO</ElementLabel>
          ) : type === 'MNP' ? (
            <ElementLabel bgColor="bg-gray-600">MOV NON PROD</ElementLabel>
          ) : (
            <ElementLabel>{type}</ElementLabel>
          ),
        pickUpDate: (date, rent) => (
          <>
            <DisplayDateTime date={date} displayType={'flat'} />
            <div className="text-xs">
              {userType === 'corporate' ? (
                <span className="font-semibold">{rent?.pickUpLocation?.name}</span>
              ) : (
                <Link
                  className="flex space-x-1"
                  to={`/settings/puntinolo/${rent?.pickUpLocation?._id}`}
                >
                  <span className="font-semibold">{rent?.pickUpLocation?.name}</span>
                  <span className="text-sm text-blue-600 mt-0.5">
                    <MdGarage />
                  </span>
                </Link>
              )}
            </div>
          </>
        ),
        expectedDropOffDate: (date, rent) => (
          <>
            {!(rent?.state.includes('aperto', 'draft')) && rent?.expectedDropOffDate !== undefined ? (
              <>
                <div className="flex space-x-1">
                  <div className="text-sm">Prevista:</div>
                  <DisplayDateTime
                    date={date}
                    displayType={'flat'}
                    alert={lateRent(rent)}
                  />
                </div>
                <div className="flex space-x-1">
                  <div className="text-sm">Effettiva:</div>
                  <DisplayDateTime date={rent?.dropOffDate} displayType={'flat'} />
                </div>
              </>
            ) : (
              <DisplayDateTime date={date} displayType={'flat'} alert={lateRent(rent)} />
            )}
            <div className="text-xs">
              {userType === 'corporate' ? (
                <span className="font-semibold">{rent?.dropOffLocation?.name}</span>
              ) : (
                <Link
                  className="flex space-x-1"
                  to={`/settings/puntinolo/${rent?.dropOffLocation?._id}`}
                >
                  <span className="font-semibold">{rent?.dropOffLocation?.name}</span>
                  <span className="text-sm text-blue-600 mt-0.5">
                    <MdGarage />
                  </span>
                </Link>
              )}
            </div>
          </>
        ),
        createdAt: (date) => <DisplayDateTime date={date} />,
        price: (price) =>
          price?.totalAmount ? (
            <>{convertPrice(price?.totalAmount)} </>
          ) : price?.amount ? (
            <>{convertPrice(price?.amount)} </>
          ) : (
            '-'
          ),
        _id: (id, rent) => (
          <Button to={generateUrl(rent)} btnStyle="tableItemAction">
            Dettagli &raquo;
          </Button>
        ),
      }}
      rowClassFunction={(rent) => (lateRent(rent) ? 'bg-red-100' : '')}
      queryProps={{
        rentalLocation: selectedRentalLocation,
        vehicle: selectedVehicle,
        state: selectedState,
      }}
    />
  );
};

export default RentsTable;
