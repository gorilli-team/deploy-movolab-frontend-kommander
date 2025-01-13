import React, { useContext, useEffect, useState } from 'react';
import ProgressCircle from '../UI/ProgressCircle';
import { http } from '../../utils/Utils';
import toast from 'react-hot-toast';
import WhiteBox from '../UI/WhiteBox';
import Button from '../UI/buttons/Button';
import { UserContext } from '../../store/UserContext';
import { MOVOLAB_ROLE_ADMIN } from '../../utils/Utils';
import Table from '../UI/Table';
import ElementLabel from '../UI/ElementLabel';
import { convertPrice } from '../../utils/Prices';
import DisplayDateTime from '../UI/dates/DisplayDateTime';
import Loader from '../UI/Loader';
import { Link } from 'react-router-dom/cjs/react-router-dom';
import { FaFileInvoice } from 'react-icons/fa6';

const ClientUsage = ({ onLoaded, ...props }) => {
  const [monthlyStats, setMonthlyStats] = useState(null);
  const [monthlyRevenueShares, setMonthlyRevenueShares] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [packDetailsExpanded, setPackDetailsExpanded] = useState(false);
  const [packDetails, setPackDetails] = useState(undefined);
  const [paymentsExpanded, setPaymentsExpanded] = useState(false);

  const { data: currentClient } = useContext(UserContext);
  const isAdmin = currentClient?.role === MOVOLAB_ROLE_ADMIN;

  const clientId = isAdmin ? props.clientId : currentClient?.client?._id;

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

  const date = new Date(props.month);
  const formattedMonth = `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}`; // getMonth() is zero-based
  const currentMonthName = monthNames[date.getMonth()]; // getMonth() is zero-based
  const currentYear = date.getFullYear();

  const generateFatturaElettronica = async (invoice) => {
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

  const createRevenueShareInvoice = async (monthlyRevenueShares) => {
    try {
      toast.success('Genero la fattura elettronica per Movolab');
      const response = await http({
        url: `/clientPayments/revenueShareMonthlyRecap/invoice`,
        method: 'POST',
        form: {
          revenueShareMonthlyRecapId: monthlyRevenueShares?._id,
        },
      });

      toast.success('Fattura creata');
    } catch (err) {
      console.error(err);
    }
  };

  const generateRevenueShareFatturaElettronica = async (monthlyRevenueShares) => {
    try {
      toast.success('Scarico la fattura elettronica');
      const response = await http({
        url: `/clientPayments/revenueShareMonthlyRecap/fatturaElettronica`,
        method: 'POST',
        form: {
          revenueShareMonthlyRecapId: monthlyRevenueShares?._id,
        },
      });

      const element = document.createElement('a');
      const file = new Blob([response.fatturaElettronica], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      // element.download = `${revenueShareMonthlyRecap?._id}.xml`;
      element.download = `test.xml`;
      document.body.appendChild(element); // Required for this to work in FireFox
      element.click();

      // toast.success('Scarico la fattura elettronica');
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPackDetails = async (clientId, month) => {
    const response = await http({
      url: `/clientPayments/packs/details?month=${month}&clientId=${clientId}`,
    });
    setPackDetails(response);
  };

  const fetchMonthlyStats = async (month) => {
    try {
      if (isAdmin) {
        const response = await http({
          url: `/clients/stats/monthly?month=${month}&clientId=${clientId}`,
        });
        setMonthlyStats(response);
      } else {
        const response = await http({ url: `/clients/stats/monthly?month=${month}` });
        setMonthlyStats(response);
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const fetchInvoice = async (month) => {
    try {
      if (isAdmin) {
        const response = await http({
          method: 'GET',
          url: `/clients/clientInvoice/byMonth/${month}?client=${clientId}`,
        });
        setInvoices(response);
      } else {
        const response = await http({
          method: 'GET',
          url: `/clients/clientInvoice/byMonth/${month}`,
        });

        setInvoices(response);
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const fetchMonthlyRecap = async (clientId, period) => {
    try {
      const response = await http({
        url: `/clientPayments/revenueShareMonthlyRecap/client/${clientId}/period/${period}`,
      });
      setMonthlyRevenueShares(response);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  useEffect(
    () => {
      fetchPackDetails(clientId, formattedMonth);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(
    () => {
      fetchInvoice(formattedMonth);
      fetchMonthlyStats(formattedMonth);
      fetchMonthlyRecap(clientId, formattedMonth);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [packDetails],
  );

  useEffect(() => {
    if (onLoaded) {
      if (monthlyStats) {
        onLoaded(props.month);
      }
    }
  }, [monthlyStats])

  if (!monthlyStats) {
    return null;
  }

  const invoice = invoices?.[0];

  const totalMonth =
    monthlyRevenueShares && invoice
      ? monthlyRevenueShares.totalAmount -
        monthlyRevenueShares.totalMovolab -
        invoice.price.finalPrice
      : null;

  if (packDetails === undefined) {
    return null;
  }

  return (
    <WhiteBox
      className="mx-0"
      innerClassName="px-6 py-5"
      isCollapsible="true"
      isExpanded={props.isExpanded}
      headerChildren={(expanded) => (
        <div className="flex gap-x-4 items-center font-bold justify-between">
          <div>
            {'Utilizzo'} {currentMonthName} {currentYear}
          </div>
          <div className="mr-8">
            {totalMonth ? (
              <ElementLabel
                bgColor={totalMonth > 0 ? 'bg-green-500' : 'bg-amber-500'}
                className="!text-base !font-bold !px-6"
              >
                {convertPrice(totalMonth)}
              </ElementLabel>
            ) : null}
          </div>
        </div>
      )}
      {...props}
    >
      <div className="bg-slate-100 p-4 rounded-lg">
        <div className="flex flex-wrap lg:flex-nowrap flex-initial w-full text-sm gap-2">
          <div className="font-bold text-lg text-slate-800 flex flex-col gap-2 min-w-32">
            <div>Pack: {packDetails?.packData?.name}</div>

            {packDetails ? (
              <>
                {invoice?.paymentStatus === 'paid' ? (
                  <ElementLabel bgColor="bg-green-500 py-0 text-center uppercase">
                    Pagato
                  </ElementLabel>
                ) : invoice?.paymentStatus === 'unpaid' ? (
                  <ElementLabel bgColor="bg-red-500 py-0 text-center uppercase">
                    Non Pagato
                  </ElementLabel>
                ) : (
                  <ElementLabel bgColor="bg-amber-500 py-0 text-center uppercase">
                    In attesa
                  </ElementLabel>
                )}
              </>
            ) : null}
          </div>

          <div className="flex flex-1 flex-wrap lg:flex-nowrap justify-between px-4 items-center">
            <div className="flex flex-1 flex-wrap lg:flex-nowrap gap-2 lg:gap-5 w-full max-w-[40rem] justify-between text-sm md:text-normal">
              <div className="w-[calc(50%-0.25rem)] md:w-1/5 min-w-20">
                <ProgressCircle
                  usage={monthlyStats?.rentalLocationCount}
                  total={packDetails?.packData?.params?.includedRentalLocations}
                />
                <div className="my-1 font-bold text-lg text-slate-800 text-center">Punti Nolo</div>
              </div>
              <div className="w-[calc(50%-0.25rem)] md:w-1/5 min-w-20">
                <ProgressCircle
                  usage={monthlyStats?.vehicleCount}
                  total={packDetails?.packData?.params?.includedVehicles}
                />
                <div className="my-1 font-bold text-lg text-slate-800 text-center">Veicoli</div>
              </div>
              <div className="w-[calc(50%-0.25rem)] md:w-1/5 min-w-20">
                <ProgressCircle
                  usage={monthlyStats?.monthlyRents}
                  total={packDetails?.packData?.params?.includedMonthlyRents}
                />
                <div className="my-1 font-bold text-lg text-slate-800 text-center">Noleggi</div>
              </div>
              <div className="w-[calc(50%-0.25rem)] md:w-1/5 min-w-20">
                <ProgressCircle
                  usage={monthlyStats?.monthlyComodati}
                  total={packDetails?.packData?.params?.includedComodati}
                />
                <div className="my-1 font-bold text-lg text-slate-800 text-center">Comodati</div>
              </div>
              <div className="w-[calc(50%-0.25rem)] md:w-1/5 min-w-20">
                <ProgressCircle
                  usage={monthlyStats?.monthlyMNP}
                  total={packDetails?.packData?.params?.includedMNP}
                />
                <div className="my-1 font-bold text-lg text-slate-800 text-center">MNP</div>
              </div>
            </div>

            {invoice ? (
              <div className="bg-white rounded-lg min-w-56 flex items-center justify-center py-6">
                <div className="font-bold text-slate-800 text-center">
                  <div className="text-3xl leading-6">
                    - {convertPrice(invoice.price.finalPrice)}
                  </div>
                  <div>il tuo pack</div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-end">
            <Button
              onClick={() => setPackDetailsExpanded(!packDetailsExpanded)}
              btnStyle="tableItemAction"
            >
              Dettagli &raquo;
            </Button>
          </div>
        </div>

        {packDetailsExpanded ? (
          invoice ? (
            <div className="bg-white rounded-lg overflow-hidden mt-4">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold p-3 px-4 flex-1">Dettaglio addebiti pack</h3>

                <div className="flex gap-1 text-sm">
                  Data emissione fattura:{' '}
                  <DisplayDateTime date={invoice.createdAt} displayType={'flat'} />
                </div>

                <div className="pr-2">
                  <Button onClick={() => generateFatturaElettronica(invoice)} btnStyle="slate">
                    Scarica XML
                  </Button>
                </div>
              </div>

              <div className="flex">
                <div className="flex-1">
                  <Table
                    header={['Descrizione', 'Prezzo Unitario', 'Quantità', 'Importo Senza IVA']}
                    headClassName="text-gray-500 bg-gray-50 border-gray-200"
                    customTable
                  >
                    {invoice.lines.map((line, index) => (
                      <tr key={index} className="bg-white">
                        <td
                          className={`px-4 py-2 ${
                            index === invoice.lines.length - 1 ? 'rounded-bl-lg' : ''
                          }`}
                        >
                          {line.description}
                        </td>
                        <td className="pr-4 py-2">{convertPrice(line.initialPrice)}</td>
                        <td className="pr-4 py-2">{line.quantity}</td>
                        <td className="pr-4 py-2">{convertPrice(line.subTotal)}</td>
                      </tr>
                    ))}
                  </Table>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center bg-white mt-4 p-4 rounded-lg">Nessuna fattura</div>
          )
        ) : null}
      </div>

      {monthlyRevenueShares ? (
        <div className="bg-slate-100 p-4 rounded-lg mt-2">
          <div className="flex flex-wrap lg:flex-nowrap flex-initial w-full text-sm gap-2">
            <div className="font-bold text-lg text-slate-800 flex flex-col gap-2 min-w-32">
              <div>Corrispettivi</div>
              {monthlyRevenueShares?.paid ? (
                <ElementLabel bgColor="bg-green-500 py-0 text-center uppercase">
                  Pagato
                </ElementLabel>
              ) : (
                <ElementLabel bgColor="bg-red-500 py-0 text-center uppercase">
                  Non Pagato
                </ElementLabel>
              )}
              {monthlyRevenueShares?.status === 'open' ? (
                <ElementLabel bgColor="bg-yellow-600 py-0 text-center uppercase">
                  In Elaborazione...
                </ElementLabel>
              ) : (
                <ElementLabel bgColor="bg-green-500 py-0 text-center uppercase">
                  Fatturato
                </ElementLabel>
              )}
            </div>

            <div className="flex flex-1 flex-wrap lg:flex-nowrap justify-center md:justify-between px-4 gap-y-4">
              <div className="bg-white aspect-square rounded-full flex items-center justify-center">
                <div className="font-bold text-slate-800 text-center min-w-24">
                  <div className="text-3xl leading-6">
                    {monthlyRevenueShares?.revenueShares?.length}
                  </div>
                  <div>movos</div>
                </div>
              </div>
              <div className="bg-white rounded-lg min-w-56 flex items-center justify-center py-6">
                <div className="font-bold text-slate-800 text-center">
                  <div className="text-3xl leading-6">
                    + {convertPrice(monthlyRevenueShares.totalAmount)}
                  </div>
                  <div>ricavi totali</div>
                </div>
              </div>
              <div className="bg-white rounded-lg min-w-56 flex items-center justify-center py-6">
                <div className="font-bold text-green-600 text-center">
                  <div className="text-3xl leading-6">
                    +{' '}
                    {convertPrice(
                      monthlyRevenueShares.totalAmount - monthlyRevenueShares.totalMovolab,
                    )}
                  </div>
                  <div>i tuoi corrispettivi</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <Button
                onClick={() => setPaymentsExpanded(!paymentsExpanded)}
                btnStyle="tableItemAction"
              >
                Dettagli &raquo;
              </Button>
            </div>
          </div>

          {paymentsExpanded ? (
            monthlyRevenueShares?.revenueShares ? (
              <div className="bg-white rounded-lg overflow-hidden mt-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold p-3 px-4 flex-1">Dettaglio corrispettivi</h3>

                  <div className="flex gap-1 text-sm">
                    Data emissione fattura:{' '}
                    <DisplayDateTime date={monthlyRevenueShares.createdAt} displayType={'flat'} />
                  </div>

                  <div className="pr-2">
                    <Button
                      onClick={() => createRevenueShareInvoice(monthlyRevenueShares)}
                      btnStyle="slate"
                    >
                      Crea Fattura
                    </Button>
                  </div>

                  <div className="pr-2">
                    <Button
                      onClick={() => generateRevenueShareFatturaElettronica(monthlyRevenueShares)}
                      btnStyle="slate"
                    >
                      Scarica XML
                    </Button>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-1">
                    <Table
                      header={[
                        'Cliente',
                        'Movo',
                        'Ricavi totali',
                        'I tuoi corrispettivi',
                        'Quota Movolab',
                        'Data',
                      ]}
                      headClassName="text-gray-500 bg-gray-50 border-gray-200"
                      customTable
                    >
                      {monthlyRevenueShares?.revenueShares?.map((revenueShare, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2">{revenueShare?.client?.ragioneSociale}</td>
                          <td className="pr-4 py-2">
                            <Link
                              to={`/dashboard/movimenti/${revenueShare?.rent?._id}`}
                              className="text-blue-500 hover:underline"
                            >
                              {revenueShare.rent?.code}
                            </Link>
                            <br />
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              Fattura Movo:{' '}
                              <Link
                                to={`/dashboard/amministrazione/fatture/${revenueShare?.invoice}`}
                                className="text-blue-500 hover:underline"
                              >
                                <FaFileInvoice />
                              </Link>
                            </div>
                          </td>
                          <td className="pr-4 py-2">{convertPrice(revenueShare.totalAmount)}</td>
                          <td className="pr-4 py-2">
                            {convertPrice(revenueShare?.clientAmount?.expectedRevenue)}
                            <br />
                            <span className="text-xs text-gray-500">
                              Saldo: {convertPrice(revenueShare?.clientAmount?.receivedRevenue)}
                            </span>
                          </td>
                          <td className="pr-4 py-2">
                            {convertPrice(revenueShare?.movolabAmount?.expectedRevenue)}
                            <br />
                            <span className="text-xs text-gray-500">
                              Saldo: {convertPrice(revenueShare?.movolabAmount?.receivedRevenue)}
                            </span>
                          </td>
                          <td className="pr-4 py-2">
                            <DisplayDateTime date={revenueShare.createdAt} displayType={'flat'} />
                          </td>
                        </tr>
                      ))}
                    </Table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center bg-white mt-4 p-4 rounded-lg">Nessuna fattura</div>
            )
          ) : null}
        </div>
      ) : monthlyRevenueShares === null ? (
        <Loader />
      ) : null}
    </WhiteBox>
  );
};

export default ClientUsage;
