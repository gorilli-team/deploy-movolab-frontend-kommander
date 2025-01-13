import React, { useEffect, useState } from 'react';
import { useParams, useHistory, Link } from 'react-router-dom';
import Page from '../../../components/Dashboard/Page';
import UpdateEventsTable from '../../../components/UpdateEvents/UpdateEventsTable';
import { http } from '../../../utils/Utils';
import { CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR } from '../../../utils/Utils';
import WhiteBox from '../../../components/UI/WhiteBox';
import CardsHeader from '../../../components/UI/CardsHeader';
import { FaLink } from 'react-icons/fa6';

const RentUpdates = () => {
  const params = useParams();
  const history = useHistory();
  const [rent, setRent] = useState({});

  const fetchRent = async () => {
    try {
      const response = await http({ url: `/rents/${params.id}` });

      setRent(response);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Page canAccess={[CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR]} bodyClassName={'pb-4'}>
      <CardsHeader
        title="Aggiornamenti movo"
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
            <strong className="font-medium">{rent?.code}</strong>
          </h1>
          {rent?.reservation && rent?.reservation?._id !== null && (
            <div className="font-medium text-xs text-gray-500">
              <span className="font-semibold">Prenotazione Associata: {''}</span>
              <Link
                className="text-gray-500"
                to={`/dashboard/prenotazioni/${rent?.reservation?._id}`}
              >
                {rent?.reservation?.code} <FaLink className="inline mb-1 text-blue-600" />
              </Link>
            </div>
          )}
        </div>

        <UpdateEventsTable collectionName={'rents'} id={params.id} />
      </WhiteBox>
    </Page>
  );
};

export default RentUpdates;
