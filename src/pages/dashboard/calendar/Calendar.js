import React from 'react';
import Page from '../../../components/Dashboard/Page';
import Calendar from '../../../components/Calendar/Calendar';
import { CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR } from '../../../utils/Utils';

const DashboardCalendar = () => <Page canAccess={[CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR]}>
  <Calendar />
</Page>;

export default DashboardCalendar;
