import React from 'react';
import Button from '../UI/buttons/Button';
import ElementLabel from '../UI/ElementLabel';
import { RiVerifiedBadgeFill } from 'react-icons/ri';

const UsersTableItem = (item) => {
  const pathname = window.location.pathname.split('/')[1];

  let redirectBaseUrl = '';
  if (pathname === 'corporate') {
    redirectBaseUrl = '/corporate/clienti/';
  } else {
    redirectBaseUrl = '/dashboard/utenti/persona/';
  }

  const user = item.user;
  return (
    <tr>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <div className="text-left font-semibold text-gray-600">
          <div
            className="shadow-sm relative cursor-pointer"
            style={{
              backgroundImage: `url(${user.imageUrl || ''})`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              backgroundSize: 'cover',
              borderRadius: '5em',
              width: '40px',
              height: '40px',
              marginBottom: '0.2em',
            }}
          ></div>
        </div>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">
          {user?.name || ''} {user?.surname || ''}
          {user?.verifiedPartitaIva && (
            <RiVerifiedBadgeFill className="text-green-600 ml-1 mb-1 inline" />
          )}
        </p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">{user.residency?.city}</p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">{user.fiscalCode}</p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">
          {user.drivingLicense?.expirationDate
            ? new Date(user.drivingLicense?.expirationDate).toLocaleString().substring(0, 10)
            : ''}
        </p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="font-semibold text-gray-600 uppercase">
          {user.userType === 'driver' ? (
            <ElementLabel bgColor="bg-green-600">Conducente</ElementLabel>
          ) : user.userType === 'customer' ? (
            <ElementLabel bgColor="bg-yellow-600">Cliente</ElementLabel>
          ) : (
            ''
          )}
        </p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="font-semibold text-gray-600 uppercase">
          {user.state === 'attivo' ? (
            <ElementLabel bgColor="bg-green-600">Attivo</ElementLabel>
          ) : user.state === 'annullato' ? (
            <ElementLabel bgColor="bg-red-600">Annullato</ElementLabel>
          ) : user.state === 'chiuso' ? (
            <ElementLabel bgColor="bg-yellow-600">Chiuso</ElementLabel>
          ) : (
            <ElementLabel>{user.state}</ElementLabel>
          )}
        </p>
      </td>

      <td>
        {}
        <Button to={`${redirectBaseUrl}${user._id}`} btnStyle="tableItemAction">
          Dettagli &raquo;
        </Button>
      </td>
    </tr>
  );
};

export default UsersTableItem;
