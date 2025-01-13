import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useParams, useHistory, useLocation } from 'react-router-dom';
import CorporatePage from '../../../components/Corporate/CorporatePage';
import { CORPORATE_ROLE_ADMIN, CORPORATE_ROLE_OPERATOR, http } from '../../../utils/Utils';
import ReservationDetails from '../../../components/Reservations/ReservationDetails';
import CardsHeader from '../../../components/UI/CardsHeader';
import Stepper from '../../../components/UI/Stepper';
import { FaSearch } from 'react-icons/fa';
import Button from '../../../components/UI/buttons/Button';
import ModalConfirmDialog from '../../../components/UI/ModalConfirmDialog';

const CorporateReservation = () => {
  const params = useParams();
  const history = useHistory();
  const search = useLocation().search;
  const [reservation, setReservation] = useState({});
  const [cancelReservationConfirm, setCancelReservationConfirm] = useState(false);
  const from = new URLSearchParams(search).get('from');

  const fetchReservation = async () => {
    try {
      const response = await http({ url: `/reservations/${params.id}` });
      setReservation(response);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const goBackPage = () => {
    if (from === 'calendar') {
      history.push('/corporate/calendario');
    } else {
      history.goBack();
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
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const cancelReservation = async (confirm = false) => {
    if (!confirm) {
      setCancelReservationConfirm(true);
      return;
    }

    try {
      updateReservation({ ...reservation, state: 'annullato' });
      fetchReservation();
      setCancelReservationConfirm(false);
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
    <CorporatePage
      canAccess={[CORPORATE_ROLE_ADMIN, CORPORATE_ROLE_OPERATOR]}
      bodyClassName={'pb-4'}
    >
      <CardsHeader
        title="Dettagli prenotazione"
        buttons={[
          {
            btnStyle: 'lightSlateTransparent',
            children: '« Indietro',
            onClick: () => goBackPage(),
          },
          {
            btnStyle: 'lightSlateTransparent',
            children: 'Annulla prenotazione',
            className: 'text-red-500',
            onClick: () => cancelReservation(),
            hiddenIf: !reservation || reservation?.state !== 'draft',
          },
          {
            btnStyle: 'lightSlateTransparent',
            children: 'Stampa',
            to: `./${reservation?._id}/stampa`,
            hiddenIf: !reservation || reservation?.state !== 'aperto',
          },
        ]}
      >
        {reservation?.state === 'draft' && (
          <Stepper
            className="pr-[12rem]"
            colorScheme="orange"
            steps={[{ content: '1' }, { content: '2', isCurrent: true }]}
          />
        )}
      </CardsHeader>

      <div>
        <ReservationDetails
          reservation={reservation}
          fetchReservation={fetchReservation}
          fromCorporate={true}
        />

        {reservation._id && (
          <div className="text-center">
            <Button
              btnStyle="unstyled"
              className="text-slate-500 underline text-xs"
              to={`/corporate/prenotazioni/${reservation?._id}/aggiornamenti`}
            >
              <FaSearch className="inline mb-1" /> Log aggiornamenti
            </Button>
          </div>
        )}
      </div>

      <ModalConfirmDialog
        isVisible={cancelReservationConfirm}
        title="Continuando, questa prenotazione verrà annullata."
        description="Annullare la prenotazione?"
        handleCancel={() => setCancelReservationConfirm(false)}
        handleOk={() => cancelReservation(true)}
        cancelText="Torna ai dettagli"
        okText="Annulla prenotazione"
      />
    </CorporatePage>
  );
};

export default CorporateReservation;
