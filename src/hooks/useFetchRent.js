import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import toast from 'react-hot-toast';
import { http } from '../utils/Utils';

const useFetchRent = (id) => {
  const history = useHistory();
  const [rent, setRent] = useState({});

  useEffect(() => {
    fetchRent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRent = async () => {
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

  return rent;
};

export default useFetchRent;
