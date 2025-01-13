import React, { useContext } from 'react';
import ElementLabel from '../../UI/ElementLabel';
import { UserContext } from '../../../store/UserContext';
import { convertPrice } from '../../../utils/Prices';
import { mapApplicability, mapCostCalculation } from '../../../utils/Extras';
import { CLIENT_ROLE_ADMIN, MOVOLAB_ROLE_ADMIN } from '../../../utils/Utils';
import Button from '../../UI/buttons/Button';
import DisplayDateTime from '../../UI/dates/DisplayDateTime';

const ExtrasTableItem = (item) => {
  const extra = item.extra;

  const { data: currentClient } = useContext(UserContext);
  const isAdmin = currentClient?.role === MOVOLAB_ROLE_ADMIN;

  return (
    <tr>
      <td className="first:pl-5 pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600 w-20">
          {extra?.licenseType === 'movolab' ? (
            <ElementLabel bgColor="bg-blue-500">Movolab</ElementLabel>
          ) : extra?.licenseType === 'client' ? (
            <>
              {isAdmin && <div className="text-xs">{extra.client?.ragioneSociale}</div>}
              <ElementLabel bgColor="bg-gray-500">Personale</ElementLabel>
            </>
          ) : (
            <></>
          )}
        </p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">{extra?.name}</p>
      </td>

      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">{extra?.groups?.length}</p>
      </td>

      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">
          {mapApplicability(extra?.applicability)}
        </p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">
          {extra?.cost?.amount ? convertPrice(extra?.cost?.amount) : '-'}
        </p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">
          {mapCostCalculation(extra?.cost?.calculation)}
        </p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">
          {extra.configuration?.invoicingType === 'movolab' ? (
            <>Movolab</>
          ) : extra.configuration?.invoicingType === 'customer' ? (
            <>Cliente</>
          ) : null}
        </p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">
          {extra.configuration?.vatPercentage ? (
            <>{extra.configuration?.vatPercentage}%</>
          ) : (
            <>0%</>
          )}
        </p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-pre-line">
        <DisplayDateTime date={extra?.createdAt} />
      </td>

      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        {currentClient?.role === CLIENT_ROLE_ADMIN || currentClient?.role === MOVOLAB_ROLE_ADMIN ? (
          isAdmin === true ? (
            <Button to={`/admin/movolab/extra/${extra?._id}`} btnStyle="tableItemAction">
              Dettagli &raquo;
            </Button>
          ) : (
            <Button
              to={`/settings/listini/extra/${extra?._id}/aggiorna`}
              btnStyle="tableItemAction"
            >
              Dettagli &raquo;
            </Button>
          )
        ) : null}
      </td>
    </tr>
  );
};

export default ExtrasTableItem;
