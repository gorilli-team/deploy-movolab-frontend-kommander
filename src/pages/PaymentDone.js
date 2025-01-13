import React from 'react';
import EmptyPage from './EmptyPage';

const PaymentDone = () => {
  return (
    <EmptyPage headerProps={{ hideNav: true }}>
      <section className="max-w-6xl md:mx-auto px-4 sm:px-6">
        <h1 className="h1 pb-6 text-center text-gray-600 w-full">Pagamento Effettuato</h1>
        <div className="w-full md:w-96 md:mx-auto text-black">
          <p className="text-center">Il tuo pagamento è stato effettuato con successo.</p>
        </div>
      </section>
    </EmptyPage>
  );
};

export default PaymentDone;
