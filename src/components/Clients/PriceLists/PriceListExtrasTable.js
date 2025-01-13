import React from 'react';
import { mapApplicability, mapCostCalculation } from '../../../utils/Extras';
import { convertPrice } from '../../../utils/Prices';

const PriceListExtrasTable = ({ elements = [], applyVat = false }) => {
  const convertPriceVat = (price, vatPerc) => applyVat ? 
    convertPrice(price + (price * vatPerc / 100)) : 
    convertPrice(price);

  return (
    <div className="rounded-xl overflow-auto border border-gray-200">
      <table className="table-auto w-full whitespace-nowrap">
        <thead className="text-xs font-semibold bg-gray-50 border-b border-gray-200">
          <tr className="divide-x divide-gray-200">
            <th className="first:pl-5 py-3 text-left text-lg">Extra</th>
            <th className="pt-1 uppercase text-gray-500">Gruppi</th>
            <th className="pt-1 uppercase text-gray-500">Applicabilità</th>
            <th className="pt-1 uppercase text-gray-500">Costo Unitario</th>
            <th className="pt-1 uppercase text-gray-500">Calcolo Prezzo</th>
            <th className="pt-1 uppercase text-gray-500">Fatturazione</th>
            <th className="pt-1 uppercase text-gray-500">IVA</th>
          </tr>
        </thead>
        <tbody className="text-sm divide-y divide-gray-200 text-gray-600">
          {elements.map((extra, index) => (
            <tr className="text-center divide-x divide-gray-200" key={index}>
              <th className="first:pl-5 py-3 text-left">{extra.name}</th>
              <td className="py-1 px-2">{extra?.groups?.length}</td>
              <td className="py-1 px-2">{mapApplicability(extra?.applicability)}</td>
              <td className="py-1 px-2">
                {extra?.cost?.amount ? convertPriceVat(extra?.cost?.amount, extra.configuration?.vatPercentage) : '-'}
              </td>
              <td className="py-1 px-2">{mapCostCalculation(extra?.cost?.calculation)}</td>
              <td className="py-1 px-2">
                {extra.configuration?.invoicingType === 'movolab' ? (
                  <>Movolab</>
                ) : extra.configuration?.invoicingType === 'customer' ? (
                  <>Cliente</>
                ) : null}
              </td>
              <td className="py-1 px-2">
                {extra.configuration?.vatPercentage ? (
                  <>{extra.configuration?.vatPercentage}%</>
                ) : (
                  <>0%</>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PriceListExtrasTable;
