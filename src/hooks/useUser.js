import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { http } from '../utils/Utils';

const useUser = (id) => {
  const [user, setUser] = useState({});

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUser = async () => {
    try {
      if (!id) return;
      const response = await http({ url: `/users/${id}` });
      setUser(response);

      if (!response || !response._id) {
        toast.error('Errore nel caricamento utente. Utente non presente.');
        return;
      }
      setUser(response);
    } catch (err) {
      console.error(err);
    }
  };

  return user;
};

export default useUser;
