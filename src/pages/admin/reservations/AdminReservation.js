import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useParams, useHistory } from 'react-router-dom';
import AdminPage from '../../../components/Admin/AdminPage';
import { http, MOVOLAB_ROLE_ADMIN } from '../../../utils/Utils';
import ReservationDetails from '../../../components/Reservations/ReservationDetails';
import CardsHeader from '../../../components/UI/CardsHeader';

const AdminReservation = () => {
  const params = useParams();
  const history = useHistory();
  const [reservation, setReservation] = useState({});

  const fetchReservation = async () => {
    try {
      const response = await http({ url: `/reservations/${params.id}` });
      setReservation(response);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  useEffect(() => {
    fetchReservation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AdminPage canAccess={[MOVOLAB_ROLE_ADMIN]} bodyClassName="pb-4">
      <CardsHeader
        title="Dettagli prenotazione"
        buttons={[
          {
            btnStyle: 'lightSlateTransparent',
            children: '« Indietro',
            onClick: () => history.goBack(),
          },
        ]}
      ></CardsHeader>

      <div>
        <ReservationDetails reservation={reservation} />
      </div>
    </AdminPage>
  );
};

export default AdminReservation;
