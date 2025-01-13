import React, { useContext } from 'react';
import ElementLabel from '../../UI/ElementLabel';
import { UserContext } from '../../../store/UserContext';
// import { convertFareCalculation } from '../../../utils/Prices';
import Button from '../../UI/buttons/Button';
import { CLIENT_ROLE_ADMIN, MOVOLAB_ROLE_ADMIN } from '../../../utils/Utils';

const RangesTableItem = (item) => {
  const range = item.range;

  const { data: currentClient } = useContext(UserContext);
  const isAdmin = currentClient?.role === MOVOLAB_ROLE_ADMIN;

  const timeUnitLabel = (timeUnit) => {
    switch (timeUnit) {
      case 'minute':
        return 'Minuto';
      case 'hour':
        return 'Ora';
      case 'day':
        return 'Giorno';
      case 'month':
        return 'Mese';
      default:
        return 'Unità Tempo';
    }
  };

  return (
    <tr>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600 w-20">
          {range?.licenseType === 'movolab' ? (
            <ElementLabel bgColor="bg-blue-500">Movolab</ElementLabel>
          ) : range?.licenseType === 'client' ? (
            <>
              {isAdmin && <div className="text-xs">{range.client?.ragioneSociale}</div>}
              <ElementLabel bgColor="bg-gray-500">Personale</ElementLabel>
            </>
          ) : (
            <></>
          )}
        </p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">{range.name}</p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">{range.description}</p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">{timeUnitLabel(range.timeUnit)}</p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600 w-10">{range.from}</p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600 w-10">{range.to}</p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600 w-10">{range.faresCount}</p>
      </td>
      <td>
        {currentClient?.role === CLIENT_ROLE_ADMIN || currentClient?.role === MOVOLAB_ROLE_ADMIN ? (
          isAdmin ? (
            <Button to={`/admin/movolab/fasce/${range?._id}`} btnStyle="tableItemAction">
              Dettagli &raquo;
            </Button>
          ) : (
            <Button
              to={`/settings/listini/fasce/${range?._id}/aggiorna`}
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

export default RangesTableItem;
