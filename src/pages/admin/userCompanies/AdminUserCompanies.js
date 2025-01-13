import React, { useEffect, useState } from 'react';
import AdminPage from '../../../components/Admin/AdminPage';
import TableHeader from '../../../components/UI/TableHeader';
import UserCompaniesTable, {
  fetchUserCompanies as dbFetchUserCompanies,
} from '../../../components/UserCompanies/UserCompaniesTable';
const AdminUserCompanies = () => {
  const [userCompanies, setUserCompanies] = useState(0);

  useEffect(() => {
    fetchUserCompanies();
  }, []);

  const fetchUserCompanies = async (skip = 0, limit = 10) => {
    const result = await dbFetchUserCompanies(skip, limit);
    setUserCompanies(result);
  };

  return (
    <AdminPage>
      <div className="p-4">
        <TableHeader
          tableName={'Aziende Convenzionate'}
          // buttons={[
          //   {
          //     function: () => {
          //       history.push(`/settings/profiliCliente/crea`);
          //     },
          //     label: '+',
          //   },
          // ]}
          length={userCompanies?.length}
        />

        <div className="bg-white rounded-lg shadow-lg  p-0">
          <UserCompaniesTable
            userCompanies={userCompanies?.userCompanies ?? []}
            userCompaniesCount={userCompanies?.count ?? 0}
            fetchCompanies={fetchUserCompanies}
            disableDetails={true}
          />
        </div>
      </div>
    </AdminPage>
  );
};

export default AdminUserCompanies;
