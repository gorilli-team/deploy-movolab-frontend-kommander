import React from 'react';
import {
  FaArrowsTurnToDots,
  FaBellConcierge,
  FaCarSide,
  FaFileInvoice,
  FaFileLines,
  FaRegCalendarCheck,
  FaUser,
} from 'react-icons/fa6';

export const SIDEBAR_MENU = {
  '/dashboard/calendario': {
    label: 'Calendario',
    icon: ({ ...props }) => <FaRegCalendarCheck {...props} />,
  },
  '/dashboard/prenotazioni': {
    label: 'Prenotazioni',
    icon: ({ ...props }) => <FaBellConcierge {...props} />,
  },
  '/dashboard/movimenti': {
    label: 'Movo',
    icon: ({ ...props }) => <FaArrowsTurnToDots {...props} />,
  },
  '/dashboard/amministrazione': {
    label: 'Amministrazione',
    icon: ({ ...props }) => <FaFileInvoice {...props} />,
  },
  '/dashboard/veicoli/flotta': {
    label: 'Veicoli',
    icon: ({ ...props }) => <FaCarSide {...props} />,
  },
  '/dashboard/utenti': {
    label: 'Clienti',
    icon: ({ ...props }) => <FaUser {...props} />,
  },
  '/dashboard/operazioni/multe': {
    label: 'Multe',
    icon: ({ ...props }) => <FaFileLines {...props} />,
  },
};
