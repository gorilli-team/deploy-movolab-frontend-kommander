import React from 'react';
import { CLIENT_ROLE_ADMIN, MOVOLAB_ROLE_ADMIN } from '../../../utils/Utils';
import Button from '../../UI/buttons/Button';

const BrandsTableItem = (item) => {
  const brand = item.brand;
  return (
    <tr>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">{brand.brandName}</p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">
          {brand.brandImage ? <img src={brand.brandImage} width={40} alt="brand-logo" /> : <></>}
        </p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">
          {brand.createdAt !== undefined && new Date(brand.createdAt).toLocaleDateString()}
        </p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600 w-10">
          {brand.updatedAt !== undefined && new Date(brand.updatedAt).toLocaleDateString()}
        </p>
      </td>
      {item.role === MOVOLAB_ROLE_ADMIN && (
        <td>
          <Button to={`/admin/veicoli/marche/${brand._id}`} btnStyle="tableItemAction">
            Aggiorna &raquo;
          </Button>
        </td>
      )}
      {item.role === CLIENT_ROLE_ADMIN && item?.clientId === brand?.createdByClient && (
        <td>
          <Button to={`/settings/veicoli/marche/${brand._id}`} btnStyle="tableItemAction">
            Aggiorna &raquo;
          </Button>
        </td>
      )}
    </tr>
  );
};

export default BrandsTableItem;
