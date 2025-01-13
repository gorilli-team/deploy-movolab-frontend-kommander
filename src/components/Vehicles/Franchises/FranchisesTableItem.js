import React, { useContext } from 'react';
import ElementLabel from '../../UI/ElementLabel';
import DisplayDateTime from '../../UI/dates/DisplayDateTime';

import { UserContext } from '../../../store/UserContext';
import { convertPrice } from '../../../utils/Prices';
import { mapFranchiseCalculation } from '../../../utils/Franchises';
import Button from '../../UI/buttons/Button';
import { CLIENT_ROLE_ADMIN, MOVOLAB_ROLE_ADMIN } from '../../../utils/Utils';

const FranchisesTableItem = (item) => {
  const franchise = item.franchise;

  const { data: currentClient } = useContext(UserContext);
  const isAdmin = currentClient?.role === MOVOLAB_ROLE_ADMIN;

  return (
    <tr>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-pre-line">
        <p className="text-left font-semibold text-gray-600 w-20">
          {franchise?.licenseType === 'movolab' ? (
            <ElementLabel bgColor="bg-blue-500">Movolab</ElementLabel>
          ) : franchise?.licenseType === 'client' ? (
            <>
              {isAdmin && <div className="text-xs">{franchise.client?.ragioneSociale}</div>}
              <ElementLabel bgColor="bg-gray-500">Personale</ElementLabel>
            </>
          ) : (
            <></>
          )}
        </p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-pre-line">
        <p className="text-left font-semibold text-gray-600">{franchise?.type}</p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-pre-line">
        <p className="text-left font-semibold text-gray-600">{franchise?.description}</p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-pre-line">
        <p className="text-left font-semibold text-gray-600">
          {mapFranchiseCalculation(franchise?.calculation)}
        </p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-pre-line">
        <p className="text-left font-semibold text-gray-600">
          {franchise?.value ? convertPrice(franchise?.value) : '0 €'}
        </p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-pre-line">
        <p className="text-left font-semibold text-gray-600">
          {franchise?.percent ? franchise?.percent : 0} %
        </p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-pre-line">
        <DisplayDateTime date={franchise?.createdAt} />
      </td>
      <td>
        {currentClient?.role === CLIENT_ROLE_ADMIN || currentClient?.role === MOVOLAB_ROLE_ADMIN ? (
          isAdmin === true ? (
            <Button to={`/admin/movolab/franchigie/${franchise?._id}`} btnStyle="tableItemAction">
              Dettagli &raquo;
            </Button>
          ) : (
            <Button
              to={`/settings/veicoli/franchigie/${franchise?._id}`}
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

export default FranchisesTableItem;
