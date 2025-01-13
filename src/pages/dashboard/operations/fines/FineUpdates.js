import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import Page from '../../../../components/Dashboard/Page';
import UpdateEventsTable from '../../../../components/UpdateEvents/UpdateEventsTable';
import { http } from '../../../../utils/Utils';
import { CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR } from '../../../../utils/Utils';
import CardsHeader from '../../../../components/UI/CardsHeader';
import WhiteBox from '../../../../components/UI/WhiteBox';

const FineUpdates = () => {
  const params = useParams();
  const history = useHistory();
  const [fine, setFine] = useState({});

  const fetchFine = async () => {
    try {
      const response = await http({ url: `/fines/${params.id}` });

      setFine(response);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFine();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Page canAccess={[CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR]} bodyClassName={'pb-4'}>
      <CardsHeader
        title="Aggiornamenti multa"
        buttons={[
          {
            btnStyle: 'lightSlateTransparent',
            children: '« Indietro',
            onClick: () => history.goBack(),
          },
        ]}
      />

      <WhiteBox className="mx-6 my-0">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-semibold">
            <strong className="font-medium">Multa {fine?.code}</strong>
          </h1>
        </div>

        <UpdateEventsTable collectionName={'fines'} id={params.id} />
      </WhiteBox>
    </Page>
  );
};

export default FineUpdates;
