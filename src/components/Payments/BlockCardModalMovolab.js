import React, { useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { http } from '../../utils/Utils';
import { useForm } from 'react-hook-form';
import { loadStripe } from '@stripe/stripe-js';
import { convertPrice } from '../../utils/Prices';
import { UserContext } from '../../store/UserContext';

import Button from '../UI/buttons/Button';
import ElementLabel from '../UI/ElementLabel';
import Modal from '../UI/Modal';

const BlockCardModalMovolab = ({
  closeModal = () => {},
  invoiceId,
  rentId,
  amount,
  email,
  mode,
}) => {
  const form = useForm();
  const [cardElement, setCardElement] = useState(null);
  const [connectedAccountId, setConnectedAccountId] = useState(null);
  const [connectedAccountIdToPass, setConnectedAccountIdToPass] = useState(null);
  const [stripe, setStripe] = useState(null);
  const [elements, setElements] = useState(null);
  const userContext = useContext(UserContext);
  let userData = userContext.data || {};

  const generateStripePromise = async () => {
    try {
      let stripePromise;
      if (mode === 'movolab') {
        stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
      } else if (mode === 'customer') {
        setConnectedAccountIdToPass(userData?.client?.stripeConnect?.accountId);
        stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY, {
          stripeAccount: userData?.client?.stripeConnect?.accountId,
        });
      }
      return stripePromise;
    } catch (error) {
      console.error('Error in getting stripe promise', error);
    }
  };

  useEffect(() => {
    const initializeStripe = async () => {
      const stripeInstance = await generateStripePromise();
      setStripe(stripeInstance);
      const elementsInstance = stripeInstance.elements();
      const card = elementsInstance.create('card', {
        style: {
          base: {
            color: '#32325d',
            fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
            fontSize: '16px',
            lineHeight: '24px',
            padding: '10px',
            '::placeholder': {
              color: '#aab7c4',
            },
          },
          invalid: {
            color: '#fa755a',
            iconColor: '#fa755a',
          },
        },
      });
      card.mount('#card-element'); // Mount the card element to the DOM
      setCardElement(card);
      setElements(elementsInstance);
    };
    initializeStripe();
    return () => {
      if (cardElement) {
        cardElement.unmount(); // Clean up the card element on unmount
      }
    };
  }, [connectedAccountId]);

  const onSubmit = async (data) => {
    try {
      let paymentMethod;
      let error;

      const response = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      paymentMethod = response.paymentMethod;
      error = response.error;

      if (error) {
        toast.error('Errore nel blocco della carta');
        return;
      }

      await http({
        url: `/payments/card-captures/block-funds`,
        method: 'POST',
        form: {
          invoiceId: invoiceId,
          rentId,
          email,
          paymentMethodId: paymentMethod.id,
          invoicingType: mode,
          amount: amount,
          connectedAccountId: connectedAccountIdToPass,
        },
      });

      toast.success('Plafond bloccato sulla carta di credito inserita');
      closeModal();
    } catch (error) {
      toast.error("Errore nell'invio del link");
    }
  };

  const exitFromModal = () => {
    closeModal();
  };

  return (
    <>
      <Modal
        isVisible={true}
        size="xs"
        bgClassName="items-start"
        className="md:mt-40"
        headerChildren={
          <div className="flex space-x-2">
            <span className="text-sm">Inserisci Carta di Credito</span>
            <>{mode === 'movolab' && <ElementLabel bgColor="bg-blue-500">Movolab</ElementLabel>}</>
            <>
              {mode === 'customer' && <ElementLabel bgColor="bg-gray-500">Personale</ElementLabel>}
            </>
          </div>
        }
        onClose={(e) => {
          e.preventDefault();
          exitFromModal();
        }}
        innerClassName="px-6 py-4 relative"
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="mt-2">
            <div
              id="card-element"
              className="border border-gray-300 p-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></div>
            <div id="card-errors" role="alert" className="text-red-500 mt-2"></div>{' '}
            {/* For displaying card errors */}
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <Button btnStyle="inFormStyle" className="py-1">
              Blocca Plafond <strong>{convertPrice(amount)}</strong>
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default BlockCardModalMovolab;
