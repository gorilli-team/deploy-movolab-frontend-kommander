import React from 'react';

const PriceListRentalLocationTableItem = (item) => {
  const rentalLocation = item.rentalLocation;
  return (
    <tr>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">{rentalLocation.name}</p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">{rentalLocation.address}</p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">{rentalLocation.city}</p>
      </td>
    </tr>
  );
};

export default PriceListRentalLocationTableItem;
