import React, { useContext, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { UserContext } from '../../store/UserContext';
import { SIDEBAR_MENU } from './SidebarMenu.js';

import PageLayout from '../UI/PageLayout.js';

const colorClasses = {
  bgColor: 'bg-gray-400',
  fgColor: 'hover:text-gray-700',
  selectedColor: 'bg-slate-100 text-gray-700',
  hoverColor: 'hover:bg-gray-300',
};

const Page = ({ canAccess, ...props }) => {
  const userContext = useContext(UserContext);
  const history = useHistory();
  let userData = userContext.data || {};
  // const [userLoading, setUserLoading] = useState(!userData.id);

  props.hasBox = false;

  useEffect(() => {
    const fetch = async () => {
      try {
        let user = userData;
        const isAdmin = userData.role === 'admin';
        if (!user.id) user = await userContext.getUserInfo();

        if (!isAdmin && !user?.client?.enabled) {
          history.push('/inapprovazione');
        }
        // if (!user.emailVerified)
        //   history.push(
        //     `/confirmAddress?${new URLSearchParams({ redirect: document.location.pathname })}`,
        //   );
        if (canAccess && canAccess.indexOf(user.role) < 0) throw new Error('Unauthorized');
        if (!user.client) history.push('/settings/clientInfo');
        // setUserLoading(false);
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

  return (
    <PageLayout
      userContext={userContext}
      sidebarMenu={SIDEBAR_MENU}
      colorClasses={colorClasses}
      {...props}
    />
  );
};

export default Page;
