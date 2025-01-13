import React from 'react';
import { CLIENT_ROLE_ADMIN, MOVOLAB_ROLE_ADMIN } from '../../../utils/Utils';
import { FaCheck, FaCircleXmark } from 'react-icons/fa6';
import Button from '../../UI/buttons/Button';

const ModelsTableItem = (item) => {
  const model = item.model;

  return (
    <tr>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">{model.modelName}</p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">{model.brandId?.brandName}</p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">
          {model.createdAt !== undefined && new Date(model.createdAt).toLocaleString()}
        </p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600 w-10">
          {model.updatedAt !== undefined && new Date(model.updatedAt).toLocaleString()}
        </p>
      </td>
      {item?.role === MOVOLAB_ROLE_ADMIN && (
        <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap text-xs">
          <p className="text-left font-semibold text-gray-600">
            {model.createdByClient?.ragioneSociale
              ? model.createdByClient?.ragioneSociale
              : 'Team Movolab'}
          </p>
          <p className="text-left font-semibold text-gray-600">
            {model.approved ? (
              <FaCheck className="text-green-500 font-bold text-lg"></FaCheck>
            ) : (
              <span className="flex space-x-1 text-red-500">
                <span>Non Approvato</span>
                <FaCircleXmark className="text-red-500 font-bold text-lg"></FaCircleXmark>
              </span>
            )}
          </p>
        </td>
      )}
      {item?.role === MOVOLAB_ROLE_ADMIN && (
        <td>
          <Button to={`/admin/veicoli/modelli/${model._id}`} btnStyle="tableItemAction">
            Aggiorna &raquo;
          </Button>
        </td>
      )}
      {item?.role === CLIENT_ROLE_ADMIN && model?.createdByClient?._id === item.clientId && (
        <td>
          <Button to={`/settings/veicoli/modelli/${model._id}`} btnStyle="tableItemAction">
            Aggiorna &raquo;
          </Button>
        </td>
      )}
    </tr>
  );
};

export default ModelsTableItem;
