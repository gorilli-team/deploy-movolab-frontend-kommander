import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../store/UserContext';
import ElementLabel from '../UI/ElementLabel';
import Button from '../UI/buttons/Button';
import { http, MOVOLAB_ROLE_ADMIN } from '../../utils/Utils';

const PacksTableItem = (item) => {
  const pack = item.pack;
  const packId = pack?._id;
  const [clientsForPack, setClientsForPack] = useState(0);

  useEffect(() => {
    getClientsForPack(packId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packId]);

  const getClientsForPack = async (packId) => {
    try {
      if (packId !== undefined) {
        const clients = await http({ url: `/clientPayments/packs/clients/${packId}` });
        setClientsForPack(clients.count);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const { data: currentClient } = useContext(UserContext);
  const isAdmin = currentClient?.role === MOVOLAB_ROLE_ADMIN;

  return (
    <tr>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600 w-20">
          {pack?.licenseType === 'movolab' ? (
            <ElementLabel bgColor="bg-blue-500">Movolab</ElementLabel>
          ) : (
            <ElementLabel bgColor="bg-gray-500">Personale</ElementLabel>
          )}
        </p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">{pack?.name}</p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">
          {pack?.status === 'active' ? (
            <ElementLabel bgColor="bg-green-600">Attivo</ElementLabel>
          ) : pack?.status === 'inactive' ? (
            <ElementLabel bgColor="bg-red-500">Annullato</ElementLabel>
          ) : (
            ''
          )}
        </p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">
          {pack?.renewal === true ? (
            <ElementLabel bgColor="bg-green-600">SI</ElementLabel>
          ) : pack?.renewal === false ? (
            <ElementLabel bgColor="bg-red-500">NO</ElementLabel>
          ) : (
            ''
          )}
        </p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">
          {pack?.visible === true ? (
            <ElementLabel bgColor="bg-green-600">SI</ElementLabel>
          ) : pack?.visible === false ? (
            <ElementLabel bgColor="bg-red-500">NO</ElementLabel>
          ) : (
            ''
          )}
        </p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">
          {pack?.paymentPeriod === 'yearly'
            ? 'Annuale'
            : pack?.paymentPeriod === 'monthly'
            ? 'Mensile'
            : ''}
        </p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">{pack?.fee} €</p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">{clientsForPack}</p>
      </td>

      <td>
        {isAdmin ? (
          <Button to={`/admin/packs/${pack?._id}`} btnStyle="tableItemAction">
            Dettagli &raquo;
          </Button>
        ) : (
          ''
        )}
      </td>
    </tr>
  );
};

export default PacksTableItem;
