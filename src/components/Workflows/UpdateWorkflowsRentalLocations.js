import React, { useContext, useEffect, useState } from 'react';
import { http, MOVOLAB_ROLE_ADMIN, CLIENT_ROLE_ADMIN } from '../../utils/Utils';

import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { UserContext } from '../../store/UserContext';
import { SelectField } from '../Form/SelectField';
import Button from '../UI/buttons/Button';

const UpdateWorkflowsRentalLocations = ({ workflowId = null}) => {
  const [rentalLocationsRetrieved, setRentalLocationsRetrieved] = useState([]);
  const [workflow, setWorkflow] = useState({});

  const form = useForm();
  const params = useParams();

  const { data: currentClient } = useContext(UserContext);
  const isAdmin = currentClient?.role === MOVOLAB_ROLE_ADMIN;
  const isClientAdmin = currentClient?.role === CLIENT_ROLE_ADMIN;
  const allowAdmin =
    isAdmin || (isClientAdmin && workflow?.client?._id === currentClient?.client?._id);

  useEffect(() => {
    fetchWorkflow();
    fetchRentalLocations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchWorkflow = async () => {
    try {
      const response = await http({ url: `/workflow/${workflowId || params.id}?mode=flat` });
      form.setValue('rentalLocationsConfig', response.rentalLocationsConfig);
      form.setValue('rentalLocations', response.rentalLocations);
      setWorkflow(response);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const updaterentalLocationsConfig = async (e) => {
    try {
      const rentalLocationsConfig = form.getValues('rentalLocationsConfig');
      const workflow = {
        rentalLocationsConfig,
      };

      await http({
        method: 'PUT',
        url: `/workflow/${workflowId || params.id}`,
        form: workflow,
      });
      toast.success('Configurazione Punti Nolo aggiornata con successo');
      await fetchWorkflow();
      await fetchRentalLocations();
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const fetchRentalLocations = async () => {
    try {
      let response = [];

      if (currentClient?.role === MOVOLAB_ROLE_ADMIN) {
        response = await http({ url: '/admin/rentalLocation' });
      } else {
        response = await http({ url: '/clients/rentalLocation' });
      }

      const responseWorkflow = await http({ url: `/workflow/${workflowId || params.id}?mode=flat` });
      const ids =
        responseWorkflow.rentalLocations.map((rentalLocation) => rentalLocation._id) || [];
      const availableRentalLocations = response.rentalLocations.filter((rentalLocation) => {
        return !ids.includes(rentalLocation._id);
      });

      if (availableRentalLocations.length > 0) {
        form.setValue('newRentalLocation', availableRentalLocations[0]);
      }

      if (isAdmin) {
        setRentalLocationsRetrieved(
          availableRentalLocations.map((rentalLocation) => {
            return {
              value: rentalLocation._id,
              label: `${rentalLocation?.clientId?.ragioneSociale}: ${rentalLocation.name} - ${rentalLocation.address}`,
            };
          }),
        );
      } else {
        setRentalLocationsRetrieved(
          availableRentalLocations.map((rentalLocation) => {
            return {
              value: rentalLocation._id,
              label: `${rentalLocation.name} - ${rentalLocation.address}`,
            };
          }),
        );
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const addRentalLocation = async (e) => {
    try {
      e.preventDefault();
      const newRentalLocation = form.getValues('newRentalLocation');
      const workflow = {
        rentalLocations: [...form.getValues('rentalLocations'), newRentalLocation],
      };

      await http({
        method: 'PUT',
        url: `/workflow/${workflowId || params.id}`,
        form: workflow,
      });
      toast.success('Punto Nolo aggiunto con successo');
      await fetchWorkflow();
      await fetchRentalLocations();
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const removeRentalLocation = async (e, id) => {
    try {
      e.preventDefault();
      const workflow = {
        rentalLocations: form
          .getValues('rentalLocations')
          .filter((rentalLocation) => rentalLocation._id !== id),
      };
      await http({
        method: 'PUT',
        url: `/workflow/${workflowId || params.id}`,
        form: workflow,
      });
      toast.success('Punto Nolo rimosso con successo');
      await fetchWorkflow();
      await fetchRentalLocations();
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  return (
    <div className="">
      <div>
        <div>
          <form>
            <fieldset disabled={form.formState.isSubmitting}>
              {allowAdmin && rentalLocationsRetrieved.length > 0 && (
                <div>
                  <div className="w-96">
                    <div className="text-lg font-semibold">Abbinamento Punti Nolo</div>
                    {workflow?.workflowType === 'movolab' && (
                      <div className="mt-2">
                        <SelectField
                          form={form}
                          name={`rentalLocationsConfig`}
                          options={[
                            { value: 'all', label: 'Tutti i Punti Nolo' },
                            { value: 'only_movolab', label: 'Solo i Punti Nolo Movolab' },
                            { value: 'only_client', label: 'Solo i Punti Nolo dei Licenziatari' },
                            { value: 'selected', label: 'Solo i Punti Nolo selezionati' },
                          ]}
                          onChangeFunction={() => {
                            updaterentalLocationsConfig();
                          }}
                        />
                      </div>
                    )}
                    {workflow?.workflowType === 'client' && (
                      <div className="mt-2">
                        <SelectField
                          form={form}
                          name={`rentalLocationsConfig`}
                          options={[
                            {
                              value: 'all_from_client',
                              label: 'Tutti i Punti Nolo del Licenziatario',
                            },
                            { value: 'selected', label: 'Solo i Punti Nolo selezionati' },
                          ]}
                          onChangeFunction={() => {
                            updaterentalLocationsConfig();
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
              {form?.watch('rentalLocationsConfig') === 'selected' &&
                workflow?.rentalLocations?.length > 0 && (
                  <div>
                    <div className="text-lg font-semibold">Punti Nolo Selezionati</div>
                    <div className="mt-2">
                      {workflow?.rentalLocations?.map((rentalLocation, index) => {
                        return (
                          <div key={index}>
                            <div className="flex mt-2">
                              <div className="w-full">
                                {isAdmin ? (
                                  <input
                                    className="w-full py-1 rounded"
                                    type="text"
                                    value={`${rentalLocation?.clientId?.ragioneSociale}: ${rentalLocation.name} - ${rentalLocation.address}`}
                                    disabled={true}
                                  />
                                ) : (
                                  <input
                                    className="w-full py-1 rounded"
                                    type="text"
                                    value={`${rentalLocation.name} - ${rentalLocation.address}`}
                                    disabled={true}
                                  />
                                )}
                              </div>
                              {allowAdmin && (
                                <div className="ml-2">
                                  <Button
                                    btnStyle="inFormStyle"
                                    type="button"
                                    onClick={(e) => {
                                      removeRentalLocation(e, rentalLocation._id);
                                    }}
                                  >
                                    Rimuovi
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              <div className="mt-4">
                {form?.watch('rentalLocationsConfig') === 'selected' && (
                  <div className="mt-4">
                    {rentalLocationsRetrieved.length > 0 && (
                      <div>
                        <div className="text-lg font-semibold">Aggiungi Punto Nolo</div>

                        <div className="flex mt-2">
                          <div className="w-full">
                            <SelectField
                              form={form}
                              name={`newRentalLocation`}
                              options={rentalLocationsRetrieved}
                              autofocus
                            />
                          </div>
                          <div className="ml-2">
                            <Button
                              btnStyle="inFormStyle"
                              type="button"
                              onClick={(e) => {
                                addRentalLocation(e);
                              }}
                            >
                              Aggiungi
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </fieldset>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateWorkflowsRentalLocations;
