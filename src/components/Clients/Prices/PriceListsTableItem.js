import React, { useContext } from 'react';
import { UserContext } from '../../../store/UserContext';
import ElementLabel from '../../UI/ElementLabel';
import Button from '../../UI/buttons/Button';
import DisplayDateTime from '../../UI/dates/DisplayDateTime';
import { MOVOLAB_ROLE_ADMIN } from '../../../utils/Utils';

const PriceListsTableItem = (item) => {
  const priceList = item.priceList;

  const { data: currentClient } = useContext(UserContext);
  const isAdmin = currentClient?.role === MOVOLAB_ROLE_ADMIN;

  let description = priceList?.description?.substr(0, 20);
  if (priceList?.description?.length > 20) description += ' ...';

  return (
    <tr>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600 max-w-xs">
          {priceList?.licenseType === 'movolab' ? (
            <>
              {priceList?.revenueShare?.percentage && (
                <div className="text-xs">
                  Perc Movolab: {priceList?.revenueShare?.percentage}% (Priorità:{' '}
                  {priceList?.revenueShare?.priority === 'fares' ? 'Tariffa' : 'Listino'})
                </div>
              )}
              <ElementLabel bgColor="bg-blue-500">Movolab</ElementLabel>
            </>
          ) : priceList?.licenseType === 'client' ? (
            <>
              {isAdmin && <div className="text-xs">{priceList.client?.ragioneSociale}</div>}
              <ElementLabel bgColor="bg-gray-500">Personale</ElementLabel>
            </>
          ) : (
            <></>
          )}
        </p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">
          {priceList?.licenseType === 'movolab'
            ? 'Tutti i Movolab'
            : priceList?.client?.ragioneSociale}
        </p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">{priceList?.name}</p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">{description}</p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <div className="text-left font-semibold text-gray-600">
          <DisplayDateTime date={priceList?.createdAt} />
        </div>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">
          {priceList?.status === 'active' ? (
            <ElementLabel bgColor="bg-green-600">Attivo</ElementLabel>
          ) : priceList?.status === 'inactive' ? (
            <ElementLabel bgColor="bg-red-500">Annullato</ElementLabel>
          ) : (
            ''
          )}
        </p>
      </td>

      <td>
        {isAdmin ? (
          <Button to={`/admin/movolab/listini/${priceList?._id}`} btnStyle="tableItemAction">
            Dettagli &raquo;
          </Button>
        ) : (
          <Button to={`/settings/listini/${priceList?._id}`} btnStyle="tableItemAction">
            Dettagli &raquo;
          </Button>
        )}
      </td>
    </tr>
  );
};

export default PriceListsTableItem;
