import React from 'react';
import {
  FaArrowRightArrowLeft,
  FaBuildingUser,
  FaCar,
  FaCoins,
  FaGaugeHigh,
  FaLocationDot,
  FaMoneyCheckDollar,
  FaServer,
  FaTableList,
  FaUser,
  FaUsers,
} from 'react-icons/fa6';

import { CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR } from '../../utils/Utils';

export const SETTINGS_SIDEBAR_MENU = {
  '/settings/clientInfo': {
    label: 'Profilo azienda',
    icon: ({ ...props }) => <FaBuildingUser {...props} />,
    allowedRoles: [CLIENT_ROLE_ADMIN],
  },
  '/settings/profilo': {
    label: 'Profilo',
    icon: ({ ...props }) => <FaUser {...props} />,
    allowedRoles: [CLIENT_ROLE_OPERATOR],
  },
  '/settings/abbonamento': {
    label: 'Abbonamento',
    icon: ({ ...props }) => <FaCoins {...props} />,
    allowedRoles: [CLIENT_ROLE_ADMIN],
  },
  '/settings/incasso': {
    label: 'Incasso',
    icon: ({ ...props }) => <FaMoneyCheckDollar {...props} />,
    allowedRoles: [CLIENT_ROLE_ADMIN],
  },
  '/settings/puntinolo': {
    label: 'Punti nolo',
    icon: ({ ...props }) => <FaLocationDot {...props} />,
    allowedRoles: [CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR],
  },
  '/settings/listini': {
    label: 'Listini',
    icon: ({ ...props }) => <FaTableList {...props} />,
    allowedRoles: [CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR],
    nestedItems: [
      {
        label: 'Listini',
        url: '/settings/listini',
      },
      { label: 'Tariffe', url: '/settings/listini/tariffe' },
      {
        label: 'Fasce',
        url: '/settings/listini/fasce',
      },
      { label: 'Franchigie', url: '/settings/veicoli/franchigie' },
      {
        label: 'Danni',
        url: '/settings/listini/danni',
      },
      { label: 'Extra', url: '/settings/listini/extra' },
    ],
  },
  '/settings/flussi': {
    label: 'Flussi',
    icon: ({ ...props }) => <FaArrowRightArrowLeft {...props} />,
    allowedRoles: [CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR],
  },
  '/settings/profiliCliente': {
    label: 'Utenti',
    icon: ({ ...props }) => <FaUsers {...props} />,
    allowedRoles: [CLIENT_ROLE_ADMIN],
  },

  '/settings/cargos': {
    label: 'Cargos',
    icon: ({ ...props }) => <FaServer {...props} />,
    allowedRoles: [CLIENT_ROLE_ADMIN],
    allowedLicense: ['client'],
  },
  '/settings/veicoli/versioni': {
    label: 'Veicoli',
    icon: ({ ...props }) => <FaCar {...props} />,
    allowedRoles: [CLIENT_ROLE_ADMIN],
    allowedLicense: ['client'],
    nestedItems: [
      {
        label: 'Marche',
        url: '/settings/veicoli/marche',
      },
      {
        label: 'Modelli',
        url: '/settings/veicoli/modelli',
      },
      {
        label: 'Versioni',
        url: '/settings/veicoli/versioni',
      },
    ],
  },
  '/dashboard': {
    label: 'Torna a dashboard',
    icon: ({ ...props }) => <FaGaugeHigh {...props} />,
  },
};
