import React, { useEffect, useState } from 'react';
import ActivitiesRentsTableItem from './ActivitiesRentsTableItem';
import ActivitiesReservationsTableItem from './ActivitiesReservationsTableItem';
import Navigation from '../../../UI/Navigation';
import toast from 'react-hot-toast';

import { http } from '../../../../utils/Utils';

const ActivitiesTable = (props) => {
  const [fromRents, setFromRents] = useState(0);
  const [fromReservations, setFromReservations] = useState(0);
  const [rents, setRents] = useState([]);
  const [rentsCount, setRentsCount] = useState(0);
  const [reservations, setReservations] = useState([]);
  const [reservationsCount, setReservationsCount] = useState(0);

  const fetchRents = async (skip = 0, limit = 10) => {
    try {
      const response = await http({
        url: `/rents?vehicle=${props.vehicle}&skip=${skip}&limit=${limit}`,
      });
      setRents(response.rents);
      setRentsCount(response.count);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const fetchReservations = async (skip = 0, limit = 10) => {
    try {
      const response = await http({
        url: `/reservations?vehicle=${props.vehicle}&skip=${skip}&limit=${limit}`,
      });
      response.reservations.forEach((reservation) => {
        reservation.type = 'Prenotazione';
      });
      setReservations(response.reservations);
      setReservationsCount(response.count);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  useEffect(() => {
    fetchRents();
    fetchReservations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const precFunctionRents = () => {
    if (fromRents - 10 < 0) return;
    fetchRents(fromRents - 10, 10);
    setFromRents(fromRents - 10);
  };

  const succFunctionRents = () => {
    if (fromRents + 10 > rentsCount) return;
    fetchRents(fromRents + 10, 10);
    setFromRents(fromRents + 10);
  };

  const precFunctionReservations = () => {
    if (fromReservations - 10 < 0) return;
    fetchReservations(fromReservations - 10, 10);
    setFromReservations(fromReservations - 10);
  };

  const succFunctionReservations = () => {
    if (fromReservations + 10 > reservationsCount) return;
    fetchReservations(fromReservations + 10, 10);
    setFromReservations(fromReservations + 10);
  };

  return (
    <>
      <div className="text-xl font-semibold p-2">Movo</div>
      <div className="bg-white rounded border-gray-200 overflow-hidden">
        {/* Table */}
        <div className="border-b">
          <table className="table-auto w-full">
            {/* Table header */}
            <thead className="text-xs font-semibold uppercase text-white bg-gray-400 border-gray-200">
              <tr>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Attività</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Codice</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Targa</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Stato</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Tipo</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Inizio</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Fine</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Creazione</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Prezzo</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap"></th>
              </tr>
            </thead>
            {/* Table body */}
            {rents.length === 0 ? (
              <tr className="text-sm divide-y divide-gray-200 h-32">
                <td colSpan={10} className="text-center py-5">
                  <div className="text-gray-400 text-2xl">Nessun movo trovato</div>
                </td>
              </tr>
            ) : (
              <tbody className="text-sm divide-y divide-gray-200">
                {rents.map((rent, index) => {
                  return <ActivitiesRentsTableItem key={index} rent={rent} />;
                })}
              </tbody>
            )}
          </table>
        </div>
        <Navigation
          from={fromRents + 1}
          to={fromRents + 10}
          length={rentsCount}
          precFunction={precFunctionRents}
          succFunction={succFunctionRents}
        />
      </div>
      <div className="mt-5">
        <div className="text-xl font-semibold p-2">Prenotazioni</div>
        <div className="bg-white rounded border-gray-200 overflow-hidden">
          {/* Table */}
          <div className="border-b">
            <table className="table-auto w-full">
              {/* Table header */}
              <thead className="text-xs font-semibold uppercase text-white bg-gray-400 border-gray-200">
                <tr>
                  <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                    <div className="font-semibold text-left">Attività</div>
                  </th>
                  <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                    <div className="font-semibold text-left">Codice</div>
                  </th>
                  <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                    <div className="font-semibold text-left">Targa</div>
                  </th>
                  <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                    <div className="font-semibold text-left">Stato</div>
                  </th>
                  <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                    <div className="font-semibold text-left">Tipo</div>
                  </th>
                  <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                    <div className="font-semibold text-left">Inizio</div>
                  </th>
                  <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                    <div className="font-semibold text-left">Fine</div>
                  </th>
                  <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                    <div className="font-semibold text-left">Creazione</div>
                  </th>
                  <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                    <div className="font-semibold text-left">Prezzo</div>
                  </th>
                  <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap"></th>
                </tr>
              </thead>
              {/* Table body */}
              {reservations.length === 0 ? (
                <tr className="text-sm divide-y divide-gray-200 h-32">
                  <td colSpan={10} className="text-center py-5">
                    <div className="text-gray-400 text-2xl">Nessuna prenotazione trovata</div>
                  </td>
                </tr>
              ) : (
                <tbody className="text-sm divide-y divide-gray-200">
                  {reservations.map((reservation, index) => {
                    return (
                      <ActivitiesReservationsTableItem key={index} reservation={reservation} />
                    );
                  })}
                </tbody>
              )}
            </table>
          </div>
          <Navigation
            from={fromReservations + 1}
            to={fromReservations + 10}
            length={reservationsCount}
            precFunction={precFunctionReservations}
            succFunction={succFunctionReservations}
          />
        </div>
      </div>
    </>
  );
};

export default ActivitiesTable;
