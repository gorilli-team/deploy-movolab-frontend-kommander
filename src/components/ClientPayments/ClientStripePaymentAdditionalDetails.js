import React from 'react';
import { convertPrice } from '../../utils/Prices';

const ClientStripePaymentAdditionalDetails = ({ charge }) => {
  return (
    <tr>
      <td colSpan="7" className="first:pl-3 last:pr-3 py-3 bg-gray-100">
        <div className="flex flex-col space-y-2 bg-white p-4 rounded-lg">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center space-x-2">
              <p className="font-semibold text-gray-600">Dettagli Pagamento</p>
            </div>
            <div className="flex items-center space-x-2">
              <p className="font-semibold text-gray-600">ID Pagamento:</p>
              <p className="text-gray-600 break-all whitespace-normal">{charge.id}</p>
            </div>
            <div className="flex items-center space-x-2">
              <p className="font-semibold text-gray-600">ID Cliente:</p>
              <p className="text-gray-600 break-all whitespace-normal">{charge.customer}</p>
            </div>
            <div className="flex items-center space-x-2">
              <p className="font-semibold text-gray-600">Tipo Pagamento:</p>
              <p className="text-gray-600 break-all whitespace-normal">
                {charge.payment_method_details.type}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <p className="font-semibold text-gray-600">Stato:</p>
              <p className="text-gray-600 break-all whitespace-normal">{charge.status}</p>
            </div>
            {charge.amount_refunded > 0 && (
              <>
                <div className="flex items-center space-x-2">
                  <p className="font-semibold text-gray-600">Rimborsato:</p>
                  <p className="text-gray-600 break-all whitespace-normal">
                    {charge.amount_refunded > 0 ? 'SI' : 'NO'}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <p className="font-semibold text-gray-600">Importo Rimborsato:</p>
                  <p className="text-gray-600 break-all whitespace-normal">
                    {convertPrice(charge.amount_refunded / 100)}
                  </p>
                </div>
                {charge.refunds.length > 0 && (
                  <>
                    {charge.refunds.map((refund, index) => (
                      <div className="p-4 bg-gray-100 border rounded-lg">
                        <div key={index} className="flex items-center space-x-2">
                          <p className="font-semibold text-gray-600">Rimborso:</p>
                          <p className="text-gray-600 break-all whitespace-normal">
                            {convertPrice(refund.amount / 100)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <p className="font-semibold text-gray-600">Motivo Rimborso:</p>
                          <p className="text-gray-600 break-all whitespace-normal">
                            {refund.reason}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <p className="font-semibold text-gray-600">Stato Rimborso:</p>
                          <p className="text-gray-600 break-all whitespace-normal">
                            {refund.status}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <p className="font-semibold text-gray-600">Data Rimborso:</p>
                          <p className="text-gray-600">
                            {new Date(refund.created * 1000).toLocaleDateString()}{' '}
                            {new Date(refund.created * 1000).toLocaleTimeString()}
                          </p>
                        </div>
                        {/* <div className="flex items-center space-x-2">
                          <p className="font-semibold text-gray-600">Data Rimborso:</p>
                          <p className="text-gray-600">
                            {new Date(refund.created * 1000).toLocaleDateString()}{' '}
                            {new Date(refund.created * 1000).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <p className="font-semibold text-gray-600">ID Rimborso:</p>
                          <p className="text-gray-600 break-all whitespace-normal">{refund.id}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <p className="font-semibold text-gray-600">Stato Rimborso:</p>
                          <p className="text-gray-600 break-all whitespace-normal">
                            {refund.status}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <p className="font-semibold text-gray-600">Motivo Rimborso:</p>
                          <p className="text-gray-600 break-all whitespace-normal">
                            {refund.reason}
                          </p>
                        </div> */}
                      </div>
                    ))}
                  </>
                )}
              </>
            )}
            {charge.failure_code && (
              <div className="bg-red-100 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <p className="font-semibold text-gray-600">Codice Errore:</p>
                  <p className="text-gray-600 break-all whitespace-normal">{charge.failure_code}</p>
                </div>

                {charge.failure_message && (
                  <div className="flex items-center space-x-2 mt-2">
                    <p className="font-semibold text-gray-600">Messaggio Errore:</p>
                    <p className="text-gray-600 break-all whitespace-normal">
                      {charge.failure_message}
                    </p>
                  </div>
                )}
              </div>
            )}
            <div className="flex items-center space-x-2">
              <p className="font-semibold text-gray-600">Data:</p>
              <p className="text-gray-600">
                {new Date(charge.created * 1000).toLocaleDateString()}{' '}
                {new Date(charge.created * 1000).toLocaleTimeString()}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <p className="font-semibold text-gray-600">Totale:</p>
              <p className="text-gray-600">{convertPrice(charge.amount / 100)}</p>
            </div>
            <div className="flex items-center space-x-2">
              <p className="font-semibold text-gray-600">Descrizione:</p>
              <p className="text-gray-600 break-all whitespace-normal">{charge.description}</p>
            </div>
            {charge.payment_method_details.type === 'sepa_debit' && (
              <div className="flex items-center space-x-2">
                <p className="font-semibold text-gray-600">IBAN:</p>
                <p className="text-gray-600 break-all whitespace-normal">
                  {charge.payment_method_details.sepa_debit.iban}
                </p>
                <p className="text-gray-600 break-all whitespace-normal">
                  {charge.payment_method_details.sepa_debit.bic}{' '}
                  {charge.payment_method_details.sepa_debit.country}
                </p>
              </div>
            )}
            {charge.payment_method_details.type === 'sepa_debit' && (
              <div className="flex space-x-2">
                <p className="font-semibold text-gray-600">Dettagli SEPA:</p>
                <p className="text-gray-600 break-all whitespace-normal">
                  Codice Banca: {charge.payment_method_details.sepa_debit.bank_code}
                  <br />
                  Nazione: {charge.payment_method_details.sepa_debit.country}
                  <br />
                  Fingerprint: {charge.payment_method_details.sepa_debit.fingerprint}
                  <br />
                  IBAN: **** **** **** {charge.payment_method_details.sepa_debit.last4}
                </p>
              </div>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
};

export default ClientStripePaymentAdditionalDetails;
