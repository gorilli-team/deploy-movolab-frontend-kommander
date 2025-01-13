import React from 'react';

import { Link } from 'react-router-dom';

import DisplayDateTime from '../UI/dates/DisplayDateTime';
import RevenueSharesTableItem from '../RevenueShares/RevenueSharesTableItem';
import { convertPrice } from '../../utils/Prices';
import { getMonthName } from '../../utils/Dates';
import ElementLabel from '../UI/ElementLabel';

const RevenueShareMonthlyRecapDetails = ({ monthlyRecap, showDetails }) => {
  return (
    <div>
      {/* add header with written ripartizione incassi */}
      <div className="flex justify-between">
        <h2 className="font-semibold text-gray-800 text-2xl p-2 mt-5">
          <span>Recap Mensile</span>
        </h2>
      </div>
      <div className="flex">
        <div className="bg-white rounded-2xl overflow-auto mx-0 border border-gray-300 font-medium text-gray-900 w-full divide-y">
          <div className="flex justify-between px-4 py-2">
            <span>Cliente</span>
            {showDetails ? (
              <Link
                to={`/admin/clienti/anagrafica/${monthlyRecap?.client?._id}`}
                className="text-blue-500 hover:underline"
              >
                {monthlyRecap?.client?.ragioneSociale}
              </Link>
            ) : (
              <span>{monthlyRecap?.client?.ragioneSociale}</span>
            )}
          </div>
          <div className="flex justify-between px-4 py-2">
            <span>Periodo</span>
            <span>
              {getMonthName(monthlyRecap?.month)} {monthlyRecap.year}
            </span>
          </div>

          <div className="flex justify-between px-4 py-2">
            <span>Pagato</span>
            <div>
              {monthlyRecap?.paid ? (
                <ElementLabel bgColor="bg-green-500">Pagato</ElementLabel>
              ) : (
                <ElementLabel bgColor="bg-red-500">Non Pagato</ElementLabel>
              )}
            </div>
          </div>
          <div className="flex justify-between px-4 py-2">
            <span>Stato</span>
            <div>
              {monthlyRecap?.status === 'open' ? (
                <ElementLabel bgColor="bg-yellow-600">In Elaborazione...</ElementLabel>
              ) : monthlyRecap?.status === 'invoiced' ? (
                <ElementLabel bgColor="bg-green-500">Fatturato</ElementLabel>
              ) : monthlyRecap?.status === 'closed' ? (
                <ElementLabel bgColor="bg-blue-500">Chiuso</ElementLabel>
              ) : (
                <ElementLabel bgColor="bg-gray-500">{monthlyRecap?.status}</ElementLabel>
              )}
            </div>{' '}
          </div>

          <div className="flex justify-between px-4 py-2">
            <span>Numero Movo</span>
            <span>{monthlyRecap?.revenueShares?.length}</span>
          </div>
          <div className="flex justify-between px-4 py-2">
            <span>Ultimo Aggiornamento</span>
            <span>
              <DisplayDateTime date={monthlyRecap.createdAt} displayType={'flat'} />
            </span>
          </div>
          <div className="flex justify-between px-4 py-2">
            <span>Data Creazione</span>
            <span>
              <DisplayDateTime date={monthlyRecap.createdAt} displayType={'flat'} />
            </span>
          </div>
          <div className="flex justify-between px-4 py-2 font-semibold">
            <span>Corrispettivo Movolab</span>
            <span>{convertPrice(monthlyRecap.totalMovolab)}</span>
          </div>
          <div className="flex justify-between px-4 py-2 font-semibold">
            <span>Corrispettivo Cliente</span>
            <span>{convertPrice(monthlyRecap.totalAmount - monthlyRecap.totalMovolab)}</span>
          </div>
          <div className="flex justify-between px-4 py-2 bg-slate-100 font-semibold">
            <span>Corrispettivo Totale</span>
            <span>{convertPrice(monthlyRecap.totalAmount)}</span>
          </div>
        </div>
      </div>

      <div className="py-2 mt-5">
        <h3 className="font-semibold text-gray-800 text-lg p-2">
          <span>Dettagli Ripartizione ({monthlyRecap.revenueShares?.length})</span>
        </h3>
        <div className="bg-white rounded-2xl overflow-auto mx-0 border border-gray-300 font-medium text-gray-900 w-full divide-y">
          <div className="bg-white border-t border-gray-200 overflow-hidden relative">
            <div className="overflow-x-auto h-full">
              {/* Table */}
              <div>
                <table className="w-full table-fixed">
                  {/* Table header */}
                  <thead className="text-xs font-semibold uppercase text-gray-500 bg-gray-50">
                    <tr>
                      <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                        <div className="font-semibold text-left">Cliente</div>
                      </th>
                      <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                        <div className="font-semibold text-left">Movo</div>
                      </th>
                      <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                        <div className="font-semibold text-left">Ricavi Totali</div>
                      </th>
                      <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                        <div className="font-semibold text-left">Ricavi Cliente</div>
                      </th>
                      <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                        <div className="font-semibold text-left">Quota Movolab</div>
                      </th>
                      <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                        <div className="font-semibold text-left">Data</div>
                      </th>
                      {showDetails && (
                        <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap"></th>
                      )}
                    </tr>
                  </thead>
                  {/* Table body */}
                  <tbody className="text-sm divide-y divide-gray-200 border-t border-b border-gray-200">
                    {monthlyRecap?.revenueShares?.map((revenueShare, index) => {
                      return (
                        <RevenueSharesTableItem
                          key={index}
                          revenueShare={revenueShare}
                          showDetails={showDetails}
                        />
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueShareMonthlyRecapDetails;
