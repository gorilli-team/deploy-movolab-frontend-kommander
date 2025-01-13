import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { MOVOLAB_ROLE_ADMIN } from '../../../../utils/Utils';
import PriceListsTable from '../../../../components/Clients/Prices/PriceListsTable';
import TableHeader from '../../../../components/UI/TableHeader';
import FilterSelectField from '../../../../components/Form/FilterSelectField';
import AdminPage from '../../../../components/Admin/AdminPage';

const AdminPriceLists = () => {
  const history = useHistory();

  const [priceListsCount, setPriceListsCount] = useState([]);
  const [selectedLicenseType, setSelectedLicenseType] = useState(undefined);

  const setSelectedLicenseTypeAndReload = (value) => {
    // Add logic to set selectedLicenseType and reload the table
    setSelectedLicenseType(value);
  };

  const setCount = (count) => {
    setPriceListsCount(count);
  };

  return (
    <AdminPage canAccess={MOVOLAB_ROLE_ADMIN} className="!px-0 !pb-0">
      <div className="flex justify-between items-center gap-2 mr-6">
        <TableHeader
          tableName={'Listini'}
          buttons={[
            {
              function: () => {
                history.push(`/admin/movolab/listini/crea`);
              },
              label: '+',
            },
          ]}
          length={priceListsCount}
        />
        <div className="flex gap-2">
          <FilterSelectField
            onChange={(e) => setSelectedLicenseTypeAndReload(e.target.value)}
            emptyOption={{ label: 'Tutti i Listini' }}
            options={[
              {
                value: 'client',
                label: 'Listini Clienti',
              },
              {
                value: 'movolab',
                label: 'Listini Movolab',
              },
            ]}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-0">
        <PriceListsTable licenseType={selectedLicenseType} setCount={setCount} />
      </div>
    </AdminPage>
  );
};

export default AdminPriceLists;
