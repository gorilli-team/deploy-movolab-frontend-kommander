import React from 'react';

const PriceListDepositsTableItem = (item) => {
  const deposit = item.deposit;

  const mapInvoicingType = (type) => {
    if (type === 'movolab') {
      return 'Movolab';
    }
    if (type === 'customer') {
      return 'Diretta';
    }
    if (type === 'mixed') {
      return 'Mista';
    }
  };

  return (
    <tr>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">{deposit?.group?.mnemonic}</p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">
          {deposit?.amount ? +deposit?.amount + '€' : '0€'}
        </p>
      </td>
    </tr>
  );
};

export default PriceListDepositsTableItem;
