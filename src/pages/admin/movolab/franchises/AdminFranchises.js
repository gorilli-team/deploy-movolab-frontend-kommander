import React, { useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useHistory } from 'react-router-dom';
import { MOVOLAB_ROLE_ADMIN, http } from '../../../../utils/Utils';
import AdminPage from '../../../../components/Admin/AdminPage';
import TableHeader from '../../../../components/UI/TableHeader';
import FranchisesTable from '../../../../components/Vehicles/Franchises/FranchisesTable';
import { UserContext } from '../../../../../src/store/UserContext';

const AdminFranchises = () => {
  const history = useHistory();
  const [franchisesCount, setFranchisesCount] = useState(0);

  const { data: currentClient } = useContext(UserContext);
  const license = currentClient?.client?.license?.licenseOwner;

  useEffect(() => {
    fetchFranchises();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchFranchises = async () => {
    try {
      const response = await http({ url: '/vehicles/franchise' });
      setFranchisesCount(response.count);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  return (
    <AdminPage canAccess={MOVOLAB_ROLE_ADMIN}>
        {license === 'movolab' ? (
          <TableHeader tableName={'Franchigie'} buttons={[]} length={franchisesCount} />
        ) : (
          <TableHeader
            tableName={'Franchigie'}
            buttons={[
              {
                function: () => {
                  history.push(`/admin/movolab/franchigie/crea`);
                },
                label: '+',
              },
            ]}
            length={franchisesCount}
          />
        )}

        <FranchisesTable />
    </AdminPage>
  );
};

export default AdminFranchises;
