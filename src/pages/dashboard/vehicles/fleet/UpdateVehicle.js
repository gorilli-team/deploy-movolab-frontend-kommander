import React from 'react';
import { CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR } from '../../../../utils/Utils';
import Page from '../../../../components/Dashboard/Page';
import UpdateVehicle from '../../../../components/Vehicles/Vehicles/UpdateVehicle';

const ExistingVehicle = (vehicle) => {
  return (
    <Page canAccess={[CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR]} bodyClassName="pb-4">
      <UpdateVehicle setShowUpdateVehicle={() => {}} />
    </Page>
  );
};

export default ExistingVehicle;
