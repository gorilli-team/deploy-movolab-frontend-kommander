import React from 'react';
import AdminPage from '../../../components/Admin/AdminPage';
import TableHeader from '../../../components/UI/TableHeader';
import CargosSubmissionsTable from '../../../components/Cargos/CargosSubmissionsTable';

const AdminCargos = () => {
  return (
    <AdminPage>
      <TableHeader tableName={'Cargos'} />
      <>
        <div className="p-6">
          <CargosSubmissionsTable />
        </div>
      </>
    </AdminPage>
  );
};

export default AdminCargos;
