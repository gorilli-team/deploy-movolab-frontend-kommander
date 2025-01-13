import React from 'react';
import SimpleReservation from '../../../components/Reservations/ReservationTypes/SimpleReservation';
import CorporatePage from '../../../components/Corporate/CorporatePage';
import { CORPORATE_ROLE_ADMIN, CORPORATE_ROLE_OPERATOR } from '../../../utils/Utils';
import { useLocation } from 'react-router-dom/cjs/react-router-dom.min';

const CompleteCorporateReservation = () => {
  const searchString = useLocation().search;
  const searchParams = Object.fromEntries(new URLSearchParams(searchString).entries());

  return (
    <CorporatePage
      canAccess={[CORPORATE_ROLE_ADMIN, CORPORATE_ROLE_OPERATOR]}
      bodyClassName={'pb-4'}
    >
      <SimpleReservation pageTitle="Completa prenotazione" activeStep={2} {...{ searchParams, searchString }} />
    </CorporatePage>
  );
};

export default CompleteCorporateReservation;
