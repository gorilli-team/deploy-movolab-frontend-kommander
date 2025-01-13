import React from 'react';
import { convertPrice } from '../../../utils/Prices';
import useFetchRanges from '../../../hooks/useFetchRanges';

const PriceListFaresTable = ({ priceList, applyVat = false }) => {
  const groups = [];
  const ranges = useFetchRanges(priceList?._id);
  const config = priceList?.configuration;

  const convertPriceVat = (price, vatPerc) => applyVat ? 
    convertPrice(price + (price * vatPerc / 100)) : 
    convertPrice(price);

  priceList.fares.forEach((el) => {
    const group = groups.find((g) => g._id === el.group?._id);

    el.range.fare = el.fare;

    if (group) {
      group.range[el.range._id] = el.range;
    } else {
      if (!el || !el.group) return;
      el.group.range = {};
      el.group.range[el.range._id] = el.range;
      groups.push(el.group);
    }
  });

  const compareFn = (a,b) => (a.mnemonic > b.mnemonic) ? 1 : ((b.mnemonic > a.mnemonic) ? -1 : 0);

  const findFirstRangeCalcType = (rangeId) =>
    groups?.find((g) => g?.range?.[rangeId])?.range?.[rangeId]?.fare?.calculation;

  return (
    <div className="rounded-xl overflow-auto border border-gray-200">
      <table className="table-auto w-full whitespace-nowrap">
        <thead className="text-xs font-semibold bg-gray-50 border-b border-gray-200">
          <tr className="divide-x divide-gray-200">
            <th className="first:pl-5 py-3 text-left text-lg">Tariffe</th>
            {ranges.map((range, r_index) => (
              <th className="pt-1 uppercase text-gray-500" key={r_index}>
                <div className="flex flex-wrap text-center">
                  <div className="w-full py-2 px-3 border-b border-gray-100">
                    {range.name} (da {range.from} a {range.to} gg)
                  </div>
                  <div className="w-1/2 py-1 border-r border-gray-100">
                    {findFirstRangeCalcType(range._id) === 'unit' ? 'Giorno' : 'Fissa'}
                  </div>
                  <div className="w-1/2 py-1">KM</div>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-sm divide-y divide-gray-200 text-gray-600">
          {groups.sort(compareFn).map((group, g_index) => (
            <tr className="divide-x divide-gray-200" key={g_index}>
              <th className="first:pl-5 py-1 text-left">
                <div className="flex">
                  <div className="flex-1 border-r border-gray-100 flex items-center">
                    {group?.mnemonic} ({group?.description})
                  </div>
                  <div className="flex flex-col">
                    <div className="px-3 py-3 font-semibold border-b border-gray-100">Base</div>
                    <div className="px-3 pt-1 pb-0.5 italic text-xs font-semibold">Extra</div>
                  </div>
                </div>
              </th>
              {ranges.map((range, r_index) => (
                <td className="py-1" key={r_index}>
                  {group?.range?.[range._id]?.fare ? (
                    <div className="flex flex-wrap text-center">
                      <div className="w-1/2 text-base border-b border-r border-gray-100">
                        <div className="font-medium">
                          {convertPriceVat(group?.range?.[range._id]?.fare.baseFare, config?.fares?.vatPercentage)}
                        </div>
                        {/* <div className="text-xs">
                          min {convertPriceVat(group?.range?.[range._id]?.fare.minDailyFare)}
                        </div> */}
                      </div>
                      <div className="w-1/2 border-b border-gray-100">
                        <div>{group?.range?.[range._id]?.fare.freeDailyKm}</div>
                        <div className="text-xs">inclusi</div>
                      </div>
                      <div className="w-1/2 text-xs italic pt-1 border-r border-gray-100">
                        {convertPriceVat(group?.range?.[range._id]?.fare.extraDayFare, config?.fares?.vatPercentage)}
                      </div>
                      <div className="w-1/2 text-xs italic pt-1">
                        {convertPriceVat(group?.range?.[range._id]?.fare.extraKmFare, config?.kmExtra?.vatPercentage)}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">-</div>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PriceListFaresTable;
