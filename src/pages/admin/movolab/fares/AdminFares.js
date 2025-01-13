import React, { useState } from 'react';
import AdminPage from '../../../../components/Admin/AdminPage';
import { MOVOLAB_ROLE_ADMIN } from '../../../../utils/Utils';
import { useHistory } from 'react-router-dom';

import FaresTable from '../../../../components/Clients/Prices/FaresTable';
import TableHeader from '../../../../components/UI/TableHeader';
import FilterSelectField from '../../../../components/Form/FilterSelectField';

const AdminFares = () => {
  const history = useHistory();
  const [faresCount, setFaresCount] = useState(0);
  const [selectedType, setSelectedType] = useState(
    new URLSearchParams(window.location.search).get('tipo') || '',
  );

  const updateFaresCount = (count) => {
    setFaresCount(count);
  };

  const setSelectedTypeAndReload = (value) => {
    setSelectedType(value);
    history.push(`/admin/movolab/tariffe?tipo=${value}`);
  };

  return (
    <AdminPage canAccess={MOVOLAB_ROLE_ADMIN}>
      <div className="flex justify-between items-center">
        <TableHeader
          tableName={'Tariffe'}
          buttons={[
            {
              function: () => {
                history.push(`/admin/movolab/tariffe/crea`);
              },
              label: '+',
            },
          ]}
          length={faresCount}
        />
        <div className="flex justify-end gap-2 mr-6">
          <FilterSelectField
            onChange={(e) => setSelectedTypeAndReload(e.target.value)}
            value={selectedType}
            options={[
              { label: 'Tutti i Tipi', value: '' },
              { label: 'Movolab', value: 'movolab' },
              { label: 'Cliente', value: 'client' },
            ]}
          />
        </div>
      </div>

      <FaresTable
        role={MOVOLAB_ROLE_ADMIN}
        type={selectedType}
        updateFaresCount={updateFaresCount}
      />
    </AdminPage>
  );
};

export default AdminFares;
