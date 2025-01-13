import AOS from 'aos';
import React, { useContext, useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { Route, Switch, useLocation } from 'react-router-dom';
import './css/style.scss';

import PageNotFound from './pages/PageNotFound';
import ADMIN_ROUTES from './routes/AdminRoutes';
import SETTINGS_ROUTES from './routes/SettingsRoutes';
import DASHBOARD_ROUTES from './routes/DashboardRoutes';
import DOCUMENTS_ROUTES from './routes/DocumentsRoutes';
import GENERIC_ROUTES from './routes/GenericRoutes';
import CORPORATE_ROUTES from './routes/CorporateRoutes';
import { UserContext } from './store/UserContext';

const ROUTES = [];

ROUTES.push(...ADMIN_ROUTES);
ROUTES.push(...SETTINGS_ROUTES);
ROUTES.push(...DASHBOARD_ROUTES);
ROUTES.push(...DOCUMENTS_ROUTES);
ROUTES.push(...GENERIC_ROUTES);
ROUTES.push(...CORPORATE_ROUTES);

const keplero_internal_id = '2fb74e4c-df2f-45ff-8c70-99d1eda132db';
const keplero_external_id = 'f5b99a75-0ac0-4530-8ed6-afbbcf3a315d';

function App() {
  const [kepleroKeyType, setKepleroKeyType] = useState(null);
  const { data: userData } = useContext(UserContext);
  const location = useLocation();
  const path = location.pathname;

  useEffect(() => {
    AOS.init({
      once: true,
      disable: 'phone',
      duration: 600,
      easing: 'ease-out-sine',
    });

    if (!document.querySelector('script[src="https://bundle.keplero.ai/min.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://bundle.keplero.ai/min.js';
      document.body.appendChild(script);
    }
  });

  useEffect(() => {
    document.querySelector('html').style.scrollBehavior = 'auto';
    window.scroll({ top: 0 });
    document.querySelector('html').style.scrollBehavior = '';

    if (
      path.startsWith('/dashboard') ||
      path.startsWith('/settings') ||
      path.startsWith('/corporate')
    ) {
      // Load the second KepleroAI bot for /dashboard or /settings or /corporate
      setKepleroKeyType('internal');
    } else {
      // Load the first KepleroAI bot for all other paths
      setKepleroKeyType(null);
    }
  }, [path]); // triggered on route change

  return (
    <>
      <Switch>
        {ROUTES.map((route) => (
          <Route key={route.url} path={route.url} exact>
            {route.component}
          </Route>
        ))}
        <Route path="*">
          <PageNotFound />
        </Route>
      </Switch>
      
      {/* Nota: tenere separati questo elemento e quello sotto per forzare il redraw quando necessario e ri-inizializzare Keplero */}
      {kepleroKeyType == 'internal' ?
        <kepleroai-chat chatbot={keplero_internal_id}
          userid={`${userData?.fullname || 'fullname'} - ${userData?.client?.ragioneSociale || 'ragioneSociale'}`} /> : null}
      <Toaster />
      {kepleroKeyType != 'internal' ?
        <kepleroai-chat chatbot={keplero_external_id} /> : null}
    </>
  );
}

export default App;
