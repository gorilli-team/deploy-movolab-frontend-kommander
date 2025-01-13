import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { http } from '../../utils/Utils';
import Button from '../UI/buttons/Button';
import ElementLabel from '../UI/ElementLabel';
import DisplayDateTime from '../UI/dates/DisplayDateTime';
import LoadingSpinner from '../../assets/icons/LoadingSpinner';

const ClientPayouts = ({ client, stripeConnectInfo, message, isClient }) => {
  const [accountData, setAccountData] = useState(null);
  const [showAccountDetails, setShowAccountDetails] = useState(false);
  const [showAddConnectButton, setShowAddConnectButton] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchClient();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchClient = async () => {
    try {
      let retrieveStripeConnect;

      if (isClient) {
        await http({
          method: 'GET',
          url: `/clients/client`,
        });

        retrieveStripeConnect = await http({
          method: 'GET',
          url: `/payments/stripe-connect/retrieve`,
        });
      } else {
        await http({
          method: 'GET',
          url: `/clients/client?client=${client?._id}`,
        });

        retrieveStripeConnect = await http({
          method: 'GET',
          url: `/payments/stripe-connect/retrieve?client=${client?._id}`,
        });
      }
      setAccountData(retrieveStripeConnect);
      setShowAccountDetails(true);
      setIsLoading(false);
    } catch (error) {
      setShowAccountDetails(false);
      setShowAddConnectButton(true);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setStripeConnectSuccess();
  }, [stripeConnectInfo]);

  if (message === 'refresh') {
    toast.error('Rigenera il link Stripe per poter connettere la tua attività');
  }

  const setStripeConnectOauth = async () => {
    try {
      // Call the /connect endpoint
      const response = await http({
        url: `/payments/stripe-connect/connect`,
        method: 'GET',
      });

      if (response.url) {
        // Open the Stripe OAuth URL in a new tab
        window.open(response.url, '_blank');
      } else {
        throw new Error('No URL returned from the server');
      }
    } catch (error) {
      console.error(error);
      toast.error("Errore nella creazione dell'account Stripe Connect");
    }
  };

  const setStripeConnectSuccess = async () => {
    try {
      if (!stripeConnectInfo || stripeConnectInfo !== 'success') {
        return;
      }
      // Implement Stripe Connect success logic
      const response = await http({
        url: `/payments/stripe-connect/success`,
        method: 'POST',
      });
    } catch (error) {
      console.error(error);
    }
  };

  const getStripeLink = async () => {
    try {
      const response = await http({
        url: `/payments/stripe-connect/createLoginLink`,
        method: 'GET',
      });

      if (response?.loginLink) {
        window.open(response.loginLink, '_blank');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      {!isLoading ? (
        <div className="p-2">
          <header className="p-0">
            <div className={`flex items-start space-x-2`}>
              {isClient && !showAccountDetails && showAddConnectButton && (
                <div className="m-2">
                  <Button btnStyle="whiteLightButton" onClick={() => setStripeConnectOauth()}>
                    <div className="flex">
                      <p>Ricevi Pagamenti digitali</p>
                      <div className="pl-2">
                        <img
                          src="/stripe_logo.jpeg"
                          alt="Stripe logo"
                          className="w-5 h-5 mr-2 rounded-full" // Added the rounded-full class
                        />
                      </div>
                    </div>
                  </Button>
                </div>
              )}
              {isClient && (
                <div className="flex-1">
                  {showAccountDetails && (
                    <div className="m-2 flex items-center justify-between gap-2">
                      <Button btnStyle="whiteLightButton" onClick={() => getStripeLink()}>
                        <div className="flex">
                          <p>Vai al tuo account Stripe</p>
                          <div className="pl-2">
                            <img
                              src="/stripe_logo.jpeg"
                              alt="Stripe logo"
                              className="w-5 h-5 rounded-full" // Added the rounded-full class
                            />
                          </div>
                        </div>
                      </Button>
                      <div className="text-sm">
                        <span className="font-bold">Stato:</span>{' '}
                        {accountData?.charges_enabled ? (
                          <ElementLabel bgColor="bg-green-500">Attivo</ElementLabel>
                        ) : (
                          <ElementLabel bgColor="bg-yellow-500">Non Attivo</ElementLabel>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </header>

          {/* Client Information Section */}
          {showAccountDetails ? (
            <div className="mx-2 p-4 bg-white rounded-lg">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-2 border-b border-slate-200">
                  Dettagli Account
                </h2>
                <div className="space-y-1 text-gray-600">
                  <p className="text-sm">
                    <span className="font-bold text-gray-700">Codice Account:</span>{' '}
                    {accountData?.id}
                  </p>
                  <p className="text-sm">
                    <span className="font-bold text-gray-700">Nome:</span>{' '}
                    {accountData?.business_profile.name}
                  </p>
                  <p className="text-sm">
                    <span className="font-bold text-gray-700">Email:</span> {accountData?.email}
                  </p>
                  {/* Add this block to display the connection date */}
                  {accountData?.tos_acceptance?.date ? (
                    <div className="text-sm flex">
                      <span className="font-bold text-gray-700">Data di Connessione:</span>{' '}
                      <DisplayDateTime
                        date={accountData.tos_acceptance.date * 1000}
                        displayType="flat"
                      />
                    </div>
                  ) : (
                    <p className="text-sm">
                      <span className="font-bold text-gray-700">Data di Connessione:</span> Non
                      disponibile
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-2 border-b border-slate-200">
                  Profilo Aziendale
                </h2>
                <div className="space-y-1 text-gray-600">
                  <p className="text-sm">
                    <span className="font-bold text-gray-700">Sito Web:</span>{' '}
                    <a
                      href={`http://${accountData?.business_profile.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {accountData?.business_profile.url}
                    </a>
                  </p>
                  <p className="text-sm">
                    <span className="font-bold text-gray-700">MCC:</span>{' '}
                    {accountData?.business_profile.mcc}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-2 border-b border-slate-200">
                  Operazioni Consentite
                </h2>
                <div className="space-y-1 text-gray-600">
                  <p className="text-sm">
                    <span className="font-bold text-gray-700">Pay by Link:</span>{' '}
                    {accountData?.capabilities.link_payments === 'active'
                      ? 'Abilitato'
                      : 'Disabilitato'}
                  </p>
                  <p className="text-sm">
                    <span className="font-bold text-gray-700">Carte di Credito:</span>{' '}
                    {accountData?.capabilities.card_payments === 'active'
                      ? 'Abilitato'
                      : 'Disabilitato'}
                  </p>
                  <p className="text-sm">
                    <span className="font-bold text-gray-700">Trasferimenti:</span>{' '}
                    {accountData?.capabilities.transfers === 'active'
                      ? 'Abilitato'
                      : 'Disabilitato'}
                  </p>
                </div>
              </div>

              <div className="">
                <h2 className="text-lg font-semibold text-gray-800 mb-2 border-b border-slate-200">
                  Tariffe Stripe
                </h2>
                <div className="space-y-1 text-gray-600">
                  <p className="text-sm">
                    <span className="font-bold text-gray-700">Commissioni:</span> 1,5% + 0,25 € a transazione 
                  </p>
                  <p className="text-sm">
                    <span className="font-bold text-gray-700">Canone:</span> Gratuito
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow-lg rounded-lg border border-gray-200 relative">
              <header className="p-4">
                <div className={`flex items-start justify-between`}>
                  <h2 className="font-medium text-gray-800 flex items-start space-x-2">
                    <p>Nessun Account Stripe Connesso</p>
                  </h2>
                </div>
              </header>
            </div>
          )}
        </div>
      ) : (
        <LoadingSpinner addText />
      )}
    </div>
  );
};

export default ClientPayouts;
