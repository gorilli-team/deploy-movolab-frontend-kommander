import React, { useState } from 'react';
import { FaAngleDown, FaClock } from 'react-icons/fa';

const RentalLocationCard = ({
  rentalLocation,
  selectedVehicle,
  showVehicles = false,
  onVehicleSelect = () => {},
  onRentalSelect = () => {},
}) => {
  const [infoBoxVisible, setInfoBoxVisible] = useState(false);
  const [showOpeningHours, setShowOpeningHours] = useState(false);

  if (!rentalLocation) return null;

  const mapDay = (day) => {
    switch (day) {
      case 1:
        return 'Lunedì';
      case 2:
        return 'Martedì';
      case 3:
        return 'Mercoledì';
      case 4:
        return 'Giovedì';
      case 5:
        return 'Venerdì';
      case 6:
        return 'Sabato';
      case 7:
        return 'Domenica';
      default:
        return 'Giorno non valido';
    }
  };

  return (
    <div className="relative">
      <div className="absolute right-[2.9rem] top-[1.8rem] cursor-pointer hover:opacity-80 active:opacity-65">
        <FaClock
          className={`text-lg`}
          onClick={() => setShowOpeningHours(!showOpeningHours)}
          title="Orari di apertura"
        />
      </div>
      <div
        className="p-2 px-3 cursor-pointer hover:bg-slate-50 overflow-auto flex items-center"
        onClick={({ ...props }) => {
          setInfoBoxVisible(!infoBoxVisible);
          onRentalSelect(rentalLocation, { ...props });
        }}
      >
        <div className="flex-1">
          <p className="text-md font-bold">
            {rentalLocation.rentalLocation || rentalLocation.name}
          </p>
          <p className="text-xs">
            <span className="font-bold">Di:</span> {rentalLocation.client}
          </p>
          <p className="text-xs">
            <span className="font-bold">Distanza:</span> {rentalLocation.distance} Km, in{' '}
            {rentalLocation.address || rentalLocation?._doc?.address || 'indirizzo non disponibile'}
          </p>
        </div>

        {showVehicles && (
          <div className="pr-2">
            <FaAngleDown className={`text-lg ${infoBoxVisible && 'transform rotate-180'}`} />
          </div>
        )}
      </div>
      {showOpeningHours && rentalLocation?.openingHours && (
        <div className="text-xs px-3 pb-3">
          <span className="font-bold">Orari di apertura</span>
          {rentalLocation?.openingHours?.map((opening) => (
            <p key={opening.day}>
              {mapDay(opening.day)}: {opening.openingHour} - {opening.closingHour}
            </p>
          ))}
        </div>
      )}
      {infoBoxVisible && showVehicles && (
        <div className="bg-slate-50">
          {rentalLocation.vehicles.map((vehicle) => (
            <div
              className={`flex p-2 px-3 w-full cursor-pointer gap-3 ${
                vehicle.plate === selectedVehicle?.plate ? 'bg-slate-200' : 'hover:bg-slate-100'
              }`}
            >
              <div
                className="w-12 bg-center bg-contain bg-no-repeat"
                style={{ backgroundImage: `url(${vehicle.imageUrl})` }}
              ></div>
              <div
                key={vehicle.plate}
                onClick={({ ...props }) => onVehicleSelect(vehicle, { ...props })}
              >
                <div className="text-sm font-bold">
                  {vehicle.plate ? vehicle.plate.toUpperCase() : ''}
                </div>
                <div className="text-sm">
                  {vehicle.name} &bull; {vehicle.group}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RentalLocationCard;
