import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useHistory } from 'react-router-dom';
import { MOVOLAB_ROLE_ADMIN, http } from '../../../utils/Utils';
import TableHeader from '../../../components/UI/TableHeader';
import AdminPage from '../../../components/Admin/AdminPage';
import PacksTable from '../../../components/Packs/PacksTable';

const AdminPacks = () => {
  const history = useHistory();

  const [packsCount, setPacksCount] = useState([]);

  useEffect(() => {
    fetchPacks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPacks = async () => {
    try {
      const response = await http({ url: '/clientPayments/packs' });

      setPacksCount(response.count);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  return (
    <AdminPage canAccess={MOVOLAB_ROLE_ADMIN}>
      <TableHeader
        tableName={'Packs'}
        buttons={[
          {
            function: () => {
              history.push(`/admin/packs/crea`);
            },
            label: '+',
          },
        ]}
        length={packsCount}
      />

      <PacksTable />
    </AdminPage>
  );
};

export default AdminPacks;
