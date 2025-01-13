import React from 'react';
import Calendar from '../../components/Calendar/Calendar';
import { CORPORATE_ROLE_ADMIN } from '../../utils/Utils';
import CorporatePage from '../../components/Corporate/CorporatePage';

const CorporateCalendar = () => <CorporatePage canAccess={CORPORATE_ROLE_ADMIN}>
  <Calendar />
</CorporatePage>;

export default CorporateCalendar;
