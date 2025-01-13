import React from 'react';
import { useHistory } from 'react-router-dom'; //eslint-disable-line
import DisplayDateTime from '../UI/dates/DisplayDateTime';
import { invoicingMomentLabel } from '../../utils/Labels';
import ElementLabel from '../UI/ElementLabel';

const InvoiceReceipt = ({ invoice, className = '' }) => {
  const history = useHistory();

  const handleClick = () => {
    const invoiceId = invoice._id;
    history.push(`/dashboard/amministrazione/fatture/${invoiceId}`);
  };

  if (!invoice)
    return (
      <div className={`py-2 ${className}`}>
        <div className="flex flex-wrap text-sm font-semibold justify-between">
          <div>Dati fattura: non presenti</div>
        </div>
      </div>
    );

  return (
    <div
      className={`py-2 pt-3 mb-2 bg-slate-100 hover:bg-slate-200 rounded-xl hover:cursor-pointer px-3 mx-[-0.75rem] text-sm ${className}`}
      onClick={handleClick}
    >
      <div className="flex flex-wrap font-semibold justify-between">
        <div>Fattura</div>
        <div className="text-xs">
          {invoice.invoicingMoment ? (
            invoicingMomentLabel(invoice.invoicingMoment)
          ) : invoice.documentType === 'creditNote' ? (
            <div>
              <ElementLabel bgColor="bg-purple-600">NOTA DI CREDITO</ElementLabel>
            </div>
          ) : null}
        </div>
      </div>
      <div className="flex flex-wrap justify-between items-end">
        {invoice?.invoiceNumber}
        {invoice.createdAt !== undefined ? (
          <div className="text-xs">
            <DisplayDateTime date={invoice.createdAt} displayType={'flat'} />
          </div>
        ) : null}{' '}
      </div>
    </div>
  );
};

export default InvoiceReceipt;
