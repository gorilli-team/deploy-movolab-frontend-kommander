import React from 'react';
import Dashboard from '../pages/dashboard/Dashboard';
import Calendar from '../pages/dashboard/calendar/Calendar';
import InvoicingDashboard from '../pages/dashboard/invoicing/InvoicingDashboard';
import Invoice from '../pages/dashboard/invoicing/Invoice';
import Rents from '../pages/dashboard/rents/Rents';
import Rent from '../pages/dashboard/rents/Rent';
import PayRent from '../pages/dashboard/rents/PayRent';
import Reservations from '../pages/dashboard/reservations/Reservations';
import Reservation from '../pages/dashboard/reservations/Reservation';
import UpdateReservation from '../pages/dashboard/reservations/UpdateReservation';
import ReservationUpdates from '../pages/dashboard/reservations/ReservationUpdates';
import ReservationPrint from '../pages/dashboard/reservations/ReservationPrint';
import Users from '../pages/dashboard/users/Users';
import CreateUserCompany from '../pages/dashboard/users/CreateUserCompany';
import User from '../pages/dashboard/users/User';
import User2 from '../pages/dashboard/users/User2';
import UserCompany from '../pages/dashboard/users/UserCompany';
import Fleet from '../pages/dashboard/vehicles/fleet/Fleet';
import Vehicle from '../pages/dashboard/vehicles/fleet/Vehicle';
import NewVehicle from '../pages/dashboard/vehicles/fleet/NewVehicle';
import CreateReservation from '../pages/dashboard/reservations/CreateReservation';
import CreateReservationByGroup from '../pages/dashboard/reservations/CreateReservationByGroup';
import CompleteReservation from '../pages/dashboard/reservations/CompleteReservation';
import Fines from '../pages/dashboard/operations/fines/Fines';
import Fine from '../pages/dashboard/operations/fines/Fine';
import NewFine from '../pages/dashboard/operations/fines/NewFine';
import FineUpdates from '../pages/dashboard/operations/fines/FineUpdates';
import ExistingVehicle from '../pages/dashboard/vehicles/fleet/UpdateVehicle';
import VehicleUpdates from '../pages/dashboard/vehicles/fleet/VehicleUpdates';
import VehicleActivities from '../pages/dashboard/vehicles/fleet/VehicleActivities';
import NewRent from '../pages/dashboard/rents/newrent/NewRent';
import NewRent2 from '../pages/dashboard/rents/newrent/NewRent2';
import UserUpdates from '../components/Users/User/UserUpdates';
import UserCompanyUpdates from '../pages/dashboard/users/UserCompanyUpdates';
import RentUpdates from '../pages/dashboard/rents/RentUpdates';
import UpdateRent from '../pages/dashboard/rents/UpdateRent';
import CloseRent1 from '../pages/dashboard/rents/CloseRent1';
import RentPrint from '../pages/dashboard/rents/RentPrint';
import SetupSepa from '../pages/dashboard/subscriptions/SetupSepa';

const DASHBOARD_ROUTES = [
  { url: '/dashboard', component: <Dashboard /> },
  { url: '/dashboard/calendario', component: <Calendar /> },
  { url: '/dashboard/amministrazione', component: <InvoicingDashboard /> },
  { url: '/dashboard/amministrazione/fatture/:id', component: <Invoice /> },
  { url: '/dashboard/movimenti', component: <Rents /> },
  { url: '/dashboard/movimenti/crea', component: <NewRent /> },
  { url: '/dashboard/movimenti/crea/1/:id', component: <NewRent /> },
  { url: '/dashboard/movimenti/crea/2/:id', component: <NewRent2 /> },
  { url: '/dashboard/movimenti/:id', component: <Rent /> },
  { url: '/dashboard/movimenti/:id/aggiornamenti', component: <RentUpdates /> },
  { url: '/dashboard/movimenti/:id/aggiorna', component: <UpdateRent /> },
  { url: '/dashboard/movimenti/:id/riepilogo', component: <CloseRent1 /> },
  { url: '/dashboard/movimenti/:id/cassa', component: <PayRent /> },
  { url: '/dashboard/movimenti/:id/stampa/:phase', component: <RentPrint /> },
  { url: '/dashboard/prenotazioni', component: <Reservations /> },
  { url: '/dashboard/prenotazioni/crea', component: <CreateReservation /> },
  { url: '/dashboard/prenotazioni/pergruppo', component: <CreateReservationByGroup /> },
  { url: '/dashboard/prenotazioni/completa', component: <CompleteReservation /> },
  { url: '/dashboard/prenotazioni/:id', component: <Reservation /> },
  { url: '/dashboard/prenotazioni/:id/aggiorna', component: <UpdateReservation /> },
  { url: '/dashboard/prenotazioni/:id/aggiornamenti', component: <ReservationUpdates /> },
  { url: '/dashboard/prenotazioni/:id/stampa', component: <ReservationPrint /> },
  { url: '/dashboard/utenti', component: <Users /> },
  { url: '/dashboard/utenti/anagrafica', component: <Users /> },
  { url: '/dashboard/utenti/crea/azienda', component: <CreateUserCompany /> },
  { url: '/dashboard/utenti/anagrafica/:id', component: <User /> },
  { url: '/dashboard/utenti/persona/:id', component: <User2 /> },
  { url: '/dashboard/utenti/persona/:id/aggiornamenti', component: <UserUpdates /> },
  { url: '/dashboard/utenti/azienda/:id', component: <UserCompany /> },
  { url: '/dashboard/utenti/azienda/:id/aggiornamenti', component: <UserCompanyUpdates /> },
  { url: '/dashboard/veicoli/flotta', component: <Fleet /> },
  { url: '/dashboard/veicoli/flotta/:id', component: <Vehicle /> },
  { url: '/dashboard/veicoli/flotta/:id/aggiorna', component: <ExistingVehicle /> },
  { url: '/dashboard/veicoli/flotta/:id/aggiornamenti', component: <VehicleUpdates /> },
  { url: '/dashboard/veicoli/flotta/:id/attivita', component: <VehicleActivities /> },
  { url: '/dashboard/veicoli/crea', component: <NewVehicle /> },
  { url: '/dashboard/operazioni/multe', component: <Fines /> },
  { url: '/dashboard/operazioni/multe/crea', component: <NewFine /> },
  { url: '/dashboard/operazioni/multe/:id', component: <Fine /> },
  { url: '/dashboard/operazioni/multe/:id/aggiornamenti', component: <FineUpdates /> },
  { url: '/dashboard/sepa', component: <SetupSepa /> },
];

export default DASHBOARD_ROUTES;
