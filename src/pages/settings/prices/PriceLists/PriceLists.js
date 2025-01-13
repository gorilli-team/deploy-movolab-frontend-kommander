import React, { useContext, useState } from 'react';
import SettingsPage from '../../../../components/Settings/SettingsPage';
import { CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR } from '../../../../utils/Utils';
import PriceListsTable from '../../../../components/Clients/Prices/PriceListsTable';
import TableHeader from '../../../../components/UI/TableHeader';
import { useHistory } from 'react-router-dom';
import { UserContext } from '../../../../../src/store/UserContext';
import PlusOutlineCircle from '../../../../assets/icons/PlusOutlineCircle';

const PriceLists = () => {
  const history = useHistory();

  const [priceListsCount, setPriceListsCount] = useState([]);

  const { data: currentClient } = useContext(UserContext);
  const license = currentClient?.client?.license?.licenseOwner;

  const setCount = (count) => {
    setPriceListsCount(count);
  };

  return (
    <SettingsPage canAccess={[CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR]}>
      {license === 'movolab' || currentClient?.role === CLIENT_ROLE_OPERATOR ? (
        <TableHeader tableName={'Listini'} buttons={[]} length={priceListsCount} />
      ) : (
        <TableHeader
          tableName={'Listini'}
          buttons={[
            {
              function: () => {
                history.push(`/settings/listini/crea`);
              },
              label: 'Aggiungi listino',
              svgIco: <PlusOutlineCircle />,
            },
          ]}
          length={priceListsCount}
        />
      )}

      <PriceListsTable setCount={setCount} />
    </SettingsPage>
  );
};

export default PriceLists;
