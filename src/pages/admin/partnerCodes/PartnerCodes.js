import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useHistory } from 'react-router-dom';
import { MOVOLAB_ROLE_ADMIN, http } from '../../../utils/Utils';
import TableHeader from '../../../components/UI/TableHeader';
import AdminPage from '../../../components/Admin/AdminPage';
import PartnerCodesTable from '../../../components/PartnerCodes/PartnerCodesTable';

const AdminPacks = () => {
  const history = useHistory();

  const [partnerCodesCount, setPartnerCodesCount] = useState(0);
  const [partnerCodes, setPartnerCodes] = useState([]); // eslint-disable-line

  useEffect(() => {
    fetchPartnerCodes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPartnerCodes = async () => {
    try {
      const response = await http({ url: '/partnerCode' });

      setPartnerCodesCount(response.count);
      setPartnerCodes(response.partnerCodes);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  return (
    <AdminPage canAccess={MOVOLAB_ROLE_ADMIN}>
      <TableHeader
        tableName={'Codici Partner'}
        buttons={[
          {
            function: () => {
              history.push(`/admin/codicipartner/crea`);
            },
            label: '+',
          },
        ]}
        length={partnerCodesCount}
      />

      <PartnerCodesTable />
    </AdminPage>
  );
};

export default AdminPacks;
