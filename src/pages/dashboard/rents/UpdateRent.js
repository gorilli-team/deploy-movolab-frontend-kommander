import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import Page from '../../../components/Dashboard/Page';
import { http } from '../../../utils/Utils';
import { CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR } from '../../../utils/Utils';
import EditRent from '../../../components/Rents/EditRent';
import Button from '../../../components/UI/buttons/Button';
import { FaSearch } from 'react-icons/fa';

const UpdateRent = () => {
  const params = useParams();
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
    if (data.movementType === 'COM' || data.movementType === 'MNP') {
      data.price = {
        amount: 0,
      };
    }

    try {
      const response = await http({
        method: 'PUT',
        url: `/rents/${params.id}`,
        form: data,
      });
      setRent(response);
      toast.success('Movo aggiornato');
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
    <Page canAccess={[CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR]}>
      <EditRent rent={rent} updateRent={updateRent} />

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

export default UpdateRent;
