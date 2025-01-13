import React, { useEffect, useState } from 'react';
import { useParams, useHistory, useLocation } from 'react-router-dom';
import { http } from '../../../utils/Utils';
import { CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR } from '../../../utils/Utils';
import Page from '../../../components/Dashboard/Page';
import RentDetails from '../../../components/Rents/Details';
import CardsHeader from '../../../components/UI/CardsHeader';
import toast from 'react-hot-toast';
import { RouterPrompt } from '../../../components/UI/RouterPrompt';
import Button from '../../../components/UI/buttons/Button';
import { FaSearch } from 'react-icons/fa';
import ModalConfirmDialog from '../../../components/UI/ModalConfirmDialog';
const moment = require('moment');

const Rent = () => {
  const params = useParams();
  const history = useHistory();
  const search = useLocation().search;
  const [rent, setRent] = useState({});
  const [cancelRentConfirm, setCancelRentConfirm] = useState(false);
  const from = new URLSearchParams(search).get('from');

  useEffect(() => {
    fetchRent(params.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRent = async (id) => {
    try {
      if (!id) return;
      const response = await http({ url: `/rents/${id}` });

      if (!response || !response._id) {
        toast.error('Errore nel caricamento del movo. Movo non presente.');
        return;
      }
      setRent(response);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore nel caricamento del movo. Movo non presente.');
      history.push('/dashboard/movimenti');
    }
  };

  const goBackPage = () => {
    if (from === 'calendar') {
      history.push('/dashboard/calendario');
    } else {
      history.goBack();
    }
  };

  const reopenRent = async () => {
    try {
      await http({
        url: `/rents/${rent?._id}`,
        method: 'PUT',
        form: { state: 'aperto' },
      });
      toast.success('Movo riaperto con successo');

      // Refreshino
      window.location.reload(false);
    } catch (error) {
      console.error(error);
    }
  };

  const updateMovo = async () => {
    try {
      const update = {
        dropOffDate: moment().format(),
      };

      await http({
        url: `/rents/${rent?._id}`,
        method: 'PUT',
        form: update,
      });

      history.push(`/dashboard/movimenti/${rent?._id}/riepilogo`);
    } catch (error) {
      console.error(error);
    }
  };

  const cancelRent = async (confirm = false) => {
    if (!confirm) {
      setCancelRentConfirm(true);
      return;
    }

    try {
      const response = await http({
        url: '/rents/' + rent?._id,
        method: 'PUT',
        form: { state: 'annullato' },
      });
      if (response) {
        setCancelRentConfirm(false);

        // Refreshino
        window.location.reload(false);
      }
    } catch (e) {
      console.error(e);
      toast.error('Errore durante il salvataggio del movimento');
    }
  };

  const depositBlocking = 
    !['bozza', 'aperto'].includes(rent?.state) &&
    rent?.paidDeposit ? !rent?.refundedDeposit : false;

  const phase = rent.state !== 'aperto' ? 'dropOff' : 'pickUp';
  var docsBlocking = false;

  if (
    rent.state !== 'annullato' &&
    phase === 'pickUp' &&
    rent?.pickUpState &&
    rent?.signature?.pickUp?.otp &&
    rent.signature.pickUp.otp.verified !== true
  ) {
    const docFound = rent.pickUpState.documents.find((doc) => doc.label === 'pickupcontract');

    if (!docFound?.fileUrl) {
      docsBlocking = true;
    }
  }

  if (
    rent.state !== 'annullato' &&
    phase === 'dropOff' &&
    rent?.dropOffState &&
    rent?.signature?.dropOff?.otp &&
    rent.signature.dropOff.otp.verified !== true
  ) {
    const docFound = rent.dropOffState.documents.find((doc) => doc.label === 'dropoffcontract');

    if (!docFound?.fileUrl) {
      docsBlocking = true;
    }
  }

  const movoPrintLink =
    rent.state !== 'aperto'
      ? `/dashboard/movimenti/${rent?._id}/stampa/dropOff`
      : `/dashboard/movimenti/${rent?._id}/stampa/pickUp`;

  return (
    <Page canAccess={[CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR]} bodyClassName={'pb-4'}>
      <CardsHeader
        title="Dettagli movo"
        buttons={[
          {
            btnStyle: 'lightSlateTransparent',
            children: '« Indietro',
            onClick: goBackPage,
          },
          {
            btnStyle: 'lightSlateTransparent',
            children: 'Firma',
            to: movoPrintLink,
            hiddenIf: !rent || rent.state === 'draft',
          },
          {
            btnStyle: 'lightSlateTransparent',
            children: 'Annulla movo',
            className: 'text-red-500',
            onClick: () => cancelRent(),
            hiddenIf: !['bozza', 'aperto'].includes(rent?.state)
          },
          {
            btnStyle: 'lightSlateTransparent',
            children: 'Modifica Movo',
            onClick: reopenRent,
            hiddenIf: !['chiuso', 'stornato'].includes(rent?.state),
          },
          {
            btnStyle: 'blue',
            children: 'Cassa',
            to: `./${rent?._id}/cassa`,
            hiddenIf: !(
              rent &&
              rent._id &&
              (rent.state === 'chiuso' ||
                rent.state === 'fatturato' ||
                rent.state === 'parz fatturato' ||
                rent.state === 'parz incassato')
            ),
          },
          {
            children: 'Chiusura Movo',
            onClick: updateMovo,
            hiddenIf: !(
              rent &&
              rent._id &&
              rent.state !== 'chiuso' &&
              rent.state !== 'annullato' &&
              rent.state !== 'fatturato' &&
              rent.state !== 'parz fatturato' &&
              rent.state !== 'incassato' &&
              rent.state !== 'parz incassato' &&
              rent.state !== 'stornato'
            ),
          },
        ]}
      />

      <div className="px-6">
        <RentDetails rent={rent} phase={phase} updateRent={() => fetchRent(params.id)} />

        {rent._id && (
          <div className="text-center">
            <Button
              btnStyle="unstyled"
              className="text-slate-500 underline text-xs"
              to={`/dashboard/movimenti/${rent?._id}/aggiornamenti`}
            >
              <FaSearch className="inline mb-1" /> Log aggiornamenti
            </Button>
          </div>
        )}
      </div>

      <ModalConfirmDialog
        isVisible={cancelRentConfirm}
        title="Continuando, questo movo verrà annullato."
        description="Annullare il movo?"
        handleCancel={() => setCancelRentConfirm(false)}
        handleOk={() => cancelRent(true)}
        cancelText="Torna ai dettagli"
        okText="Annulla movo"
      />
      <RouterPrompt
        when={docsBlocking}
        title="Non è stata caricata la lettera movo firmata dal cliente."
        description={'Clicca su "firma" per procedere'}
        cancelText="Firma"
        // okText="Conferma"
        // onOK={() => true}
        onCancel={() => history.push(movoPrintLink)}
        excludedPaths={[movoPrintLink]}
        cannotLeave
      />
      <RouterPrompt
        when={depositBlocking && !docsBlocking}
        title="Deposito inserito"
        description="E' stato inserito un deposito in fase di apertura ma non è stato restituito"
        cancelText="Restituisci deposito"
        okText="Continua"
        onOK={() => true}
        onCancel={() => document.getElementById('depositBox').scrollIntoView({ behavior: 'smooth' })}
      />
    </Page>
  );
};

export default Rent;
