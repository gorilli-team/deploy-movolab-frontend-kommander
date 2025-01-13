import React from 'react';

const PriceListDepositsTable = ({ elements = [] }) => {
  const compareFn = (a, b) =>
    a?.group?.mnemonic > b?.group?.mnemonic ? 1 : b?.group?.mnemonic > a?.group?.mnemonic ? -1 : 0;

  return (
    <div className="rounded-xl overflow-auto border border-gray-200">
      <table className="table-auto w-full whitespace-nowrap">
        <thead className="text-xs font-semibold bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-5 py-3 text-left text-lg">Deposito</th>
            <th className="px-2 pt-1 uppercase text-gray-500"></th>
          </tr>
        </thead>
        <tbody className="text-sm divide-y divide-gray-200 text-gray-600">
          {elements.sort(compareFn).map((deposit, index) => (
            <tr className="text-right" key={index}>
              <th className="px-5 py-3.5 text-left">
                {deposit?.group?.mnemonic} ({deposit?.group?.description})
              </th>
              <td className="pr-5 py-3">{deposit?.amount ? +deposit?.amount + '€' : '0€'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PriceListDepositsTable;
