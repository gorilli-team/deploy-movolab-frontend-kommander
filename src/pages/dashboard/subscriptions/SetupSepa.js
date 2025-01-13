import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import React from 'react';
import Page from '../../../components/Dashboard/Page';
import { CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR } from '../../../utils/Utils';
import WhiteBox from '../../../components/UI/WhiteBox';
import SepaElement from '../../../components/Subscriptions/SepaElement';

const SetupSepa = () => {
  const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

  return (
    <Page canAccess={[CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR]}>
      <WhiteBox>
        <Elements stripe={stripePromise}>
          <SepaElement />
        </Elements>
      </WhiteBox>
    </Page>
  );
};

export default SetupSepa;
