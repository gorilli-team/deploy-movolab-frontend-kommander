import React from 'react';
import { useParams, useHistory } from 'react-router-dom';
import Page from '../../../components/Dashboard/Page';
import { CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR } from '../../../utils/Utils';
import WhiteButton from '../../../components/UI/buttons/WhiteButton';
import UpdateEventsTable from '../../../components/UpdateEvents/UpdateEventsTable';
import UserCompany from './UserCompany';

const UserUpdates = () => {
  const params = useParams();
  const history = useHistory();

  return (
    <Page canAccess={[CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR]}>
      <div className="p-4 left-0">
        <div className="flex">
          <div className="px-2">
            <WhiteButton onClick={() => history.goBack()}>Indietro</WhiteButton>
          </div>
        </div>
        <div className="p-2">
          <div className="text-xl">
            <span className="font-semibold">Aggiornamenti:</span> {UserCompany._id}
          </div>

          <div className="mt-4">
            <UpdateEventsTable collectionName={'userCompanies'} id={params.id} />
          </div>
        </div>
      </div>
    </Page>
  );
};

export default UserUpdates;
