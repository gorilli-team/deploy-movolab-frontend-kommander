import React from 'react';

import { http } from '../../utils/Utils';
import Table from '../UI/Table';
import { Link } from 'react-router-dom';
import { FaLink } from 'react-icons/fa';
import ElementLabel from '../UI/ElementLabel';
import { MdGarage } from 'react-icons/md';
import DisplayDateTime from '../UI/dates/DisplayDateTime';
import { convertPrice } from '../../utils/Prices';
import Button from '../UI/buttons/Button';

const ReservationsTable = ({
  selectedRentalLocation,
  selectedState,
  selectedVehicle,
  updateReservationsCount,
  userType,
}) => {
  const fetchReservations = async (skip = 0, limit = 10, queryProps) => {
    const response = await http({
      url: `${userType === 'corporate' ? '/corporate' : ''}/reservations?pickUpLocation=${
        queryProps?.rentalLocation || 'null'
      }&vehicle=${queryProps?.vehicle || 'null'}&state=${
        queryProps?.state || 'null'
      }&skip=${skip}&limit=${limit}`,
    });
    updateReservationsCount(response.count);
    return { resource: response.reservations, count: response.count };
  };

  const generateUrl = (reservation) => {
    let path;
    if (userType === 'corporate') {
      path = '/corporate';
    } else if (userType === 'admin') {
      path = '/admin/clienti';
    } else {
      path = '/dashboard';
    }
    return `${path}/prenotazioni/${reservation._id}`;
  };

  const lateReservation = (reservation) =>
    reservation.state.includes('aperto', 'draft') && new Date(reservation.dropOffDate) < new Date();

  return (
    <Table
      header={['Codice', 'Targa', 'Stato', 'Tipo', 'Inizio', 'Fine', 'Creazione', 'Prezzo', '']}
      fetchFunction={fetchReservations}
      emptyTableMessage="Non è stata creata alcuna prenotazione"
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
        state: (state) =>
          state === 'aperto' ? (
            <ElementLabel bgColor="bg-green-500" className="uppercase">
              {state}
            </ElementLabel>
          ) : state === 'attivo' ? (
            <ElementLabel bgColor="bg-green-600" className="uppercase">
              {state}
            </ElementLabel>
          ) : state === 'no show' ? (
            <ElementLabel bgColor="bg-red-600" className="uppercase">
              {state}
            </ElementLabel>
          ) : state === 'chiuso' ? (
            <ElementLabel bgColor="bg-yellow-600" className="uppercase">
              {state}
            </ElementLabel>
          ) : state === 'annullato' ? (
            <ElementLabel bgColor="bg-red-400" className="uppercase">
              {state}
            </ElementLabel>
          ) : state === 'stornato' ? (
            <ElementLabel bgColor="bg-purple-600" className="uppercase">
              {state}
            </ElementLabel>
          ) : state === 'draft' && userType === 'corporate' ? (
            <ElementLabel bgColor="bg-yellow-500" className="uppercase">
              IN APPROVAZIONE
            </ElementLabel>
          ) : state === 'draft' && userType !== 'corporate' ? (
            <ElementLabel className="uppercase">BOZZA</ElementLabel>
          ) : (
            <ElementLabel className="uppercase">{state}</ElementLabel>
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
        pickUpDate: (date, reservation) => (
          <>
            <DisplayDateTime date={date} displayType={'flat'} />
            <div className="text-xs">
              {userType === 'corporate' ? (
                <span className="font-semibold">{reservation?.pickUpLocation?.name}</span>
              ) : (
                <Link
                  className="flex space-x-1"
                  to={`/settings/puntinolo/${reservation?.pickUpLocation?._id}`}
                >
                  <span className="font-semibold">{reservation?.pickUpLocation?.name}</span>
                  <span className="text-sm text-blue-600 mt-0.5">
                    <MdGarage />
                  </span>
                </Link>
              )}
            </div>
          </>
        ),
        dropOffDate: (date, reservation) => (
          <>
            <DisplayDateTime
              date={date}
              displayType={'flat'}
              alert={lateReservation(reservation)}
            />
            <div className="text-xs">
              {userType === 'corporate' ? (
                <span className="font-semibold">{reservation?.dropOffLocation?.name}</span>
              ) : (
                <Link
                  className="flex space-x-1"
                  to={`/settings/puntinolo/${reservation?.dropOffLocation?._id}`}
                >
                  <span className="font-semibold">{reservation?.dropOffLocation?.name}</span>
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
        _id: (id, reservation) => (
          <Button to={generateUrl(reservation)} btnStyle="tableItemAction">
            Dettagli &raquo;
          </Button>
        ),
      }}
      rowClassFunction={(reservation) => (lateReservation(reservation) ? 'bg-red-100' : '')}
      queryProps={{
        rentalLocation: selectedRentalLocation,
        vehicle: selectedVehicle,
        state: selectedState,
      }}
    />
  );
};

export default ReservationsTable;
