import React, { useState } from 'react';
import ElementLabel from '../UI/ElementLabel';
import DisplayDateTime from '../UI/dates/DisplayDateTime';
import PriceListDepositsTable from '../Clients/PriceLists/PriceListDepositsTable';
import PriceListExtrasTable from '../Clients/PriceLists/PriceListExtrasTable.js';
import PriceListFaresTable from '../Clients/Prices/PriceListFaresTable';
import PriceListFranchisesTable from '../Clients/PriceLists/PriceListFranchisesTable';
import LoadingSpinner from '../../assets/icons/LoadingSpinner.js';
import ToggleSwitch from '../UI/ToggleSwitch.js';

const PriceListDetails = ({ priceList }) => {
  const [useVat, setUseVat] = useState(false);

  if (!priceList) {
    return <LoadingSpinner addText />
  }

  return (
    <div>
      <div className="flex pt-4 px-4 gap-x-4">
        <div className="flex-1">
          <div className="text-3xl font-semibold">{priceList?.name}</div>
          <div className="flex items-center">
            <div className="text-sm my-2 text-gray-600 flex space-x-1">
              <div>Creato il: </div>
              <DisplayDateTime date={priceList.createdAt} displayType={'flat'} />
            </div>
            <div className="text-sm my-2 text-gray-600 flex space-x-1">
              <div>Ultimo Aggiornamento: </div>
              <DisplayDateTime date={priceList.updatedAt} displayType={'flat'} />
            </div>
          </div>
          <div className="text-md">{priceList?.description}</div>
          <div className="text-sm my-2 text-gray-600">
            <strong className="font-semibold">Data inizio:</strong>{' '}
            {new Date(priceList?.validFrom).toLocaleDateString()},{' '}
            <strong className="font-semibold">Data fine:</strong>{' '}
            {new Date(priceList?.validTo).toLocaleDateString()}
          </div>
          {priceList?.licenseType === 'movolab' && (
            <div className="text-sm my-2 text-gray-600">
              <strong className="font-semibold">Percentuale Corrispettivi:</strong>{' '}
              {priceList?.revenueShare?.percentage}%,{' '}
              <strong className="font-semibold">Priorità Corrispettivi:</strong>{' '}
              {priceList?.revenueShare?.priority === 'priceList'
                ? 'Listino'
                : priceList?.revenueShare?.priority === 'fares'
                ? 'Tariffa'
                : ''}
            </div>
          )}
        </div>
        <div className="flex flex-col justify-between">
          <div>
          <p className="font-semibold text-gray-600 flex">
            <span className="mr-2 text-sm w-16">Licenza</span>
            <span>
              {priceList?.licenseType === 'movolab' ? (
                <ElementLabel bgColor="bg-blue-500">Movolab</ElementLabel>
              ) : (
                <ElementLabel bgColor="bg-gray-500">Personale</ElementLabel>
              )}
            </span>
          </p>
          <p className="font-semibold text-gray-600 flex mt-1">
            <span className="mr-2 text-sm w-16">Stato</span>
            <span>
              {priceList?.status === 'active' ? (
                <ElementLabel bgColor="bg-green-600">Attivo</ElementLabel>
              ) : priceList?.status === 'inactive' ? (
                <ElementLabel bgColor="bg-red-600">Annullato</ElementLabel>
              ) : (
                ''
              )}
            </span>
          </p>
          </div>
          <div>
            <ToggleSwitch 
              switches={[
                {
                  label: 'Senza IVA',
                  selected: !useVat,
                  onClick: () => setUseVat(false),
                },
                {
                  label: 'Con IVA',
                  selected: useVat,
                  onClick: () => setUseVat(true),
                },
              ]}
            />
          </div>
        </div>
      </div>

      <div className="flex">
        <div className="md:flex-initial w-full p-2">
          {priceList?.fares?.length > 0 ? (
            <PriceListFaresTable priceList={priceList} applyVat={useVat} />
          ) : (
            <div className="bg-gray-50 border-gray-200 rounded-lg border p-4 px-5 font-semibold">
              <>Nessuna Tariffa</>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap">
        <div className="md:flex-1 w-full p-2">
          {priceList?.franchises?.length > 0 ? (
            <PriceListFranchisesTable
              elements={priceList?.franchises}
              priority={priceList?.franchisePriority}
            />
          ) : (
            <div className="bg-gray-50 border-gray-200 rounded-lg border p-4 px-5 font-semibold">
              <>Nessuna Franchigia</>
            </div>
          )}
        </div>
        <div className="md:w-auto w-full p-2">
          {priceList?.deposits?.length > 0 ? (
            <PriceListDepositsTable elements={priceList?.deposits} />
          ) : (
            <div className="bg-gray-50 border-gray-200 rounded-lg border p-4 px-5 font-semibold">
              <>Nessun Deposito</>
            </div>
          )}
        </div>
      </div>

      <div className="flex">
        <div className="md:flex-initial w-full p-2">
          {priceList?.extras?.length > 0 ? (
            <PriceListExtrasTable elements={priceList?.extras} applyVat={useVat} />
          ) : (
            <div className="bg-gray-50 border-gray-200 rounded-lg border p-4 px-5 font-semibold">
              <>Nessun Extra</>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PriceListDetails;
