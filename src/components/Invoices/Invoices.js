import React from 'react';
import WhiteBox from '../UI/WhiteBox';
import InvoiceRecord from './InvoiceRecord';

const Invoices = ({ invoices, ...props }) => {
  if (!invoices || invoices.length === 0) {
    return null;
  }

  return (
    <WhiteBox
      className="mx-0"
      innerClassName="px-6 py-5"
      isCollapsible="true"
      headerChildren={
        <div className="font-bold text-lg">
          Fatture (
          {`${invoices.length} ${invoices.length === 1 ? 'fattura generata' : 'fatture generate'}`})
        </div>
      }
      {...props}
    >
      {invoices?.map((invoice, index) => (
        <InvoiceRecord invoice={invoice} key={invoice._id} index={index} length={invoices.length} />
      ))}
    </WhiteBox>
  );
};

export default Invoices;
