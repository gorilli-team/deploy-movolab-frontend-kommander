import React, { useEffect, useState } from 'react';
import AdminPage from '../../../../components/Admin/AdminPage';
import DamagesTable from '../../../../components/Clients/Prices/DamagesTable';
import TableHeader from '../../../../components/UI/TableHeader';
import { MOVOLAB_ROLE_ADMIN, http } from '../../../../utils/Utils';

const AdminDamages = () => {
  const [damagesCount, setDamagesCount] = useState(0);

  useEffect(() => {
    fetchDamages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDamages = async (skip = 0, limit = 10) => {
    try {
      const response = await http({ url: `/pricing/damages?skip=${skip}&limit=${limit}` });
      setDamagesCount(response.count);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminPage canAccess={MOVOLAB_ROLE_ADMIN}>
      <TableHeader tableName={'Listini Danni'} buttons={[]} length={damagesCount} />
      <DamagesTable />
    </AdminPage>
  );
};

export default AdminDamages;
