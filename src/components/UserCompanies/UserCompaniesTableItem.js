import React from 'react';
import Button from '../UI/buttons/Button';
import ElementLabel from '../UI/ElementLabel';
import { RiVerifiedBadgeFill } from 'react-icons/ri';

const UserCompaniesTableItem = (item) => {
  const userCompany = item.userCompany;
  return (
    <tr>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <div className="text-left font-semibold text-gray-600">
          <div
            className="shadow-sm relative cursor-pointer"
            style={{
              backgroundImage: `url(${userCompany.imageUrl || ''})`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              backgroundSize: 'contain',
              borderRadius: '5em',
              border: '1px solid #e5e7eb',
              width: '40px',
              height: '40px',
              marginBottom: '0.2em',
            }}
          ></div>
        </div>
      </td>
      <td className="first:pl-5 last:pr-5 py-3">
        <p
          className="text-left font-semibold text-gray-600"
          style={{ maxWidth: '200px', wordWrap: 'break-word', overflowWrap: 'break-word' }}
        >
          {userCompany?.ragioneSociale || ''}
          {userCompany?.verifiedPartitaIva && (
            <RiVerifiedBadgeFill className="text-green-600 ml-1 mb-1 inline" />
          )}
        </p>
      </td>

      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">
          {userCompany.partitaIva !== undefined && userCompany.partitaIva}
        </p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">
          {userCompany.address?.city !== undefined && userCompany.address?.city}
        </p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">
          {userCompany.address?.province !== undefined && userCompany.address?.province}
        </p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="font-semibold text-gray-600">
          {userCompany.state === 'attivo' ? (
            <ElementLabel bgColor="bg-green-600">Attivo</ElementLabel>
          ) : userCompany.state === 'annullato' ? (
            <ElementLabel bgColor="bg-red-600">Annullato</ElementLabel>
          ) : userCompany.state === 'chiuso' ? (
            <ElementLabel bgColor="bg-yellow-600">Chiuso</ElementLabel>
          ) : (
            <ElementLabel>{userCompany.state}</ElementLabel>
          )}
        </p>
      </td>

      <td>
        {!item.disableDetails && (
          <Button to={`/dashboard/utenti/azienda/${userCompany._id}`} btnStyle="tableItemAction">
            Dettagli &raquo;
          </Button>
        )}
      </td>
    </tr>
  );
};

export default UserCompaniesTableItem;
