import React, { useContext, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useHistory, useParams } from 'react-router-dom';
import SettingsPage from '../../../components/Settings/SettingsPage';
import { TextField } from '../../../components/Form/TextField';
import { SelectField } from '../../../components/Form/SelectField';
import { CheckboxField } from '../../../components/Form/CheckboxField';
import FormLabel from '../../../components/UI/FormLabel';
import { CLIENT_ROLE_ADMIN, http } from '../../../utils/Utils';
import { UserContext } from '../../../store/UserContext';
import CardsHeader from '../../../components/UI/CardsHeader';
import WhiteBox from '../../../components/UI/WhiteBox';
import ToggleSwitch from '../../../components/UI/ToggleSwitch';

const Range = () => {
  const form = useForm();
  const history = useHistory();
  const params = useParams();
  const mode = params.id ? 'edit' : 'create';

  const { data: currentClient } = useContext(UserContext);
  const license = currentClient?.client?.license?.licenseOwner;

  useEffect(() => {
    fetchRange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const fetchRange = async () => {
    try {
      if (mode === 'edit') {
        const response = await http({ url: `/pricing/range/${params.id}` });
        form.setValue('name', response.name);
        form.setValue('description', response.description);
        form.setValue('timeUnit', response.timeUnit);
        form.setValue('from', response.from);
        form.setValue('to', response.to);
        form.setValue('weekdays.monday', response.weekdays?.monday);
        form.setValue('weekdays.tuesday', response.weekdays?.tuesday);
        form.setValue('weekdays.wednesday', response.weekdays?.wednesday);
        form.setValue('weekdays.thursday', response.weekdays?.thursday);
        form.setValue('weekdays.friday', response.weekdays?.friday);
        form.setValue('weekdays.saturday', response.weekdays?.saturday);
        form.setValue('weekdays.sunday', response.weekdays?.sunday);
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const onSubmit = async (data) => {
    try {
      if (data.timeUnit !== 'month' && (data.from === undefined || data.to === undefined)) {
        toast.error('Inserire validità da/a della fascia');
        return;
      }
      if (data.timeUnit === 'month') {
        data.from = undefined;
        data.to = undefined;
        data.weekdays = undefined;
      }

      if (mode === 'create') {
        await http({
          method: 'POST',
          url: '/pricing/range',
          form: data,
        });

        toast.success('Fascia creata');
        history.push('/settings/listini/fasce');
      } else if (mode === 'edit') {
        await http({
          method: 'PUT',
          url: `/pricing/range/${params.id}`,
          form: data,
        });
        toast.success('Fascia aggiornata');
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const removeRange = async (e) => {
    e.preventDefault();
    try {
      await http({
        method: 'DELETE',
        url: `/pricing/range/${params.id}`,
      });
      toast.success('Fascia eliminata');
      history.goBack();
    } catch (err) {
      console.error(err);
      toast.error(err?.error || 'Errore');
    }
  };

  return (
    <SettingsPage canAccess={[CLIENT_ROLE_ADMIN]} hasBox={false}>
      <CardsHeader
        title={mode === 'edit' ? 'Dettagli fascia' : 'Nuova fascia'}
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
            children: mode === 'Rimuovi fascia',
            onClick: (e) => removeRange(e),
            form: 'rangeForm',
            hiddenIf: license === 'movolab' || mode !== 'edit',
          },
          {
            children: mode === 'edit' ? 'Aggiorna fascia' : 'Crea fascia',
            form: 'rangeForm',
            hiddenIf: license === 'movolab',
          },
        ]}
      />

      <WhiteBox className="mt-0 p-4">
        <form onSubmit={form.handleSubmit(onSubmit)} id="rangeForm">
          <fieldset disabled={form.formState.isSubmitting}>
            <div>
              <div className="max-w-sm">
                <FormLabel>Nome</FormLabel>
                <TextField form={form} name="name" type="text" placeholder="Nome" />
              </div>
              <div className="max-w-sm">
                <FormLabel>Descrizione</FormLabel>
                <TextField form={form} name="description" type="text" placeholder="Descrizione" />
              </div>
              <div className="flex space-x-5">
                <div className="w-64">
                  <FormLabel>Unità Tempo</FormLabel>
                  <SelectField
                    form={form}
                    name="timeUnit"
                    type="text"
                    placeholder="Unità Tempo"
                    options={[
                      // { value: 'month', label: 'Mese' },
                      { value: 'day', label: 'Giorno' },
                      // { value: 'hour', label: 'Ora' },
                      // { value: 'minute', label: 'Minuto' },
                    ]}
                  />
                </div>
              </div>
              {form.watch('timeUnit') !== 'month' && (
                <div>
                  <div className="flex space-x-5">
                    <div>
                      <FormLabel>Da</FormLabel>
                      <TextField form={form} name="from" type="number" placeholder="Da" />
                    </div>
                    <div>
                      <FormLabel>A</FormLabel>
                      <TextField form={form} name="to" type="number" placeholder="A" />
                    </div>
                  </div>
                  <FormLabel>Giorni validità</FormLabel>
                  <div className="flex space-x-5">
                    <div className="flex">
                      <span className="pt-2 pr-2 text-xs">Lunedi</span>
                      <CheckboxField form={form} name="weekdays.monday" />
                    </div>
                    <div className="flex">
                      <span className="pt-2 pr-2 text-xs">Martedi</span>{' '}
                      <CheckboxField form={form} name="weekdays.tuesday" />
                    </div>
                    <div className="flex">
                      <span className="pt-2 pr-2 text-xs">Mercoledì</span>{' '}
                      <CheckboxField form={form} name="weekdays.wednesday" />
                    </div>
                    <div className="flex">
                      <span className="pt-2 pr-2 text-xs">Giovedì</span>{' '}
                      <CheckboxField form={form} name="weekdays.thursday" />
                    </div>
                    <div className="flex">
                      <span className="pt-2 pr-2 text-xs">Venerdì</span>{' '}
                      <CheckboxField form={form} name="weekdays.friday" />
                    </div>
                    <div className="flex">
                      <span className="pt-2 pr-2 text-xs">Sabato</span>{' '}
                      <CheckboxField form={form} name="weekdays.saturday" />
                    </div>
                    <div className="flex">
                      <span className="pt-2 pr-2 text-xs">Domenica</span>{' '}
                      <CheckboxField form={form} name="weekdays.sunday" />
                    </div>
                  </div>
                  <div className="">
                    <FormLabel>Seleziona tutti</FormLabel>
                    <ToggleSwitch
                      className="mt-[3px]"
                      switches={[
                        {
                          label: 'Nessuno',
                          onClick: (e) => {
                            form.setValue('weekdays.monday', false);
                            form.setValue('weekdays.tuesday', false);
                            form.setValue('weekdays.wednesday', false);
                            form.setValue('weekdays.thursday', false);
                            form.setValue('weekdays.friday', false);
                            form.setValue('weekdays.saturday', false);
                            form.setValue('weekdays.sunday', false);
                          },
                        },
                        {
                          label: 'Tutti',
                          onClick: (e) => {
                            form.setValue('weekdays.monday', true);
                            form.setValue('weekdays.tuesday', true);
                            form.setValue('weekdays.wednesday', true);
                            form.setValue('weekdays.thursday', true);
                            form.setValue('weekdays.friday', true);
                            form.setValue('weekdays.saturday', true);
                            form.setValue('weekdays.sunday', true);
                          },
                        },
                      ]}
                    />
                  </div>
                </div>
              )}
            </div>
          </fieldset>
        </form>
      </WhiteBox>
    </SettingsPage>
  );
};

export default Range;
