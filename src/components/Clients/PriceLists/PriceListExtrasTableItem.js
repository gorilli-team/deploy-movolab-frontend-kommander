import React from 'react';
import { mapApplicability, mapCostCalculation } from '../../../utils/Extras';
import { convertPrice } from '../../../utils/Prices';

const PriceListExtrasTableItem = ({ extra, groups }) => {
  return (
    <tr>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">{extra?.name}</p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">{extra?.groups?.length}</p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">
          {mapApplicability(extra?.applicability)}
        </p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">
          {extra?.cost?.amount ? convertPrice(extra?.cost?.amount) : '-'}
        </p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">
          {mapCostCalculation(extra?.cost?.calculation)}
        </p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">
          {extra.configuration?.invoicingType === 'movolab' ? (
            <>Movolab</>
          ) : extra.configuration?.invoicingType === 'customer' ? (
            <>Cliente</>
          ) : null}
        </p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">
          {extra.configuration?.vatPercentage ? (
            <>{extra.configuration?.vatPercentage}%</>
          ) : (
            <>0%</>
          )}
        </p>
      </td>
    </tr>
  );
};

export default PriceListExtrasTableItem;
