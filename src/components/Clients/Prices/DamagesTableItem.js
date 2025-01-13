import React, { useContext } from 'react';
import { convertPrice } from '../../../utils/Prices';
import { mapDamageVehiclePart } from '../../Damages/Damage';
import Button from '../../UI/buttons/Button';
import { CLIENT_ROLE_ADMIN } from '../../../utils/Utils';
import { UserContext } from '../../../store/UserContext';

const DamagesTableItem = (item) => {
  const damage = item.damage;
  const { data: currentClient } = useContext(UserContext);

  const pathname = window.location.pathname.split('/')[1];

  return (
    <tr>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">{damage?.group?.mnemonic}</p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">
          {mapDamageVehiclePart(damage?.vehiclePart)}
        </p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600 text-xs">
          <p>
            {damage?.damageType?.scratch?.low > 0 &&
              `Lieve: ${convertPrice(damage?.damageType?.scratch?.low)}`}{' '}
          </p>
          <p>
            {damage?.damageType?.scratch?.medium > 0 &&
              `Medio: ${convertPrice(damage?.damageType?.scratch?.medium)}`}{' '}
          </p>
          <p>
            {damage?.damageType?.scratch?.high > 0 &&
              `Grave: ${convertPrice(damage?.damageType?.scratch?.high)}`}{' '}
          </p>
        </p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600 text-xs">
          <p>
            {damage?.damageType?.dent?.low > 0 &&
              `Lieve: ${convertPrice(damage?.damageType?.dent?.low)}`}{' '}
          </p>
          <p>
            {damage?.damageType?.dent?.medium > 0 &&
              `Medio: ${convertPrice(damage?.damageType?.dent?.medium)}`}{' '}
          </p>
          <p>
            {damage?.damageType?.dent?.high > 0 &&
              `Grave: ${convertPrice(damage?.damageType?.dent?.high)}`}{' '}
          </p>
        </p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600 text-xs">
          <p>
            {damage?.damageType?.crack?.low > 0 &&
              `Lieve: ${convertPrice(damage?.damageType?.crack?.low)}`}{' '}
          </p>
          <p>
            {damage?.damageType?.crack?.medium > 0 &&
              `Medio: ${convertPrice(damage?.damageType?.crack?.medium)}`}{' '}
          </p>
          <p>
            {damage?.damageType?.crack?.high > 0 &&
              `Grave: ${convertPrice(damage?.damageType?.crack?.high)}`}{' '}
          </p>
        </p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600 text-xs">
          <p>
            {damage?.damageType?.break?.low > 0 &&
              `Lieve: ${convertPrice(damage?.damageType?.break?.low)}`}{' '}
          </p>
          <p>
            {damage?.damageType?.break?.medium > 0 &&
              `Medio: ${convertPrice(damage?.damageType?.break?.medium)}`}{' '}
          </p>
          <p>
            {damage?.damageType?.break?.high > 0 &&
              `Grave: ${convertPrice(damage?.damageType?.break?.high)}`}{' '}
          </p>
        </p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600 text-xs">
          <p>
            {damage?.damageType?.hole?.low > 0 &&
              `Lieve: ${convertPrice(damage?.damageType?.hole?.low)}`}{' '}
          </p>
          <p>
            {damage?.damageType?.hole?.medium > 0 &&
              `Medio: ${convertPrice(damage?.damageType?.hole?.medium)}`}{' '}
          </p>
          <p>
            {damage?.damageType?.hole?.high > 0 &&
              `Grave: ${convertPrice(damage?.damageType?.hole?.high)}`}{' '}
          </p>
        </p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600 text-xs">
          <p>
            {damage?.damageType?.tear?.low > 0 &&
              `Lieve: ${convertPrice(damage?.damageType?.tear?.low)}`}{' '}
          </p>
          <p>
            {damage?.damageType?.tear?.medium > 0 &&
              `Medio: ${convertPrice(damage?.damageType?.tear?.medium)}`}{' '}
          </p>
          <p>
            {damage?.damageType?.tear?.high > 0 &&
              `Grave: ${convertPrice(damage?.damageType?.tear?.high)}`}{' '}
          </p>
        </p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600 text-xs">
          <p>
            {damage?.damageType?.other?.low > 0 &&
              `Lieve: ${convertPrice(damage?.damageType?.other?.low)}`}{' '}
          </p>
          <p>
            {damage?.damageType?.other?.medium > 0 &&
              `Medio: ${convertPrice(damage?.damageType?.other?.medium)}`}{' '}
          </p>
          <p>
            {damage?.damageType?.other?.high > 0 &&
              `Grave: ${convertPrice(damage?.damageType?.other?.high)}`}{' '}
          </p>
        </p>
      </td>
      {pathname === 'settings' && (
        <td>
          {currentClient?.role === CLIENT_ROLE_ADMIN ? (
            <Button to={`/settings/listini/danni/${damage?._id}`} btnStyle="tableItemAction">
              Dettagli &raquo;
            </Button>
          ) : null}
        </td>
      )}
    </tr>
  );
};

export default DamagesTableItem;
