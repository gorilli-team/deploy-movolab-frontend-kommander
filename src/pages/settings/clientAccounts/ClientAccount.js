import React, { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useHistory, useParams } from 'react-router-dom';

import { UserContext } from '../../../store/UserContext';

import { TextField } from '../../../components/Form/TextField';
import { SelectField } from '../../../components/Form/SelectField';
import LightGrayButton from '../../../components/UI/buttons/LightGrayButton';
import {
  CLIENT_ROLE_OPERATOR,
  CLIENT_ROLE_ADMIN,
  MOVOLAB_ROLE_ADMIN,
  http,
} from '../../../utils/Utils';
import FormLabel from '../../../components/UI/FormLabel';
import SettingsPage from '../../../components/Settings/SettingsPage';
import ElementLabel from '../../../components/UI/ElementLabel';
import CardsHeader from '../../../components/UI/CardsHeader';
import WhiteBox from '../../../components/UI/WhiteBox';
import ToggleSwitch from '../../../components/UI/ToggleSwitch';

const ClientAccount = () => {
  const form = useForm({
    defaultValues: {
      fullname: '',
      email: '',
      role: '',
      rentalLocationsConfig: 'all_from_client', // or some other default
    },
  });
  const params = useParams();
  const history = useHistory();

  const { data: currentClient } = useContext(UserContext);
  const isAdmin = currentClient?.role === MOVOLAB_ROLE_ADMIN;
  const isClientAdmin = currentClient?.role === CLIENT_ROLE_ADMIN;
  const allowAdmin = isAdmin || isClientAdmin;

  const [clientAccount, setClientAccount] = useState({});
  const [rentalLocationsRetrieved, setRentalLocationsRetrieved] = useState([]);
  const mode = params.id ? 'edit' : 'create';

  useEffect(() => {
    fetchClientAccount();
    fetchRentalLocations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchClientAccount = async () => {
    try {
      if (mode === 'edit') {
        const response = await http({ url: `/clientProfile/${params.id}` });
        setClientAccount(response);
        form.setValue('fullname', response.fullname);
        form.setValue('email', response.email);
        form.setValue('role', response.role);
        form.setValue('rentalLocationsConfig', response.rentalLocationsConfig);
        form.setValue('rentalLocations', response.rentalLocations);
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const fetchRentalLocations = async () => {
    try {
      if (!params.id) return;

      let response = [];

      if (currentClient?.role === MOVOLAB_ROLE_ADMIN) {
        response = await http({ url: '/admin/rentalLocation' });
      } else {
        response = await http({ url: '/clients/rentalLocation' });
      }

      const responseClientAccount = await http({ url: `/clientProfile/${params.id}` });

      const ids =
        responseClientAccount?.rentalLocations.map((rentalLocation) => rentalLocation?._id) || [];

      const availableRentalLocations = response.rentalLocations.filter((rentalLocation) => {
        return !ids.includes(rentalLocation._id);
      });

      if (availableRentalLocations.length > 0) {
        form.setValue('newRentalLocation', availableRentalLocations[0]);
      }

      setRentalLocationsRetrieved(
        availableRentalLocations.map((rentalLocation) => {
          return {
            value: rentalLocation?._id,
            label: `${rentalLocation?.clientId?.ragioneSociale}: ${rentalLocation.name} - ${rentalLocation.address}`,
          };
        }),
      );
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const addRentalLocation = async (e) => {
    try {
      e.preventDefault();
      const newRentalLocation = form.getValues('newRentalLocation');
      const currentRentalLocations = clientAccount?.rentalLocations || [];

      const update = {
        rentalLocations: [...currentRentalLocations, newRentalLocation],
      };

      await http({
        method: 'PUT',
        url: `/clientProfile/${params.id}`,
        form: update,
      });
      toast.success('Punto Nolo aggiunto con successo');
      await fetchClientAccount();
      await fetchRentalLocations();
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const updaterentalLocationsConfig = async () => {
    try {
      if (params.id) {
        const rentalLocationsConfig = form.getValues('rentalLocationsConfig');
        const update = {
          rentalLocationsConfig,
        };

        await http({
          method: 'PUT',
          url: `/clientProfile/${params.id}`,
          form: update,
        });
        toast.success('Configurazione Punti Nolo aggiornata con successo');
        await fetchClientAccount();
        await fetchRentalLocations();
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const removeRentalLocation = async (e, id) => {
    try {
      e.preventDefault();

      const update = {
        rentalLocations: form
          .getValues('rentalLocations')
          .filter((rentalLocation) => rentalLocation._id !== id),
      };
      await http({
        method: 'PUT',
        url: `/clientProfile/${params.id}`,
        form: update,
      });
      toast.success('Punto Nolo rimosso con successo');
      await fetchClientAccount();
      await fetchRentalLocations();
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const disableClientAccount = async () => {
    try {
      await http({
        method: 'PUT',
        url: `/clientProfile/${params.id}`,
        form: { enabled: !clientAccount.enabled },
      });
      toast.success('Profilo Cliente disabilitato');
      await fetchClientAccount();
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const sendActivationEmail = async () => {
    try {
      await http({
        method: 'PUT',
        url: `/clientProfile/sendActivationEmail/${params.id}`,
      });
      toast.success('Email di attivazione inviata');
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const onSubmit = async (data) => {
    try {
      if (mode === 'create') {
        const response = await http({
          method: 'POST',
          url: '/clientProfile/create',
          form: data,
        });

        toast.success('Profilo Cliente aggiunto');
        history.push(`/settings/profiliCliente/${response?.clientProfile?._id}`);
      } else if (mode === 'edit') {
        await http({
          method: 'PUT',
          url: `/clientProfile/${params.id}`,
          form: data,
        });
        toast.success('Profilo Cliente aggiornato');
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  return (
    <SettingsPage canAccess={[CLIENT_ROLE_ADMIN]} hasBox={false}>
      <CardsHeader
        title={mode === 'edit' ? 'Aggiorna Profilo Cliente' : 'Nuovo Profilo Cliente'}
        buttons={[
          {
            btnStyle: 'lightSlateTransparent',
            children: '« Indietro',
            onClick: () => {
              history.goBack();
            },
          },
          {
            btnStyle: 'lightSlateTransparent',
            children: 'Reinvia Email di Attivazione',
            onClick: () => {
              sendActivationEmail();
            },
          },
          {
            children: mode === 'edit' ? 'Aggiorna profilo' : 'Crea profilo',
            form: 'clientAccount',
          },
        ]}
      />

      <WhiteBox className="mt-0 p-4">
        {mode === 'edit' && (
          <div className="flex p-3 gap-x-4 mb-4">
            <div className="flex-1">
              <div className="text-3xl font-semibold">{clientAccount?.fullname}</div>
              <div className="text-md">{clientAccount?.email}</div>
            </div>
            <div className="text-right p-1">
              <div className="mb-4">
                {clientAccount?.enabled ? (
                  <ElementLabel bgColor="bg-green-600">Abilitato</ElementLabel>
                ) : (
                  <ElementLabel bgColor="bg-red-600">Disabilitato</ElementLabel>
                )}
              </div>

              <ToggleSwitch
                switches={[
                  {
                    label: 'ON',
                    onClick: (e) => {
                      disableClientAccount();
                    },
                    selected: clientAccount?.enabled,
                  },
                  {
                    label: 'OFF',
                    onClick: (e) => {
                      disableClientAccount();
                    },
                    selected: !clientAccount?.enabled,
                  },
                ]}
              />
            </div>
          </div>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} id="clientAccount">
          <fieldset disabled={form.formState.isSubmitting}>
            <div className="max-w-sm">
              <FormLabel>Nome Profilo Cliente</FormLabel>
              <TextField
                form={form}
                name="fullname"
                type="string"
                placeholder="Nome Profilo Cliente"
                validation={{
                  required: { value: true, message: 'Nome Profilo Cliente' },
                }}
                value={form.watch('fullname') || ''}
              />
              <FormLabel>Email</FormLabel>
              <TextField
                form={form}
                name="email"
                type="string"
                placeholder="Email"
                value={form.watch('email') || ''}
              />
              <FormLabel>Ruolo</FormLabel>
              <SelectField
                name="role"
                form={form}
                options={[
                  { value: CLIENT_ROLE_ADMIN, label: 'Amministratore' },
                  { value: CLIENT_ROLE_OPERATOR, label: 'Operatore' },
                ]}
                placeholder="Ruolo"
                value={form.watch('role') || ''}
              />
            </div>
          </fieldset>

          {params.id && form?.watch('role') === CLIENT_ROLE_OPERATOR && (
            <div>
              {allowAdmin && (
                <div className="mt-4 flex space-x-4">
                  <div className="mt-4 w-96">
                    <div className="text-lg font-semibold">Abbinamento Punti Nolo</div>
                    <div className="mt-2">
                      <SelectField
                        form={form}
                        name={`rentalLocationsConfig`}
                        options={[
                          {
                            value: 'all_from_client',
                            label: 'Tutti i Punti Nolo del Cliente',
                          },
                          { value: 'selected', label: 'Solo i Punti Nolo selezionati' },
                        ]}
                        onChangeFunction={() => {
                          updaterentalLocationsConfig();
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
              {form?.watch('rentalLocationsConfig') === 'selected' &&
                clientAccount?.rentalLocations?.length > 0 && (
                  <div className="mt-4">
                    <div className="text-lg font-semibold">Punti Nolo Abilitati</div>
                    <div className="mt-2">
                      {clientAccount?.rentalLocations?.map((rentalLocation, index) => {
                        if (!rentalLocation) return null;
                        return (
                          <div key={index}>
                            <div className="flex mt-2">
                              <div className="w-full">
                                {isAdmin ? (
                                  <input
                                    className="w-full"
                                    type="text"
                                    value={`${rentalLocation?.clientId?.ragioneSociale}: ${rentalLocation.name} - ${rentalLocation.address}`}
                                    disabled={true}
                                  />
                                ) : (
                                  <input
                                    className="w-full"
                                    type="text"
                                    value={`${rentalLocation.name} - ${rentalLocation.address}`}
                                    disabled={true}
                                  />
                                )}
                              </div>
                              {allowAdmin && (
                                <div className="ml-2">
                                  <LightGrayButton
                                    type="button"
                                    onClick={(e) => {
                                      removeRentalLocation(e, rentalLocation._id);
                                    }}
                                  >
                                    Rimuovi
                                  </LightGrayButton>
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
                {form?.watch('rentalLocationsConfig') === 'selected' &&
                  rentalLocationsRetrieved.length > 0 && (
                    <div className="mt-4">
                      <div className="text-lg font-semibold">Aggiungi Punto Nolo</div>

                      <div className="flex mt-2">
                        <div className="w-full">
                          <SelectField
                            form={form}
                            name="newRentalLocation"
                            options={
                              rentalLocationsRetrieved.length > 0
                                ? [{ value: '', label: 'Seleziona un punto nolo' }].concat(
                                    rentalLocationsRetrieved,
                                  )
                                : [{ value: '', label: 'Nessun Punto Nolo disponibile' }]
                            }
                            autofocus
                            defaultValue={rentalLocationsRetrieved[0]?.value || ''} // default to the first option or an empty value
                          />
                        </div>

                        <div className="ml-2">
                          <LightGrayButton
                            type="button"
                            onClick={(e) => {
                              addRentalLocation(e);
                            }}
                          >
                            Aggiungi
                          </LightGrayButton>
                        </div>
                      </div>
                    </div>
                  )}
              </div>
            </div>
          )}
        </form>
      </WhiteBox>
    </SettingsPage>
  );
};

export default ClientAccount;
