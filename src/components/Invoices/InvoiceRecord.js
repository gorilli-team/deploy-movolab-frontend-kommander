import React from 'react';
import Button from '../UI/buttons/Button';
import { convertPrice } from '../../utils/Prices';
import ElementLabel from '../UI/ElementLabel';
import { invoicingMomentLabel, invoiceTypeLabel } from '../../utils/Labels';

const InvoiceRecord = ({ invoice, className = '', index = 0, length = 1 }) => {
  const classes =
    length === 1
      ? 'border rounded-lg'
      : index === 0
      ? 'border-t rounded-t-lg border-b'
      : index === length - 1
      ? 'border-b rounded-b-lg'
      : 'border-b';

  return (
    <div className={`border-gray-300 border-x overflow-hidden ${classes} ${className}`}>
      <div className="flex text-sm justify-end gap-x-4 gap-y-1 flex-wrap px-3 py-2">
        <div className="flex-1 flex flex-wrap gap-x-4 gap-y-1">
          <div className="w-52">
            {invoice.invoicingMoment ? (
              invoicingMomentLabel(invoice.invoicingMoment)
            ) : invoice.documentType === 'creditNote' ? (
              <div>
                <ElementLabel bgColor="bg-purple-600">NOTA DI CREDITO</ElementLabel>
              </div>
            ) : null}
          </div>

          <div>{invoiceTypeLabel(invoice.invoicingType)}</div>
        </div>

        <div className="flex justify-end gap-x-4">
          <div className="w-36">
            <span className="font-semibold">Fattura numero</span>
            <br />
            {invoice.invoiceNumber}
          </div>
          <div className="w-32">
            <span className="font-semibold">Data fattura</span>
            <br />
            {invoice.createdAt !== undefined && new Date(invoice.createdAt).toLocaleDateString()}
          </div>
          <div className="w-20">
            <span className="font-semibold">Imponibile</span>
            <br />
            {convertPrice(invoice?.price?.priceNoVat)}
          </div>
          <div className="w-16">
            <span className="font-semibold">IVA</span>
            <br />
            {convertPrice(invoice?.price?.vatAmount)}
          </div>
          <div className="w-20">
            <span className="font-semibold">Totale</span>
            <br />
            {convertPrice(invoice?.price?.finalPrice)}
          </div>
        </div>
        <div className="flex flex-end items-center">
          <Button
            to={`/dashboard/amministrazione/fatture/${invoice._id}`}
            btnStyle="tableItemAction"
          >
            Dettagli &raquo;
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceRecord;
