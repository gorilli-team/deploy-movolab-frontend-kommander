import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import CorporatePage from '../../../components/Corporate/CorporatePage';
import RentsTable from '../../../components/Rents/RentsTable';
import { http } from '../../../utils/Utils';
import { CORPORATE_ROLE_ADMIN, CORPORATE_ROLE_OPERATOR } from '../../../utils/Utils';
import TableHeader from '../../../components/UI/TableHeader';
import { useHistory, useLocation } from 'react-router-dom';
import WhiteBox from '../../../components/UI/WhiteBox';
import FilterSelectField from '../../../components/Form/FilterSelectField';

const CorporateRents = () => {
  const history = useHistory();
  const search = useLocation().search;
  const urlParams = new URLSearchParams(search);
  const [rentsCount, setRentsCount] = useState([]);
  const [rentalLocations, setRentalLocations] = useState([]);
  const rentStates = [
    { value: 'draft', label: 'Bozza' },
    { value: 'aperto', label: 'Aperto' },
    { value: 'attivo', label: 'Attivo' },
    { value: 'chiuso', label: 'Chiuso' },
    { value: 'fatturato', label: 'Fatturato' },
    { value: 'parz fatturato', label: 'Fatturato parziale' },
    { value: 'incassato', label: 'Incassato' },
    { value: 'parz incassato', label: 'Incassato parziale' },
    { value: 'stornato', label: 'Stornato' },
    { value: 'annullato', label: 'Annullato' },
  ];
  const [selectedRentalLocation, setSelectedRentalLocation] = useState(urlParams.get('puntoNolo'));
  const [selectedVehicle, setSelectedVehicle] = useState(urlParams.get('veicolo'));
  const [selectedState, setSelectedState] = useState(urlParams.get('stato'));

  const setSelectedRentalLocationAndReload = (value) => {
    setSelectedRentalLocation(value);
    history.push(
      `/corporate/movimenti?puntoNolo=${value}&stato=${selectedState}&veicolo=${selectedVehicle}`,
    );
  };

  const setSelectedStateAndReload = (value) => {
    setSelectedState(value);
    history.push(
      `/corporate/movimenti?stato=${value}&puntoNolo=${selectedRentalLocation}&veicolo=${selectedVehicle}`,
    );
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const setSelectedVehicleAndReload = (value) => {
    setSelectedVehicle(value);
    history.push(
      `/corporate/movimenti?veicolo=${value}&puntoNolo=${selectedRentalLocation}&stato=${selectedState}`,
    );
  };

  const updateRentsCount = (count) => {
    setRentsCount(count);
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

  return (
    <CorporatePage canAccess={[CORPORATE_ROLE_ADMIN, CORPORATE_ROLE_OPERATOR]}>
      <WhiteBox>
        <div className="flex justify-between items-center">
          <TableHeader tableName={'Movo'} length={rentsCount} />
          <div className="flex justify-end gap-2 mr-6">
            <FilterSelectField
              onChange={(e) => setSelectedStateAndReload(e.target.value)}
              emptyOption={{ label: 'Tutti gli Stati' }}
              defaultValue={rentStates.find((state) => state.value === selectedState)}
              options={rentStates}
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
        <RentsTable
          selectedRentalLocation={selectedRentalLocation}
          selectedState={selectedState}
          selectedVehicle={selectedVehicle}
          updateRentsCount={updateRentsCount}
          userType="corporate"
        />
      </WhiteBox>
    </CorporatePage>
  );
};

export default CorporateRents;
