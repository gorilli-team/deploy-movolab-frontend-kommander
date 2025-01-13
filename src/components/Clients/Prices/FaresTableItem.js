import React, { useContext } from 'react';
import ElementLabel from '../../UI/ElementLabel';
import { UserContext } from '../../../store/UserContext';
import { convertPrice } from '../../../utils/Prices';
import { convertFareCalculation } from '../../../utils/Prices';
import { CLIENT_ROLE_ADMIN, MOVOLAB_ROLE_ADMIN } from '../../../utils/Utils';
import Button from '../../UI/buttons/Button';
import DisplayDateTime from '../../UI/dates/DisplayDateTime';

const FaresTableItem = (item) => {
  const fare = item.fare;

  const { data: currentClient } = useContext(UserContext);
  const isAdmin = currentClient?.role === MOVOLAB_ROLE_ADMIN;

  return (
    <tr>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <div className="text-left font-semibold text-gray-600 max-w-xs">
          {fare?.licenseType === 'movolab' ? (
            <ElementLabel bgColor="bg-blue-500">Movolab</ElementLabel>
          ) : fare?.licenseType === 'client' ? (
            <>
              {isAdmin && <div className="text-xs">{fare.client?.ragioneSociale}</div>}
              <ElementLabel bgColor="bg-gray-500">Personale</ElementLabel>
            </>
          ) : (
            <></>
          )}
        </div>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">{fare?.group?.mnemonic}</p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">
          {fare.range?.name !== undefined ? `${fare?.range?.name}` : '-'}
        </p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">
          {fare.range?.name !== undefined ? `${convertFareCalculation(fare, fare?.range)}` : '-'}
        </p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">
          {fare.baseFare !== undefined ? <>{convertPrice(fare?.baseFare)}</> : '-'}
        </p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">
          {fare.extraDayFare !== undefined ? <>{convertPrice(fare?.extraDayFare)}</> : '-'}
        </p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600 w-10">
          {fare.freeDailyKm !== undefined ? `${fare.freeDailyKm}` : '-'}
        </p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600 w-10">
          {fare.extraKmFare !== undefined ? <>{convertPrice(fare?.extraKmFare)}</> : '-'}
        </p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <div className="text-left font-semibold text-gray-600 w-10">
          <DisplayDateTime date={fare?.createdAt} />
        </div>
      </td>
      <td>
        {currentClient?.role === CLIENT_ROLE_ADMIN || currentClient?.role === MOVOLAB_ROLE_ADMIN ? (
          isAdmin === true ? (
            <Button to={`/admin/movolab/tariffe/${fare?._id}`} btnStyle="tableItemAction">
              Dettagli &raquo;
            </Button>
          ) : (
            <Button to={`/settings/listini/tariffe/${fare?._id}`} btnStyle="tableItemAction">
              Dettagli &raquo;
            </Button>
          )
        ) : null}
      </td>
    </tr>
  );
};

export default FaresTableItem;
