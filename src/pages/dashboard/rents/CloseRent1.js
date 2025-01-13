import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useParams, useHistory } from 'react-router-dom';
import Page from '../../../components/Dashboard/Page';
import { http } from '../../../utils/Utils';
import { CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR } from '../../../utils/Utils';
import CloseRentDetails from '../../../components/Rents/CloseRentDetails';
import { RouterPrompt } from '../../../components/UI/RouterPrompt';
import Button from '../../../components/UI/buttons/Button';
import { FaSearch } from 'react-icons/fa';

const CloseRent1 = () => {
  const params = useParams();
  const history = useHistory();
  const [rent, setRent] = useState({});

  const fetchRent = async () => {
    try {
      const response = await http({ url: `/rents/${params.id}` });
      setRent(response);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  var docsBlocking = false;

  const closeRent = async (data) => {
    if (!data.km?.pickUp || !data.km?.dropOff) {
      toast.error('KM Iniziali e KM Finali sono obbligatori');
      return;
    }

    if (data.kmStart > data.kmEnd) {
      toast.error('KM Iniziali non possono essere maggiori di KM Finali');
      return;
    }

    try {
      const response = await http({
        method: 'PUT',
        url: `/rents/${params.id}/close`,
        form: data,
      });
      setRent(response);
      toast.success('Movo chiuso con successo');
      history.push(`/dashboard/movimenti/${params.id}`);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  useEffect(() => {
    fetchRent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Page canAccess={[CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR]} bodyClassName={'pb-4'}>
      <CloseRentDetails rent={rent} closeRent={closeRent} updateRent={() => fetchRent(params.id)} />

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

      <RouterPrompt
        when={docsBlocking}
        title="Sei sicuro di voler lasciare la pagina?"
        description="Ci sono ancora dei documenti da caricare"
        cancelText="Annulla"
        okText="Conferma"
        onOK={() => true}
        onCancel={() => false}
        excludedPaths={[`/dashboard/movimenti/${rent?._id}/stampa/dropOff`]}
      />
    </Page>
  );
};

export default CloseRent1;
