import { useStripe, useElements, IbanElement } from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';
import React, { useState } from 'react';
import Button from '../../components/UI/buttons/Button';
import { http } from '../../utils/Utils';

// Initialize Stripe with your publishable key

const SepaElement = ({ selectedPack, onSubmit }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [email, setEmail] = useState(''); //eslint-disable-line
  const [name, setName] = useState(''); //eslint-disable-line
  const [status, setStatus] = useState(null); //eslint-disable-line

  const handleSubmit = async (event) => {
    event.preventDefault();

    const inputData = {
      name,
      email,
    };

    const response = await http({
      url: '/subscriptions/sepa/create',
      method: 'POST',
      form: inputData,
    });

    const setupIntent = response.setupIntent;
    const client = response.client;

    const ibanElement = elements.getElement(IbanElement);

    const { error, setupIntent: confirmedSetupIntent } = await stripe.confirmSepaDebitSetup(
      setupIntent.client_secret,
      {
        payment_method: {
          sepa_debit: ibanElement,
          billing_details: {
            name: client?.ragioneSociale,
            email: client?.email,
          },
        },
      },
    );

    if (error) {
      console.error(error);
      setStatus('error');
      toast.error('Errore durante la conferma del pagamento', { duration: 5000 });
    } else {
      setStatus('success');
      toast.success('Addebiti SEPA impostati');

      if (onSubmit) {
        onSubmit();
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="font-semibold text-md">
        Imposta Iban per addebitare i costi della piattaforma
      </div>
      <div className="mt-3 p-2 border border-gray-300 rounded-md shadow-sm w-96">
        <IbanElement
          id="iban-element"
          className="block w-100 px-3 py-2 border-none focus:outline-none sm:text-sm"
          options={{ supportedCountries: ['SEPA'], placeholderCountry: 'IT' }}
        />{' '}
      </div>

      {/* <Button type="submit" btnStyle="primary" disabled={!stripe}>
          Setup SEPA
        </Button> */}
      <div className="mt-5">
        <Button btnStyle="blue" className="py-1" type="submit">
          Imposta addebiti SEPA
        </Button>
      </div>
    </form>
  );
};

export default SepaElement;
