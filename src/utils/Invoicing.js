export const convertInvoicing = (invoicing) => {
  if (invoicing === undefined) return '';
  if (invoicing === 'movolab') return 'Movolab';
  if (invoicing === 'customer') return 'Cliente';
  return invoicing;
};

export const elementHasInvoice = (invoices, invoicingType, invoicingMoment) => {
  const hasMatchingInvoice = invoices.some((item) => {
    return item.invoicingType === invoicingType && item.invoicingMoment === invoicingMoment;
  });

  return hasMatchingInvoice;
};
