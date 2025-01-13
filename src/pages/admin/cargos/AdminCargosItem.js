import React from 'react';
import { useParams, useHistory } from 'react-router-dom';
import AdminPage from '../../../components/Admin/AdminPage';

import Button from '../../../components/UI/buttons/Button';
import CargosSubmissionDetails from '../../../components/Cargos/CargosSubmissionDetails';

const AdminCargosItem = () => {
  const history = useHistory();
  const params = useParams();

  return (
    <AdminPage>
      <div className="p-4 w-full">
        <div>
          <Button btnStyle={'lightGray'} onClick={() => history.goBack()}>
            Indietro
          </Button>
        </div>
        <CargosSubmissionDetails cargosSubmissionId={params.id} />
      </div>
    </AdminPage>
  );
};

export default AdminCargosItem;
