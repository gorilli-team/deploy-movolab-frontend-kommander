import React from 'react';
import { convertPrice } from '../../../utils/Prices';

const PriceListFaresTableItem = (item) => {
  const fare = item.fare;

  return (
    <tr>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">
          {fare?.group?.mnemonic} - {fare?.group?.description}
        </p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">{fare?.range?.name}</p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">{fare?.range?.from}</p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">{fare?.range?.to}</p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">
          {fare?.fare?.baseFare !== undefined ? `${convertPrice(fare?.fare?.baseFare)}` : '-'}
        </p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">
          {fare?.fare?.extraDayFare !== undefined ? (
            <>{convertPrice(fare?.fare?.extraDayFare)}</>
          ) : (
            '-'
          )}
        </p>
      </td>
      {/* <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600 w-10">
          {fare?.fare?.minDailyFare !== undefined ? (
            <>{convertPrice(fare?.fare?.minDailyFare)}</>
          ) : (
            '-'
          )}
        </p>
      </td> */}
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600 w-10">
          {fare?.fare?.freeDailyKm !== undefined ? `${fare?.fare?.freeDailyKm}` : '-'}
        </p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600 w-10">
          {fare?.fare?.extraKmFare !== undefined ? (
            <>{convertPrice(fare?.fare?.extraKmFare)}</>
          ) : (
            '-'
          )}
        </p>
      </td>
    </tr>
  );
};

export default PriceListFaresTableItem;
