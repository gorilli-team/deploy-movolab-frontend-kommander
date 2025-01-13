import React, { useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import Page from '../../../components/Dashboard/Page';
import WhiteBox from '../../../components/UI/WhiteBox';
import { http } from '../../../utils/Utils';
import { CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR } from '../../../utils/Utils';
import InvoicesTable from '../../../components/Invoices/InvoicesTable';
import TableHeaderTab from '../../../components/UI/TableHeaderTab';
import TableHeader from '../../../components/UI/TableHeader';
import PlusOutlineCircle from '../../../assets/icons/PlusOutlineCircle';
import ModalExtractInvoices from '../../../components/Invoices/ModalExtractInvoices';
import { UserContext } from '../../../store/UserContext';

const InvoicingDashboard = () => {
  const [showModal, setShowModal] = useState(false);
  const { data: userData } = useContext(UserContext);
  const hasClientLicense = userData?.client?.license?.licenseOwner === 'client';

  const [invoicesCount, setInvoicesCount] = useState({ movolab: null, customer: null });

  const search = useLocation().search;
  const page = new URLSearchParams(search).get('page');
  const [invoicingType, setInvoicingType] = useState(page || 'movolab');

  useEffect(() => {
    fetchCounts();
  }, [invoicingType]);

  useEffect(() => {
    setInvoicingType('customer');
  }, [hasClientLicense]);

  const updateShowModal = () => {
    setShowModal(!showModal);
  };

  const fetchCounts = async () => {
    try {
      const movolabInvs = await http({ url: `/invoice?skip=0&limit=1&invoicingType=movolab` });
      const customerInvs = await http({ url: `/invoice?skip=0&limit=1&invoicingType=customer` });

      setInvoicesCount({ movolab: movolabInvs.count, customer: customerInvs.count });
    } catch (err) {
      console.error(err);
    }
  };

  const updateInvoicingType = (userType) => {
    var newurl =
      window.location.protocol +
      '//' +
      window.location.host +
      window.location.pathname +
      '?page=' +
      userType;
    window.history.pushState({ path: newurl }, '', newurl);
    setInvoicingType(userType);
  };

  return (
    <Page canAccess={[CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR]}>
      <WhiteBox>
        <TableHeader
          tableName="Fatture"
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

        <TableHeaderTab
          buttons={[
            {
              label: 'Movolab' + (invoicesCount?.movolab ? ' (' + invoicesCount.movolab + ')' : ''),
              function: () => updateInvoicingType('movolab'),
              selected: invoicingType === 'movolab',
              hiddenIf: hasClientLicense
            },
            {
              label:
                'Le tue fatture' +
                (invoicesCount?.customer ? ' (' + invoicesCount.customer + ')' : ''),
              function: () => updateInvoicingType('customer'),
              selected: invoicingType === 'customer',
            },
          ]}
        />

        <InvoicesTable {...{ invoicingType }} />
        <ModalExtractInvoices showModal={showModal} updateShowModal={updateShowModal} />
      </WhiteBox>
    </Page>
  );
};

export default InvoicingDashboard;
