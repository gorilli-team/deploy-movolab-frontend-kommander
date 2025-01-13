import React from 'react';

import VehiclesTableItem from './VehiclesTableItem';
import Navigation from '../../UI/Navigation';

const VehiclesTable = ({ elements = [], from, count, precFunction, succFunction }) => {
  return (
    <div className="bg-white border-gray-200 relative">
      <div className="h-full border-b">
        {/* Table */}
        <div className="overflow-auto">
          <table className="table-auto w-full">
            {/* Table header */}
            <thead className="text-xs font-semibold uppercase text-white bg-gray-400 border-t border-b border-gray-200">
              <tr>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap"></th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Targa</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Versione</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Gruppo</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">KM</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Punto Nolo</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Stato</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Disponibile</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap"></th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-200">
              {elements.map((vehicle, index) => {
                return <VehiclesTableItem key={index} vehicle={vehicle} />;
              })}
            </tbody>
          </table>
        </div>
      </div>
      <Navigation
        from={from + 1}
        to={from + 10}
        length={count}
        precFunction={precFunction}
        succFunction={succFunction}
      />
    </div>
  );
};

export default VehiclesTable;
