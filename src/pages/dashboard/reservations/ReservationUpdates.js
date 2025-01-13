import React, { useEffect, useState } from 'react';
import { useParams, useHistory, Link } from 'react-router-dom';
import Page from '../../../components/Dashboard/Page';
import UpdateEventsTable from '../../../components/UpdateEvents/UpdateEventsTable';
import { http } from '../../../utils/Utils';
import { CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR } from '../../../utils/Utils';
import CardsHeader from '../../../components/UI/CardsHeader';
import WhiteBox from '../../../components/UI/WhiteBox';
import { FaLink } from 'react-icons/fa6';

const ReservationUpdates = () => {
  const params = useParams();
  const history = useHistory();
  const [reservation, setReservation] = useState({});

  const fetchReservation = async () => {
    try {
      const response = await http({ url: `/reservations/${params.id}` });

      setReservation(response);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchReservation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Page canAccess={[CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR]} bodyClassName={'pb-4'}>
      <CardsHeader
        title="Aggiornamenti prenotazione"
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
            <strong className="font-medium">{reservation?.code}</strong>
          </h1>
          {reservation?.rent && reservation?.rent?._id !== null && (
            <div className="font-medium text-xs text-gray-500">
              <span className="font-semibold">Movo associato: {''}</span>
              <Link className="text-gray-500" to={`/dashboard/movimenti/${reservation?.rent?._id}`}>
                {reservation?.rent?.code} <FaLink className="inline mb-1 text-blue-600" />
              </Link>
            </div>
          )}
        </div>

        <UpdateEventsTable collectionName={'reservations'} id={params.id} />
      </WhiteBox>
    </Page>
  );
};

export default ReservationUpdates;
