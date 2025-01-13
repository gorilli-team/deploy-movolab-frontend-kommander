import React, { useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Page from '../../../../components/Dashboard/Page';
import VehiclesTable from '../../../../components/Vehicles/Vehicles/VehiclesTable';
import { http } from '../../../../utils/Utils';
import { CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR } from '../../../../utils/Utils';
import { useHistory, useLocation } from 'react-router-dom';
import TableHeader from '../../../../components/UI/TableHeader';
import WhiteBox from '../../../../components/UI/WhiteBox';
import PlusOutlineCircle from '../../../../assets/icons/PlusOutlineCircle';
import FilterSelectField from '../../../../components/Form/FilterSelectField';
import VehiclesFilterContainer from '../../../../components/Vehicles/Vehicles/VehiclesFilterContainer';
import { FaCarOn } from 'react-icons/fa6';
import { getCurrentPartnerCode, UserContext } from '../../../../store/UserContext';

const Fleet = () => {
  const history = useHistory();
  const search = useLocation().search;
  const [curPartner, setCurPartner] = useState(null);
  const { data: currentClient } = useContext(UserContext);

  const [vehiclesCount, setVehiclesCount] = useState([]);
  const [from, setFrom] = useState(0);
  const [vehicles, setVehicles] = useState([]);
  const [plateString, setPlateString] = useState('');

  const [rentalLocations, setRentalLocations] = useState([]);
  const [selectedRentalLocation, setSelectedRentalLocation] = useState(
    new URLSearchParams(search).get('puntoNolo'),
  );

  useEffect(async () => {
    setCurPartner(await getCurrentPartnerCode(currentClient?.client));
  }, [currentClient]);

  useEffect(() => {
    fetchVehicles(selectedRentalLocation, 0, 10);
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchVehicles = async (rentalLocation, skip = 0, limit = 10) => {
    try {
      const response = await http({
        url: `/vehicles/vehicle?rentalLocation=${rentalLocation}&skip=${skip}&limit=${limit}`,
      });

      setVehicles(response.vehicles);
      setVehiclesCount(response.count);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const filterVehiclesByPlate = async (plate, skip = 0, limit = 10) => {
    try {
      const response = await http({
        url: `/vehicles/vehicle/filterByPlate?plate=${plate}&skip=${skip}&limit=${limit}`,
      });

      setVehicles(response.vehicles);
      setVehiclesCount(response.count);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const searchSubmit = async (data, e) => {
    e.preventDefault();

    setPlateString(data.query);

    if (data.query) {
      const query = data.query.toLowerCase();
      filterVehiclesByPlate(query);
    } else {
      return fetchVehicles('', 0, 10);
    }
  };

  const precFunction = () => {
    if (from - 10 < 0) return;
    if (plateString) {
      filterVehiclesByPlate(plateString, from - 10, 10);
    } else {
      fetchVehicles(selectedRentalLocation, from - 10, 10);
    }
    setFrom(from - 10);
  };

  const succFunction = () => {
    if (from + 10 > vehiclesCount) return;
    if (plateString) {
      filterVehiclesByPlate(plateString, from + 10, 10);
    } else {
      fetchVehicles(selectedRentalLocation, from + 10, 10);
    }
    setFrom(from + 10);
  };

  const setSelectedRentalLocationAndReload = (value) => {
    setSelectedRentalLocation(value);
    fetchVehicles(value, 0, 10);
    setFrom(0);
    history.push(`/dashboard/veicoli/flotta?puntoNolo=${value}`);
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
    <Page canAccess={[CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR]}>
      <WhiteBox>
        <div className="flex justify-between items-center gap-2 mr-6">
          <TableHeader
            tableName={'Veicoli'}
            buttons={[
              {
                function: () => {
                  history.push('/dashboard/veicoli/crea');
                },
                label: 'Aggiungi veicolo',
                svgIco: <PlusOutlineCircle />,
              },
              {
                function: () => {
                  window.open(curPartner?.partnerUrl, '_blank');
                },
                label: 'Acquista veicoli',
                svgIco: <FaCarOn className="inline mb-1" />,
                hidden: !curPartner?.partnerUrl,
              },
            ]}
            length={vehiclesCount}
          />

          <div className="flex gap-2">
            <FilterSelectField
              onChange={(e) => setSelectedRentalLocationAndReload(e.target.value)}
              emptyOption={{ label: 'Tutti i Punti Nolo' }}
              defaultValue={rentalLocations.find(
                (rental) => rental.value === selectedRentalLocation,
              )}
              options={rentalLocations}
            />
            <div className="flex flex-1 justify-end">
              <VehiclesFilterContainer onSubmit={searchSubmit} />
            </div>
          </div>
        </div>
        {vehicles.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-400 text-2xl">Nessun veicolo trovato</div>
          </div>
        ) : (
          <VehiclesTable
            elements={vehicles}
            from={from}
            count={vehiclesCount}
            precFunction={precFunction}
            succFunction={succFunction}
          />
        )}
      </WhiteBox>
    </Page>
  );
};

export default Fleet;
