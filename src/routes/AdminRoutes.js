import React from 'react';
import Admin from '../pages/admin/Admin';
import Clients from '../pages/admin/clients/Clients';
import Client from '../pages/admin/clients/Client';
import ClientProfiles from '../pages/admin/clients/ClientProfiles';
import AdminFleet from '../pages/admin/vehicles/AdminFleet';
import Brands from '../pages/admin/vehicles/brands/Brands';
import Brand from '../pages/admin/vehicles/brands/Brand';
import Models from '../pages/admin/vehicles/models/Models';
import Model from '../pages/admin/vehicles/models/Model';
import Versions from '../pages/admin/vehicles/versions/Versions';
import Version from '../pages/admin/vehicles/versions/Version';
import AdminMovolab from '../pages/admin/movolab/AdminMovolab';
import AdminPriceList from '../pages/admin/movolab/priceLists/AdminPriceList';
import AdminEditPriceList from '../pages/admin/movolab/priceLists/AdminEditPriceList';
import AdminPriceLists from '../pages/admin/movolab/priceLists/AdminPriceLists';
import AdminFares from '../pages/admin/movolab/fares/AdminFares';
import AdminFare from '../pages/admin/movolab/fares/AdminFare';
import AdminRanges from '../pages/admin/movolab/ranges/AdminRanges';
import AdminRange from '../pages/admin/movolab/ranges/AdminRange';
import AdminExtras from '../pages/admin/movolab/extras/AdminExtras';
import AdminExtra from '../pages/admin/movolab/extras/AdminExtra';
import AdminFranchises from '../pages/admin/movolab/franchises/AdminFranchises';
import AdminFranchise from '../pages/admin/movolab/franchises/AdminFranchise';
import AdminWorkflows from '../pages/admin/workflows/AdminWorkflows';
import AdminWorkflow from '../pages/admin/workflows/AdminWorkflow';
import AdminDamages from '../pages/admin/movolab/damages/AdminDamages';
import AdminDamage from '../pages/admin/movolab/damages/AdminDamage';
import ClientProfile from '../pages/admin/clients/ClientProfile';
import Packs from '../pages/admin/packs/Packs';
import Pack from '../pages/admin/packs/Pack';
import EditPack from '../pages/admin/packs/EditPack';
import PartnerCodes from '../pages/admin/partnerCodes/PartnerCodes';
import EditPartnerCode from '../pages/admin/partnerCodes/EditPartnerCode';
import AdminRentalLocations from '../pages/admin/rentalLocations/AdminRentalLocations';
import AdminRentalLocation from '../pages/admin/rentalLocations/AdminRentalLocation';
import InvoicingDashboard from '../pages/admin/invoicing/InvoicingDashboard';
import AdminInvoice from '../pages/admin/invoicing/AdminInvoice';
import AdminRents from '../pages/admin/rents/AdminRents';
import AdminRent from '../pages/admin/rents/AdminRent';
import AdminReservations from '../pages/admin/reservations/AdminReservations';
import AdminReservation from '../pages/admin/reservations/AdminReservation';
import AdminRevenueShares from '../pages/admin/movolab/adminEarnings/AdminEarnings';
import AdminRevenueShare from '../pages/admin/movolab/adminEarnings/AdminRevenueShare';
import AdminRevenueShareMonthlyRecap from '../pages/admin/movolab/adminEarnings/AdminRevenueShareMonthlyRecap';
import AdminUserCompanies from '../pages/admin/userCompanies/AdminUserCompanies';
import AdminCargos from '../pages/admin/cargos/AdminCargos';
import AdminCargosItem from '../pages/admin/cargos/AdminCargosItem';

const ADMIN_ROUTES = [
  { url: '/admin', component: <Admin /> },
  { url: '/admin/clienti/anagrafica', component: <Clients /> },
  { url: '/admin/clienti/anagrafica/:id', component: <Client /> },
  { url: '/admin/utenti/clientProfile', component: <ClientProfiles /> },
  { url: '/admin/utenti/clientProfile/:id', component: <ClientProfile /> },
  { url: '/admin/clienti/puntinolo', component: <AdminRentalLocations /> },
  { url: '/admin/clienti/puntinolo/:id', component: <AdminRentalLocation /> },
  { url: '/admin/clienti/movimenti', component: <AdminRents /> },
  { url: '/admin/clienti/movimenti/:id', component: <AdminRent /> },
  { url: '/admin/clienti/prenotazioni', component: <AdminReservations /> },
  { url: '/admin/clienti/prenotazioni/:id', component: <AdminReservation /> },
  { url: '/admin/amministrazione', component: <InvoicingDashboard /> },
  { url: '/admin/amministrazione/fatture/:id', component: <AdminInvoice /> },
  { url: '/admin/veicoli', component: <AdminFleet /> },
  { url: '/admin/veicoli/marche', component: <Brands /> },
  { url: '/admin/veicoli/marche/crea', component: <Brand /> },
  { url: '/admin/veicoli/marche/:id', component: <Brand /> },
  { url: '/admin/veicoli/modelli', component: <Models /> },
  { url: '/admin/veicoli/modelli/crea', component: <Model /> },
  { url: '/admin/veicoli/modelli/:id', component: <Model /> },
  { url: '/admin/veicoli/versioni', component: <Versions /> },
  { url: '/admin/veicoli/versioni/crea', component: <Version /> },
  { url: '/admin/veicoli/versioni/:id', component: <Version /> },
  { url: '/admin/movolab', component: <AdminMovolab /> },
  { url: '/admin/movolab/listini', component: <AdminPriceLists /> },
  { url: '/admin/movolab/listini/crea', component: <AdminEditPriceList /> },
  { url: '/admin/movolab/listini/:id', component: <AdminPriceList /> },
  { url: '/admin/movolab/listini/:id/aggiorna', component: <AdminEditPriceList /> },
  { url: '/admin/movolab/tariffe', component: <AdminFares /> },
  { url: '/admin/movolab/tariffe/crea', component: <AdminFare /> },
  { url: '/admin/movolab/tariffe/:id', component: <AdminFare /> },
  { url: '/admin/workflows', component: <AdminWorkflows /> },
  { url: '/admin/workflows/crea', component: <AdminWorkflow /> },
  { url: '/admin/workflows/:id', component: <AdminWorkflow /> },
  { url: '/admin/workflows/:id/aggiorna', component: <AdminWorkflow /> },
  { url: '/admin/movolab/fasce', component: <AdminRanges /> },
  { url: '/admin/movolab/fasce/crea', component: <AdminRange /> },
  { url: '/admin/movolab/fasce/:id', component: <AdminRange /> },
  { url: '/admin/movolab/franchigie', component: <AdminFranchises /> },
  { url: '/admin/movolab/franchigie/:id', component: <AdminFranchise /> },
  { url: '/admin/movolab/danni', component: <AdminDamages /> },
  { url: '/admin/movolab/danni/crea', component: <AdminDamage /> },
  { url: '/admin/movolab/danni/:id', component: <AdminDamage /> },
  { url: '/admin/movolab/extra', component: <AdminExtras /> },
  { url: '/admin/movolab/extra/crea', component: <AdminExtra /> },
  { url: '/admin/movolab/extra/:id', component: <AdminExtra /> },
  { url: '/admin/ripartizione-incassi', component: <AdminRevenueShares /> },
  {
    url: '/admin/ripartizione-incassi/mensile/:id',
    component: <AdminRevenueShareMonthlyRecap />,
  },
  { url: '/admin/ripartizione-incassi/:id', component: <AdminRevenueShare /> },
  { url: '/admin/packs', component: <Packs /> },
  { url: '/admin/packs/crea', component: <EditPack /> },
  { url: '/admin/packs/:id', component: <Pack /> },
  { url: '/admin/packs/:id/aggiorna', component: <EditPack /> },
  { url: '/admin/codicipartner', component: <PartnerCodes /> },
  { url: '/admin/codicipartner/crea', component: <EditPartnerCode /> },
  { url: '/admin/codicipartner/:id/aggiorna', component: <EditPartnerCode /> },
  { url: '/admin/aziende', component: <AdminUserCompanies /> },
  { url: '/admin/cargos', component: <AdminCargos /> },
  { url: '/admin/cargos/:id', component: <AdminCargosItem /> },
];

export default ADMIN_ROUTES;
