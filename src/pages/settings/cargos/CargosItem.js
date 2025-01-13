import React from 'react';
import { useParams, useHistory } from 'react-router-dom';
import SettingsPage from '../../../components/Settings/SettingsPage';

import { CLIENT_ROLE_ADMIN } from '../../../utils/Utils';

import Button from '../../../components/UI/buttons/Button';
import CargosSubmissionDetails from '../../../components/Cargos/CargosSubmissionDetails';

const CargosItem = () => {
  const history = useHistory();
  const params = useParams();

  return (
    <SettingsPage canAccess={[CLIENT_ROLE_ADMIN]}>
      <div className="p-4 w-full">
        <div>
          <Button btnStyle={'lightGray'} onClick={() => history.goBack()}>
            Indietro
          </Button>
        </div>
        <CargosSubmissionDetails cargosSubmissionId={params.id} />
      </div>
    </SettingsPage>
  );
};

export default CargosItem;
