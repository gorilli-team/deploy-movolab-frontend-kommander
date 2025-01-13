import React, { useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import SettingsPage from '../../../components/Settings/SettingsPage';
import { CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR, http } from '../../../utils/Utils';
import { useHistory } from 'react-router-dom';

import ExtrasTable from '../../../components/Clients/Prices/ExtrasTable';
import TableHeader from '../../../components/UI/TableHeader';
import { UserContext } from '../../../../src/store/UserContext';
import PlusOutlineCircle from '../../../assets/icons/PlusOutlineCircle';

const Extras = () => {
  const history = useHistory();
  const [extrasCount, setExtrasCount] = useState(0);

  const { data: currentClient } = useContext(UserContext);

  useEffect(() => {
    fetchExtras();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchExtras = async () => {
    try {
      const response = await http({ url: '/pricing/extras' });
      setExtrasCount(response.count);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  return (
    <SettingsPage canAccess={[CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR]}>
      {currentClient?.role === CLIENT_ROLE_OPERATOR ? (
        <TableHeader tableName={'Extra'} buttons={[]} length={extrasCount} />
      ) : (
        <TableHeader
          tableName={'Extra'}
          buttons={[
            {
              function: () => {
                history.push(`/settings/listini/extra/crea`);
              },
              label: 'Aggiungi extra',
              svgIco: <PlusOutlineCircle />,
            },
          ]}
          length={extrasCount}
        />
      )}
      <ExtrasTable />
    </SettingsPage>
  );
};

export default Extras;
