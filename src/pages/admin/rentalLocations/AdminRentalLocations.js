import React, { useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import RentalLocationsTable from '../../../components/Clients/RentalLocations/RentalLocationsTable';
import { MOVOLAB_ROLE_ADMIN, http } from '../../../utils/Utils';
import { UserContext } from '../../../store/UserContext';
import AdminPage from '../../../components/Admin/AdminPage';
import { useHistory, useLocation } from 'react-router-dom';
import TableHeader from '../../../components/UI/TableHeader';
import FilterSelectField from '../../../components/Form/FilterSelectField';

const AdminRentalLocations = () => {
  const history = useHistory();
  const search = useLocation().search;
  const [rentalLocationsCount, setRentalLocationsCount] = useState(0);
  const [rentalLocations, setRentalLocations] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(new URLSearchParams(search).get('client'));

  const userContext = useContext(UserContext);
  let userData = userContext.data || {}; //eslint-disable-line

  useEffect(() => {
    fetchRentalLocations(selectedClient);
    fetchClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRentalLocations = async (clientId = undefined, skip = 0, limit = 10) => {
    try {
      if (clientId) {
        const response = await http({
          url: `/admin/rentalLocation?clientId=${clientId}&skip=${skip}&limit=${limit}`,
        });
        setRentalLocations(response.rentalLocations);
        setRentalLocationsCount(response.count);
      } else {
        const response = await http({ url: `/admin/rentalLocation?skip=${skip}&limit=${limit}` });
        setRentalLocations(response.rentalLocations);
        setRentalLocationsCount(response.count);
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const fetchClients = async (skip = 0, limit = 10) => {
    try {
      const response = await http({ url: `/clients/client/all` });
      const clients = response.result.map((client) => {
        const rentalLocationsCount = client.rentallocationsCount;
        const label = client?.ragioneSociale || client?.code || client?.partitaIva || client?.email;
        return {
          value: client._id,
          label: label + ` (${rentalLocationsCount} punti nolo)`,
        };
      });
      setClients(clients.sort((a, b) => a.label.localeCompare(b.label)));
    } catch (err) {
      console.error(err);
    }
  };

  const setSelectedClientAndReload = (value) => {
    setSelectedClient(value);
    fetchRentalLocations(value);

    history.push(`/admin/clienti/puntinolo?client=${value}`);
  };

  return (
    <AdminPage canAccess={[MOVOLAB_ROLE_ADMIN]}>
      <div className="flex justify-between items-center">
        <TableHeader tableName={'Punti Nolo'} length={rentalLocationsCount} />
        <div className="flex justify-end gap-2 mr-6">
          <FilterSelectField
            onChange={(e) => setSelectedClientAndReload(e.target.value)}
            emptyOption={{ label: 'Tutti i Clienti' }}
            defaultValue={clients.find((client) => client.value === selectedClient)}
            options={clients}
          />
        </div>
      </div>

      <RentalLocationsTable
        rentalLocations={rentalLocations}
        fetchRentalLocations={fetchRentalLocations}
        count={rentalLocationsCount}
      />
    </AdminPage>
  );
};

export default AdminRentalLocations;
