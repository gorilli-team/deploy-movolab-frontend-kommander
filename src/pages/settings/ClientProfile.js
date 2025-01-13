import React, { useContext } from 'react';
import { CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR, MOVOLAB_ROLE_ADMIN } from '../../utils/Utils';

import SettingsPage from '../../components/Settings/SettingsPage';

import { UserContext } from '../../store/UserContext';
import ClientProfileComponent from '../../components/Clients/ClientProfiles/ClientProfileComponent';

const ClientProfile = () => {
  const userContext = useContext(UserContext);

  if (userContext?.data?.role === MOVOLAB_ROLE_ADMIN) {
    return <SettingsPage>Questo è un profilo admin movolab</SettingsPage>;
  }

  return (
    <SettingsPage canAccess={[CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR]} className="p-6">
      <ClientProfileComponent />
    </SettingsPage>
  );
};

export default ClientProfile;
