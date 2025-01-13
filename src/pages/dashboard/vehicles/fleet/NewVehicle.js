import React from 'react';
import { CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR } from '../../../../utils/Utils';
import Page from '../../../../components/Dashboard/Page';
import CreateVehicleWizard from '../../../../components/Vehicles/Vehicles/CreateVehicleWizard';

const NewVehicle = () => {
  return (
    <Page canAccess={[CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR]} bodyClassName="pb-4">
      <CreateVehicleWizard />
    </Page>
  );
};

export default NewVehicle;
