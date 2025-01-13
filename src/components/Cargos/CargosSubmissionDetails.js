import React, { useContext, useEffect, useState } from 'react';
import { http, MOVOLAB_ROLE_ADMIN } from '../../utils/Utils';
import { UserContext } from '../../store/UserContext';
import toast from 'react-hot-toast';
import DisplayDateTime from '../UI/dates/DisplayDateTime';
import ElementLabel from '../UI/ElementLabel';
import Button from '../UI/buttons/Button';

const CargosSubmissionDetails = ({ cargosSubmissionId }) => {
  const userContext = useContext(UserContext);
  let userData = userContext.data || {};

  const [cargosSubmission, setCargosSubmission] = useState({});

  useEffect(() => {
    fetchCargosSubmission(cargosSubmissionId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCargosSubmission = async (id) => {
    try {
      if (!id) return;
      const response = await http({ url: `/cargos/cargosSubmissions/${id}` });
      setCargosSubmission(response?.cargosSubmission);
    } catch (error) {
      console.error('Error', error);
    }
  };

  const mapCargosSubmissionStatus = (status) => {
    switch (status) {
      case 'not_sent':
        return 'Non Inviato';
      case 'error_occurred':
        return 'Errore';
      case 'missing_credentials':
        return 'Credenziali Mancanti';
      case 'sent':
        return 'Inviato';
      case 'submission_error':
        return 'Errore Invio';
      case 'test_successful':
        return 'Test OK';
      case 'validation_error':
        return 'Errore Validazione';
      default:
        return 'Stato sconosciuto'; // Unknown status
    }
  };

  const mapLabelColor = (status) => {
    switch (status) {
      case 'not_sent':
        return 'bg-blue-400';
      case 'error_occurred':
        return 'bg-red-500';
      case 'missing_credentials':
        return 'bg-yellow-500';
      case 'sent':
        return 'bg-green-600';
      case 'submission_error':
        return 'bg-red-500';
      case 'test_successful':
        return 'bg-green-400';
      case 'validation_error':
        return 'bg-red-500';
    }
  };

  const testCargosSubmission = async () => {
    try {
      const submissionData = {
        rentId: cargosSubmission?.rent?._id,
        _id: cargosSubmission?._id,
      };

      const response = await http({
        method: 'POST',
        url: '/cargos/cargosSubmissions/test-submission',
        form: submissionData,
      });

      if (response?.cargosSubmission?.status === 'missing_credentials') {
        toast.error('Credenziali CARGOS non presenti');
      } else {
        await fetchCargosSubmission(cargosSubmissionId);
        toast.success('Test Effettuato');
      }
    } catch (error) {
      console.error('Errore nel test', error);
      toast.error('Errore nel Test');
    }
  };

  const sendCargosSubmission = async () => {
    try {
      const submissionData = {
        rentId: cargosSubmission?.rent?._id,
        _id: cargosSubmission?._id,
      };

      const response = await http({
        method: 'POST',
        url: '/cargos/cargosSubmissions/send-submission',
        form: submissionData,
      });

      if (response?.cargosSubmission?.status === 'missing_credentials') {
        toast.error('Credenziali CARGOS non presenti');
      } else {
        await fetchCargosSubmission(cargosSubmissionId);
        toast.success('Dati inviati a Cargos');
      }
    } catch (error) {
      console.error('Errore nel test', error);
      toast.error('Errore nel Test');
    }
  };

  return (
    <div>
      {/* add header with written ripartizione incassi */}
      <div className="flex justify-between">
        <h2 className="font-semibold text-gray-800 text-2xl p-2">
          <span>Dettagli Invio</span>
        </h2>
      </div>
      <div className="flex">
        <div className="bg-white rounded-2xl overflow-auto mx-0 border border-gray-300 font-medium text-gray-900 w-full divide-y">
          <div className="flex justify-between px-4 py-2">
            <span>Cliente</span>
            <span>
              {cargosSubmission?.client?.ragioneSociale} - Licenza:{' '}
              {cargosSubmission?.client?.license.licenseOwner}{' '}
            </span>
          </div>

          <div className="flex justify-between px-4 py-2">
            <span>Stato</span>
            <div>
              {/* Mapping status to label and color */}
              <ElementLabel bgColor={mapLabelColor(cargosSubmission?.status)}>
                {mapCargosSubmissionStatus(cargosSubmission?.status)}
              </ElementLabel>
            </div>{' '}
          </div>

          <div className="flex justify-between px-4 py-2">
            <span>Numero Movo</span>
            <span>{cargosSubmission?.rent?.code}</span>
          </div>
          <div className="flex justify-between px-4 py-2">
            <span>Data Creazione</span>
            <span>
              <DisplayDateTime date={cargosSubmission.createdAt} displayType={'flat'} />
            </span>{' '}
          </div>
          <div className="flex justify-between px-4 py-2">
            <span>Data Invio</span>
            {cargosSubmission.sentAt ? (
              <span>
                <DisplayDateTime date={cargosSubmission.sentAt} displayType={'flat'} />
              </span>
            ) : (
              <span>-</span>
            )}
          </div>

          {userData.role === MOVOLAB_ROLE_ADMIN && cargosSubmission.status !== 'sent' && (
            <div className="flex justify-between px-4 py-2">
              <span>Azioni</span>
              <span className="flex space-x-2">
                <Button onClick={testCargosSubmission} btnStyle="gray">
                  Testa
                </Button>
                {process.env.NODE_ENV === 'production' && (
                  <Button onClick={sendCargosSubmission} btnStyle="inFormStyleBlue">
                    Invia
                  </Button>
                )}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="py-2 mt-5">
        <h3 className="font-semibold text-gray-800 text-lg p-2">
          <span>Aggiornamenti ({cargosSubmission?.updates?.length || 0})</span>
        </h3>
        <div className="bg-white rounded-2xl overflow-auto mx-0 border border-gray-300 font-medium text-gray-900 w-full divide-y">
          <div className="bg-white border-t border-gray-200 overflow-hidden relative">
            <div className="overflow-x-auto h-full">
              <div>
                <table className="w-full table-fixed">
                  <thead className="text-xs font-semibold uppercase text-gray-500 bg-gray-50">
                    <tr>
                      <th className="first:pl-5 last:pr-5 py-3 w-48 whitespace-nowrap">
                        <div className="font-semibold text-left">Stato</div>
                      </th>
                      <th className="first:pl-5 last:pr-5 py-3 w-48 whitespace-nowrap">
                        <div className="font-semibold text-left">Data</div>
                      </th>
                      <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                        <div className="font-semibold text-left">Messaggio</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-gray-200 border-t border-b border-gray-200">
                    {cargosSubmission?.updates
                      ?.slice()
                      .reverse()
                      .map((update, index) => {
                        return (
                          <tr key={index}>
                            <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                              <div className="text-left">
                                <ElementLabel bgColor={mapLabelColor(update?.status)}>
                                  {mapCargosSubmissionStatus(update?.status)}
                                </ElementLabel>
                              </div>
                            </td>
                            <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                              <div className="text-left">
                                <DisplayDateTime date={update.date} displayType={'flat'} />
                              </div>
                            </td>
                            <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                              {update.cargosUser ? (
                                <div
                                  className="bg-gray-100 p-2 rounded text-left break-words"
                                  style={{ whiteSpace: 'pre-wrap' }}
                                >
                                  Utente: {update.cargosUser}
                                </div>
                              ) : (
                                <></>
                              )}
                              {update.submissionMessage ? (
                                <div
                                  className="bg-gray-100 p-2 rounded text-left break-words"
                                  style={{ whiteSpace: 'pre-wrap' }}
                                >
                                  {update.submissionMessage}
                                </div>
                              ) : (
                                <></>
                              )}
                              {update.error ? (
                                <div
                                  className="bg-red-200 p-2 rounded text-left break-words"
                                  style={{ whiteSpace: 'pre-wrap' }}
                                >
                                  {update.error}
                                </div>
                              ) : (
                                <></>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CargosSubmissionDetails;
