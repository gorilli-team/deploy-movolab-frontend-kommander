import React, { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { UserContext } from '../../../store/UserContext';
import { useHistory, useParams } from 'react-router-dom';
import SettingsPage from '../../../components/Settings/SettingsPage';
import { TextField } from '../../../components/Form/TextField';
import { SelectField } from '../../../components/Form/SelectField';
import FormLabel from '../../../components/UI/FormLabel';
import ToggleSwitch from '../../../components/UI/ToggleSwitch';

import {
  MOVOLAB_ROLE_ADMIN,
  CLIENT_ROLE_ADMIN,
  CLIENT_ROLE_OPERATOR,
  http,
} from '../../../utils/Utils';
import UpdateWorkflowsAdministration from '../../../components/Workflows/UpdateWorkflowsAdministration';
import UpdateWorkflowsConfigurations from '../../../components/Workflows/UpdateWorkflowsConfigurations';
import UpdateWorkflowsExtraFields from '../../../components/Workflows/UpdateWorkflowsExtraFields';
import UpdateWorkflowsPriceLists from '../../../components/Workflows/UpdateWorkflowsPriceLists';
import UpdateWorkflowsRentalLocations from '../../../components/Workflows/UpdateWorkflowsRentalLocations';
import UpdateWorkflowsUserCompanies from '../../../components/Workflows/UpdateWorkflowsUserCompanies';
import CardsHeader from '../../../components/UI/CardsHeader';
import WhiteBox from '../../../components/UI/WhiteBox';
import TableHeaderTab from '../../../components/UI/TableHeaderTab';
import ElementLabel from '../../../components/UI/ElementLabel';
import {
  checkClientProfileIsAdmin,
  checkClientProfileIsMovolabAdmin,
} from '../../../utils/ClientProfile';
import Stepper from '../../../components/UI/Stepper';

const Workflow = () => {
  const form = useForm();
  const history = useHistory();
  const params = useParams();
  const mode = params.id ? 'edit' : 'create';
  const [workflow, setWorkflow] = useState({ extraFields: [] }); //eslint-disable-line
  const [rentalLocations, setRentalLocations] = useState([]);
  const [fieldToUpdate, setFieldToUpdate] = useState('general');
  const [stepDone, setStepDone] = useState(0);

  const [isAdmin, setIsAdmin] = useState(false);
  const [isMovolabAdmin, setIsMovolabAdmin] = useState(false);
  const [canUpdate, setCanUpdate] = useState(false); //eslint-disable-line
  const { data: currentClient } = useContext(UserContext);
  useEffect(() => {
    setIsAdmin(checkClientProfileIsAdmin(currentClient));
    setIsMovolabAdmin(checkClientProfileIsMovolabAdmin(currentClient));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentClient]);

  useEffect(() => {
    setCanUpdate(canUpdateWorkflow(workflow.workflowType, currentClient?.role));
  }, [workflow]);

  useEffect(() => {
    setCanUpdate(canUpdateWorkflow(workflow.workflowType, currentClient?.role));
  }, [currentClient]);

  const canUpdateWorkflow = (workflowType, currentClientRole) => {
    if (currentClientRole === MOVOLAB_ROLE_ADMIN) {
      return true;
    }
    if (workflowType !== 'movolab' && currentClientRole === CLIENT_ROLE_ADMIN) {
      return true;
    }
    return false;
  };

  const addWorkflowToWidget = async () => {
    try {
      const response = await http({
        method: 'PUT',
        url: `/workflow/addtowidget/${params.id}`,
      });

      setWorkflow(response);

      toast.success('Flusso associato al Widget');
    } catch (err) {
      console.error(err);
    }
  };

  const fetchWorkflow = async (id = null, updateStep = false) => {
    try {
      if (mode === 'edit' || updateStep) {
        const response = await http({ url: `/workflow/${id || params.id}` });

        setRentalLocations(response.rentalLocations);

        form.setValue('name', response.name);
        form.setValue('description', response.description);
        form.setValue('status', response.status);
        form.setValue('extraFields', response.extraFields);
        setWorkflow(response);

        if (updateStep) {
          updateStepDone(updateStep);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  useEffect(() => {
    fetchWorkflow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateStepDone = async (step) => {
    if (step === 0) return;

    if (stepDone === 1) {
      const curWorkflow = await http({ url: `/workflow/${workflow._id}` });

      if (curWorkflow?.priceLists.length < 1) {
        toast.error('Abbinare almeno un listino');
        return;
      }
    }

    setStepDone(step);
    if (step === 1) {
      setFieldToUpdate('priceLists');
    }
    if (step === 2) {
      setFieldToUpdate('rentalLocations');
    }
    if (step === 3) {
      setFieldToUpdate('extraFields');
    }
    if (step === 4) {
      setFieldToUpdate('configuration');
    }
    if (step === 5) {
      setFieldToUpdate('administration');
    }
    if (step === 6) {
      setFieldToUpdate('userCompanies');
    }
  };

  const onSubmit = async (data) => {
    try {
      if (isAdmin) {
        if (data.extraFields && data.extraFields.length > 0) {
          data.extraFields.map((extraField) => {
            if (extraField.field === '') {
              toast.error('I campi extra non possono essere vuoti');
            }
            if (extraField.dataType === undefined) {
              toast.error('I campi devono avere un tipo');
            }
            if (extraField.requiredField === undefined) {
              extraField.requiredField = false;
            }

            return extraField;
          });
        }
        data.workflowType = 'client';
        data.client = currentClient.client.id;

        if (mode === 'create') {
          const response = await http({
            method: 'POST',
            url: '/workflow',
            form: data,
          });
          fetchWorkflow(response._id, 1);
        } else if (mode === 'edit') {
          await http({
            method: 'PUT',
            url: `/workflow/${params.id}`,
            form: data,
          });
          toast.success('Flusso aggiornato');
          await fetchWorkflow();
        }
      } else {
        toast.error('Non hai i permessi per creare un flusso');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <SettingsPage canAccess={[CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR]} hasBox={false}>
      <CardsHeader
        title={mode === 'edit' ? 'Flusso' : 'Nuovo Flusso'}
        buttons={[
          {
            btnStyle: 'lightSlateTransparent',
            children: '« Indietro',
            onClick: () => {
              if (mode === 'create' && stepDone > 0) {
                updateStepDone(stepDone - 1);
              } else {
                history.goBack();
              }
            },
          },
          {
            children:
              mode === 'edit' ? 'Aggiorna flusso' : stepDone < 6 ? 'Avanti' : 'Salva flusso',
            form: 'workflowForm',
            hiddenIf: workflow?.workflowType === 'movolab' || !isAdmin,
            onClick: () => {
              if (mode === 'create' && stepDone > 0 && stepDone !== 4 && stepDone !== 5) {
                if (stepDone > 5) {
                  history.push(`/settings/flussi/${workflow._id}`);
                } else {
                  updateStepDone(stepDone + 1);
                }
              }
              if (mode === 'edit') {
                toast.success('Flusso aggiornato');
              }
            },
          },
        ]}
      >
        {mode === 'create' ? (
          <Stepper
            steps={[
              { content: '1', isCurrent: stepDone === 0 },
              { content: '2', isCurrent: stepDone === 1 },
              { content: '3', isCurrent: stepDone === 2 },
              { content: '4', isCurrent: stepDone === 3 },
              { content: '5', isCurrent: stepDone === 4 },
              { content: '6', isCurrent: stepDone === 5 },
              { content: '7', isCurrent: stepDone === 6 },
            ]}
            colorScheme="orange"
            className="mr-6"
          />
        ) : null}
      </CardsHeader>

      <WhiteBox className="mt-0">
        {mode === 'edit' && (
          <div className="flex p-7 gap-x-4">
            <div className="flex-1">
              <div className="text-3xl font-semibold">{workflow?.name}</div>
              <div className="text-md">{workflow?.description}</div>
            </div>
            <div className="flex flex-col items-end">
              <div className="space-x-2">
                {workflow?.workflowType === 'movolab' ? (
                  <ElementLabel bgColor="bg-blue-500">Movolab</ElementLabel>
                ) : workflow?.workflowType === 'client' ? (
                  <>
                    <ElementLabel bgColor="bg-gray-500">Personale</ElementLabel>
                  </>
                ) : (
                  <></>
                )}
                {workflow?.status === 'active' ? (
                  <ElementLabel bgColor="bg-green-600">Attivo</ElementLabel>
                ) : workflow?.status === 'inactive' ? (
                  <ElementLabel bgColor="bg-red-600">Annullato</ElementLabel>
                ) : (
                  ''
                )}
              </div>
              <div className="mt-2">
                <ToggleSwitch
                  switches={[
                    {
                      label: 'Su Widget',
                      onClick: (e) => {
                        addWorkflowToWidget();
                      },
                      selected: workflow?.isOnWidget,
                    },
                    {
                      label: 'OFF',
                      onClick: (e) => {
                        toast.error(
                          'Non puoi rimuovere un Flusso dal Widget. Se vuoi usarne un altro vai sulla pagina di quel Flusso.',
                        );
                      },
                      selected: !workflow?.isOnWidget,
                    },
                  ]}
                />
              </div>
            </div>
          </div>
        )}

        <TableHeaderTab
          buttons={[
            {
              label: 'Generale',
              function: () => {
                setFieldToUpdate('general');
              },
              selected: fieldToUpdate === 'general',
              disabled: mode !== 'edit',
            },
            {
              label: 'Listini',
              function: () => {
                setFieldToUpdate('priceLists');
              },
              selected: fieldToUpdate === 'priceLists',
              disabled: mode !== 'edit',
            },
            {
              label: 'Punti Nolo',
              function: () => {
                setFieldToUpdate('rentalLocations');
              },
              selected: fieldToUpdate === 'rentalLocations',
              disabled: mode !== 'edit',
            },
            {
              label: 'Campi Extra',
              function: () => {
                setFieldToUpdate('extraFields');
              },
              selected: fieldToUpdate === 'extraFields',
              disabled: mode !== 'edit',
            },
            {
              label: 'Configurazione',
              function: () => {
                setFieldToUpdate('configuration');
              },
              selected: fieldToUpdate === 'configuration',
              disabled: mode !== 'edit',
            },
            {
              label: 'Amministrazione',
              function: () => {
                setFieldToUpdate('administration');
              },
              selected: fieldToUpdate === 'administration',
              disabled: mode !== 'edit',
            },
            {
              label: 'Aziende Clienti',
              function: () => {
                setFieldToUpdate('userCompanies');
              },
              selected: fieldToUpdate === 'userCompanies',
              disabled: mode !== 'edit',
            },
          ]}
        />

        <div className={`p-4 bg-slate-200 border-4 rounded-b-2xl border-white`}>
          {fieldToUpdate === 'general' && (
            <form onSubmit={form.handleSubmit(onSubmit)} id="workflowForm">
              <fieldset disabled={form.formState.isSubmitting}>
                <div className="max-w-sm">
                  <FormLabel>Nome</FormLabel>
                  <TextField
                    form={form}
                    name="name"
                    type="text"
                    disabled={!canUpdate}
                    placeholder="Nome"
                  />
                </div>
                <div className="max-w-sm">
                  <FormLabel>Descrizione</FormLabel>
                  <TextField
                    form={form}
                    name="description"
                    type="text"
                    placeholder="Descrizione"
                    disabled={!canUpdate}
                  />
                </div>
                {mode === 'edit' ? (
                  <div className="max-w-sm">
                    <FormLabel>Stato</FormLabel>
                    <SelectField
                      form={form}
                      name="status"
                      placeholder="Stato"
                      options={[
                        { value: 'active', label: 'Attivo' },
                        { value: 'inactive', label: 'Disattivato' },
                      ]}
                      disabled={!canUpdate}
                    />
                  </div>
                ) : null}
              </fieldset>
            </form>
          )}
          {fieldToUpdate === 'priceLists' && (
            <UpdateWorkflowsPriceLists workflowId={workflow._id} />
          )}
          {fieldToUpdate === 'rentalLocations' && (
            <UpdateWorkflowsRentalLocations
              workflowId={workflow._id}
              rentalLocations={rentalLocations}
            />
          )}
          {fieldToUpdate === 'extraFields' && (
            <UpdateWorkflowsExtraFields workflowId={workflow._id} />
          )}
          {fieldToUpdate === 'configuration' && (
            <UpdateWorkflowsConfigurations
              workflowId={workflow._id}
              editOk
              submitFn={() => {
                updateStepDone(5);
              }}
            />
          )}
          {fieldToUpdate === 'administration' && (
            <UpdateWorkflowsAdministration
              workflowId={workflow._id}
              editOk
              submitFn={() => {
                updateStepDone(6);
              }}
            />
          )}
          {fieldToUpdate === 'userCompanies' && (
            <UpdateWorkflowsUserCompanies workflowId={workflow._id} />
          )}
        </div>
      </WhiteBox>
    </SettingsPage>
  );
};

export default Workflow;
