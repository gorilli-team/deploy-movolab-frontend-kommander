import React from 'react';
import ElementLabel from '../UI/ElementLabel';
import DisplayDateTime from '../UI/dates/DisplayDateTime';
import { convertPrice } from '../../utils/Prices';

const PackDetails = ({ pack }) => {
  const mapPeriod = (period) => {
    switch (period) {
      case 'monthly':
        return 'Mensile';
      case 'quarterly':
        return 'Trimestrale';
      case 'biannual':
        return 'Semestrale';
      case 'yearly':
        return 'Annuale';
      default:
        return '';
    }
  };

  return (
    <div className="p-4">
      <div className="flex p-4  gap-x-4 bg-slate-100 rounded-lg">
        <div className="flex-1">
          <div className="text-3xl font-semibold">{pack?.name}</div>
          <div className="text-sm flex text-slate-600">
            <div className="pr-2">Creato il:</div>
            <DisplayDateTime displayType="flat" date={pack?.createdAt} />
          </div>
          <div className="text-sm flex text-slate-600">
            <div className="pr-2">Ultimo aggiornamento:</div>
            <DisplayDateTime displayType="flat" date={pack?.updatedAt} />
          </div>
        </div>
        <div>
          <p className="font-semibold text-slate-600 flex">
            <span className="mr-2 text-sm w-16 mt-1">Licenza</span>
            <span>
              {pack?.licenseType === 'movolab' ? (
                <ElementLabel bgColor="bg-blue-500">Movolab</ElementLabel>
              ) : (
                <ElementLabel bgColor="bg-slate-500">Personale</ElementLabel>
              )}
            </span>
          </p>
          <p className="font-semibold text-slate-600 flex mt-1">
            <span className="mr-2 text-sm w-16 mt-1">Stato</span>
            <span>
              {pack?.status === 'active' ? (
                <ElementLabel bgColor="bg-green-600">Attivo</ElementLabel>
              ) : pack?.status === 'inactive' ? (
                <ElementLabel bgColor="bg-red-600">Annullato</ElementLabel>
              ) : (
                ''
              )}
            </span>
          </p>
          <p className="font-semibold text-slate-600 flex mt-1">
            <span className="mr-2 text-sm w-16 mt-1">Visibile</span>
            <span>
              {pack?.visible === true ? (
                <ElementLabel bgColor="bg-green-600">SI</ElementLabel>
              ) : pack?.visible === false ? (
                <ElementLabel bgColor="bg-red-600">NO</ElementLabel>
              ) : (
                ''
              )}
            </span>
          </p>
        </div>
      </div>
      <div className="mt-4 p-4 gap-x-4 bg-slate-100 rounded-lg">
        <div>
          <p className="font-semibold text-slate-600 flex mt-1">
            <span className="mr-2 w-60">Periodo di pagamento:</span>
            <span>{mapPeriod(pack?.paymentPeriod)}</span>
          </p>
        </div>
        <div>
          <p className="font-semibold text-slate-600 flex mt-1">
            <span className="mr-2 w-60">Tariffa Base:</span>
            <span>{convertPrice(pack?.fee)}</span>
          </p>
        </div>
      </div>
      <div className="mt-4 p-4 gap-x-4 bg-slate-100 rounded-lg">
        <div>
          <p className="font-semibold text-slate-600 flex mt-1">
            <span className="mr-2 w-60 text-xl">Extra</span>
          </p>
        </div>
        <div>
          <p className="font-semibold text-slate-600 flex mt-1">
            <span className="mr-2 w-60">Punti Nolo inclusi:</span>
            <span className="mr-2 w-60">{pack?.params?.includedRentalLocations}</span>
            <span className="mr-2 w-60">Punto Nolo extra:</span>
            <span className="mr-2 w-60">
              {convertPrice(pack?.variablePayments?.extraRentalLocationFee)}
            </span>
          </p>
        </div>
        <div>
          <p className="font-semibold text-slate-600 flex mt-1">
            <span className="mr-2 w-60">Veicoli inclusi:</span>
            <span className="mr-2 w-60">{pack?.params?.includedVehicles}</span>
            <span className="mr-2 w-60">Veicolo extra:</span>
            <span className="mr-2 w-60">
              {convertPrice(pack?.variablePayments?.extraVehicleFee)}
            </span>
          </p>
        </div>
        <div>
          <p className="font-semibold text-slate-600 flex mt-1">
            <span className="mr-2 w-60">Noleggi Mensili:</span>
            <span className="mr-2 w-60">{pack?.params?.includedMonthlyRents}</span>
            <span className="mr-2 w-60">Noleggio extra:</span>
            <span className="mr-2 w-60">
              {convertPrice(pack?.variablePayments?.extraMonthlyRentFee)}
            </span>
          </p>
        </div>
        <div>
          <p className="font-semibold text-slate-600 flex mt-1">
            <span className="mr-2 w-60">Comodati Mensili:</span>
            <span className="mr-2 w-60">{pack?.params?.includedComodati}</span>
            <span className="mr-2 w-60">Costo comodato extra:</span>
            <span className="mr-2 w-60">
              {convertPrice(pack?.variablePayments?.extraComodatoFee)}
            </span>
          </p>
        </div>
        <div>
          <p className="font-semibold text-slate-600 flex mt-1">
            <span className="mr-2 w-60">MNP Mensili:</span>
            <span className="mr-2 w-60">{pack?.params?.includedMNP}</span>
            <span className="mr-2 w-60">MNP extra:</span>
            <span className="mr-2 w-60">{convertPrice(pack?.variablePayments?.extraMNPFee)}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PackDetails;
