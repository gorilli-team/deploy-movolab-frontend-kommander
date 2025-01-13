import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import SettingsPage from '../../../components/Settings/SettingsPage';
import { http } from '../../../utils/Utils';
import { CLIENT_ROLE_ADMIN } from '../../../utils/Utils';
import CardsHeader from '../../../components/UI/CardsHeader';
import ClientUsage from '../../../components/Subscriptions/ClientUsage';
import SubscriptionInfo from '../../../components/Subscriptions/SubscriptionInfo';
import TableHeaderTab from '../../../components/UI/TableHeaderTab';
import SepaComponent from '../../../components/Subscriptions/SepaComponent';
import ClientPayments from '../../../components/ClientPayments/ClientPayments';
import { useHistory } from 'react-router-dom';
import WhiteBox from '../../../components/UI/WhiteBox';
import LoadingSpinner from '../../../assets/icons/LoadingSpinner';

const SubscriptionDetails = () => {
  const query = new URLSearchParams(window.location.search);
  const tab = query.get('tab');

  const [planMonths, setPlanMonths] = useState(null);
  const [loadedMonths, setLoadedMonths] = useState(0);
  const [fieldToUpdate, setFieldToUpdate] = useState(tab || 'subscription');
  const [client, setClient] = useState(null);
  const history = useHistory();

  useEffect(() => {
    fetchClient();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLoadedMonths(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldToUpdate]);

  const fetchClient = async () => {
    try {
      const response = await http({
        method: 'GET',
        url: `/clients/client`,
      });

      setClient(response);
      const createdAt = new Date(response?.createdAt);
      createdAt.setDate(1); // set the day to the first day of the month
      const now = new Date();
      now.setDate(1); // set the day to the first day of the month
      const months = [];

      while (createdAt <= now) {
        months.push(new Date(createdAt.getFullYear(), createdAt.getMonth(), 1));
        createdAt.setMonth(createdAt.getMonth() + 1);
      }

      // Add the current month if not already in the array
      if (
        !months.some(
          (month) =>
            month.getMonth() === now.getMonth() && month.getFullYear() === now.getFullYear(),
        )
      ) {
        months.push(new Date(now.getFullYear(), now.getMonth(), 1));
      }

      months.reverse();
      setPlanMonths(months);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const onSubTabLoad = (month) => {
    setLoadedMonths(loadedMonths + 1);
  }

  return (
    <SettingsPage canAccess={[CLIENT_ROLE_ADMIN]} hasBox={false}>
      <CardsHeader
        title="Abbonamento"
        buttons={[
          {
            btnStyle: 'lightSlateTransparent',
            children: '« Indietro',
            onClick: () => history.goBack(),
            // hiddenIf: !showUpdate,
          },
        ]}
      />

      <WhiteBox className="mt-0 !overflow-visible">
        <SubscriptionInfo />

        <TableHeaderTab
          buttons={[
            {
              label: 'Abbonamento',
              function: () => {
                setFieldToUpdate('subscription');
              },
              selected: fieldToUpdate === 'subscription',
            },
            {
              label: 'Pagamenti',
              function: () => {
                setFieldToUpdate('pagamenti');
              },
              selected: fieldToUpdate === 'pagamenti',
            },
            {
              label: 'Fatture',
              function: () => {
                setFieldToUpdate('fatture');
              },
              selected: fieldToUpdate === 'fatture',
            },
            {
              label: 'Metodi di pagamento',
              function: () => {
                setFieldToUpdate('metodiPagamento');
              },
              selected: fieldToUpdate === 'metodiPagamento',
            },
          ]}
        />

        <div className="bg-slate-200 border-4 rounded-b-2xl border-white py-2 relative z-10 min-h-48">
          {fieldToUpdate === 'subscription' && (
            <>
              {planMonths !== null ?
                <>
                  {planMonths.length >= loadedMonths ? <LoadingSpinner className="absolute w-full h-full bg-slate-500/10 z-10 rounded-b-2xl top-0" addText /> : null}
                  <div className="flex flex-col-reverse md:flex-row space-x-0 md:space-x-4 px-6">
                    <div className="w-full md:w-full order-last md:order-first">
                      {(planMonths || []).map((month, index) => (
                        <ClientUsage key={index} month={month} onLoaded={onSubTabLoad} />
                      ))}
                    </div>
                  </div>
                </>
                : <LoadingSpinner addText />}
            </>
          )}
          {fieldToUpdate === 'pagamenti' && (
            <ClientPayments client={client} showTab={fieldToUpdate} />
          )}
          {fieldToUpdate === 'fatture' && (
            <ClientPayments client={client} showTab={fieldToUpdate} />
          )}
          {fieldToUpdate === 'metodiPagamento' && (
            <ClientPayments client={client} showTab={fieldToUpdate} />
          )}
          {fieldToUpdate === 'sepa' && (
            <SepaComponent />
          )}
        </div>
      </WhiteBox>
    </SettingsPage>
  );
};

export default SubscriptionDetails;
