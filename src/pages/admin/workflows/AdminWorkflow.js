import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import AdminPage from '../../../components/Admin/AdminPage';
import { TextField } from '../../../components/Form/TextField';
import { SelectField } from '../../../components/Form/SelectField';
import FormLabel from '../../../components/UI/FormLabel';
import { Link } from 'react-router-dom';
import { FaLink } from 'react-icons/fa';
import { MOVOLAB_ROLE_ADMIN, http } from '../../../utils/Utils';
import Button from '../../../components/UI/buttons/Button';
import UpdateWorkflowsAdministration from '../../../components/Workflows/UpdateWorkflowsAdministration';
import UpdateWorkflowsConfigurations from '../../../components/Workflows/UpdateWorkflowsConfigurations';
import UpdateWorkflowsExtraFields from '../../../components/Workflows/UpdateWorkflowsExtraFields';
import UpdateWorkflowsPriceLists from '../../../components/Workflows/UpdateWorkflowsPriceLists';
import UpdateWorkflowsRentalLocations from '../../../components/Workflows/UpdateWorkflowsRentalLocations';
import UpdateWorkflowsUserCompanies from '../../../components/Workflows/UpdateWorkflowsUserCompanies';
import UpdateWorkflowsAgreements from '../../../components/Workflows/UpdateWorkflowsAgreements';
import TableHeaderTab from '../../../components/UI/TableHeaderTab';
import ElementLabel from '../../../components/UI/ElementLabel';

const AdminWorkflow = () => {
  const form = useForm();
  const history = useHistory();
  const params = useParams();
  const mode = params.id ? 'edit' : 'create';
  const [workflow, setWorkflow] = useState({ extraFields: [] });
  const [userCompanies, setUserCompanies] = useState([]);
  const search = useLocation().search;

  const [rentalLocations, setRentalLocations] = useState([]);
  const [fieldToUpdate, setFieldToUpdate] = useState(
    new URLSearchParams(search).get('tab') || 'generale',
  );

  const fetchWorkflow = async () => {
    try {
      if (mode === 'edit') {
        const response = await http({ url: `/workflow/${params.id}` });
        setRentalLocations(response.rentalLocations);

        form.setValue('name', response.name);
        form.setValue('description', response.description);
        form.setValue('status', response.status);
        form.setValue('extraFields', response.extraFields);
        form.setValue('initiator', response.initiator);
        form.setValue('workflowType', response.workflowType);
        form.setValue('workflowCorporateClient', response.workflowCorporateClient?._id);
        setWorkflow(response);
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const fetchUserCompanies = async () => {
    try {
      const response = await http({ url: `/userCompanies` });

      setUserCompanies(
        response.userCompanies.map((userCompany) => {
          return {
            value: userCompany._id,
            label: `${userCompany.ragioneSociale}`,
          };
        }),
      );
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  useEffect(() => {
    fetchWorkflow();
    fetchUserCompanies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goToTab = (tab) => {
    setFieldToUpdate(tab);
    history.push(`/admin/workflows/${params.id}?tab=${tab}`);
  };

  const onSubmit = async (data) => {
    try {
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
      data.workflowType = data.workflowType || 'movolab';

      if (mode === 'create') {
        const response = await http({
          method: 'POST',
          url: '/workflow',
          form: data,
        });

        history.push(`/admin/workflows/${response._id}?tab=listini`);
        toast.success('Flusso creato con successo');
        await fetchWorkflow();
      } else if (mode === 'edit') {
        await http({
          method: 'PUT',
          url: `/workflow/${params.id}`,
          form: data,
        });
        toast.success('Flusso aggiornato');
        await fetchWorkflow();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminPage canAccess={MOVOLAB_ROLE_ADMIN}>
      {mode === 'edit' && (
        <div className="flex p-7 gap-x-4">
          <div className="flex-1">
            <div className="text-3xl font-semibold">{workflow?.name}</div>
            <div className="text-md">{workflow?.description}</div>
          </div>
          <div>
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
          </div>
        </div>
      )}

      <TableHeaderTab
        buttons={[
          {
            label: 'Indietro',
            function: () => {
              history.push('/admin/workflows');
            },
          },
          {
            label: 'Generale',
            function: () => {
              setFieldToUpdate('generale');
            },
            selected: fieldToUpdate === 'generale',
            // disabled: mode !== 'edit'
          },
          {
            label: 'Listini',
            function: () => {
              goToTab('listini');
            },
            selected: fieldToUpdate === 'listini',
            disabled: mode !== 'edit',
          },
          {
            label: 'Punti Nolo',
            function: () => {
              goToTab('puntiNolo');
            },
            selected: fieldToUpdate === 'puntiNolo',
            disabled: mode !== 'edit',
          },
          {
            label: 'Campi Extra',
            function: () => {
              goToTab('campiExtra');
            },
            selected: fieldToUpdate === 'campiExtra',
            disabled: mode !== 'edit',
          },
          {
            label: 'Configurazione',
            function: () => {
              goToTab('configurazione');
            },
            selected: fieldToUpdate === 'configurazione',
            disabled: mode !== 'edit',
          },
          {
            label: 'Amministrazione',
            function: () => {
              goToTab('amministrazione');
            },
            selected: fieldToUpdate === 'amministrazione',
            disabled: mode !== 'edit',
          },
          {
            label: 'Aziende Clienti',
            function: () => {
              goToTab('aziendeClienti');
            },
            selected: fieldToUpdate === 'aziendeClienti',
            disabled: mode !== 'edit',
          },
        ]}
      />

      <div className="p-4">
        <div className="mb-4">
          {!params.id || params.id === 'crea' ? (
            <span className="font-bold">Creazione Flusso</span>
          ) : null}
          {fieldToUpdate === 'generale' && (
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <fieldset disabled={form.formState.isSubmitting}>
                <div className="max-w-sm">
                  <FormLabel>Nome</FormLabel>
                  <TextField form={form} name="name" type="text" placeholder="Nome" />
                </div>
                <div className="max-w-sm">
                  <FormLabel>Descrizione</FormLabel>
                  <TextField form={form} name="description" type="text" placeholder="Nome" />
                </div>
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
                  />
                </div>
                <div className="max-w-sm">
                  <FormLabel>Tipo</FormLabel>
                  <SelectField
                    form={form}
                    name="workflowType"
                    placeholder="Tipo"
                    options={[
                      { value: 'movolab', label: 'Movolab' },
                      { value: 'client', label: 'Cliente' },
                    ]}
                  />
                </div>
                {workflow.workflowType === 'client' && (
                  <div className="max-w-sm">
                    <FormLabel>Cliente Associato</FormLabel>
                    <div className="text-md py-2 text-gray-700">
                      <Link to={`/admin/utenti/clientProfile`}>
                        <span className="font-semibold">
                          {' '}
                          {workflow.client?.ragioneSociale || 'Nessun cliente associato'}
                        </span>
                        <FaLink className="inline ml-1 mb-1 text-sm text-blue-600" />
                      </Link>
                    </div>
                  </div>
                )}
                <div className="max-w-sm">
                  <FormLabel>Iniziatore</FormLabel>
                  <p className="text-xs text-gray-700">
                    L'iniziatore è chi inizia il processo di prenotazione o di richiesta di
                    noleggio.
                  </p>
                  <SelectField
                    form={form}
                    name="initiator"
                    placeholder="Iniziatore"
                    options={[
                      { value: 'dashboard', label: 'Azienda Nolo' },
                      { value: 'corporate', label: 'Cliente Corporate' },
                      { value: 'mobileapp', label: 'Utente App' },
                    ]}
                  />
                </div>
                {form.watch('initiator') === 'corporate' && (
                  <div className="max-w-sm bg-gray-100 p-2 mt-3">
                    <FormLabel>Azienda Cliente</FormLabel>
                    <SelectField
                      form={form}
                      name="workflowCorporateClient"
                      placeholder="Cliente Corporate"
                      options={[{ value: '', label: '-- Seleziona --' }, ...userCompanies]}
                    />
                  </div>
                )}

                <div className="mt-5">
                  {mode === 'edit' ? <Button>Aggiorna</Button> : <Button>Crea Flusso</Button>}
                </div>
              </fieldset>
            </form>
          )}
          {fieldToUpdate === 'listini' && <UpdateWorkflowsPriceLists></UpdateWorkflowsPriceLists>}
          {fieldToUpdate === 'puntiNolo' && (
            <UpdateWorkflowsRentalLocations
              rentalLocations={rentalLocations}
            ></UpdateWorkflowsRentalLocations>
          )}
          {fieldToUpdate === 'campiExtra' && (
            <UpdateWorkflowsExtraFields></UpdateWorkflowsExtraFields>
          )}
          {fieldToUpdate === 'configurazione' && (
            <UpdateWorkflowsConfigurations></UpdateWorkflowsConfigurations>
          )}
          {fieldToUpdate === 'amministrazione' && (
            <UpdateWorkflowsAdministration></UpdateWorkflowsAdministration>
          )}
          {fieldToUpdate === 'aziendeClienti' && (
            <UpdateWorkflowsUserCompanies></UpdateWorkflowsUserCompanies>
          )}
          {fieldToUpdate === 'convenzioni' && (
            <UpdateWorkflowsAgreements></UpdateWorkflowsAgreements>
          )}
        </div>
      </div>
    </AdminPage>
  );
};

export default AdminWorkflow;
