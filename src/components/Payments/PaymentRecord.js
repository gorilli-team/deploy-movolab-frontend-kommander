import React, { useState, useEffect } from 'react';
import { convertPrice } from '../../utils/Prices';
import { FaAngleDown } from 'react-icons/fa6';
import { invoicingMomentLabel, paymentMethodLabel } from '../../utils/Labels';
import { http } from '../../utils/Utils';

const mapItemPaid = (itemPaid) => {
  switch (itemPaid) {
    case 'amountInfo':
      return 'Utilizzo';
    case 'extraCostsAmountInfo':
      return 'Costi Extra';
    case 'extraServicesAmountInfo':
      return 'Servizi Extra';
    case 'fuelExtraAmountInfo':
      return 'Carburante';
    case 'kmExtraAmountInfo':
      return 'Km Extra';
    case 'damagesAmountInfo':
      return 'Danni';
    case 'kaskoFranchiseAmountInfo':
      return 'Franchigia Kasko';
    case 'rcaFranchiseAmountInfo':
      return 'Franchigia RCA';
    case 'ifFranchiseAmountInfo':
      return 'Franchigia Incendio e Furto';
    case 'extraDaysAmountInfo':
      return 'Giorni Extra';
    case 'deposit':
      return 'Deposito';
    case 'returnDeposit':
      return 'Restituzione Deposito';
    default:
      return itemPaid;
  }
};

const PaymentRecord = ({ payment, isExpanded = false, className = '', expandable = true }) => {
  const [expanded, setExpanded] = useState(isExpanded);
  const [invoice, setInvoice] = useState(undefined);

  const fetchInvoice = async () => {
    if (payment?.invoice) {
      const response = await http({
        url: `/invoice/${payment?.invoice}`,
        method: 'GET',
      });
      setInvoice(response);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [payment?.invoice]); // eslint-disable-line

  return (
    <div className={`border-gray-300 ${className}`}>
      <div
        className="flex text-sm justify-end gap-x-4 gap-y-1 flex-wrap px-3 py-2 cursor-pointer hover:bg-slate-50 active:bg-slate-100"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 flex flex-wrap gap-x-4 gap-y-1">
          <div className="w-44">{invoicingMomentLabel(payment.paymentMoment)}</div>
          <div>{paymentMethodLabel(payment.paymentMethod, '!py-[0.1rem]')}</div>
        </div>

        <div className="flex justify-end gap-x-4">
          <div className="w-32">
            <span className="font-semibold">Data pagamento</span>
            <br />
            {payment.createdAt !== undefined && new Date(payment.createdAt).toLocaleDateString()}
          </div>
          <div className="w-24">
            <span className="font-semibold">Fatturazione</span>
            <br />
            {payment.invoicingType === 'movolab' ? 'Movolab' : 'Diretta'}
          </div>

          {invoice !== undefined && (
            <>
              <div className="w-32">
                <span className="font-semibold">Fattura numero</span>
                <br />
                {invoice.invoiceNumber}
              </div>
              <div className="w-24">
                <span className="font-semibold">Data fattura</span>
                <br />
                {invoice.createdAt !== undefined &&
                  new Date(invoice.createdAt).toLocaleDateString()}
              </div>
            </>
          )}

          <div className="w-20">
            <span className="font-semibold">Totale</span>
            <br />
            {convertPrice(payment?.paymentAmount)}
          </div>
        </div>
        {expandable ? (
          <div className="flex flex-end p-3">
            <button>
              <FaAngleDown className={`text-lg ${expanded && 'transform rotate-180'}`} />
            </button>
          </div>
        ) : null}
      </div>
      {expanded ? (
        <div className="text-sm px-3 py-2">
          {payment.paymentItems.map((paymentItem) =>
            !paymentItem || !paymentItem?.amount ? null : (
              <div className="flex justify-end gap-x-4" key={paymentItem._id}>
                <div className="flex-1 flex justify-end">
                  <div className="w-60 font-semibold">{mapItemPaid(paymentItem?.itemPaid)}</div>
                </div>
                <div className="w-20">{convertPrice(paymentItem?.amount)}</div>
                <div className="w-[42px]"></div>
              </div>
            ),
          )}
        </div>
      ) : null}
    </div>
  );
};

export default PaymentRecord;
