import React, { useEffect, useState } from 'react';
import AdminPage from '../../../components/Admin/AdminPage';
import RentsTable from '../../../components/Rents/RentsTable';
import { http } from '../../../utils/Utils';
import { MOVOLAB_ROLE_ADMIN } from '../../../utils/Utils';
import TableHeader from '../../../components/UI/TableHeader';
import { useHistory, useLocation } from 'react-router-dom';
import WhiteBox from '../../../components/UI/WhiteBox';
import FilterSelectField from '../../../components/Form/FilterSelectField';

const AdminRents = () => {
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
  const [vehicles, setVehicles] = useState([]);
  const [selectedRentalLocation, setSelectedRentalLocation] = useState(urlParams.get('puntoNolo'));
  const [selectedVehicle, setSelectedVehicle] = useState(urlParams.get('veicolo'));
  const [selectedState, setSelectedState] = useState(urlParams.get('stato'));

  const setSelectedRentalLocationAndReload = (value) => {
    setSelectedRentalLocation(value);
    history.push(
      `/admin/clienti/movimenti?puntoNolo=${value}&stato=${selectedState}&veicolo=${selectedVehicle}`,
    );
  };

  const setSelectedStateAndReload = (value) => {
    setSelectedState(value);
    history.push(
      `/admin/clienti/movimenti?stato=${value}&puntoNolo=${selectedRentalLocation}&veicolo=${selectedVehicle}`,
    );
  };

  const setSelectedVehicleAndReload = (value) => {
    setSelectedVehicle(value);
    history.push(
      `/admin/clienti/movimenti?veicolo=${value}&puntoNolo=${selectedRentalLocation}&stato=${selectedState}`,
    );
  };

  useEffect(() => {
    getRentalLocations();
    getVehicles();
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
    }
  };

  const getVehicles = async () => {
    try {
      const response = await http({ url: `/vehicles/vehicle` });
      const orderedVehicles = response.vehicles.sort((a, b) => {
        if (a.plate < b.plate) {
          return -1;
        }
        if (a.plate > b.plate) {
          return 1;
        }
        return 0;
      });
      setVehicles(orderedVehicles);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminPage canAccess={[MOVOLAB_ROLE_ADMIN]} hasBox={false}>
      <WhiteBox>
        <div className="flex justify-between items-center">
          <TableHeader tableName="Movo" length={rentsCount}></TableHeader>
          <div className="flex justify-end gap-2 mr-6">
            <FilterSelectField
              onChange={(e) => setSelectedStateAndReload(e.target.value)}
              emptyOption={{ label: 'Tutti gli Stati' }}
              defaultValue={rentStates.find((state) => state.value === selectedState)}
              options={rentStates}
              className="w-full md:w-auto"
            />
            <FilterSelectField
              onChange={(e) => setSelectedRentalLocationAndReload(e.target.value)}
              emptyOption={{ label: 'Tutti i Punti Nolo' }}
              defaultValue={rentalLocations.find(
                (rental) => rental.value === selectedRentalLocation,
              )}
              options={rentalLocations}
              className="w-full md:w-auto"
            />
            <FilterSelectField
              onChange={(e) => setSelectedVehicleAndReload(e.target.value)}
              emptyOption={{ label: 'Tutti i veicoli' }}
              defaultValue={vehicles.find((vehicle) => vehicle.value === selectedVehicle)}
              options={vehicles.map((vehicle) => ({
                value: vehicle._id,
                label: vehicle.plate,
              }))}
              className="w-full md:w-auto"
            />
          </div>
        </div>

        <RentsTable
          selectedRentalLocation={selectedRentalLocation}
          selectedState={selectedState}
          selectedVehicle={selectedVehicle}
          userType="admin"
          updateRentsCount={(count) => {
            setRentsCount(count);
          }}
        />
      </WhiteBox>
    </AdminPage>
  );
};

export default AdminRents;
