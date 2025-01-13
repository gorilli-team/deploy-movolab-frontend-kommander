import React, { useState } from 'react';
import Button from '../UI/buttons/Button';
import PlusOutlineCircle from '../../assets/icons/PlusOutlineCircle';
import Modal from '../UI/Modal';
import SepaComponent from '../Subscriptions/SepaComponent';
import LoadingSpinner from '../../assets/icons/LoadingSpinner';

const ClientPaymentMethods = ({ paymentMethods, defaultPaymentMethod, isLoadingFromStripe }) => {
  const [expandedRows, setExpandedRows] = useState([]);
  const [sepaModal, setSepaModal] = useState(false);

  const handleRowClick = (index) => {
    const currentExpandedRows = expandedRows;
    const isRowExpanded = currentExpandedRows.includes(index);

    const newExpandedRows = isRowExpanded
      ? currentExpandedRows.filter((id) => id !== index)
      : [...currentExpandedRows, index];

    setExpandedRows(newExpandedRows);
  };

  const getCountryFlag = (countryCode) => {
    return `https://flagcdn.com/w20/${countryCode.toLowerCase()}.png`;
  };

  const [menuVisibleElems, setMenuVisibleElems] = useState([]);

  //eslint-disable-next-line
  const showMenu = (index) => {
    setMenuVisibleElems((prev) => {
      // Create a new array with all elements set to false
      const newMenuVisibleElems = Array(prev.length).fill(false);

      // Set only the selected menu to true
      newMenuVisibleElems[index] = !prev[index];
      return newMenuVisibleElems;
    });
  };

  const handleRemove = (index) => {
    // Implement remove payment method logic
    setMenuVisibleElems((prev) => {
      const newMenuVisibleElems = [false];
      newMenuVisibleElems[index] = false;
      return newMenuVisibleElems;
    });
  };

  const handleSetAsDefault = (index) => {
    // Implement set as default logic
    setMenuVisibleElems((prev) => {
      const newMenuVisibleElems = [false];
      newMenuVisibleElems[index] = false;
      return newMenuVisibleElems;
    });
  };

  return (
    <div className="">
      {!isLoadingFromStripe ? (
        <>
          <div className="col-span-2">
            {paymentMethods && paymentMethods.length > 0 ? (
              <div className="bg-white shadow-lg rounded-lg border border-gray-200 relative">
                <header className="p-4">
                  <div className={`flex items-start space-x-2`}>
                    <h2 className="font-medium text-gray-800 flex items-start space-x-2 mt-1">
                      <p className="">
                        {paymentMethods.length}{' '}
                        {paymentMethods.length > 1 ? 'Metodi di pagamento' : 'Metodo di pagamento'}{' '}
                      </p>
                    </h2>
                    <div>
                      <Button btnStyle="whiteLightButton" onClick={() => setSepaModal(true)}>
                        Aggiungi <PlusOutlineCircle />
                      </Button>
                    </div>
                  </div>
                </header>
                <div className="overflow-x-auto">
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
                          <div className="font-semibold text-left">IBAN</div>
                        </th>
                        <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                          <div className="font-semibold text-left">Data</div>
                        </th>
                        <th className="first:pl-5 last:pr-5 py-3"></th>
                      </tr>
                    </thead>

                    <tbody className="text-sm divide-y divide-gray-200">
                      {paymentMethods.reverse().map((paymentMethod, index) => (
                        <React.Fragment key={index}>
                          <tr className="cursor-pointer relative">
                            <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                              <p className="text-left font-semibold text-gray-600">
                                {paymentMethod.billing_details.name}
                              </p>
                            </td>
                            <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap items-center">
                              {paymentMethod.type === 'sepa_debit' && (
                                <img
                                  src="/sepa_logo.png"
                                  alt="SEPA Icon"
                                  style={{ width: '48px', height: '24px' }}
                                />
                              )}
                            </td>
                            <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                <img
                                  src={getCountryFlag(paymentMethod?.sepa_debit?.country)}
                                  alt={'Country Flag'}
                                  className="w-8 h-6"
                                />
                                <p className="font-semibold text-gray-600">
                                  **** **** **** {paymentMethod?.sepa_debit?.last4}
                                </p>
                                {defaultPaymentMethod && (
                                  <>
                                    {defaultPaymentMethod?.id === paymentMethod?.id && (
                                      <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                                        Predefinito
                                      </span>
                                    )}
                                  </>
                                )}
                              </div>
                            </td>
                            <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                              <p className="text-left font-semibold text-gray-600">
                                {new Date(paymentMethod.created * 1000).toLocaleDateString()}{' '}
                                {new Date(paymentMethod.created * 1000).toLocaleTimeString()}
                              </p>
                            </td>
                            <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap flex items-center space-x-2 relative">
                              <Button
                                btnStyle="tableItemAction"
                                onClick={() => handleRowClick(index)}
                              >
                                Espandi &darr;
                              </Button>
                              {/* <Button
                                btnStyle="tableItemAction"
                                onClick={(e) => {
                                  e.preventDefault();
                                  showMenu(index);
                                }}
                              >
                                <FaEllipsisV />
                              </Button> */}
                              {menuVisibleElems[index] && (
                                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 shadow-lg rounded-md">
                                  <ul>
                                    <li>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation(); // Prevent the row click event
                                          handleSetAsDefault(index);
                                        }}
                                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                                      >
                                        Imposta come Default
                                      </button>
                                    </li>
                                    <li>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation(); // Prevent the row click event
                                          handleRemove(index);
                                        }}
                                        className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-100"
                                      >
                                        Rimuovi
                                      </button>
                                    </li>
                                  </ul>
                                </div>
                              )}
                            </td>
                          </tr>

                          {expandedRows.includes(index) && (
                            <tr>
                              <td colSpan="9" className="p-4 bg-gray-50">
                                {/* Render additional details here */}
                                <p className="text-gray-600">
                                  Bank Code: {paymentMethod.sepa_debit.bank_code}
                                </p>
                                <p className="text-gray-600">
                                  Country: {paymentMethod.sepa_debit.country}
                                </p>
                                <p className="text-gray-600">
                                  Fingerprint: {paymentMethod.sepa_debit.fingerprint}
                                </p>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white shadow-lg rounded-lg border border-gray-200 relative mt-2">
                <header className="p-4">
                  <div className={`flex items-start justify-between`}>
                    <h2 className="font-medium text-gray-800 flex items-start space-x-2">
                      <p>Nessun metodo di pagamento inserito</p>
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

      <Modal
        isVisible={sepaModal}
        onClose={() => setSepaModal(false)}
        headerChildren={'Aggiungi conto SEPA'}
      >
        <SepaComponent
          onSubmit={() => {
            setSepaModal(false);
          }}
        />
      </Modal>
    </div>
  );
};

export default ClientPaymentMethods;
