import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import SettingsPage from '../../../components/Settings/SettingsPage';
import { http } from '../../../utils/Utils';
import { CLIENT_ROLE_ADMIN } from '../../../utils/Utils';
import CardsHeader from '../../../components/UI/CardsHeader';
import SubscriptionInfo from '../../../components/Subscriptions/SubscriptionInfo';
import TableHeaderTab from '../../../components/UI/TableHeaderTab';
import ClientPayouts from '../../../components/ClientPayments/ClientPayouts';
import { useHistory } from 'react-router-dom';
import WhiteBox from '../../../components/UI/WhiteBox';

const IncomeDetails = () => {
  const query = new URLSearchParams(window.location.search);
  const tab = query.get('tab');
  const message = query.get('message');
  const stripeConnectInfo = query.get('stripeConnect');

  const [fieldToUpdate, setFieldToUpdate] = useState(tab || 'payouts');
  const history = useHistory();

  useEffect(() => {
    fetchClient();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchClient = async () => {
    try {
      const response = await http({
        method: 'GET',
        url: `/clients/client`,
      });

      // setClient(response);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  return (
    <SettingsPage canAccess={[CLIENT_ROLE_ADMIN]} hasBox={false}>
      <CardsHeader
        title="Incasso"
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
              label: 'Metodo di incasso',
              function: () => {
                setFieldToUpdate('payouts');
              },
              selected: fieldToUpdate === 'payouts',
            },
          ]}
        />

        <div className="bg-slate-200 border-4 rounded-b-2xl border-white py-2">
          {fieldToUpdate === 'payouts' && (
            <ClientPayouts
              isClient={true}
              stripeConnectInfo={stripeConnectInfo}
              message={message}
            />
          )}
        </div>
      </WhiteBox>
    </SettingsPage>
  );
};

export default IncomeDetails;
