import React, { useContext, useEffect, useState } from 'react';
import AdminPage from '../../../components/Admin/AdminPage';

import { UserContext } from '../../../store/UserContext';
import InvoicesTable from '../../../components/Invoices/InvoicesTable';
import TableHeader from '../../../components/UI/TableHeader';
import toast from 'react-hot-toast';
import { http } from '../../../utils/Utils';
import { MOVOLAB_ROLE_ADMIN } from '../../../utils/Utils';
import PlusOutlineCircle from '../../../assets/icons/PlusOutlineCircle';
import ModalExtractInvoices from '../../../components/Invoices/ModalExtractInvoices';

const InvoicingDashboard = () => {
  const userContext = useContext(UserContext);
  const [userData, setUserData] = useState({}); //eslint-disable-line
  const [invoicesCount, setInvoicesCount] = useState(0);
  const [invoices, setInvoices] = useState({});
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    getClientProfileData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchInvoices(0, 10);
  }, []);

  const updateShowModal = () => {
    setShowModal(!showModal);
  };

  const getClientProfileData = async () => {
    setUserData(await userContext.getUserInfo());
  };

  const fetchInvoices = async (skip = 0, limit = 10) => {
    try {
      const response = await http({
        url: `/admin/invoice?skip=${skip}&limit=${limit}`,
      });
      setInvoices(response.invoices);
      setInvoicesCount(response.count);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  return (
    <AdminPage canAccess={[MOVOLAB_ROLE_ADMIN]}>
      <TableHeader
        tableName="Fatture"
        length={invoicesCount}
        buttons={[
          {
            function: () => {
              setShowModal(true);
            },
            label: 'Estrazione massiva',
            svgIco: <PlusOutlineCircle />,
          },
        ]}
      />

      <InvoicesTable {...{ fetchInvoices, invoices, invoicesCount: invoicesCount }} />
      <ModalExtractInvoices
        showModal={showModal}
        updateShowModal={updateShowModal}
        type={'movolab'}
      />
    </AdminPage>
  );
};

export default InvoicingDashboard;
