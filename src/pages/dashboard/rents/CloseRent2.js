import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import Page from '../../../components/Dashboard/Page';
import { http } from '../../../utils/Utils';
import CloseRentRecap from '../../../components/Rents/CloseRentRecap';

const CloseRent2 = () => {
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

  useEffect(() => {
    fetchRent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Page>
      <CloseRentRecap rent={rent} />
    </Page>
  );
};

export default CloseRent2;
