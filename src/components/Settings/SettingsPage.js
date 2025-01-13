import React, { useContext, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { UserContext } from '../../store/UserContext';
import { SETTINGS_SIDEBAR_MENU } from './SettingsSidebarMenu';
import PageLayout from '../UI/PageLayout';

const SettingsPage = ({ canAccess, ...props }) => {
  const userContext = useContext(UserContext);
  const history = useHistory();
  let userData = userContext.data || {};

  useEffect(() => {
    const fetch = async () => {
      try {
        let user = userData;
        if (!user.id) user = await userContext.getUserInfo();
        // if (!user.emailVerified) history.push(`/confirmAddress?${new URLSearchParams({ redirect: document.location.pathname })}`);
        if (canAccess && canAccess.indexOf(user.role) < 0) throw new Error('Unauthorized');
        if (user.role === 'admin') history.push('/admin');
      } catch (e) {
        console.error(e);
        // user logged in, but not authorized to page
        if (e === 'Unauthorized') history.push('/dashboard');
        // user not logged in
        else
          history.push(`/signin?${new URLSearchParams({ redirect: document.location.pathname })}`);
      }
    };
    fetch();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <PageLayout userContext={userContext} sidebarMenu={SETTINGS_SIDEBAR_MENU} {...props} />;
};

export default SettingsPage;
