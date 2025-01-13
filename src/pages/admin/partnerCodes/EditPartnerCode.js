import React, { useState } from 'react';
import { MOVOLAB_ROLE_ADMIN } from '../../../utils/Utils';
import { useHistory, useLocation, useParams } from 'react-router-dom';

import AdminPage from '../../../components/Admin/AdminPage';
import UpdatePartnerCodeGeneral from '../../../components/PartnerCodes/Update/UpdatePartnerCodeGeneral';
import Button from '../../../components/UI/buttons/Button';

const EditPartnerCode = () => {
  const params = useParams();
  const history = useHistory();

  const search = useLocation().search;
  const section = new URLSearchParams(search).get('section');

  const mode = params.id ? 'edit' : 'create';

  const [fieldToUpdate] = useState(section || 'generale');

  return (
    <AdminPage canAccess={MOVOLAB_ROLE_ADMIN}>
      <div>
        <div className="p-4">
          <Button onClick={() => history.goBack()} btnStyle="white">
            &laquo; Indietro
          </Button>
        </div>

        {fieldToUpdate === 'generale' && (
          <UpdatePartnerCodeGeneral mode={mode}></UpdatePartnerCodeGeneral>
        )}
      </div>
    </AdminPage>
  );
};

export default EditPartnerCode;
