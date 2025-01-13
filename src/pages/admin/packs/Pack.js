import React, { useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useHistory, useParams } from 'react-router-dom';
import { MOVOLAB_ROLE_ADMIN, http } from '../../../utils/Utils';
import { UserContext } from '../../../store/UserContext';

import AdminPage from '../../../components/Admin/AdminPage';
import Button from '../../../components/UI/buttons/Button';
import PackDetails from '../../../components/Packs/PackDetails';
import TableHeader from '../../../components/UI/TableHeader';
import PackUsage from '../../../components/Packs/PackUsage';
import TableHeaderTab from '../../../components/UI/TableHeaderTab';

const Pack = () => {
  const params = useParams();
  const history = useHistory();
  const [pack, setPack] = useState({});
  const [clientsForPack, setClientsForPack] = useState(0);
  const [fieldToUpdate, setFieldToUpdate] = useState('general');

  const { data: currentClient } = useContext(UserContext);
  const license = currentClient?.client?.license?.licenseOwner;
  const isAdmin = currentClient?.role;

  useEffect(() => {
    fetchPack();
    getClientsForPack(params.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const fetchPack = async () => {
    try {
      const response = await http({ url: `/clientPayments/packs/${params.id}` });
      setPack(response);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const getClientsForPack = async (packId) => {
    try {
      if (packId !== undefined) {
        const clients = await http({ url: `/clientPayments/packs/clients/${packId}` });
        setClientsForPack(clients.count);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminPage canAccess={MOVOLAB_ROLE_ADMIN}>
      <TableHeader tableName="Dettagli pack" className="justify-between !pb-0">
        <div className="flex gap-2">
          <Button btnStyle="white" onClick={() => history.goBack()}>
            &laquo; Indietro
          </Button>
          {(license === 'client' || isAdmin) && (
            <div className="px-2">
              <Button to={`/admin/packs/${params.id}/aggiorna`} className="block">
                Aggiorna
              </Button>
            </div>
          )}
        </div>
      </TableHeader>

      <TableHeaderTab
        className="mt-3"
        buttons={[
          {
            label: 'Panoramica',
            function: () => {
              setFieldToUpdate('general');
            },
            selected: fieldToUpdate === 'general',
          },
          {
            label: 'Clienti associati',
            function: () => {
              setFieldToUpdate('clients');
            },
            selected: fieldToUpdate === 'clients',
          },
        ]}
      />

      {fieldToUpdate === 'general' ? <PackDetails pack={pack} /> : null}

      {fieldToUpdate === 'clients' ? (
        <>
          {clientsForPack > 0 ? (
            <>
              <PackUsage pack={pack} />
            </>
          ) : (
            <div className="p-4">Nessun cliente</div>
          )}
        </>
      ) : null}
    </AdminPage>
  );
};

export default Pack;
