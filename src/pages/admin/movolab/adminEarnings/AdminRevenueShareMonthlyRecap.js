import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useHistory, useParams } from 'react-router-dom';
import { MOVOLAB_ROLE_ADMIN, http } from '../../../../utils/Utils';

import AdminPage from '../../../../components/Admin/AdminPage';
import Button from '../../../..//components/UI/buttons/Button';
import RevenueShareMonthlyRecapDetails from '../../../../components/RevenueShares/RevenueShareMonthlyRecapDetails';

const AdminRevenueShareMonthlyRecap = () => {
  const params = useParams();
  const history = useHistory();
  const [revenueShareMonthlyRecap, setRevenueShareMonthlyRecap] = useState({});

  useEffect(() => {
    fetchRevenueShareMonthlyRecap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRevenueShareMonthlyRecap = async () => {
    try {
      const response = await http({
        url: `/clientPayments/revenueShareMonthlyRecap/${params.id}`,
      });
      setRevenueShareMonthlyRecap(response);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const generateFatturaElettronica = async () => {
    try {
      const response = await http({
        url: `/clientPayments/revenueShareMonthlyRecap/fatturaElettronica`,
        method: 'POST',
        form: {
          revenueShareMonthlyRecapId: revenueShareMonthlyRecap?._id,
        },
      });

      const element = document.createElement('a');
      const file = new Blob([response.fatturaElettronica], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      // element.download = `${revenueShareMonthlyRecap?._id}.xml`;
      element.download = `test.xml`;
      document.body.appendChild(element); // Required for this to work in FireFox
      element.click();

      toast.success('Scarico la fattura elettronica');
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  return (
    <AdminPage canAccess={MOVOLAB_ROLE_ADMIN}>
      <div className="p-4 w-full">
        <div className="flex space-x-4 justify-between">
          <div>
            <Button btnStyle={'lightGray'} onClick={() => history.goBack()}>
              Indietro
            </Button>
          </div>
          <div className="space-x-2">
            {revenueShareMonthlyRecap?.status === 'closed' && (
              <Button onClick={generateFatturaElettronica}>Scarica XML</Button>
            )}
          </div>
        </div>
        <RevenueShareMonthlyRecapDetails
          monthlyRecap={revenueShareMonthlyRecap}
          showDetails={true}
        />
        <div className="mb-4 mt-2"></div>
      </div>
    </AdminPage>
  );
};

export default AdminRevenueShareMonthlyRecap;
