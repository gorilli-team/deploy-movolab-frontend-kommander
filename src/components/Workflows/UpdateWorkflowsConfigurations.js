import React, { useContext, useEffect, useState } from 'react';
import { MOVOLAB_ROLE_ADMIN, CLIENT_ROLE_ADMIN, http } from '../../utils/Utils';
import { UserContext } from '../../store/UserContext';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { TextField } from '../Form/TextField';
import { CheckboxField } from '../Form/CheckboxField';
import FormLabel from '../UI/FormLabel';
import Button from '../UI/buttons/Button';

const UpdateWorkflowsConfigurations = ({ workflowId = null, editOk = false, submitFn = null }) => {
  const form = useForm();
  const params = useParams();
  const [canModify, setCanModify] = useState(editOk);

  const { data: currentClient } = useContext(UserContext);
  const isAdmin = currentClient?.role === MOVOLAB_ROLE_ADMIN;
  const isClientAdmin = currentClient?.role === CLIENT_ROLE_ADMIN;

  useEffect(() => {
    fetchWorkflow();
  }, [canModify]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchWorkflow = async () => {
    try {
      const response = await http({ url: `/workflow/${workflowId || params.id}?mode=flat` });

      const rentBufferTime = `0${Math.floor(response.configuration.rentBuffer / 60)}:${
        response.configuration.rentBuffer % 60 < 10 ? '0' : ''
      }${response.configuration.rentBuffer % 60}`;

      const noShowHoursTime = `0${Math.floor(response.configuration.noShowHours / 60)}:${
        response.configuration.noShowHours % 60 < 10 ? '0' : ''
      }${response.configuration.noShowHours % 60}`;

      form.setValue('configuration.rentBuffer', rentBufferTime);
      form.setValue('configuration.noShowHours', noShowHoursTime);
      form.setValue('configuration.rentAvailable', response.configuration.rentAvailable);
      form.setValue('configuration.comodatoAvailable', response.configuration.comodatoAvailable);
      form.setValue('configuration.mnpAvailable', response.configuration.mnpAvailable);

      if (isAdmin) {
        setCanModify(true);
      } else if (isClientAdmin) {
        setCanModify(response?.client?._id === currentClient?.client?._id);
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const onSubmit = async (data) => {
    try {
      if (!canModify) {
        toast.error('Non hai i permessi per modificare questo flusso');
        return;
      }
      const update = {
        configuration: {
          rentBuffer:
            Number(data.configuration.rentBuffer.substring(0, 2)) * 60 +
            Number(data.configuration.rentBuffer.substring(3, 5)),
          noShowHours:
            Number(data.configuration.noShowHours.substring(0, 2)) * 60 +
            Number(data.configuration.noShowHours.substring(3, 5)),
          rentAvailable: data.configuration.rentAvailable,
          comodatoAvailable: data.configuration.comodatoAvailable,
          mnpAvailable: data.configuration.mnpAvailable,
        },
      };

      await http({
        method: 'PUT',
        url: `/workflow/${workflowId || params.id}`,
        form: update,
      });
      if (submitFn) submitFn();
      else toast.success('Flusso aggiornato con successo');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="text-lg font-semibold">Flusso</div>

      <div className="mt-2">
        <form onSubmit={form.handleSubmit(onSubmit)} id="workflowForm">
          <fieldset disabled={form.formState.isSubmitting}>
            <div>
              <FormLabel>Tolleranza</FormLabel>
              <p className="text-xs my-1">
                Tempo entro il quale non scatta il giorno successivo nel noleggio (max 2 ore)
              </p>
              <div className="max-w-sm mt-2">
                <TextField
                  form={form}
                  name="configuration.rentBuffer"
                  type="time"
                  max={'02:00'}
                  disabled={!canModify}
                  placeholder="Tolleranza noleggio"
                  autofocus
                />
              </div>
            </div>
            <div className="mt-4">
              <FormLabel>Ore No Show</FormLabel>
              <p className="text-xs my-1">Penale su Importo Movo in Apertura </p>
              <div className="max-w-sm mt-2">
                <TextField
                  form={form}
                  name="configuration.noShowHours"
                  type="time"
                  max={'02:00'}
                  disabled={!canModify}
                  placeholder="Ore No Show"
                  autofocus
                />
              </div>
            </div>
            <div className="mt-4">
              <FormLabel>Movimenti Abilitati</FormLabel>
              <div className="flex">
                <CheckboxField
                  form={form}
                  disabled={!canModify}
                  name="configuration.rentAvailable"
                />
                <span className="pt-0.5 pl-2 text-md">Noleggio</span>
              </div>
              <div className="flex">
                <CheckboxField
                  form={form}
                  disabled={!canModify}
                  name="configuration.comodatoAvailable"
                />
                <span className="pt-0.5 pl-2 text-md">Comodato</span>{' '}
              </div>
              <div className="flex">
                <CheckboxField
                  form={form}
                  disabled={!canModify}
                  name="configuration.mnpAvailable"
                />
                <span className="pt-0.5 pl-2 text-md">Movimento Non Produttivo</span>{' '}
              </div>
            </div>

            {isAdmin && canModify && (
              <div className="mt-5">
                <Button>Aggiorna</Button>
              </div>
            )}
          </fieldset>
        </form>
      </div>
    </div>
  );
};

export default UpdateWorkflowsConfigurations;
