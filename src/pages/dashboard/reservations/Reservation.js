import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useParams, useHistory, useLocation } from 'react-router-dom';
import Page from '../../../components/Dashboard/Page';
import { http } from '../../../utils/Utils';
import { CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR } from '../../../utils/Utils';
import ReservationDetails from '../../../components/Reservations/ReservationDetails';
import CardsHeader from '../../../components/UI/CardsHeader';
import { calculateReservationTotals } from '../../../utils/Reservation';
import Stepper from '../../../components/UI/Stepper';
import { FaSearch } from 'react-icons/fa';
import Button from '../../../components/UI/buttons/Button';
import ModalConfirmDialog from '../../../components/UI/ModalConfirmDialog';

const Reservation = () => {
  const params = useParams();
  const history = useHistory();
  const search = useLocation().search;
  const from = new URLSearchParams(search).get('from');
  const [reservation, setReservation] = useState({});
  const [cancelReservationConfirm, setCancelReservationConfirm] = useState(false);

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
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const completeReservation = async () => {
    try {
      const updatedReservation = await http({
        url: '/reservations/' + params.id,
      });

      const reservationTotals = calculateReservationTotals(
        updatedReservation,
        updatedReservation?.workflow?.administration?.prepaidRent,
      );

      const outstandingPayments =
        reservationTotals.missingMovolab + reservationTotals.missingCustomer;

      if (
        updatedReservation?.workflow?.administration?.prepaidReservation > 0 &&
        outstandingPayments > 0
      ) {
        toast.error(`Non è possibile aprire la prenotazione con pagamenti in sospeso`);
      } else {
        const data = {
          state: 'aperto',
        };
        await http({
          url: '/reservations/' + params.id,
          method: 'PUT',
          form: data,
        });
        toast.success('Prenotazione aperta con successo');
      }

      fetchReservation();
    } catch (e) {
      console.error(e);
      toast.error('Errore durante apertura della prenotazione');
    }
  };

  const setNoShow = async () => {
    try {
      if (reservation.workflow?.administration?.noShowFee) {
        const newTotalAmount =
          (reservation.price.totalAmount * reservation.workflow?.administration?.noShowFee) / 100;

        const noShowFee = reservation.workflow?.administration?.noShowFee;
        const reservationUpdated = {
          ...reservation,
          state: 'no show',
          noShowPercentageApplied: noShowFee,
          price: {
            ...reservation.price,
            totalAmount: newTotalAmount,
          },
        };

        updateReservation(reservationUpdated);
        fetchReservation();
      } else {
        const reservationUpdated = {
          ...reservation,
          state: 'no show',
        };

        updateReservation(reservationUpdated);
        fetchReservation();
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const openMovement = async () => {
    try {
      history.push(`/dashboard/movimenti/crea?prenotazione=${reservation._id}`);
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

  const goBackPage = () => {
    if (from === 'calendar') {
      history.push('/dashboard/calendario');
    } else {
      history.goBack();
    }
  };

  useEffect(() => {
    fetchReservation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Page canAccess={[CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR]} bodyClassName={'pb-4'}>
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
            children: 'No Show',
            onClick: (e) => setNoShow(e),
            hiddenIf: !reservation || reservation?.state !== 'aperto',
          },
          {
            btnStyle: 'lightSlateTransparent',
            children: 'Stampa',
            to: `./${reservation?._id}/stampa`,
            hiddenIf: !reservation || reservation?.state !== 'aperto',
          },
          {
            btnStyle: 'lightSlateTransparent',
            children: 'Annulla prenotazione',
            className: 'text-red-500',
            onClick: () => cancelReservation(),
            hiddenIf:
              !reservation || (reservation?.state !== 'aperto' && reservation?.state !== 'draft'),
          },
          {
            children: 'Apri movo',
            onClick: (e) => openMovement(e),
            hiddenIf: !reservation || reservation?.state !== 'aperto',
          },
          {
            children: 'Apri prenotazione',
            onClick: (e) => completeReservation(e),
            hiddenIf: !reservation || reservation?.state !== 'draft',
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
        <ReservationDetails reservation={reservation} fetchReservation={fetchReservation} />

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

      <ModalConfirmDialog
        isVisible={cancelReservationConfirm}
        title="Continuando, questa prenotazione verrà annullata."
        description="Annullare la prenotazione?"
        handleCancel={() => setCancelReservationConfirm(false)}
        handleOk={() => cancelReservation(true)}
        cancelText="Torna ai dettagli"
        okText="Annulla prenotazione"
      />
    </Page>
  );
};

export default Reservation;
