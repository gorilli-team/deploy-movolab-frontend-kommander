import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { MOVOLAB_ROLE_ADMIN, http } from '../../../../utils/Utils';
import RevenueSharesTable from '../../../../components/RevenueShares/RevenueSharesTable';
import TableHeader from '../../../../components/UI/TableHeader';
import TableHeaderTab from '../../../../components/UI/TableHeaderTab';
import FilterSelectField from '../../../../components/Form/FilterSelectField';
import AdminPage from '../../../../components/Admin/AdminPage';
import RevenueSharesMonthlyRecapTable from '../../../../components/RevenueShares/RevenueSharesMonthlyRecapTable';
import ClientInvoicesTable from '../../../../components/ClientPayments/ClientInvoicesTable';
import ClientStripePayments from '../../../../components/ClientPayments/ClientStripePayments';

const AdminRevenueShares = () => {
  const [revenueSharesCount, setRevenueSharesCount] = useState(0);
  const [revenueSharesMonthlyRecapCount, setRevenueSharesMonthlyRecapCount] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState(undefined);
  const [months, setMonths] = useState([]);

  const [fieldToUpdate, setFieldToUpdate] = useState('clientsInvoices');
  const [clientInvoicesCount, setClientInvoicesCount] = useState(0);
  const [clientInvoices, setClientInvoices] = useState([]);
  const [charges, setCharges] = useState([]);
  const [clientInvoicesSkip, setClientInvoicesSkip] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFromStripe, setIsLoadingFromStripe] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastChargeId, setLastChargeId] = useState(null);
  const PAGE_SIZE = 20;

  useEffect(() => {
    fetchRevenueShares();
    fetchClientInvoices();
    fetchAllStripePayments();
    populateMonths();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchClientInvoices();
  }, [selectedPeriod]);

  const populateMonths = () => {
    const startDate = new Date(2024, 8, 1); // September 2024 (months are 0-indexed)
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthsList = [];

    let currentDate = new Date(startDate);

    while (currentDate <= currentMonth) {
      monthsList.push(new Date(currentDate));
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    monthsList.reverse(); // Most recent month first
    setMonths(monthsList);
  };

  const fetchRevenueShares = async () => {
    try {
      const response = await http({ url: '/clientPayments/revenueShares' });
      setRevenueSharesCount(response.count);
      const responseMonthlyRecap = await http({ url: '/clientPayments/revenueShareMonthlyRecap' });
      setRevenueSharesMonthlyRecapCount(responseMonthlyRecap.count);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const fetchClientInvoices = async (skip) => {
    setIsLoading(true);

    let month;
    let year;

    if (selectedPeriod) {
      const date = new Date(selectedPeriod);
      month = date.getMonth() + 1; // getMonth() returns 0-11, so we add 1
      year = date.getFullYear();
    }

    const response = await http({
      url: `/clients/clientInvoice?month=${month}&year=${year}&limit=${PAGE_SIZE}&skip=${
        skip || 0
      }`,
      method: 'GET',
    });

    setClientInvoices(response.clientInvoices);
    setClientInvoicesCount(response.count);
    setIsLoading(false);
  };

  const fetchClientInvoicesNext = async () => {
    setClientInvoicesSkip(clientInvoicesSkip + PAGE_SIZE);
    fetchClientInvoices(clientInvoicesSkip + PAGE_SIZE);
  };

  const fetchClientInvoicesPrev = async () => {
    if (clientInvoicesSkip > 0) {
      setClientInvoicesSkip(clientInvoicesSkip - PAGE_SIZE);
      fetchClientInvoices(clientInvoicesSkip - PAGE_SIZE);
    }
  };

  const fetchAllStripePayments = async (last_charge_id) => {
    try {
      setIsLoadingFromStripe(true);

      let response;
      if (last_charge_id) {
        response = await http({
          url: `/payments/stripe-payments/all-charges?starting_after=${last_charge_id}`,
          method: 'GET',
        });

        setCharges([...charges, ...response.charges]);
        setHasMore(response.has_more);
        setLastChargeId(response.last_charge_id);
        setIsLoadingFromStripe(false);
      } else {
        response = await http({
          url: `/payments/stripe-payments/all-charges`,
          method: 'GET',
        });

        setCharges(response.charges);
        setHasMore(response.has_more);
        setLastChargeId(response.last_charge_id);
        setIsLoadingFromStripe(false);
      }
    } catch (error) {
      console.error(error);
      setIsLoadingFromStripe(false);
    }
  };

  const monthNames = [
    'Gennaio',
    'Febbraio',
    'Marzo',
    'Aprile',
    'Maggio',
    'Giugno',
    'Luglio',
    'Agosto',
    'Settembre',
    'Ottobre',
    'Novembre',
    'Dicembre',
  ];

  return (
    <AdminPage canAccess={MOVOLAB_ROLE_ADMIN} className="!px-0 !pb-0">
      <TableHeaderTab
        buttons={[
          {
            label: 'Indietro',
            function: () => {
              window.history.back();
            },
          },
          {
            label: 'Fatture Pack',
            function: () => {
              setFieldToUpdate('clientsInvoices');
            },
            selected: fieldToUpdate === 'clientsInvoices',
          },
          {
            label: 'Lic ML - Corrispettivi Mensili',
            function: () => {
              setFieldToUpdate('monthlyRecaps');
            },
            selected: fieldToUpdate === 'monthlyRecaps',
          },
          {
            label: 'Lic ML - Corrispettivi Singoli',
            function: () => {
              setFieldToUpdate('revenueShares');
            },
            selected: fieldToUpdate === 'revenueShares',
          },
          {
            label: 'Pagamenti Stripe',
            function: () => {
              setFieldToUpdate('stripePayments');
            },
            selected: fieldToUpdate === 'stripePayments',
          },
        ]}
      />

      {fieldToUpdate === 'monthlyRecaps' && (
        <>
          <TableHeader
            tableName={'Licenza Movolab - Corrispettivi Mensili'}
            length={revenueSharesMonthlyRecapCount}
          />

          <div className="bg-white rounded-lg shadow-lg p-0">
            <RevenueSharesMonthlyRecapTable />
          </div>
        </>
      )}
      {fieldToUpdate === 'revenueShares' && (
        <>
          <TableHeader
            tableName={'Licenza Movolab - Corrispettivi Singoli'}
            length={revenueSharesCount}
          />

          <div className="bg-white rounded-lg shadow-lg p-0">
            <RevenueSharesTable />
          </div>
        </>
      )}
      {fieldToUpdate === 'clientsInvoices' && (
        <>
          <div className="flex justify-between items-center">
            <TableHeader tableName={'Fatture Pack'} length={clientInvoicesCount} />
            <div className="flex justify-end gap-2 mr-6">
              <FilterSelectField
                onChange={(e) => setSelectedPeriod(e.target.value)}
                emptyOption={{ label: 'Tutti i periodi' }}
                defaultValue={months.find((month) => month.toISOString() === selectedPeriod)}
                options={months.map((month) => ({
                  label: `${monthNames[month.getMonth()]} ${month.getFullYear()}`,
                  value: month.toISOString(),
                }))}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-0">
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
          </div>
        </>
      )}
      {fieldToUpdate === 'stripePayments' && (
        <>
          <TableHeader tableName={'Pagamenti Stripe'} />

          <div className="bg-white rounded-lg shadow-lg p-0">
            <ClientStripePayments
              charges={charges}
              isLoadingFromStripe={isLoadingFromStripe}
              hasMore={hasMore}
              goNextPage={() => fetchAllStripePayments(lastChargeId)}
            />
          </div>
        </>
      )}
    </AdminPage>
  );
};

export default AdminRevenueShares;
