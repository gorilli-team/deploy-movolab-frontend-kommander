import React from 'react';
import LightGrayLink from '../../UI/LightGrayLink';
import ElementLabel from '../../UI/ElementLabel';
import DisplayDateTime from '../../UI/dates/DisplayDateTime';

const ClientsTableItem = (item) => {
  const client = item.client;
  return (
    <tr>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap w-60 max-w-60">
        <div className="text-left font-semibold text-gray-600 overflow-auto break-words">
          {client.ragioneSociale.substring(0, 40)}
        </div>
        <div className="text-sm text-gray-500">{client?.code}</div>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">{client.partitaIva}</p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">{client.address?.city}</p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <div className="text-left font-semibold text-gray-600">
          {client?.enabled ? (
            <ElementLabel bgColor="bg-green-600">Abilitato</ElementLabel>
          ) : (
            <ElementLabel bgColor="bg-red-600">Disabilitato</ElementLabel>
          )}
        </div>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <div className="text-left font-semibold text-gray-600">
          {client?.stripeCustomerId ? (
            <ElementLabel bgColor="bg-green-600">Attivo</ElementLabel>
          ) : (
            <ElementLabel bgColor="bg-red-600">Non Attivo</ElementLabel>
          )}
        </div>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <div className="text-left font-semibold text-gray-600">
          {client.license?.licenseOwner === 'movolab' ? (
            <ElementLabel bgColor="bg-blue-500">Movolab</ElementLabel>
          ) : (
            <ElementLabel bgColor="bg-gray-500">Personale</ElementLabel>
          )}
        </div>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <div className="text-left font-semibold text-gray-600">
          <DisplayDateTime date={client.createdAt} />
        </div>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <div className="text-left font-semibold text-gray-600 w-10">
          <DisplayDateTime date={client.updatedAt} />
        </div>
      </td>
      <td>
        <LightGrayLink to={`/admin/clienti/anagrafica/${client._id}`}>Dettagli</LightGrayLink>
      </td>
    </tr>
  );
};

export default ClientsTableItem;
