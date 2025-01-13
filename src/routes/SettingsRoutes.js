import React from 'react';
import Damages from '../pages/settings/prices/Damages';
import Damage from '../pages/settings/prices/Damage';
import Fares from '../pages/settings/prices/Fares';
import Fare from '../pages/settings/prices/Fare';
import PriceLists from '../pages/settings/prices/PriceLists/PriceLists';
import PriceList from '../pages/settings/prices/PriceLists/PriceList';
import EditPriceList from '../pages/settings/prices/PriceLists/EditPriceList';
import Ranges from '../pages/settings/prices/Ranges';
import Range from '../pages/settings/prices/Range';
import Extras from '../pages/settings/prices/Extras';
import Extra from '../pages/settings/prices/Extra';
import Workflows from '../pages/settings/workflows/Workflows';
import Workflow from '../pages/settings/workflows/Workflow';
import Franchises from '../pages/settings/prices/franchises/Franchises';
import Franchise from '../pages/settings/prices/franchises/Franchise';
import ClientInfo from '../pages/settings/ClientInfo';
import ClientProfile from '../pages/settings/ClientProfile';
import ClientAccounts from '../pages/settings/clientAccounts/ClientAccounts';
import ClientAccount from '../pages/settings/clientAccounts/ClientAccount';
import RentalLocations from '../pages/settings/rentallocation/RentalLocations';
import RentalLocation from '../pages/settings/rentallocation/RentalLocation';
import SubscriptionDetails from '../pages/settings/subscription/SubscriptionDetails';
import MonthlySubscriptionDetails from '../pages/settings/subscription/MonthlySubscriptionDetails';
import Cargos from '../pages/settings/cargos/Cargos';
import CargosItem from '../pages/settings/cargos/CargosItem';
import IncomeDetails from '../pages/settings/income/IncomeDetails';
import Brand from '../pages/settings/vehicles/brands/Brand';
import Brands from '../pages/settings/vehicles/brands/Brands';
import Model from '../pages/settings/vehicles/models/Model';
import Models from '../pages/settings/vehicles/models/Models';
import Version from '../pages/settings/vehicles/versions/Version';
import Versions from '../pages/settings/vehicles/versions/Versions';

const SETTINGS_ROUTES = [
  { url: '/settings/clientinfo', component: <ClientInfo /> },
  { url: '/settings/abbonamento', component: <SubscriptionDetails /> },
  { url: '/settings/abbonamento/:month', component: <MonthlySubscriptionDetails /> },
  { url: '/settings/incasso', component: <IncomeDetails /> },
  { url: '/settings/puntinolo', component: <RentalLocations /> },
  { url: '/settings/puntinolo/crea', component: <RentalLocation /> },
  { url: '/settings/puntinolo/:id', component: <RentalLocation /> },
  { url: '/settings/listini/tariffe', component: <Fares /> },
  { url: '/settings/listini/tariffe/crea', component: <Fare /> },
  { url: '/settings/listini/tariffe/:id', component: <Fare /> },
  { url: '/settings/listini/tariffe/:id/aggiorna', component: <Fare /> },
  { url: '/settings/listini/danni', component: <Damages /> },
  { url: '/settings/listini/danni/crea', component: <Damage /> },
  { url: '/settings/listini/danni/:id', component: <Damage /> },
  { url: '/settings/listini/fasce', component: <Ranges /> },
  { url: '/settings/listini/fasce/crea', component: <Range /> },
  { url: '/settings/listini/fasce/:id/aggiorna', component: <Range /> },
  { url: '/settings/listini/extra', component: <Extras /> },
  { url: '/settings/listini/extra/crea', component: <Extra /> },
  { url: '/settings/listini/extra/:id/aggiorna', component: <Extra /> },
  { url: '/settings/listini', component: <PriceLists /> },
  { url: '/settings/listini/crea', component: <EditPriceList /> },
  { url: '/settings/listini/:id', component: <PriceList /> },
  { url: '/settings/listini/:id/aggiorna', component: <EditPriceList /> },
  { url: '/settings/veicoli/franchigie', component: <Franchises /> },
  { url: '/settings/veicoli/franchigie/:id', component: <Franchise /> },
  { url: '/settings/profilo', component: <ClientProfile /> },
  { url: '/settings/profiliCliente', component: <ClientAccounts /> },
  { url: '/settings/profiliCliente/crea', component: <ClientAccount /> },
  { url: '/settings/profiliCliente/:id', component: <ClientAccount /> },
  { url: '/settings/flussi', component: <Workflows /> },
  { url: '/settings/flussi/crea', component: <Workflow /> },
  { url: '/settings/flussi/:id', component: <Workflow /> },
  { url: '/settings/flussi/:id/aggiorna', component: <Workflow /> },
  { url: '/settings/cargos', component: <Cargos /> },
  { url: '/settings/cargos/:id', component: <CargosItem /> },
  { url: '/settings/veicoli/marche', component: <Brands /> },
  { url: '/settings/veicoli/marche/crea', component: <Brand /> },
  { url: '/settings/veicoli/marche/:id', component: <Brand /> },
  { url: '/settings/veicoli/modelli', component: <Models /> },
  { url: '/settings/veicoli/modelli/crea', component: <Model /> },
  { url: '/settings/veicoli/modelli/:id', component: <Model /> },
  { url: '/settings/veicoli/versioni', component: <Versions /> },
  { url: '/settings/veicoli/versioni/crea', component: <Version /> },
  { url: '/settings/veicoli/versioni/:id', component: <Version /> },
];

export default SETTINGS_ROUTES;
