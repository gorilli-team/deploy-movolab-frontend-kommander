import React, { useContext, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { UserContext } from '../../store/UserContext';
import { CORPORATE_SIDEBAR_MENU } from './CorporateSidebarMenu';
import PageLayout from '../UI/PageLayout';

const colorClasses = {
  bgColor: 'bg-red-400',
  fgColor: 'text-white',
  selectedColor: 'bg-red-600',
  hoverColor: 'hover:bg-red-500',
};

const CorporatePage = ({ canAccess, ...props }) => {
  const userContext = useContext(UserContext);
  const history = useHistory();
  let userData = userContext.data || {};

  props.hasBox = false;

  useEffect(() => {
    const fetch = async () => {
      try {
        let user = userData;
        if (!user.id) user = await userContext.getUserInfo();

        if (canAccess && canAccess.indexOf(user.role) < 0) throw new Error('Unauthorized');
        if (user.role === 'corporate') history.push('/corporate');
      } catch (e) {
        console.error(e);
        if (e === 'Unauthorized') history.push('/');
        else
          history.push(`/signin?${new URLSearchParams({ redirect: document.location.pathname })}`);
      }
    };
    fetch();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <PageLayout
      userContext={userContext}
      sidebarMenu={CORPORATE_SIDEBAR_MENU}
      colorClasses={colorClasses}
      {...props}
    />
  );
};

export default CorporatePage;
