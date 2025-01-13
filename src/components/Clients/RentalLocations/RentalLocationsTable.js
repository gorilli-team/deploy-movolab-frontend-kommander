import React, { useState } from 'react';
import RentalLocationsTableItem from './RentalLocationsTableItem';
import Navigation from '../../UI/Navigation';

const RentalLocationsTable = ({ rentalLocations, fetchRentalLocations, count }) => {
  const [from, setFrom] = useState(0);

  const precFunction = () => {
    if (from - 10 < 0) return;
    fetchRentalLocations(undefined, from - 10, 10);
    setFrom(from - 10);
  };

  const succFunction = () => {
    if (from + 10 > count) return;
    fetchRentalLocations(undefined, from + 10, 10);
    setFrom(from + 10);
  };

  return (
    <div className="bg-white border-t border-gray-200 overflow-hidden relative">
      <div className="overflow-x-auto h-full">
        {/* Table */}
        <div>
          <table className="table-auto w-full">
            {/* Table header */}
            <thead className="text-xs font-semibold uppercase text-gray-500 bg-gray-50">
              <tr>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Punto Nolo</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Cliente</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Indirizzo</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Città</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Abilitato</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Creato</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap"></th>
              </tr>
            </thead>
            {/* Table body */}
            <tbody className="text-sm divide-y divide-gray-200 border-t border-b border-gray-200">
              {rentalLocations?.map((rentalLocation, index) => {
                return <RentalLocationsTableItem key={index} rentalLocation={rentalLocation} />;
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

export default RentalLocationsTable;
