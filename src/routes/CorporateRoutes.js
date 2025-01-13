import React from 'react';
import CorporateHome from '../pages/corporate/CorporateHome';
import CreateCorporateReservation from '../pages/corporate/reservations/CreateCorporateReservation';
import CorporateProfile from '../pages/corporate/CorporateProfile';
import CorporateReservations from '../pages/corporate/reservations/CorporateReservations';
import CorporateReservation from '../pages/corporate/reservations/CorporateReservation';
import CompleteCorporateReservation from '../pages/corporate/reservations/CompleteCorporateReservation';
import CorporateRents from '../pages/corporate/rents/CorporateRents';
import CorporateRent from '../pages/corporate/rents/CorporateRent';
import CorporateUsers from '../pages/corporate/users/CorporateUsers';
import CorporateUser from '../pages/corporate/users/CorporateUser';
import CorporateCalendar from '../pages/corporate/CorporateCalendar';
import CorporateReservationPrint from '../pages/corporate/reservations/CorporateReservationPrint';

const CORPORATE_ROUTES = [
  { url: '/corporate', component: <CorporateHome /> },
  { url: '/corporate/calendario', component: <CorporateCalendar /> },
  { url: '/corporate/prenotazioni/crea', component: <CreateCorporateReservation /> },
  { url: '/corporate/prenotazioni/completa', component: <CompleteCorporateReservation /> },
  { url: '/corporate/prenotazioni/:id/stampa', component: <CorporateReservationPrint /> },

  { url: '/corporate/profilo', component: <CorporateProfile /> },
  { url: '/corporate/prenotazioni', component: <CorporateReservations /> },
  { url: '/corporate/prenotazioni/:id', component: <CorporateReservation /> },
  { url: '/corporate/movimenti', component: <CorporateRents /> },
  { url: '/corporate/movimenti/:id', component: <CorporateRent /> },
  { url: '/corporate/clienti', component: <CorporateUsers /> },
  { url: '/corporate/clienti/:id', component: <CorporateUser /> },
];

export default CORPORATE_ROUTES;
