import React from 'react';
import Page from '../../../components/Dashboard/Page';
import { CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR } from '../../../utils/Utils';
import SimpleReservation from '../../../components/Reservations/ReservationTypes/SimpleReservation';

const CreateReservation = () => {
  return (
    <Page canAccess={[CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR]} bodyClassName={'pb-4'}>
      <SimpleReservation />
    </Page>
  );
};

export default CreateReservation;
