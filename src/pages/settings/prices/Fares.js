import React, { useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import SettingsPage from '../../../components/Settings/SettingsPage';
import { CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR, http } from '../../../utils/Utils';
import { useHistory, useLocation } from 'react-router-dom';

import FaresTable from '../../../components/Clients/Prices/FaresTable';
import TableHeader from '../../../components/UI/TableHeader';
import { UserContext } from '../../../../src/store/UserContext';
import PlusOutlineCircle from '../../../assets/icons/PlusOutlineCircle';
import FilterSelectField from '../../../components/Form/FilterSelectField';
import useGroups from '../../../hooks/useGroups';

const Fares = () => {
  const history = useHistory();
  const search = useLocation().search;
  const urlParams = new URLSearchParams(search);

  const [faresCount, setFaresCount] = useState(0);
  const [selectedGroup, setSelectedGroup] = useState(urlParams.get('gruppo'));
  const groups = useGroups();

  const { data: currentClient } = useContext(UserContext);
  const license = currentClient?.client?.license?.licenseOwner;

  const setSelectedGroupAndReload = (value) => {
    setSelectedGroup(value);
    if (value === '') history.push(`/settings/listini/tariffe`);
    else history.push(`/settings/listini/tariffe?gruppo=${value}`);
  };

  useEffect(() => {
    fetchFares();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGroup]);

  const fetchFares = async () => {
    try {
      const response = await http({ url: `/fares?group=${selectedGroup}` });
      setFaresCount(response.count);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  return (
    <SettingsPage canAccess={[CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR]}>
      <div className="flex justify-between items-center">
        {license === 'movolab' || currentClient?.role === CLIENT_ROLE_OPERATOR ? (
          <TableHeader tableName={'Tariffe'} buttons={[]} length={faresCount} />
        ) : (
          <TableHeader
            tableName={'Tariffe'}
            buttons={[
              {
                function: () => {
                  history.push(`/settings/listini/tariffe/crea`);
                },
                label: 'Aggiungi tariffa',
                svgIco: <PlusOutlineCircle />,
              },
            ]}
            length={faresCount}
          />
        )}
        <div className="flex justify-end gap-2 mr-6">
          <FilterSelectField
            onChange={(e) => setSelectedGroupAndReload(e.target.value)}
            emptyOption={{ label: 'Tutti i Gruppi' }}
            defaultValue={groups.find((group) => group.value === selectedGroup)}
            options={groups.map((group) => ({
              value: group.value,
              label: group.label,
            }))}
          />
        </div>
      </div>

      <FaresTable selectedGroup={selectedGroup} />
    </SettingsPage>
  );
};

export default Fares;
