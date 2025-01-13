import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import SettingsPage from '../../../components/Settings/SettingsPage';
import { useParams } from 'react-router-dom';
import { http } from '../../../utils/Utils';
import { CLIENT_ROLE_ADMIN } from '../../../utils/Utils';
import WhiteBox from '../../../components/UI/WhiteBox';
import CardsHeader from '../../../components/UI/CardsHeader';
import ClientUsage from '../../../components/Subscriptions/ClientUsage';
import ClientInvoiceAdditionalDetails from '../../../components/ClientPayments/ClientInvoiceAdditionalDetails';

const MonthlySubscriptionDetails = () => {
  const [, setPlanMonths] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const params = useParams();

  useEffect(() => {
    fetchClient();
    fetchInvoice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchInvoice = async () => {
    try {
      const response = await http({
        method: 'GET',
        url: `/clients/clientInvoice/byMonth/${params.month}`,
      });

      setInvoices(response);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const fetchClient = async () => {
    try {
      const response = await http({
        method: 'GET',
        url: `/clients/client`,
      });

      const createdAt = new Date(response?.createdAt);
      createdAt.setDate(1); // set the day to the first day of the month
      const now = new Date();
      now.setDate(1); // set the day to the first day of the month
      const months = [];

      while (createdAt <= now) {
        months.push(new Date(createdAt.getFullYear(), createdAt.getMonth(), 1));
        createdAt.setMonth(createdAt.getMonth() + 1);
      }

      months.reverse();
      setPlanMonths(months);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  return (
    <SettingsPage canAccess={[CLIENT_ROLE_ADMIN]} hasBox={false}>
      <CardsHeader
        title={'Dettagli abbonamento mensile'}
        buttons={[
          {
            btnStyle: 'lightSlateTransparent',
            children: '« Indietro',
          },
        ]}
      />

      <div className="flex flex-col-reverse md:flex-row space-x-0 md:space-x-4 px-6">
        <div className="w-full order-last md:order-first">
          <ClientUsage month={params.month} isExpanded={true} />
          {invoices ? (
            invoices.map((invoice) => (
              <WhiteBox key={invoice._id} className="mt-4">
                <ClientInvoiceAdditionalDetails invoice={invoice} />
              </WhiteBox>
            ))
          ) : (
            <>Nessuna fattura</>
          )}
        </div>
      </div>
    </SettingsPage>
  );
};

export default MonthlySubscriptionDetails;
