import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import AdminPage from '../../../components/Admin/AdminPage';
import ClientProfilesTable from '../../../components/Clients/ClientProfiles/ClientProfilesTable';
import TableHeader from '../../../components/UI/TableHeader';

const ClientAccounts = () => {
  const history = useHistory();
  const [clientProfilesCount, setClientProfilesCount] = useState(0);

  const setCount = (count) => {
    setClientProfilesCount(count);
  };

  return (
    <AdminPage>
      <div className="p-4">
        <TableHeader
          tableName={'Profili Cliente'}
          buttons={[
            {
              function: () => {
                history.push(`/settings/profiliCliente/crea`);
              },
              label: '+',
            },
          ]}
          length={clientProfilesCount}
        />

        <div className="bg-white rounded-lg shadow-lg  p-0">
          <ClientProfilesTable role={'client'} setCount={setCount} />
        </div>
      </div>
    </AdminPage>
  );
};

export default ClientAccounts;
