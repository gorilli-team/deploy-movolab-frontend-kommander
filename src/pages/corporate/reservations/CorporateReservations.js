import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import CorporatePage from '../../../components/Corporate/CorporatePage';
import ReservationsTable from '../../../components/Reservations/ReservationsTable';
import { http } from '../../../utils/Utils';
import { CORPORATE_ROLE_ADMIN, CORPORATE_ROLE_OPERATOR } from '../../../utils/Utils';
import TableHeader from '../../../components/UI/TableHeader';
import { useHistory, useLocation } from 'react-router-dom';
import WhiteBox from '../../../components/UI/WhiteBox';
import FilterSelectField from '../../../components/Form/FilterSelectField';

const CorporateRservations = () => {
  const search = useLocation().search;
  const reservationStates = [
    { value: 'draft', label: 'In Approvazione' },
    { value: 'aperto', label: 'Aperto' },
    { value: 'attivo', label: 'Attivo' },
    { value: 'chiuso', label: 'Chiuso' },
    { value: 'fatturato', label: 'Fatturato' },
    { value: 'annullato', label: 'Annullato' },
    { value: 'no show', label: 'No Show' },
  ];

  const [reservations, setReservations] = useState([]);
  const [reservationsCount, setReservationsCount] = useState(0);
  const [rentalLocations, setRentalLocations] = useState([]);
  const [selectedRentalLocation, setSelectedRentalLocation] = useState(
    new URLSearchParams(search).get('puntoNolo'),
  );

  const [selectedState, setSelectedState] = useState(new URLSearchParams(search).get('stato'));

  const [selectedVehicle, setSelectedVehicle] = useState(
    new URLSearchParams(search).get('veicolo'),
  );

  const [from, setFrom] = useState(0);
  const history = useHistory();

  const setSelectedRentalLocationAndReload = (value) => {
    setSelectedRentalLocation(value);
    fetchReservation(value, selectedState, selectedVehicle, 0, 10);

    history.push(
      `/corporate/prenotazioni?puntoNolo=${value}&stato=${selectedState}&veicolo=${selectedVehicle}`,
    );
  };

  const setSelectedStateAndReload = (value) => {
    setSelectedState(value);
    fetchReservation(selectedRentalLocation, value, selectedVehicle, 0, 10);

    history.push(
      `/corporate/prenotazioni?stato=${value}&puntoNolo=${selectedRentalLocation}&veicolo=${selectedVehicle}`,
    );
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const setSelectedVehicleAndReload = (value) => {
    setSelectedRentalLocation('');
    setSelectedState('');
    setSelectedVehicle(value);
    fetchReservation(selectedRentalLocation, selectedState, value, 0, 10);
    history.push(
      `/corporate/prenotazioni?veicolo=${value}&puntoNolo=${selectedRentalLocation}&stato=${selectedState}`,
    );
  };

  useEffect(() => {
    getRentalLocations();
  }, []);

  const getRentalLocations = async () => {
    try {
      const response = await http({ url: `/clients/rentalLocation` });
      setRentalLocations(
        response.rentalLocations.map((rentalLocation) => {
          return {
            value: rentalLocation._id,
            label: `${rentalLocation.name} - ${rentalLocation.city}`,
          };
        }),
      );
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  useEffect(() => {
    fetchReservation(selectedRentalLocation, selectedState, selectedVehicle, 0, 10);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchReservation = async (rentalLocation, state, vehicle, skip, limit) => {
    try {
      const response = await http({
        url: `/corporate/reservations?pickUpLocation=${rentalLocation}&state=${state}&vehicle=${vehicle}&skip=${skip}&limit=${limit}`,
      });

      setReservations(response.reservations);
      setReservationsCount(response.count);
    } catch (err) {
      console.error(err);
    }
  };

  const precFunction = () => {
    if (from - 10 < 0) return;
    fetchReservation(selectedRentalLocation, selectedState, selectedVehicle, from - 10, 10);
    setFrom(from - 10);
  };

  const succFunction = () => {
    if (from + 10 > reservationsCount) return;
    fetchReservation(selectedRentalLocation, selectedState, selectedVehicle, from + 10, 10);
    setFrom(from + 10);
  };

  return (
    <CorporatePage canAccess={[CORPORATE_ROLE_ADMIN, CORPORATE_ROLE_OPERATOR]}>
      <WhiteBox>
        <div className="flex justify-between items-center">
          <TableHeader tableName={'Prenotazioni'} buttons={[]} length={reservationsCount} />
          <div className="flex justify-end gap-2 mr-6">
            <FilterSelectField
              onChange={(e) => setSelectedStateAndReload(e.target.value)}
              emptyOption={{ label: 'Tutti gli Stati' }}
              defaultValue={reservationStates.find((state) => state.value === selectedState)}
              options={reservationStates}
            />
            <FilterSelectField
              onChange={(e) => setSelectedRentalLocationAndReload(e.target.value)}
              emptyOption={{ label: 'Tutti i Punti Nolo' }}
              defaultValue={rentalLocations.find(
                (rental) => rental.value === selectedRentalLocation,
              )}
              options={rentalLocations}
            />
          </div>
        </div>
        <ReservationsTable
          elements={reservations}
          from={from + 1}
          to={from + 10}
          count={reservationsCount}
          precFunction={precFunction}
          succFunction={succFunction}
          updateReservationsCount={(count) => {
            setReservationsCount(count);
          }}
          userType={'corporate'}
        />
      </WhiteBox>
    </CorporatePage>
  );
};

export default CorporateRservations;
