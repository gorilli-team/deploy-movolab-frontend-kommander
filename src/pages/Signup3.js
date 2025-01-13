import React, { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { loadStripe } from '@stripe/stripe-js';
import Button from '../components/UI/buttons/Button';
import Stepper from '../components/UI/Stepper';
import Loader from '../components/UI/Loader';

import EmptyPage from './EmptyPage';
import { FaCreditCard } from 'react-icons/fa6';
import { TextField } from '../components/Form/TextField';
import { useHistory } from 'react-router-dom';
import { UserContext } from '../store/UserContext';
import { http } from '../utils/Utils';

const stripePromise = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY)
  : null;

const Signup3 = () => {
  const history = useHistory();
  const form = useForm();
  const userContext = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(async () => {
    const userData = await userContext.getUserInfo();
    const clientData = userData?.client;

    if (clientData) {
      if (clientData?.ragioneSociale) {
        form.setValue('ibanName', clientData?.ragioneSociale);
      }
      if (clientData?.address?.address) {
        form.setValue('ibanAddress', clientData?.address?.address);
      }
      if (clientData?.address?.zipCode) {
        form.setValue('ibanCap', clientData?.address?.zipCode);
      }
      if (clientData?.address?.city) {
        form.setValue('ibanCity', clientData?.address?.city);
      }
      if (clientData?.pec) {
        form.setValue('ibanPec', clientData?.pec);
      }
    }
  }, []);

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const stripe = await stripePromise;
      const userData = await userContext.getUserInfo();

      // Get SetupIntent client secret from the server
      const setupIntentResponse = await http({
        url: '/subscriptions/sepa/create',
        method: 'POST',
        form: {
          email: userData?.client?.email,
          name: userData?.client?.ragioneSociale,
          address: userData?.client?.address?.address,
          cap: userData?.client?.address?.zipCode,
          city: userData?.client?.address?.city,
          /* name: form.getValues('ibanName'),
          address: form.getValues('ibanAddress'),
          cap: form.getValues('ibanCap'),
          city: form.getValues('ibanCity'), */
        },
      });

      // const setupIntent = setupIntentResponse.setupIntent;
      // const customer = setupIntentResponse.client;

      const { setupIntent, customer } = setupIntentResponse;

      // Confirm the setup of SEPA Direct Debit with the IBAN
      const { setupIntent: confirmedSetupIntent, error } = await stripe.confirmSepaDebitSetup(
        setupIntent.client_secret,
        {
          payment_method: {
            sepa_debit: {
              iban: form.getValues('iban'),
            },
            billing_details: {
              name: userData?.client?.ragioneSociale,
              email: userData?.client?.email,
              address: {
                line1: userData?.client?.address?.address,
                postal_code: userData?.client?.address?.zipCode,
                city: userData?.client?.address?.city,
                country: 'IT',
              },
            },
          },
        },
      );

      if (error) {
        let errorMessage = 'Si è verificato un errore durante la registrazione';
        if (error.type === 'invalid_request_error') {
          if (error.code === 'bank_account_unusable') {
            errorMessage += ': il conto bancario non è utilizzabile';
          } else {
            errorMessage += ': richiesta non valida';
          }
        } else {
          errorMessage += ': errore nella richiesta';
        }

        toast.error(errorMessage);
        setIsLoading(false);
        return;
      }

      // Save payment method and customer ID in your database
      const response = await http({
        url: `/clients/client/${userData?.client?._id}`,
        method: 'PUT',
        data: {
          stripeCustomerId: customer,
          stripePaymentMethodId: confirmedSetupIntent.payment_method,
          subscriptionPaymentMethod: 'sepa',
        },
      });

      if (response) {
        // Send an approval email
        await http({
          url: `/clients/emails/approvalEmail/${userData?.client?._id}`,
          method: 'POST',
          data: {
            email: userData?.client?.email,
          },
        });
        history.push('/dashboard');
      } else {
        toast.error('Errore durante la registrazione');
        history.push('/dashboard');
      }
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      console.error(err);
      toast.error('Errore durante la registrazione');
    }
  };

  const goBack = (e) => {
    e.preventDefault();
    history.push('/signup/2');
  };

  return (
    <EmptyPage className="py-12 px-6" headerProps={{ hideNav: true }}>
      {isLoading && (
        <div className="flex flex-col text-black text-lg">
          <div className="flex justify-center items-center h-48">
            <div className="flex justify-center items-center w-full h-full">
              <Loader />
            </div>
          </div>
        </div>
      )}
      {!isLoading && (
        <div className="flex flex-col text-black">
          <h1 className="h2 text-center text-gray-600 mb-4">Benvenuto in Movolab!</h1>

          <div className="flex justify-center">
            <Stepper
              steps={[
                { content: '1' },
                { content: '2' },
                { content: '3' },
                { content: '4', isCurrent: true },
              ]}
            ></Stepper>
          </div>

          <h2 className="py-6 text-center text-gray-400">
            Scegli il tipo di pagamento e procedi per attivare il servizio
          </h2>

          <form onSubmit={form.handleSubmit(onSubmit)}>
            <fieldset
              className="flex flex-col max-w-3xl gap-2 mx-auto"
              disabled={form.formState.isSubmitting}
            >
              <div className="flex flex-wrap md:flex-nowrap gap-3">
                <div className="w-full md:w-1/2">
                  <strong className="block text-gray-700 text-sm font-medium pb-1">
                    Modalità di pagamento
                  </strong>
                  <div className="flex gap-2 text-sm text-gray-500">
                    <label className="w-1/2 bg-white" title="Non ancora disponibile">
                      <input
                        type="radio"
                        name="subscriptionPaymentMethod"
                        value="creditCard"
                        className="hidden peer"
                        {...form.register('subscriptionPaymentMethod')}
                        disabled
                      />
                      <div className="border p-2 px-3 rounded cursor-not-allowed border-gray-500">
                        <FaCreditCard className="h-5 w-5 mb-1" />
                        Carta
                      </div>
                    </label>
                    <label className="w-1/2 bg-white">
                      <input
                        type="radio"
                        name="subscriptionPaymentMethod"
                        value="sepa"
                        className="hidden peer"
                        {...form.register('subscriptionPaymentMethod')}
                        checked
                      />
                      <div className="border p-2 px-3 rounded cursor-pointer text-gray-700 hover:bg-slate-100 border-slate-700 peer-checked:outline outline-1">
                        <img src="/sepa_logo.png" className="h-5 mb-1" alt={'Sepa logo'} />
                        Addebito diretto SEPA
                      </div>
                    </label>
                  </div>
                </div>
                <div className="w-full md:w-1/2"></div>
              </div>
              <div className="flex flex-wrap md:flex-nowrap gap-3">
                <div className="w-full md:w-1/2">
                  <TextField
                    labelColor="text-gray-700"
                    form={form}
                    name="iban"
                    type="string"
                    label="IBAN"
                    placeholder="IBAN"
                    validation={{
                      required: {
                        value: true,
                        message: 'IBAN obbligatorio',
                      },
                    }}
                  />
                </div>
                <div className="w-full md:w-1/2">
                  <TextField
                    labelColor="text-gray-700"
                    form={form}
                    name="ibanName"
                    type="string"
                    label="Nome sul conto"
                    placeholder="Nome sul conto"
                    /*validation={{
                      required: {
                        value: true,
                        message: 'Nome obbligatorio',
                      },
                    }}*/
                    disabled
                  />
                </div>
              </div>
              {/* <div className="flex flex-wrap md:flex-nowrap gap-3">
                <div className="w-full md:w-1/2">
                  <TextField
                    labelColor="text-gray-700"
                    form={form}
                    name="ibanAddress"
                    type="string"
                    label="Indirizzo fatturazione"
                    placeholder="Indirizzo fatturazione"
                    validation={{
                      required: {
                        value: true,
                        message: 'Indirizzo obbligatorio',
                      },
                    }}
                  />
                </div>
                <div className="w-full md:w-1/2">
                  <TextField
                    labelColor="text-gray-700"
                    form={form}
                    name="ibanCap"
                    type="string"
                    label="CAP"
                    placeholder="CAP"
                    validation={{
                      required: {
                        value: true,
                        message: 'CAP obbligatorio',
                      },
                    }}
                  />
                </div>
              </div>
              <div className="flex flex-wrap md:flex-nowrap gap-3">
                <div className="w-full md:w-1/2">
                  <TextField
                    labelColor="text-gray-700"
                    form={form}
                    name="ibanCity"
                    type="string"
                    label="Città"
                    placeholder="Città"
                    validation={{
                      required: {
                        value: true,
                        message: 'Città obbligatoria',
                      },
                    }}
                  />
                </div>
                <div className="w-full md:w-1/2">
                  <TextField
                    labelColor="text-gray-700"
                    form={form}
                    name="ibanPec"
                    type="string"
                    label="PEC"
                    placeholder="PEC"
                    validation={{
                      required: {
                        value: true,
                        message: 'PEC obbligatoria',
                      },
                    }}
                  />
                </div>
              </div> */}
              <div className="text-gray-600 text-sm pt-4">
                Confermando il tuo abbonamento, consenti a Movolab Srl di addebitarti i pagamenti
                futuri in base a quanto previsto dai relativi termini e condizioni.
                <br />
                Facendo clic su Entra, autorizzi (A) Movolab Srl e Stripe, il nostro fornitore di
                servizi di pagamento, a inviare istruzioni alla tua banca per l'addebito sul tuo
                conto e (B) la tua banca a procedere con tale addebito conformemente alle istruzioni
                ricevute.
                <p className="mt-2 text-sm">
                  <span className="text-red-600 ml-1">*</span> campo obbligatorio
                </p>
              </div>

              <div className="flex flex-col gap-3 mt-5 md:block md:mx-auto md:space-x-3">
                <Button
                  btnStyle="gray"
                  className="w-full md:w-auto md:px-10 py-3 !text-base"
                  onClick={goBack}
                >
                  Indietro
                </Button>
                <Button
                  btnStyle="blue"
                  className="w-full md:w-auto md:px-10 py-3 !text-base"
                  type="submit"
                >
                  Entra
                </Button>
              </div>
            </fieldset>
          </form>
        </div>
      )}
    </EmptyPage>
  );
};

export default Signup3;
