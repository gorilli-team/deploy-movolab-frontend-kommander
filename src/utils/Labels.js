import React from 'react';
import ElementLabel from '../components/UI/ElementLabel';

const invoicingMoments = {
  reservation: { color: 'bg-orange-500', label: 'In prenotazione' },
  rentOpening: { color: 'bg-green-500', label: 'In apertura movo' },
  rentClosing: { color: 'bg-sky-600', label: 'In chiusura movo' },
  deposit: { color: 'bg-yellow-500', label: 'Deposito' },
  returnDeposit: { color: 'bg-rose-500', label: 'Restituzione deposito' },
};
export const invoicingMomentLabel = (invoicingMoment, className = '') => {
  const labelData = invoicingMoments[invoicingMoment] ?? {
    color: 'bg-slate-500',
    label: invoicingMoment,
  };

  return (
    <ElementLabel bgColor={labelData.color} className={`uppercase ${className}`}>
      {labelData.label}
    </ElementLabel>
  );
};

const invoiceTypes = {
  movolab: { color: 'bg-blue-500', label: 'Movolab' },
  customer: { color: 'bg-gray-500', label: 'Diretta' },
};
export const invoiceTypeLabel = (type, className = '') => {
  const labelData = invoiceTypes[type] ?? { color: 'bg-slate-500', label: type };

  return (
    <ElementLabel bgColor={labelData.color} className={`uppercase ${className}`}>
      {labelData.label}
    </ElementLabel>
  );
};

const paymentMethods = {
  banco: { color: 'bg-yellow-700', label: 'Banco' },
  'carta di credito': { color: 'bg-sky-600', label: 'Carta di credito' },
  bonifico: { color: 'bg-red-700', label: 'Bonifico' },
  stripe: { color: 'bg-blue-500', label: 'Stripe' },
  card_capture: { color: 'bg-purple-500', label: 'Blocco Carta' },
  card_release: { color: 'bg-purple-700', label: 'Sblocco Carta' },
};
export const paymentMethodLabel = (paymentMethod, className = '') => {
  const labelData = paymentMethods[paymentMethod] ?? {
    color: 'bg-slate-500',
    label: paymentMethod,
  };

  return (
    <ElementLabel bgColor={labelData.color} className={`uppercase ${className}`}>
      {labelData.label}
    </ElementLabel>
  );
};
