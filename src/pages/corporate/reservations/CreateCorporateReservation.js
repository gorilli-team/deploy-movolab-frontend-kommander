import React from 'react';
import CorporatePage from '../../../components/Corporate/CorporatePage';
import { CORPORATE_ROLE_ADMIN, CORPORATE_ROLE_OPERATOR } from '../../../utils/Utils';
import AdvancedReservation from '../../../components/Reservations/ReservationTypes/AdvancedReservation';

const CreateCorporateReservation = () => {
  return (
    <CorporatePage
      canAccess={[CORPORATE_ROLE_ADMIN, CORPORATE_ROLE_OPERATOR]}
      bodyClassName={'pb-4'}
    >
      <AdvancedReservation />
    </CorporatePage>
  );
};

export default CreateCorporateReservation;
