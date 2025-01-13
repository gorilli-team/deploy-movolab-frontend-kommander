import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { convertPrice } from '../../utils/Prices';
import Button from '../UI/buttons/Button';
import ElementLabel from '../UI/ElementLabel';
import DisplayDateTime from '../UI/dates/DisplayDateTime';
import Navigation from '../UI/Navigation';
import LoadingSpinner from '../../assets/icons/LoadingSpinner';
import ClientInvoiceAdditionalDetails from './ClientInvoiceAdditionalDetails';

const ClientInvoicesTable = ({
  clientInvoices,
  from,
  clientInvoicesCount,
  pageSize,
  precFunction,
  succFunction,
  isLoading,
}) => {
  const [expandedRows, setExpandedRows] = useState([]);

  const handleRowClick = (index) => {
    const currentExpandedRows = expandedRows;
    const isRowExpanded = currentExpandedRows.includes(index);

    const newExpandedRows = isRowExpanded
      ? currentExpandedRows.filter((id) => id !== index)
      : [...currentExpandedRows, index];

    setExpandedRows(newExpandedRows);
  };

  const precFunctionPlus = () => {
    precFunction();
    setExpandedRows([]);
  };

  const succFunctionPlus = () => {
    succFunction();
    setExpandedRows([]);
  };

  const renderAdditionalDetails = (invoice) => {
    return (
      <tr>
        <td colSpan="7" className="first:pl-5 last:pr-5 py-3 whitespace-nowrap bg-gray-50">
          <ClientInvoiceAdditionalDetails invoice={invoice} />
        </td>
      </tr>
    );
  };

  return (
    <>
      {clientInvoices && clientInvoices.length > 0 ? (
        <div className="bg-white shadow-lg rounded-lg border border-gray-200 relative">
          <header className="p-4">
            <div className={`flex items-start justify-between`}>
              <h2 className="font-medium text-gray-800 flex items-start space-x-2">
                <p>
                  {clientInvoicesCount} {clientInvoicesCount > 1 ? 'Fatture' : 'Fattura'}
                </p>
              </h2>
            </div>
          </header>
          <div className="overflow-auto h-full">
            <div className="">
              <table className="table-auto w-full">
                <thead className="text-xs font-semibold uppercase text-white bg-gray-400 border-t border-b border-gray-200">
                  <tr>
                    <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                      <div className="font-semibold text-left">Numero</div>
                    </th>
                    <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                      <div className="font-semibold text-left">Cliente</div>
                    </th>
                    <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                      <div className="font-semibold text-left">Periodo</div>
                    </th>
                    <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                      <div className="font-semibold text-left">
                        Stato <br /> Pagamento
                      </div>
                    </th>
                    <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                      <div className="font-semibold text-left">Importo</div>
                    </th>
                    <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                      <div className="font-semibold text-left">
                        Data <br /> Emissione
                      </div>
                    </th>
                    <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap"></th>
                  </tr>
                </thead>

                <tbody className="text-sm divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan="7" className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-24 h-24 p-4">
                            <LoadingSpinner />
                          </div>
                          <span className="sr-only">Carico...</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    clientInvoices.reverse().map((invoice, index) => (
                      <React.Fragment key={index}>
                        <tr onClick={() => handleRowClick(index)} className="cursor-pointer">
                          <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                            <p className="text-left font-semibold text-gray-600">
                              {invoice.invoiceNumber}
                            </p>
                          </td>
                          <td className="first:pl-5 last:pr-5 py-3 whitespace-normal">
                            <p className="text-left font-semibold text-gray-600 overflow-hidden text-ellipsis">
                              <Link
                                to={`/admin/clienti/anagrafica/${invoice?.client?._id}`}
                                className="text-blue-500 hover:underline"
                              >
                                {invoice?.client?.ragioneSociale}
                              </Link>{' '}
                            </p>
                          </td>
                          <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                            <p className="text-left font-semibold text-gray-600">
                              {invoice.year} {invoice.month}
                            </p>
                          </td>
                          <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                            <p className="text-left font-semibold text-gray-600 w-20">
                              {invoice?.paymentStatus === 'unpaid' ? (
                                <ElementLabel bgColor="bg-gray-500">Non Pagato</ElementLabel>
                              ) : invoice?.paymentStatus === 'paid' ? (
                                <ElementLabel bgColor="bg-green-500">Pagato</ElementLabel>
                              ) : invoice?.paymentStatus === 'pending' ? (
                                <ElementLabel bgColor="bg-yellow-500">In Elaborazione</ElementLabel>
                              ) : invoice?.paymentStatus === 'failed' ? (
                                <ElementLabel bgColor="bg-red-500">Errore</ElementLabel>
                              ) : (
                                <ElementLabel bgColor="bg-gray-500">
                                  {invoice?.paymentStatus}
                                </ElementLabel>
                              )}
                            </p>
                          </td>
                          <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                            <p className="text-left font-semibold text-gray-600">
                              {invoice.price ? (
                                convertPrice(invoice.price.finalPrice)
                              ) : (
                                <span className="text-red-500">Errore</span>
                              )}
                            </p>
                          </td>
                          <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                            <DisplayDateTime date={invoice?.createdAt} />
                          </td>
                          <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                            <Button btnStyle="tableItemAction">
                              {expandedRows.includes(index) ? (
                                <>Riduci &uarr;</>
                              ) : (
                                <>Espandi &darr;</>
                              )}
                            </Button>
                          </td>
                        </tr>
                        {expandedRows.includes(index) && renderAdditionalDetails(invoice)}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-lg rounded-lg border border-gray-200 relative mt-2">
          <header className="p-4">
            <div className={`flex items-start justify-between`}>
              <h2 className="font-medium text-gray-800 flex items-start space-x-2">
                <p>Nessuna fattura</p>
              </h2>
            </div>
          </header>
        </div>
      )}
      <Navigation
        from={from + 1}
        to={from + pageSize}
        length={clientInvoicesCount}
        precFunction={precFunctionPlus}
        succFunction={succFunctionPlus}
      />
    </>
  );
};

export default ClientInvoicesTable;
