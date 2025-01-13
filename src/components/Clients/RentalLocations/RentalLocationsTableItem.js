import React from 'react';
import ElementLabel from '../../UI/ElementLabel';
import Button from '../../UI/buttons/Button';
import DisplayDateTime from '../../UI/dates/DisplayDateTime';

const RentalLocationsTableItem = (item) => {
  const rentalLocation = item.rentalLocation;

  const pathname = window.location.pathname.split('/')[1];

  let redirectUrl = '';
  if (pathname === 'admin') {
    redirectUrl = `/admin/clienti/puntinolo/${rentalLocation?._id}`;
  } else {
    redirectUrl = `/settings/puntinolo/${rentalLocation?._id}`;
  }

  return (
    <tr>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">{rentalLocation?.name}</p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">
          {rentalLocation?.clientId?.ragioneSociale}
        </p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        {rentalLocation && rentalLocation.address && (
          <p className="text-left font-semibold text-gray-600">
            {rentalLocation?.address.length > 30
              ? rentalLocation?.address.slice(0, 30) + '...'
              : rentalLocation?.address}
          </p>
        )}
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">{rentalLocation?.city}</p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        {rentalLocation?.enabled ? (
          <ElementLabel bgColor="bg-green-600">ABILITATO</ElementLabel>
        ) : (
          <ElementLabel bgColor="bg-red-600">DISABILITATO</ElementLabel>
        )}{' '}
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <DisplayDateTime date={rentalLocation?.createdAt} displayType={'flat'} />
      </td>
      <td>
        <Button to={redirectUrl} btnStyle="tableItemAction">
          Dettagli &raquo;
        </Button>
      </td>
    </tr>
  );
};

export default RentalLocationsTableItem;
