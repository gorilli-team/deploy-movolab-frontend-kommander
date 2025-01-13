import React from 'react';
import RentPublicPrint from '../pages/documents/RentPublicPrint';
import ReservationPublicPrint from '../pages/documents/ReservationPublicPrint';

const DOCUMENTS_ROUTES = [
  { url: '/documenti/movimenti/:id/stampa/:phase', component: <RentPublicPrint /> },
  { url: '/documenti/prenotazioni/:id/stampa/', component: <ReservationPublicPrint /> },
];

export default DOCUMENTS_ROUTES;
