import React from 'react';
import EmptyPage from './EmptyPage';

const PaymentFailed = () => {
  return (
    <EmptyPage headerProps={{ hideNav: true }}>
      <section className="max-w-6xl md:mx-auto px-4 sm:px-6">
        <h1 className="h1 pb-6 text-center text-gray-600 w-full">Pagamento Fallito</h1>
        <div className="w-full md:w-96 md:mx-auto text-black"></div>
      </section>
    </EmptyPage>
  );
};

export default PaymentFailed;
