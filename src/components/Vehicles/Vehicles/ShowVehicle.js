import React from 'react';
import { capitalizeString } from '../../../utils/Strings';
import useFetchFranchise from '../../../hooks/useFetchFranchise';
import { convertPrice } from '../../../utils/Prices';
import ElementLabel from '../../UI/ElementLabel';
import WhiteBox from '../../UI/WhiteBox';
import ReadMore from '../../UI/ReadMore';
import { mapDamageVehiclePart, mapDamageLevel } from '../../Damages/Damage';
import DamagesImage from '../../Damages/DamagesImage';
import VehicleBoxesHeader from './VehicleBoxesHeader';
import { transmissionNames } from '../../../utils/Vehicles';

const ShowVehicle = ({ ...props }) => {
  const vehicle = props.vehicle;

  const maintenanceFranchise = useFetchFranchise(vehicle?.franchises?.maintenanceFranchise);
  const ifFranchise = useFetchFranchise(vehicle?.franchises?.ifFranchise);
  const rcaFranchise = useFetchFranchise(vehicle?.franchises?.rcaFranchise);
  const kaskoFranchise = useFetchFranchise(vehicle?.franchises?.kaskoFranchise);

  const mapPurchaseType = (label) => {
    if (label === 'leasing') return 'Leasing';
    if (label === 'nlt') return 'Noleggio Lungo Termine';
    if (label === 'buy') return 'Acquisto';
    return '';
  };

  const mapVehicleType = (label) => {
    if (label === 'citycar') return 'Citycar';
    if (label === 'berlina') return 'Berlina';
    if (label === 'station_wagon') return 'Station wagon';
    if (label === 'coupe') return 'Coupè';
    if (label === 'monovolume') return 'Monovolume';
    if (label === 'suv_crossover') return 'SUV / Crossover';
    if (label === 'veicoli_commerciali') return 'Veicoli commerciali';
    if (label === '2ruote') return '2 ruote';
    if (label === 'microcar') return 'Microcar';
    if (label === 'auto_depoca') return "Auto d'epoca";
    if (label === 'supercar') return 'Supercar';
    if (label === 'altro') return 'Altro';
    return '';
  };

  const mapTiresType = (label) => {
    if (label === 'summer') return 'ESTIVI';
    if (label === 'winter') return 'INVERNALI';
    if (label === 'allseason') return 'ALL SEASON';
    if (label === 'ondemand') return 'SU RICHIESTA';
    if (label === 'none') return 'NON PREVISTI';
    return '';
  };

  const transmissionName = transmissionNames.find(t => t.value === vehicle.version?.transmission);

  return (
    <WhiteBox className="mx-6 mt-0 p-4">
      <VehicleBoxesHeader viewMode={true} {...props} />

      <div className="flex flex-wrap md:flex-nowrap mt-4 gap-4">
        {/* Box dati veicolo */}
        <div className="flex-initial w-full md:w-1/3 p-4 px-5 text-sm bg-slate-200 rounded-lg">
          <h4 className="text-xl font-bold mb-2">Dati veicolo</h4>
          <p>
            <strong>Tipo veicolo </strong> {mapVehicleType(vehicle.version?.vehicleType)}<br />
            <strong>Cilindrata </strong> {vehicle.version?.engineDisplacement}<br />
            <strong>Potenza </strong> {vehicle.version?.enginePower}<br />
            <strong>Co2 WLTP </strong> {vehicle.version?.co2}<br />
            <strong>Alimentazione </strong> {capitalizeString(vehicle?.version?.powerSupply)}<br />
            <strong>Trasmissione </strong> {transmissionName?.label || ''}<br />
            <strong>Capacità (lt/kw) </strong> {vehicle.version?.fuelCapacity}<br />
            <strong>Autonomia (km) </strong> {vehicle.version?.kmAutonomy}<br />
            <strong>Colore </strong> {vehicle.color}<br />
            <strong>Interni </strong> {vehicle.internalFeatures}<br />
            <strong>Numero posti </strong> {vehicle?.version?.numberOfSeats || '-'} / <strong>Numero porte</strong> {vehicle?.version?.numberOfDoors || '-'}<br />
            <strong>Optional </strong> <ReadMore>{vehicle.optionals}</ReadMore>
          </p>
        </div>

        {/* Box dettagli acquisto */}
        <div className="flex-initial w-full md:w-1/3 p-4 px-5 text-sm bg-slate-200 rounded-lg">
          <h4 className="text-xl font-bold mb-2">Dettagli acquisto</h4>
          <p>
            <strong>Tipo acquisto </strong> {mapPurchaseType(vehicle.purchaseDetails?.purchaseType)}<br />
            <strong>Proprietà </strong><br />
            <strong>Data Immatricolazione </strong> {vehicle.registrationDate !== undefined && new Date(vehicle.registrationDate).toLocaleDateString()}<br />
            <strong>Data Inizio </strong> {vehicle.contract?.startDate !== undefined && new Date(vehicle.contract?.startDate).toLocaleDateString()}<br />
            <strong>Data Fine </strong> {vehicle.contract?.endDate !== undefined && new Date(vehicle.contract?.endDate).toLocaleDateString()}<br />
            <strong>Durata </strong> {vehicle.contract?.durationMonths} mesi<br />
            <strong>KM </strong> {vehicle.contract?.contractKm}
            {/*<strong>Franchigia nessuna </strong><br />
            <strong>Franchigia massimale </strong><br />
            <strong>Franchigia minimale </strong><br />*/}
          </p>
        </div>

        {/* Box servizi */}
        <div className="flex-initial w-full md:w-1/3 p-4 px-5 text-sm bg-slate-200 rounded-lg">
          <h4 className="text-xl font-bold mb-2">Servizi</h4>
          <p>
            <strong>Manutenzione </strong>{' '}
            {maintenanceFranchise?.value !== undefined && convertPrice(maintenanceFranchise?.value)}{' '}
            - {maintenanceFranchise?.percent !== undefined && `${maintenanceFranchise?.percent} %`}<br />
            <strong>RCA </strong>
            {rcaFranchise?.value !== undefined && convertPrice(rcaFranchise?.value)} -{' '}
            {rcaFranchise?.percent !== undefined && `${rcaFranchise?.percent} %`}<br />
            <strong>I/F </strong>
            {ifFranchise?.value !== undefined && convertPrice(ifFranchise?.value)} -{' '}
            {ifFranchise?.percent !== undefined && `${ifFranchise?.percent} %`}<br />
            <strong>KASKO </strong>
            {kaskoFranchise?.value !== undefined && convertPrice(kaskoFranchise?.value)} -{' '}
            {kaskoFranchise?.percent !== undefined && `${kaskoFranchise?.percent} %`}<br />
            <strong>Pneumatici </strong> {vehicle.contract?.tiresNumber}{' '}
            {vehicle.contract?.tiresType !== undefined &&
              `(${mapTiresType(vehicle.contract?.tiresType)})`}<br />
            <strong>Soccorso Stradale </strong>
          </p>
        </div>
      </div>
      <div className="flex flex-wrap md:flex-nowrap mt-4 gap-4">
        <div className="flex-initial w-full md:w-[calc(66.6666666%+1rem)] p-4 px-5 text-sm bg-slate-200 rounded-lg">
          <h4 className="text-xl font-bold mb-2">Stato d'uso</h4>

          <div className="flex flex-wrap">
            <div className="flex flex-1 flex-wrap">
              {vehicle.damages?.map((damage) => (
                <div className="w-full xl:w-1/2">
                  <div className="text-md font-semibold py-1">Danno su {mapDamageVehiclePart(damage.vehiclePart ?? 'other')} 
                    {damage.damageLevel !== undefined && (
                      <span className="ml-2">
                        <ElementLabel className="ml-3" bgColor={ damage.damageLevel === 'low' ? 'bg-green-700' : (damage.damageLevel === 'medium' ? 'bg-yellow-700' : 'bg-red-700') }>
                          {mapDamageLevel(damage.damageLevel)}
                        </ElementLabel>
                      </span>
                    )}
                  </div>
                  <h6 className="text-xs text-gray-600">
                    Inserito il: {new Date(damage.date).toLocaleDateString()}
                  </h6>
                </div>
              ))}
              {vehicle.damages.length === 0 && (<strong>Il veicolo non presenta alcun danno</strong>)}
            </div>
            <div className="mt-2 w-full md:w-auto overflow-x-auto">
              <DamagesImage
                vehicleId={vehicle._id}
                className="!p-0 !my-0 !mx-auto"
                imgClassName="!w-[300px]"
              />
            </div>
          </div>
        </div>
        <div className="flex-initial w-full md:w-1/3 p-4 px-5 text-sm bg-slate-200 rounded-lg">
          <h4 className="text-xl font-bold mb-2">Note</h4>
          <p>
            <strong>Data immissione flotta </strong> {new Date(vehicle.createdAt).toLocaleString()}<br />
            <strong>Destinazione d'uso </strong><br />
            {vehicle?.fuelLevel !== undefined && (<>
              <strong>Livello Carburante </strong> {vehicle.fuelLevel}/8<br />
            </>)}
            <strong>Note </strong> {vehicle.notes?.map((note) => note.name).join(', ')}
          </p>
        </div>
      </div>
    </WhiteBox>
  );
};

export default ShowVehicle;
