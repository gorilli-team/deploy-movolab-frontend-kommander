import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { http } from '../../../utils/Utils';
import { Link } from 'react-router-dom';
import ElementLabel from '../../../components/UI/ElementLabel';
import DisplayDateTime from '../../../components/UI/dates/DisplayDateTime';
import { MdGarage } from 'react-icons/md';

const InvoiceMovoRecap = ({ rentId, className = '' }) => {
  const [rent, setRent] = useState(null);

  useEffect(() => {
    fetchRent(rentId);
  }, [rentId]);

  const fetchRent = async (id) => {
    try {
      const response = await http({ url: `/rents/${id}` });
      setRent(response);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  if (!rent) return '';

  return (
    <div className="bg-white border border-gray-300 rounded-2xl mt-3 flex flex-wrap gap-x-5 gap-y-2 px-4 py-4">
      <div>
        <span className="border-2 rounded-full py-1 px-6 whitespace-nowrap">
          <strong className="font-bold">{rent?.group?.mnemonic}</strong> ({rent?.group?.description}
          )
        </span>

        <div className="mt-4 text-sm font-semibold">
          {rent?.vehicle?.brand?.brandName} {rent?.vehicle?.model?.modelName}
        </div>

        <div className="text-xs font-semibold text-gray-600">
          {rent?.vehicle?.version?.versionName}
        </div>

        <div className="mt-1 text-sm">
          Targa:{' '}
          <Link to={`/dashboard/veicoli/flotta/${rent?.vehicle?._id}`}>
            <span className="font-semibold">
              {rent?.vehicle?.plate ? rent?.vehicle?.plate.toUpperCase() : ''}
            </span>
          </Link>
        </div>
      </div>

      <div className="flex-1 min-w-20 flex items-center justify-center">
        {rent?.vehicle?.version?.imageUrl ? (
          <img
            src={rent?.vehicle?.version?.imageUrl}
            className="max-h-32 align-right"
            alt={`Immagine veicolo noleggio`}
          />
        ) : (
          <></>
        )}
      </div>

      <div>
        {rent?.movementType === 'NOL' ? (
          <ElementLabel bgColor="bg-blue-500">NOLEGGIO</ElementLabel>
        ) : rent?.movementType === 'COM' ? (
          <ElementLabel bgColor="bg-orange-600">COMODATO</ElementLabel>
        ) : rent?.movementType === 'MNP' ? (
          <ElementLabel bgColor="bg-gray-600">MOV NON PRODUTTIVO</ElementLabel>
        ) : (
          <ElementLabel>{rent?.movementType}</ElementLabel>
        )}
        <br />

        {/* Listino */}
        <div className="font-semibold text-sm mt-3">
          <div className="text-sm">{rent?.code}</div>
          <Link className="block text-gray-600" to={`/settings/listini/${rent?.priceList?._id}`}>
            {rent?.priceList?.name}
          </Link>
        </div>
      </div>

      <div className="basis-full lg:basis-auto"></div>

      {/* Inizio */}
      <div className="font-semibold text-sm">
        <div className="text-sm">Inizio</div>
        <DisplayDateTime date={rent.pickUpDate} displayType={'flat'} />
        <div className="text-xs">
          <Link
            className="font-semibold text-xs mt-2"
            to={`/settings/puntinolo/${rent?.pickUpLocation?._id}`}
          >
            {rent?.pickUpLocation?.name} <MdGarage className="inline mb-1 text-blue-600" />
          </Link>
        </div>
        <div className="text-xs text-gray-600">
          {rent?.pickUpLocation?.email}
          <br />
          {rent?.pickUpLocation?.address}
        </div>
      </div>

      <div className="font-semibold text-sm">
        <div className="text-sm">KM iniziali</div>
        <div className="font-semibold text-sm text-gray-600">{rent?.km?.pickUp}</div>
      </div>

      <div className="font-semibold text-sm">
        <div className="text-sm">Fine effettiva</div>
        <DisplayDateTime date={rent.dropOffDate} displayType={'flat'} />
        <div className="text-xs">
          <Link
            className="font-semibold text-xs mt-2"
            to={`/settings/puntinolo/${rent?.dropOffLocation?._id}`}
          >
            {rent?.dropOffLocation?.name} <MdGarage className="inline mb-1 text-blue-600" />
          </Link>
        </div>
        <div className="text-xs text-gray-600">
          {rent?.dropOffLocation?.email}
          <br />
          {rent?.dropOffLocation?.address}
        </div>
      </div>

      <div className="font-semibold text-sm">
        <div className="text-sm">KM finali</div>
        <div className="font-semibold text-sm text-gray-600">{rent?.km?.dropOff}</div>
      </div>

      {/* Giorni */}
      {rent.totalDays !== undefined && (
        <div className="font-semibold text-sm">
          <div className="text-sm">Giorni</div>
          <div className="font-semibold text-sm text-gray-600">
            {rent.totalDays !== undefined && rent.totalDays}
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceMovoRecap;
