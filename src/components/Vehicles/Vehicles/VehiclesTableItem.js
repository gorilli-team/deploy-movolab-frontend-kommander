import React, { useEffect, useState } from 'react';
import { http } from '../../../utils/Utils';
import moment from 'moment';
import { getVehicleGroup, getVehicleImageUrl } from '../../../utils/Vehicles';
import ElementLabel from '../../UI/ElementLabel';
import Button from '../../UI/buttons/Button';

const VehiclesTableItem = (item) => {
  const groupData = getVehicleGroup(item.vehicle);
  const imageUrl = getVehicleImageUrl(item.vehicle).imageUrl;
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    getVehicleAvailability(item.vehicle._id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.vehicle._id]);

  const getVehicleAvailability = async (vehicleId) => {
    try {
      if (vehicleId === undefined) return;
      const response = await http({
        url: `/rents/availability/byVehicle/${vehicleId}`,
        method: 'POST',
        form: {
          pickUpDate: moment(),
          dropOffDate: moment(),
        },
      });

      setAvailable(response?.available);
    } catch (error) {
      console.error(error);
    }
  };

  const vehicle = item.vehicle;
  return (
    <tr>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        {imageUrl ? (
          <img
            className="display-block"
            src={imageUrl}
            height={70}
            width={70}
            alt="immagine veicolo"
          />
        ) : (
          <img
            className="display-block"
            src="/default_vehicle.png"
            height={80}
            width={80}
            alt="immagine veicolo"
          />
        )}
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">
          {vehicle.plate ? vehicle.plate.toUpperCase() : ''}
        </p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">
          {vehicle?.brand?.brandName} {vehicle?.model?.modelName}
        </p>
        <p className="text-left text-xs font-semibold text-gray-600">
          {vehicle?.version?.versionName.substring(0, 35) +
            (vehicle?.version?.versionName.length > 30 ? '...' : '')}
        </p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">{groupData?.group?.mnemonic}</p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">{vehicle?.km} KM</p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">{vehicle?.rentalLocation?.name}</p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600 uppercase">
          {vehicle?.enabled ? (
            <ElementLabel bgColor="bg-green-600">Abilitato</ElementLabel>
          ) : (
            <ElementLabel bgColor="bg-red-600">Disabilitato</ElementLabel>
          )}
        </p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600 uppercase">
          {available ? (
            <ElementLabel bgColor="bg-green-600">Disponibile</ElementLabel>
          ) : (
            <ElementLabel bgColor="bg-red-600">Non Disponibile</ElementLabel>
          )}
        </p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <Button to={`/dashboard/veicoli/flotta/${vehicle._id}`} btnStyle="tableItemAction">
          Dettagli &raquo;
        </Button>
      </td>
    </tr>
  );
};

export default VehiclesTableItem;
