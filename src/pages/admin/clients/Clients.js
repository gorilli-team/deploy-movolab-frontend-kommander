import React, { useState } from 'react';
import AdminPage from '../../../components/Admin/AdminPage';
import ClientsTable from '../../../components/Clients/Clients/ClientsTable';
import Button from '../../../components/UI/buttons/Button';
import TableHeader from '../../../components/UI/TableHeader';
import { MOVOLAB_ROLE_ADMIN } from '../../../utils/Utils';
import ClientsModal from '../../../components/Clients/Clients/ClientsModal';
import FilterContainer from '../../../components/UI/FilterContainer';

const Clients = () => {
  const [showAddClient, setShowAddClient] = useState(false);
  const [activeClientsFilter, setActiveClientsFilter] = useState(false);

  const [clientsCount, setClientsCount] = useState([]);
  const [query, setQuery] = useState('');

  const updateClientsCount = (count) => {
    setClientsCount(count);
  };

  const searchSubmit = async (values) => {
    try {
      setQuery(values.query);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminPage canAccess={MOVOLAB_ROLE_ADMIN}>
      <div className="flex justify-between items-center gap-2 mr-6">
        <TableHeader
          tableName={activeClientsFilter ? 'Clienti attivi' : 'Clienti'}
          buttons={[
            {
              function: () => {
                setShowAddClient(true);
              },
              label: '+',
            },
          ]}
          length={clientsCount}
        />
        <div className="flex gap-2">
          {!activeClientsFilter ? (
            <Button
              btnStyle={'whiteLightButton'}
              onClick={() => {
                setActiveClientsFilter(true);
              }}
            >
              Vedi solo i clienti attivi
            </Button>
          ) : (
            <Button
              btnStyle={'whiteLightButton'}
              onClick={() => {
                setActiveClientsFilter(false);
              }}
            >
              Vedi tutti i clienti
            </Button>
          )}
          <FilterContainer onSubmit={searchSubmit} />
        </div>
      </div>

      <ClientsTable
        filterQuery={query}
        activeClientsFilter={activeClientsFilter}
        updateClientsCount={updateClientsCount}
      />

      {showAddClient && <ClientsModal mode={'add'} closeModal={() => setShowAddClient(false)} />}
    </AdminPage>
  );
};

export default Clients;
