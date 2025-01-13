import React from 'react';
import {
  FaArrowRightArrowLeft,
  FaCar,
  FaCarRear,
  FaCashRegister,
  FaCode,
  FaFileInvoice,
  FaGaugeHigh,
  FaMoneyBill1,
  FaUserGear,
  FaUsers,
} from 'react-icons/fa6';

export const SIDEBAR_MENU = {
  '/admin': {
    label: 'Admin Dashboard',
    icon: ({ ...props }) => <FaGaugeHigh {...props} />,
    exact: true,
  },
  '/admin/clienti/anagrafica': {
    label: 'Clienti',
    icon: ({ ...props }) => <FaUsers {...props} />,
    nestedItems: [
      { label: 'Lista Clienti', url: '/admin/clienti/anagrafica' },
      { label: 'Profili', url: '/admin/utenti/clientProfile' },
      { label: 'Punti Nolo', url: '/admin/clienti/puntinolo' },
    ],
  },
  '/admin/amministrazione': {
    label: 'Amministrazione',
    icon: ({ ...props }) => <FaFileInvoice {...props} />,
  },
  '/admin/veicoli': {
    label: 'Flotta',
    icon: ({ ...props }) => <FaCarRear {...props} />,
  },
  '/admin/workflows': {
    label: 'Flussi',
    icon: ({ ...props }) => <FaArrowRightArrowLeft {...props} />,
  },
  '/admin/movolab': {
    label: 'Pricing',
    icon: ({ ...props }) => <FaUserGear {...props} />,
  },
  '/admin/ripartizione-incassi': {
    label: 'Incassi',
    icon: ({ ...props }) => <FaCashRegister {...props} />,
  },
  '/admin/packs': {
    label: 'Packs',
    icon: ({ ...props }) => <FaMoneyBill1 {...props} />,
  },
  '/admin/codicipartner': {
    label: 'Codici Partner',
    icon: ({ ...props }) => <FaCode {...props} />,
  },
  '/admin/aziende': {
    label: 'Aziende',
    icon: ({ ...props }) => <FaUsers {...props} />,
  },
  '/admin/cargos': {
    label: 'Cargos',
    icon: ({ ...props }) => <FaCar {...props} />,
  },
};
