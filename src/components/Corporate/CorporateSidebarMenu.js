import React from 'react';
import {
  FaArrowsTurnToDots,
  FaBellConcierge,
  FaCalendarPlus,
  FaRegCalendarCheck,
  FaUser,
} from 'react-icons/fa6';

// import { CORPORATE_ROLE_ADMIN, CORPORATE_ROLE_OPERATOR } from '../../utils/Utils';

export const CORPORATE_SIDEBAR_MENU = {
  '/corporate/calendario': {
    label: 'Calendario',
    icon: ({ ...props }) => <FaRegCalendarCheck {...props} />,
    // exact: true,
  },
  '/corporate/prenotazioni/crea': {
    label: 'Crea Prenotazione',
    icon: ({ ...props }) => <FaCalendarPlus {...props} />,
    // exact: true,
  },
  '/corporate/prenotazioni': {
    label: 'Prenotazioni',
    icon: ({ ...props }) => <FaBellConcierge {...props} />,
    exact: true,
  },
  '/corporate/movimenti': {
    label: 'Movo',
    icon: ({ ...props }) => <FaArrowsTurnToDots {...props} />,
  },
  '/corporate/clienti': {
    label: 'Clienti',
    icon: ({ ...props }) => <FaUser {...props} />,
  },
};
