import React, { useState } from 'react';
import WhiteBox from '../UI/WhiteBox';
import PaymentRecord from './PaymentRecord';

const Payments = ({
  elem,
  expanded,
  noCollapsible,
  innerClassName = '',
  isPrint = false,
  ...props
}) => {
  const [payments, setPayments] = useState(elem?.payments);

  if (elem?.payments?.length !== payments?.length) {
    setPayments(elem?.payments);
  }

  if (!payments || payments.length === 0) {
    return null;
  }

  return (
    <WhiteBox
      className={noCollapsible ? 'mx-0 my-0 px-6 py-5' : 'mx-0'}
      innerClassName="px-6 py-5"
      isCollapsible={!(noCollapsible || false)}
      isExpanded={expanded}
      headerChildren={
        <div className="font-bold text-lg">
          Pagamenti (
          {`${payments.length} ${
            payments.length === 1 ? 'pagamento effettuato' : 'pagamenti effettuati'
          }`}
          )
        </div>
      }
      {...props}
    >
      <div
        className={`border-gray-300 divide-y border rounded-lg overflow-hidden ${innerClassName}`}
      >
        {payments?.map((payment, index) => (
          <PaymentRecord
            payment={payment}
            key={payment._id}
            index={index}
            length={payments.length}
            expandable={!isPrint}
          />
        ))}
      </div>
    </WhiteBox>
  );
};

export default Payments;
