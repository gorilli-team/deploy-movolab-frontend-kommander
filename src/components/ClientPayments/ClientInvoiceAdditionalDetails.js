import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

import { http } from '../../utils/Utils';
import { convertPrice } from '../../utils/Prices';
import Button from '../UI/buttons/Button';
import DisplayDateTime from '../UI/dates/DisplayDateTime';
import ClientStripePayments from './ClientStripePayments';

const ClientInvoiceAdditionalDetails = ({ invoice }) => {
  //check from the path if user is admin or client
  const isAdmin = window.location.pathname.includes('/admin');
  const [charges, setCharges] = useState([]);
  const [isLoadingFromStripe, setIsLoadingFromStripe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (
      invoice.paymentStatus === 'paid' ||
      invoice.paymentStatus === 'pending' ||
      invoice.paymentStatus === 'failed'
    ) {
      fetchStripePaymentDetails(invoice.paymentIds[0]);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const payInvoice = async () => {
    try {
      setIsLoading(true);
      const paymentPromise = makePayment(); // Call the makePayment function to get the promise
      await toast.promise(paymentPromise, {
        loading: 'Invio richiesta SEPA...', // Loading message while the promise is pending
        success: <b>Richiesta SEPA inviata</b>, // Success message when the promise resolves
        error: ({ message }) => <b>{message || 'Errore durante il pagamento'}</b>, // Error message when the promise rejects
      });
      invoice.paymentStatus = 'pending';
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  const fetchStripePaymentDetails = async (paymentId) => {
    try {
      setIsLoadingFromStripe(true);
      const response = await http({
        url: `/payments/stripe-payments/charge/${paymentId}`,
        method: 'GET',
      });

      const charges = [response.charge];

      setCharges(charges);
      setIsLoadingFromStripe(false);
    } catch (error) {
      console.error('Error fetching Stripe payment details:', error);
      setIsLoadingFromStripe(false);
      throw new Error('Errore durante il recupero dei dettagli del pagamento');
    }
  };

  const makePayment = async () => {
    try {
      const response = await http({
        url: `/clients/clientInvoice/pay`,
        method: 'POST',
        form: {
          id: invoice._id,
        },
      });

      return true; // Resolve the promise successfully
    } catch (error) {
      console.error('Error creating SEPA charge:', error);

      // If the error has a response with a message, throw it so it can be caught by toast.promise
      const errorMessage = error?.errorMessage || 'Errore sconosciuto';
      throw new Error(errorMessage);
    }
  };

  const generateFatturaElettronica = async () => {
    try {
      toast.success('Scarico la fattura elettronica');

      const response = await http({
        url: `/clients/clientInvoice/fatturaElettronica`,
        method: 'POST',
        form: {
          invoiceId: invoice?._id,
        },
      });

      const element = document.createElement('a');
      const file = new Blob([response.fatturaElettronica], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `${invoice.invoiceNumber}.xml`;
      document.body.appendChild(element); // Required for this to work in FireFox
      element.click();
    } catch (err) {
      console.error(err);
    }
  };

  const mapPaymentPeriod = (period) => {
    switch (period) {
      case 'monthly':
        return 'Mensile';
      case 'quarterly':
        return 'Trimestrale';
      case 'biannual':
        return 'Semestrale';
      case 'yearly':
        return 'Annuale';
      default:
        return 'Non specificato';
    }
  };

  return (
    <div>
      <div className="p-4 text-gray-700">
        <div className="flex space-x-2 justify-end px-2">
          {isAdmin && ['unpaid', 'failed'].includes(invoice.paymentStatus) && (
            <>
              {isLoading && (
                <Button btnStyle="slate" disabled>
                  Attendi...
                </Button>
              )}
              {!isLoading && <Button onClick={payInvoice}>Effettua Pagamento</Button>}
            </>
          )}
          <Button onClick={generateFatturaElettronica} btnStyle="slate">
            Scarica XML
          </Button>
        </div>
        <div className="flex justify-between px-2 mt-4">
          <div className="flex space-x-2">
            <div>
              <strong>Cliente:</strong>
            </div>
            <Link
              to={`/admin/clienti/anagrafica/${invoice.client._id}`}
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              {invoice.client.ragioneSociale}
            </Link>
          </div>
          <div className="flex space-x-2">
            <div>
              <strong>Data Emissione:</strong>{' '}
            </div>
            <div>
              <DisplayDateTime date={invoice.createdAt} displayType={'flat'} />
            </div>
          </div>
        </div>
        <div className="flex justify-between px-2 mt-4">
          <p>
            <strong>Numero Fattura:</strong> {invoice.invoiceNumber}
          </p>
          <div className="flex space-x-2">
            <strong>Stato Pagamento:</strong>{' '}
            <div className="text-left font-semibold text-gray-600">
              {invoice?.paymentStatus === 'unpaid' ? (
                <>Non Pagato</>
              ) : invoice?.paymentStatus === 'paid' ? (
                <>Pagato</>
              ) : (
                <>In Attesa</>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-between mt-4 px-2">
          <p>
            <strong>Pack:</strong>{' '}
            {invoice.pack ? (
              <Link
                to={`/admin/packs/${invoice.pack._id}`}
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                {invoice.pack.name}
              </Link>
            ) : (
              'N/A'
            )}
          </p>
          <p>
            <strong>Periodo:</strong> {invoice.year} {invoice.month}
          </p>
        </div>
        <div className="mt-4">
          {invoice.lines.length > 0 && (
            <table className="min-w-full mt-2 rounded-lg">
              <thead>
                <tr className="bg-gray-300">
                  <th className="px-4 py-2 text-left rounded-tl-lg">Descrizione</th>
                  <th className="px-4 py-2 text-right">Prezzo Unitario</th>
                  <th className="px-4 py-2 text-right">Quantità</th>
                  <th className="px-4 py-2 text-right">Importo Senza IVA</th>
                  <th className="px-4 py-2 text-right">IVA</th>
                  <th className="px-4 py-2 text-right rounded-tr-lg">Importo Totale</th>
                </tr>
              </thead>
              <tbody>
                {invoice.lines.map((line, index) => (
                  <tr key={index} className="bg-white">
                    <td
                      className={`px-4 py-2 ${
                        index === invoice.lines.length - 1 ? 'rounded-bl-lg' : ''
                      }`}
                    >
                      {line.description}
                    </td>
                    <td className="px-4 py-2 text-right">{convertPrice(line.initialPrice)}</td>
                    <td className="px-4 py-2 text-right">{line.quantity}</td>
                    <td className="px-4 py-2 text-right">{convertPrice(line.subTotal)}</td>
                    <td className="px-4 py-2 text-right">{line.vatPercentage}%</td>
                    <td
                      className={`px-4 py-2 text-right ${
                        index === invoice.lines.length - 1 ? 'rounded-br-lg' : ''
                      }`}
                    >
                      {convertPrice(line.finalPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="flex justify-end gap-8 mt-4 px-2">
          <div className="flex flex-col justify-end">
            <div>
              <strong>Importo</strong>
            </div>
            <div className="text-right"> {convertPrice(invoice.price.priceNoVat)}</div>
          </div>
          <div className="flex flex-col justify-end">
            <div>
              <strong>Totale IVA</strong>
            </div>
            <div className="text-right"> {convertPrice(invoice.price.vatAmount)}</div>
          </div>
          <div className="flex flex-col justify-end">
            <div>
              <strong>Importo Finale</strong>
            </div>
            <div className="text-right"> {convertPrice(invoice.price.finalPrice)}</div>
          </div>
        </div>
        <div className="bg-gray-100 p-2 mt-2 rounded-lg">
          <p className="text-sm p-2 ">
            <strong>Dettagli Pagamenti:</strong>
          </p>
          <ClientStripePayments charges={charges} isLoadingFromStripe={isLoadingFromStripe} />
        </div>
      </div>
    </div>
  );
};

export default ClientInvoiceAdditionalDetails;
