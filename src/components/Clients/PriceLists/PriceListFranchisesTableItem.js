import React from 'react';

const PriceListFranchisesTableItem = (item) => {
  const franchise = item.franchise;

  const getFranchiseCategory = (category) => {
    if (category === 'maintenance') {
      return 'Manutenzione';
    }
    if (category === 'rca') {
      return 'RCA';
    }
    if (category === 'if') {
      return 'I/F';
    }
    if (category === 'pai') {
      return 'PAI';
    }
    if (category === 'kasko') {
      return 'Kasko';
    }
  };

  return (
    <tr>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">{franchise?.group?.mnemonic}</p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">
          {getFranchiseCategory(franchise?.category)}
        </p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">
          {franchise.franchise.type} -{' '}
          {franchise.franchise.value ? +franchise.franchise.value + '€' : '0€'} -
          {franchise.franchise.percent ? +franchise.franchise.percent + '%' : '0%'}
        </p>
      </td>
    </tr>
  );
};

export default PriceListFranchisesTableItem;
