import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useHistory, useParams } from 'react-router-dom';
import { MOVOLAB_ROLE_ADMIN, http } from '../../../../utils/Utils';
// import { UserContext } from '../../../../store/UserContext';

import AdminPage from '../../../../components/Admin/AdminPage';
import Button from '../../../..//components/UI/buttons/Button';
import RevenueShareDetail from '../../../../components/RevenueShares/RevenueShareDetails';

const AdminRevenueShare = () => {
  const params = useParams();
  const history = useHistory();
  const [revenueShare, setRevenueShare] = useState({});

  useEffect(() => {
    fetchRevenueShare();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRevenueShare = async () => {
    try {
      const response = await http({ url: `/clientPayments/revenueShares/${params.id}` });
      setRevenueShare(response);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  return (
    <AdminPage canAccess={MOVOLAB_ROLE_ADMIN}>
      <div className="p-4 w-full">
        <div className="flex space-x-4">
          <Button btnStyle={'lightGray'} onClick={() => history.goBack()}>
            Indietro
          </Button>
        </div>

        <RevenueShareDetail revenueShare={revenueShare} />

        <div className="mb-4 mt-2"></div>
      </div>
    </AdminPage>
  );
};

export default AdminRevenueShare;
