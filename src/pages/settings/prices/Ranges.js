import React, { useContext, useEffect, useState } from 'react';
import SettingsPage from '../../../components/Settings/SettingsPage';
import { toast } from 'react-hot-toast';
import { CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR, http } from '../../../utils/Utils';
import RangesTable from '../../../components/Clients/Prices/RangesTable';

import { useHistory } from 'react-router-dom';

import TableHeader from '../../../components/UI/TableHeader';
import { UserContext } from '../../../../src/store/UserContext';
import PlusOutlineCircle from '../../../assets/icons/PlusOutlineCircle';

const Ranges = () => {
  const history = useHistory();
  const [rangesCount, setRangesCount] = useState(0);

  const { data: currentClient } = useContext(UserContext);
  const license = currentClient?.client?.license?.licenseOwner;

  useEffect(() => {
    fetchRanges();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRanges = async () => {
    try {
      const response = await http({ url: '/pricing/range' });
      setRangesCount(response.count);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  return (
    <SettingsPage canAccess={[CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR]}>
      {license === 'movolab' || currentClient?.role === CLIENT_ROLE_OPERATOR ? (
        <TableHeader tableName={'Fasce'} buttons={[]} length={rangesCount} />
      ) : (
        <TableHeader
          tableName={'Fasce'}
          buttons={[
            {
              function: () => {
                history.push(`/settings/listini/fasce/crea`);
              },
              label: 'Aggiungi fascia',
              svgIco: <PlusOutlineCircle />,
            },
          ]}
          length={rangesCount}
        />
      )}

      <RangesTable />
    </SettingsPage>
  );
};

export default Ranges;
