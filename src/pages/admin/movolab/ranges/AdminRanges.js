import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { MOVOLAB_ROLE_ADMIN } from '../../../../utils/Utils';
import AdminPage from '../../../../components/Admin/AdminPage';
import RangesTable from '../../../../components/Clients/Prices/RangesTable';
import TableHeader from '../../../../components/UI/TableHeader';
import FilterSelectField from '../../../../components/Form/FilterSelectField';

const AdminRanges = () => {
  const history = useHistory();
  const [rangesCount, setRangesCount] = useState(0);
  const [selectedType, setSelectedType] = useState(
    new URLSearchParams(window.location.search).get('tipo') || 'all',
  );

  const updateRangesCount = (count) => {
    setRangesCount(count);
  };

  const setSelectedTypeAndReload = (value) => {
    setSelectedType(value);
    history.push(`/admin/movolab/fasce?tipo=${value}`);
  };

  return (
    <AdminPage canAccess={MOVOLAB_ROLE_ADMIN}>
      <div className="flex justify-between items-center">
        <TableHeader
          tableName={'Fasce'}
          buttons={[
            {
              function: () => {
                history.push(`/admin/movolab/fasce/crea`);
              },
              label: '+',
            },
          ]}
          length={rangesCount}
        />
        <div className="flex justify-end gap-2 mr-6">
          <FilterSelectField
            onChange={(e) => setSelectedTypeAndReload(e.target.value)}
            value={selectedType}
            options={[
              { label: 'Tutti i Tipi', value: 'all' },
              { label: 'Movolab', value: 'movolab' },
              { label: 'Cliente', value: 'client' },
            ]}
          />
        </div>
      </div>

      <RangesTable
        role={MOVOLAB_ROLE_ADMIN}
        type={selectedType}
        updateRangesCount={updateRangesCount}
      />
    </AdminPage>
  );
};

export default AdminRanges;
