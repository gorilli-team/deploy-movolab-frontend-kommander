import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { http } from '../../utils/Utils';
import Button from '../UI/buttons/Button';
import TableHeaderTab from '../UI/TableHeaderTab';
import ClientInvoicesTable from './ClientInvoicesTable';
import ClientStripePayments from './ClientStripePayments';
import ClientPaymentMethods from './ClientPaymentMethods';
import ClientPayouts from './ClientPayouts';

const ClientPayments = ({ client, showTab = null }) => {
  const form = useForm();

  const [clientInvoices, setClientInvoices] = useState([]);
  const [invoicesToMovolab, setInvoicesToMovolab] = useState([]);
  const [clientInvoicesCount, setClientInvoicesCount] = useState(0);
  const [invoicesToMovolabCount, setInvoicesToMovolabCount] = useState(0);
  const [selectedTab, setSelectedTab] = useState(showTab || 'pagamenti');
  const [clientInvoicesSkip, setClientInvoicesSkip] = useState(0);
  const [isLoadingFromStripe, setIsLoadingFromStripe] = useState(false);
  const [invoicingType, setInvoicingType] = useState('movolab');
  const [stripeData, setStripeData] = useState({});
  const [charges, setCharges] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [customer, setCustomer] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const PAGE_SIZE = 20;

  useEffect(() => {
    fetchClient();
    fetchClientInvoices();
    retrieveStripeData();
  }, [client]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchClient = async () => {
    form.setValue('subscriptionPaymentMethod', client?.subscriptionPaymentMethod);
    form.setValue('iban', client?.iban);
    form.setValue('ibanName', client?.ibanName);
    form.setValue('ibanAddress', client?.ibanAddress);
    form.setValue('ibanCap', client?.ibanCap);
    form.setValue('ibanCity', client?.ibanCity);
    form.setValue('ibanPec', client?.ibanPec);
  };

  const fetchClientInvoices = async (skip) => {
    try {
      if (!client) {
        return;
      }
      setIsLoading(true);
      const response = await http({
        url: `/clients/clientInvoice?client=${client?._id}&limit=10&skip=${skip || 0}`,
        method: 'GET',
      });

      setClientInvoices(response.clientInvoices);
      setClientInvoicesCount(response.count);

      const movolabResponse = await http({
        url: `/invoice/toMovolab`,
        method: 'GET',
      });

      setInvoicesToMovolab(movolabResponse.invoices);
      setInvoicesToMovolabCount(movolabResponse.count);

      setIsLoading(false);
    } catch (e) {
      console.error('error', e);
    }
  };

  const fetchClientInvoicesNext = async () => {
    setClientInvoicesSkip(clientInvoicesSkip + 10);
    fetchClientInvoices(clientInvoicesSkip + 10);
  };

  const fetchClientInvoicesPrev = async () => {
    if (clientInvoicesSkip > 0) {
      setClientInvoicesSkip(clientInvoicesSkip - 10);
      fetchClientInvoices(clientInvoicesSkip - 10);
    }
  };

  const retrieveStripeData = async () => {
    try {
      if (!client) {
        return;
      }

      setIsLoadingFromStripe(true);
      const response = await http({
        url: `/subscriptions/sepa/retrieve/${client?._id}`,
        method: 'GET',
      });
      setStripeData(response);
      setCustomer(response.customer);
      setCharges(response.charges);
      setPaymentMethods(response.paymentMethods);
      setIsLoadingFromStripe(false);
    } catch (error) {
      console.error(error);
      setIsLoadingFromStripe(false);
    }
  };

  return (
    <div className="p-4">
      {!showTab ? (
        <div className="mb-4">
          {/* menu button with fatture and metodo di pagamento selection */}
          <div className="flex space-x-4">
            <Button
              btnStyle={`${selectedTab === 'pagamenti' ? 'darkGray' : 'lightGray'}`}
              onClick={() => {
                setSelectedTab('pagamenti');
              }}
            >
              Pagamenti
            </Button>
            <Button
              btnStyle={`${selectedTab === 'fatture' ? 'darkGray' : 'lightGray'}`}
              onClick={() => {
                setSelectedTab('fatture');
              }}
            >
              Fatture
            </Button>
            <Button
              btnStyle={`${selectedTab === 'metodiPagamento' ? 'darkGray' : 'lightGray'}`}
              onClick={() => {
                setSelectedTab('metodiPagamento');
              }}
            >
              Metodi di Pagamento
            </Button>
            <Button
              btnStyle={`${selectedTab === 'payouts' ? 'darkGray' : 'lightGray'}`}
              onClick={() => {
                setSelectedTab('payouts');
              }}
            >
              Payouts
            </Button>
          </div>
        </div>
      ) : null}
      <div className="w-full rounded-xl">
        {selectedTab === 'pagamenti' && (
          <ClientStripePayments
            client={client}
            stripeData={stripeData}
            charges={charges}
            isLoadingFromStripe={isLoadingFromStripe}
          />
        )}
        {selectedTab === 'fatture' && (
          <>
            <TableHeaderTab
              buttons={[
                {
                  label: 'Da Movolab',
                  function: () => setInvoicingType('movolab'),
                  selected: invoicingType === 'movolab',
                },
                {
                  label: 'Le tue fatture a Movolab',
                  function: () => setInvoicingType('customer'),
                  selected: invoicingType === 'customer',
                },
              ]}
            />
            <>
              {invoicingType === 'movolab' ? (
                <ClientInvoicesTable
                  clientInvoices={clientInvoices}
                  clientInvoicesCount={clientInvoicesCount}
                  precFunction={fetchClientInvoicesPrev}
                  succFunction={fetchClientInvoicesNext}
                  from={clientInvoicesSkip}
                  to={clientInvoicesSkip + PAGE_SIZE}
                  pageSize={PAGE_SIZE}
                  isLoading={isLoading}
                />
              ) : invoicingType === 'customer' ? (
                <ClientInvoicesTable
                  clientInvoices={invoicesToMovolab}
                  clientInvoicesCount={invoicesToMovolabCount}
                  precFunction={fetchClientInvoicesPrev}
                  succFunction={fetchClientInvoicesNext}
                  from={clientInvoicesSkip}
                  to={clientInvoicesSkip + PAGE_SIZE}
                  pageSize={PAGE_SIZE}
                  isLoading={isLoading}
                />
              ) : null}
            </>
          </>
        )}
        {selectedTab === 'metodiPagamento' && (
          <ClientPaymentMethods
            client={client}
            form={form}
            isLoadingFromStripe={isLoadingFromStripe}
            paymentMethods={paymentMethods}
            defaultPaymentMethod={customer?.invoice_settings?.default_payment_method}
          />
        )}
        {selectedTab === 'payouts' && <ClientPayouts client={client} isClient={false} />}
      </div>
    </div>
  );
};

export default ClientPayments;
