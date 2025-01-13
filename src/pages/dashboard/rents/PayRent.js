import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useParams, useHistory } from 'react-router-dom';
import Page from '../../../components/Dashboard/Page';
import { http } from '../../../utils/Utils';
import { CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR } from '../../../utils/Utils';
import PayRentDetails from '../../../components/Rents/PayRentDetails';
import Button from '../../../components/UI/buttons/Button';
import { FaSearch } from 'react-icons/fa';

const PayRent = () => {
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

  const updateRent = async (data) => {
    try {
      const response = await http({
        method: 'PUT',
        url: `/rents/${params.id}`,
        form: data,
      });
      setRent(response);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

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
      <PayRentDetails
        rent={rent}
        closeRent={closeRent}
        updateRent={updateRent}
        fetchRent={fetchRent}
        isCheckoutPage={true}
      />

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
    </Page>
  );
};

export default PayRent;
