import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { http, MOVOLAB_ROLE_ADMIN } from '../../../utils/Utils';
import AdminPage from '../../../components/Admin/AdminPage';
import RentDetails from '../../../components/Rents/Details';
import CardsHeader from '../../../components/UI/CardsHeader';
import toast from 'react-hot-toast';

const AdminRent = () => {
  const params = useParams();
  const history = useHistory();
  const [rent, setRent] = useState({});

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

  const phase = rent.state !== 'aperto' ? 'dropOff' : 'pickUp';

  return (
    <AdminPage canAccess={[MOVOLAB_ROLE_ADMIN]} bodyClassName={'pb-4'}>
      <CardsHeader
        title="Dettagli movo"
        buttons={[
          {
            btnStyle: 'lightSlateTransparent',
            children: '« Indietro',
            onClick: history.goBack,
          },
        ]}
      />

      <div className="px-6">
        <RentDetails rent={rent} phase={phase} type="admin" />
      </div>
    </AdminPage>
  );
};

export default AdminRent;
