import React, { useEffect, useState } from 'react';
import { useParams, useHistory, useLocation } from 'react-router-dom';
import { http } from '../../../utils/Utils';
import { CORPORATE_ROLE_ADMIN, CORPORATE_ROLE_OPERATOR } from '../../../utils/Utils';
import CorporatePage from '../../../components/Corporate/CorporatePage';
import RentDetails from '../../../components/Rents/Details';
import CardsHeader from '../../../components/UI/CardsHeader';
import toast from 'react-hot-toast';
import { RouterPrompt } from '../../../components/UI/RouterPrompt';
import Button from '../../../components/UI/buttons/Button';
import { FaSearch } from 'react-icons/fa';

const CorporateRent = () => {
  const params = useParams();
  const history = useHistory();
  const search = useLocation().search;
  const [rent, setRent] = useState({});
  const from = new URLSearchParams(search).get('from');

  useEffect(() => {
    fetchRent(params.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRent = async (id) => {
    try {
      if (!id) return;
      const response = await http({ url: `/corporate/rents/${id}` });

      if (!response || !response._id) {
        toast.error('Errore nel caricamento del movo. Movo non presente.');
        return;
      }
      setRent(response);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore nel caricamento del movo. Movo non presente.');
      history.push('/corporate/movimenti');
    }
  };

  const goBackPage = () => {
    if (from === 'calendar') {
      history.push('/corporate/calendario');
    } else {
      history.goBack();
    }
  };

  const phase = rent.state !== 'aperto' ? 'dropOff' : 'pickUp';
  var docsBlocking = false;

  if (
    phase === 'pickUp' &&
    rent?.pickUpState &&
    rent?.signature?.pickUp?.otp &&
    rent.signature.pickUp.otp.verified !== true
  ) {
    if (rent.pickUpState.documents.find((doc) => doc.label === 'contract' && !doc.fileUrl)) {
      docsBlocking = true;
    }
  }

  if (
    phase === 'dropOff' &&
    rent?.dropOffState &&
    rent?.signature?.dropOff?.otp &&
    rent.signature.dropOff.otp.verified !== true
  ) {
    if (rent.dropOffState.documents.find((doc) => doc.label === 'contract' && !doc.fileUrl)) {
      docsBlocking = true;
    }
  }

  const movoPrintLink =
    rent.state !== 'aperto'
      ? `/corporate/movimenti/${rent?._id}/stampa/dropOff`
      : `/corporate/movimenti/${rent?._id}/stampa/pickUp`;

  return (
    <CorporatePage
      canAccess={[CORPORATE_ROLE_ADMIN, CORPORATE_ROLE_OPERATOR]}
      bodyClassName={'pb-4'}
    >
      <CardsHeader
        title="Dettagli movo"
        buttons={[
          {
            btnStyle: 'lightSlateTransparent',
            children: '« Indietro',
            onClick: goBackPage,
          },
        ]}
      />

      <div className="px-6">
        <RentDetails
          rent={rent}
          phase={phase}
          updateRent={() => fetchRent(params.id)}
          fromCorporate={true}
        />

        {rent._id && (
          <div className="text-center">
            <Button
              btnStyle="unstyled"
              className="text-slate-500 underline text-xs"
              to={`/corporate/movimenti/${rent?._id}/aggiornamenti`}
            >
              <FaSearch className="inline mb-1" /> Log aggiornamenti
            </Button>
          </div>
        )}
      </div>

      <RouterPrompt
        when={docsBlocking}
        title="Sei sicuro di voler lasciare la pagina?"
        description="Ci sono ancora dei documenti da caricare"
        cancelText="Annulla"
        okText="Conferma"
        onOK={() => true}
        onCancel={() => false}
        excludedPaths={[movoPrintLink]}
      />
    </CorporatePage>
  );
};

export default CorporateRent;
