import React, { useState } from 'react';

import Button from '../UI/buttons/Button';
import ElementLabel from '../UI/ElementLabel';
import ClientStripePaymentAdditionalDetails from './ClientStripePaymentAdditionalDetails';
import { convertPrice } from '../../utils/Prices';
import LoadingSpinner from '../../assets/icons/LoadingSpinner';

const ClientStripePayments = ({ charges, isLoadingFromStripe, hasMore, goNextPage }) => {
  const [expandedRows, setExpandedRows] = useState([]);

  const handleRowClick = (index) => {
    const currentExpandedRows = expandedRows;
    const isRowExpanded = currentExpandedRows.includes(index);

    const newExpandedRows = isRowExpanded
      ? currentExpandedRows.filter((id) => id !== index)
      : [...currentExpandedRows, index];

    setExpandedRows(newExpandedRows);
  };

  return (
    <div className="">
      {!isLoadingFromStripe ? (
        <>
          <div className="col-span-2">
            {charges && charges.length > 0 ? (
              <div className="bg-white shadow-lg rounded-lg border border-gray-200 relative">
                <header className="p-4">
                  <div className={`flex items-start justify-between`}>
                    <h2 className="font-medium text-gray-800 flex items-start space-x-2">
                      <p>
                        {charges.length}{' '}
                        {charges.length > 1 ? 'Pagamenti visualizzati' : 'Pagamento visualizzato'}
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
                            <div className="font-semibold text-left">Nome del Cliente</div>
                          </th>
                          <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                            <div className="font-semibold text-left">Tipo Pagamento</div>
                          </th>
                          <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                            <div className="font-semibold text-left">Totale</div>
                          </th>
                          <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                            <div className="font-semibold text-left">Stato</div>
                          </th>
                          <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                            <div className="font-semibold text-left">Data</div>
                          </th>
                          <th className="first:pl-5 last:pr-5 py-3"></th>
                        </tr>
                      </thead>

                      <tbody className="text-sm divide-y divide-gray-200">
                        {charges.reverse().map((charge, index) => (
                          <React.Fragment key={index}>
                            <tr onClick={() => handleRowClick(index)} className="cursor-pointer">
                              <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                                <p className="text-left font-semibold text-gray-600">
                                  {charge.billing_details.name}
                                </p>
                              </td>
                              <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap items-center">
                                {charge.payment_method_details.type === 'sepa_debit' && (
                                  <img
                                    src="/sepa_logo.png"
                                    alt="SEPA Icon"
                                    style={{ width: '48px', height: '24px' }}
                                  />
                                )}
                              </td>
                              <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                                <p className="text-left font-semibold text-gray-600">
                                  {convertPrice(charge.amount / 100)}
                                </p>
                              </td>
                              <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                                <p className="text-left font-semibold text-gray-600">
                                  {charge.refunded ? (
                                    <ElementLabel bgColor="bg-yellow-600">Rimborsato</ElementLabel>
                                  ) : charge.amount_refunded > 0 ? (
                                    <ElementLabel bgColor="bg-yellow-400">Parz Rimb</ElementLabel>
                                  ) : charge.status === 'succeeded' ? (
                                    <ElementLabel bgColor="bg-green-500">Successo</ElementLabel>
                                  ) : charge.status === 'processing' ||
                                    charge.status === 'pending' ? (
                                    <ElementLabel bgColor="bg-yellow-500">
                                      In Elaborazione
                                    </ElementLabel>
                                  ) : charge.status === 'failed' ? (
                                    <ElementLabel bgColor="bg-red-500">Fallito</ElementLabel>
                                  ) : (
                                    <ElementLabel bgColor="bg-yellow-500">
                                      {charge.status}
                                    </ElementLabel>
                                  )}
                                </p>
                              </td>
                              <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                                <p className="text-left font-semibold text-gray-600">
                                  {new Date(charge.created * 1000).toLocaleDateString()}{' '}
                                  {new Date(charge.created * 1000).toLocaleTimeString()}
                                </p>
                              </td>
                              <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                                <Button btnStyle="tableItemAction">Espandi &darr;</Button>
                              </td>
                            </tr>
                            {expandedRows.includes(index) && (
                              <ClientStripePaymentAdditionalDetails charge={charge} />
                            )}
                          </React.Fragment>
                        ))}
                      </tbody>
                      {hasMore && (
                        <tfoot>
                          <tr>
                            <td colSpan="6" className="text-center p-4">
                              <Button
                                btnStyle="secondary"
                                onClick={() => {
                                  goNextPage();
                                }}
                              >
                                Carica altri pagamenti
                              </Button>
                            </td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white shadow-lg rounded-lg border border-gray-200 relative">
                <header className="p-4">
                  <div className={`flex items-start justify-between`}>
                    <h2 className="font-medium text-gray-800 flex items-start space-x-2">
                      <p>Nessun pagamento effettuato</p>
                    </h2>
                  </div>
                </header>
              </div>
            )}
          </div>
        </>
      ) : (
        <LoadingSpinner addText />
      )}
    </div>
  );
};

export default ClientStripePayments;
