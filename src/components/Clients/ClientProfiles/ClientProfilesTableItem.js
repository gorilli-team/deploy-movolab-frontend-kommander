import React from 'react';
import ElementLabel from '../../UI/ElementLabel';
import DisplayDateTime from '../../UI/dates/DisplayDateTime';
import {
  CLIENT_ROLE_ADMIN,
  CLIENT_ROLE_OPERATOR,
  CORPORATE_ROLE_ADMIN,
  CORPORATE_ROLE_OPERATOR,
  MOVOLAB_ROLE_ADMIN,
} from '../../../utils/Utils';
import Button from '../../UI/buttons/Button';

const ClientProfilesTableItem = (item) => {
  const getProfileRole = (profileRole) => {
    switch (profileRole) {
      case MOVOLAB_ROLE_ADMIN:
        return 'Amministratore Movolab';
      case CLIENT_ROLE_ADMIN:
        return 'Amministratore';
      case CLIENT_ROLE_OPERATOR:
        return 'Operatore';
      case CORPORATE_ROLE_ADMIN:
        return 'Amministratore Corporate';
      case CORPORATE_ROLE_OPERATOR:
        return 'Operatore Corporate';
      default:
        return '-';
    }
  };

  const defineProfileUrl = () => {
    let profileUrl = '';

    if (item.role === CLIENT_ROLE_ADMIN) {
      profileUrl = '/settings/profiliCliente';
    } else if (item.role === MOVOLAB_ROLE_ADMIN) {
      profileUrl = '/admin/utenti/clientProfile';
    }
    return profileUrl;
  };

  const clientProfile = item.clientProfile;
  return (
    <tr>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        {clientProfile?.imageUrl ? (
          <img
            className="display-block"
            src={clientProfile?.imageUrl}
            height={50}
            width={50}
            alt="immagine profilo"
          />
        ) : (
          <></>
        )}
      </td>
      {item.role === 'admin' && (
        <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
          <p className="text-left font-semibold text-gray-600">
            {clientProfile?.client?.ragioneSociale}
          </p>
        </td>
      )}
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">
          {clientProfile.role === CLIENT_ROLE_ADMIN ? (
            <ElementLabel bgColor="bg-blue-500"> {getProfileRole(clientProfile.role)}</ElementLabel>
          ) : clientProfile.role === CLIENT_ROLE_OPERATOR ? (
            <ElementLabel> {getProfileRole(clientProfile.role)}</ElementLabel>
          ) : clientProfile.role === CORPORATE_ROLE_ADMIN ? (
            <ElementLabel bgColor="bg-yellow-500">
              {' '}
              {getProfileRole(clientProfile.role)}
            </ElementLabel>
          ) : clientProfile.role === CORPORATE_ROLE_OPERATOR ? (
            <ElementLabel> {getProfileRole(clientProfile.role)}</ElementLabel>
          ) : clientProfile.role === MOVOLAB_ROLE_ADMIN ? (
            <ElementLabel bgColor="bg-red-700"> {getProfileRole(clientProfile.role)}</ElementLabel>
          ) : (
            <ElementLabel> {getProfileRole(clientProfile.role)}</ElementLabel>
          )}
        </p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap w-32">
        <p className="text-left font-semibold text-gray-600">{clientProfile.email}</p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap w-32">
        <p className="text-left font-semibold text-gray-600">
          {clientProfile?.isVerified ? (
            <ElementLabel bgColor="bg-green-600">Verificato</ElementLabel>
          ) : (
            <ElementLabel bgColor="bg-red-600">Non Verificato</ElementLabel>
          )}
        </p>
        <p className="text-left font-semibold text-gray-600  mt-2">
          {clientProfile?.enabled ? (
            <ElementLabel bgColor="bg-green-600">Abilitato</ElementLabel>
          ) : (
            <ElementLabel bgColor="bg-red-600">Disabilitato</ElementLabel>
          )}
        </p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <DisplayDateTime date={clientProfile.createdAt} />
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <DisplayDateTime date={clientProfile.lastActivity} />
      </td>

      <td>
        <Button to={`${defineProfileUrl()}/${clientProfile._id}`} btnStyle="tableItemAction">
          Dettagli &raquo;
        </Button>
      </td>
    </tr>
  );
};

export default ClientProfilesTableItem;
