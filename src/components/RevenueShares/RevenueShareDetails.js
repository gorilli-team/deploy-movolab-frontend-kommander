import React from 'react';
import { Link } from 'react-router-dom';

import DisplayDateTime from '../UI/dates/DisplayDateTime';
import { convertPrice } from '../../utils/Prices';

const RevenueShareDetails = (item) => {
  const revenueShare = item.revenueShare;

  return (
    <div>
      {/* add header with written ripartizione incassi */}
      <h2 className="font-semibold text-gray-800 text-2xl p-2">
        <span>Dettagli Ripartizione Incassi</span>
      </h2>
      <div className="flex">
        <div className="bg-white rounded-2xl overflow-auto mx-0 border border-gray-300 font-medium text-gray-900 mt-5 w-full divide-y">
          <div className="flex justify-between px-4 py-2">
            <span>Cliente</span>
            <Link
              to={`/admin/clienti/anagrafica/${revenueShare?.client?._id}`}
              className="text-blue-500 hover:underline"
            >
              {revenueShare.client?.ragioneSociale}
            </Link>
          </div>
          <div className="flex justify-between px-4 py-2">
            <span>Movo</span>
            <Link
              to={`/admin/clienti/movimenti/${revenueShare?.rent?._id}`}
              className="text-blue-500 hover:underline"
            >
              {revenueShare.rent?.code}
            </Link>
          </div>
          <div className="flex justify-between px-4 py-2">
            <span>Listino</span>
            <Link
              to={`/admin/listini/${revenueShare?.priceList?._id}`}
              className="text-blue-500 hover:underline"
            >
              {revenueShare.priceList}
            </Link>
          </div>
          <div className="flex justify-between px-4 py-2">
            <span>Importo totale</span>
            <span> {convertPrice(revenueShare.totalAmount)}</span>
          </div>
          <div className="flex justify-between px-4 py-2">
            <span>Data Creazione</span>
            <span>
              <DisplayDateTime date={revenueShare.createdAt} displayType={'flat'} />
            </span>
          </div>
          <div className="flex justify-between px-4 py-2">
            <span>Ultimo Aggiornamento</span>
            <span>
              <DisplayDateTime date={revenueShare.updatedAt} displayType={'flat'} />
            </span>
          </div>
          <div className="flex justify-between px-4 py-2 bg-slate-100 font-semibold">
            <span>Totale Movolab</span>
            <span>
              {convertPrice(revenueShare.amountMovolab)} ({revenueShare.percentageMovolab}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueShareDetails;
