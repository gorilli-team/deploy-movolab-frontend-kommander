import React from 'react';
import RentalLocationCard from './RentalLocationCard';

const RentalLocations = ({
  showVehicles = true,
  rentalLocations,
  setSelectedVehicle,
  selectedVehicle,
  onRentalSelect,
  ...props
}) => {
  return (
    <div {...props}>
      {rentalLocations.length === 0 && (
        <div className="p-2 px-3">
          <div className="text-lg font-bold">Nessun punto nolo disponibile</div>
          <div className="text-sm text-gray-500">Cambia i parametri di ricerca</div>
        </div>
      )}
      {rentalLocations.map((rentalLocation, index) => (
        <RentalLocationCard
          key={index}
          onVehicleSelect={setSelectedVehicle}
          {...{ rentalLocation, showVehicles, onRentalSelect, selectedVehicle }}
        />
      ))}
    </div>
  );
};

export default RentalLocations;
