import React, { useEffect, useState } from 'react';
import Page from '../../../components/Dashboard/Page';
import RentsTable from '../../../components/Rents/RentsTable';
import { http } from '../../../utils/Utils';
import { CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR } from '../../../utils/Utils';
import TableHeader from '../../../components/UI/TableHeader';
import { useHistory, useLocation } from 'react-router-dom';
import WhiteBox from '../../../components/UI/WhiteBox';
import PlusOutlineCircle from '../../../assets/icons/PlusOutlineCircle';
import FilterSelectField from '../../../components/Form/FilterSelectField';
import Accordion from '../../../components/UI/Accordion';

const Rents = () => {
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
    { value: 'annullato', label: 'Annullato' },
    { value: 'stornato', label: 'Stornato' },
  ];
  const [vehicles, setVehicles] = useState([]);
  const [selectedRentalLocation, setSelectedRentalLocation] = useState(urlParams.get('puntoNolo'));
  const [selectedVehicle, setSelectedVehicle] = useState(urlParams.get('veicolo'));
  const [selectedState, setSelectedState] = useState(urlParams.get('stato'));

  const setSelectedRentalLocationAndReload = (value) => {
    setSelectedRentalLocation(value);
    history.push(
      `/dashboard/movimenti?puntoNolo=${value}&stato=${selectedState}&veicolo=${selectedVehicle}`,
    );
  };

  const setSelectedStateAndReload = (value) => {
    setSelectedState(value);
    history.push(
      `/dashboard/movimenti?stato=${value}&puntoNolo=${selectedRentalLocation}&veicolo=${selectedVehicle}`,
    );
  };

  const setSelectedVehicleAndReload = (value) => {
    setSelectedVehicle(value);
    history.push(
      `/dashboard/movimenti?veicolo=${value}&puntoNolo=${selectedRentalLocation}&stato=${selectedState}`,
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
    <Page canAccess={[CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR]}>
      <WhiteBox>
        <TableHeader
          tableName="Movo"
          buttons={[
            {
              function: () => {
                history.push('/dashboard/movimenti/crea');
              },
              label: 'Nuovo movo',
              svgIco: <PlusOutlineCircle />,
            },
          ]}
          length={rentsCount}
        >
          <Accordion
            className="w-full"
            innerClassName="flex flex-wrap justify-end gap-2 flex-1"
            textOpen="Nascondi filtri"
            textClose="Mostra filtri"
            mobileOnly
          >
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
          </Accordion>
        </TableHeader>
        <RentsTable
          selectedRentalLocation={selectedRentalLocation}
          selectedState={selectedState}
          selectedVehicle={selectedVehicle}
          updateRentsCount={(count) => {
            setRentsCount(count);
          }}
        />
      </WhiteBox>
    </Page>
  );
};

export default Rents;
