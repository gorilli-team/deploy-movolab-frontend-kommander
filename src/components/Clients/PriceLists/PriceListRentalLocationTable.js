import React from 'react';
import PriceListRentalLocationTableItem from './PriceListRentalLocationTableItem';

const PriceListRentalLocationTable = ({ elements = [] }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 relative">
      <div className="overflow-x-auto h-full">
        {/* Table */}
        <div className="">
          <table className="table-auto w-full">
            {/* Table header */}
            <thead className="text-xs font-semibold uppercase text-gray-500 bg-gray-50">
              <tr>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Punto Nolo</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Indirizzo</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Città</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap"></th>
              </tr>
            </thead>
            {/* Table body */}
            <tbody className="text-sm divide-y divide-gray-200 border-t border-b border-gray-200">
              {elements.reverse().map((rentalLocation, index) => {
                return (
                  <PriceListRentalLocationTableItem key={index} rentalLocation={rentalLocation} />
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PriceListRentalLocationTable;
