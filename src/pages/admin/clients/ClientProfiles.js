import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import AdminPage from '../../../components/Admin/AdminPage';
import ClientProfilesTable from '../../../components/Clients/ClientProfiles/ClientProfilesTable';
import { MOVOLAB_ROLE_ADMIN, http } from '../../../utils/Utils';
import TableHeader from '../../../components/UI/TableHeader';
import FilterContainer from '../../../components/UI/FilterContainer';

const ClientProfiles = () => {
  const [clientProfilesCount, setClientProfilesCount] = useState([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetchClientProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchClientProfiles = async () => {
    try {
      const response = await http({ url: '/clientProfile' });
      setClientProfilesCount(response.count);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const searchSubmit = async (values) => {
    try {
      const response = await http({
        url: `/clientProfile?search=${values.query}`,
      });
      setClientProfilesCount(response.count);
      setQuery(values.query);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  return (
    <AdminPage canAccess={MOVOLAB_ROLE_ADMIN}>
      <div className="flex justify-between items-center gap-2 mr-6">
        <TableHeader tableName={'Profili Cliente'} buttons={[]} length={clientProfilesCount} />

        <FilterContainer onSubmit={searchSubmit} />
      </div>
      <ClientProfilesTable filterQuery={query} />
    </AdminPage>
  );
};

export default ClientProfiles;
