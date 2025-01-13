import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useHistory } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import Page from '../../../components/Dashboard/Page';
import { http } from '../../../utils/Utils';
import { CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR } from '../../../utils/Utils';
import EditReservation from '../../../components/Reservations/EditReservation';
import WhiteButton from '../../../components/UI/buttons/WhiteButton';
import Button from '../../../components/UI/buttons/Button';
import { FaSearch } from 'react-icons/fa';

const UpdateReservation = () => {
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

  const updateReservation = async (data) => {
    try {
      const response = await http({
        method: 'PUT',
        url: `/reservations/${params.id}`,
        form: data,
      });
      setReservation(response);
      toast.success('Prenotazione aggiornata');
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
    <Page canAccess={[CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR]}>
      <div className="p-6">
        <div className="flex space-x-2">
          <WhiteButton onClick={() => history.goBack()}>Indietro</WhiteButton>
        </div>{' '}
        <EditReservation reservation={reservation} updateReservation={updateReservation} />

        {reservation._id && (
          <div className="text-center">
            <Button
              btnStyle="unstyled"
              className="text-slate-500 underline text-xs"
              to={`/dashboard/prenotazioni/${reservation?._id}/aggiornamenti`}
            >
              <FaSearch className="inline mb-1" /> Log aggiornamenti
            </Button>
          </div>
        )}
      </div>
    </Page>
  );
};

export default UpdateReservation;
