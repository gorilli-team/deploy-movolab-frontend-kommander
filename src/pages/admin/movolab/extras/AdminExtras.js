import React, { useEffect, useState } from 'react';
import AdminPage from '../../../../components/Admin/AdminPage';
import { toast } from 'react-hot-toast';
import { MOVOLAB_ROLE_ADMIN, http } from '../../../../utils/Utils';
import ExtrasTable from '../../../../components/Clients/Prices/ExtrasTable';
import TableHeader from '../../../../components/UI/TableHeader';

import { useHistory } from 'react-router-dom';

const AdminExtras = () => {
  const history = useHistory();
  const [extrasCount, setExtrasCount] = useState([]);

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
    <AdminPage canAccess={MOVOLAB_ROLE_ADMIN}>
      <TableHeader
        tableName={'Extra'}
        buttons={[
          {
            function: () => {
              history.push(`/admin/movolab/extra/crea`);
            },
            label: '+',
          },
        ]}
        length={extrasCount}
      />

      <ExtrasTable />
    </AdminPage>
  );
};

export default AdminExtras;
