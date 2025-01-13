import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import SettingsPage from '../../../components/Settings/SettingsPage';
import ClientProfilesTable from '../../../components/Clients/ClientProfiles/ClientProfilesTable';
import TableHeader from '../../../components/UI/TableHeader';
import { CLIENT_ROLE_ADMIN } from '../../../utils/Utils';
import PlusOutlineCircle from '../../../assets/icons/PlusOutlineCircle';

const ClientAccounts = () => {
  const history = useHistory();
  const [clientProfilesCount, setClientProfilesCount] = useState(0);

  const setCount = (count) => {
    setClientProfilesCount(count);
  };

  return (
    <SettingsPage canAccess={[CLIENT_ROLE_ADMIN]}>
      <TableHeader
        tableName={'Profili utente'}
        buttons={[
          {
            function: () => {
              history.push(`/settings/profiliCliente/crea`);
            },
            label: 'Aggiungi profilo',
            svgIco: <PlusOutlineCircle />,
          },
        ]}
        length={clientProfilesCount}
      />

      <ClientProfilesTable role={'client'} setCount={setCount} />
    </SettingsPage>
  );
};

export default ClientAccounts;
