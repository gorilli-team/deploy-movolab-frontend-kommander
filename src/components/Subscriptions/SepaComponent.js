import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import React from 'react';
import SepaElement from './SepaElement';

const SepaComponent = ({ onSubmit = null }) => {
  const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

  return (
    <Elements stripe={stripePromise}>
      <SepaElement {...{ onSubmit }} />
    </Elements>
  );
};

export default SepaComponent;
