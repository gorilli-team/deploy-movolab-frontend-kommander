import React from 'react';
import DisplayDateTime from '../UI/dates/DisplayDateTime';
import { convertPrice } from '../../utils/Prices';
import { paymentMethodLabel } from '../../utils/Labels';

const PaymentReceipt = ({ payment, className = '' }) => {
  if (!payment)
    return (
      <div className="m-2 mb-4 border rounded-lg p-2">
        <div className="flex flex-wrap text-sm font-semibold justify-between">
          <div>Pagamento non presente</div>
        </div>
      </div>
    );

  return (
    <div className={`py-2 pt-3 bg-slate-100 rounded-xl px-3 mx-[-0.75rem] text-sm ${className}`}>
      <div className="flex flex-wrap font-semibold justify-between">
        <div>
          {payment?.paymentMoment === 'returnDeposit'
            ? 'Rimborso'
            : payment?.paymentMoment === 'deposit'
            ? 'Deposito'
            : 'Pagamento'}
        </div>
        <div className="text-xs">{paymentMethodLabel(payment.paymentMethod, '!py-[0.1rem]')}</div>
      </div>
      <div className="flex flex-wrap justify-between items-end">
        {convertPrice(payment.paymentAmount)}
        {payment.createdAt !== undefined ? (
          <div className="text-xs">
            <DisplayDateTime date={payment.createdAt} displayType={'flat'} />
          </div>
        ) : null}{' '}
      </div>
    </div>
  );
};

export default PaymentReceipt;
