import React, { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import useGroups from '../../../hooks/useGroups';
import SettingsPage from '../../../components/Settings/SettingsPage';
import { TextField } from '../../../components/Form/TextField';
import { SelectField } from '../../../components/Form/SelectField';
import FormLabel from '../../../components/UI/FormLabel';
import { CLIENT_ROLE_ADMIN, http } from '../../../utils/Utils';
import { UserContext } from '../../../store/UserContext';
import { showCostTimeframe } from '../../../utils/Prices';
import CardsHeader from '../../../components/UI/CardsHeader';
import WhiteBox from '../../../components/UI/WhiteBox';

const Fare = () => {
  const form = useForm();
  const history = useHistory();
  const params = useParams();
  const groups = useGroups();
  const search = useLocation().search;
  const [ranges, setRanges] = useState([]);
  const mode = params.id ? 'edit' : 'create';

  const groupUrl = new URLSearchParams(search).get('group');
  const rangeUrl = new URLSearchParams(search).get('range');
  const listinoUrl = new URLSearchParams(search).get('listino'); //eslint-disable-line

  const { data: currentClient } = useContext(UserContext);
  const license = currentClient?.client?.license?.licenseOwner;

  const fetchFare = async () => {
    try {
      if (mode === 'edit') {
        const response = await http({ url: `/fares/${params.id}` });
        form.setValue('baseFare', response.baseFare);
        form.setValue('extraDayFare', response.extraDayFare);
        form.setValue('freeDailyKm', response.freeDailyKm);
        form.setValue('extraKmFare', response.extraKmFare);
        form.setValue('calculation', response.calculation);
        form.setValue('group', response.group);
        form.setValue('range', response.range);
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const fetchRanges = async () => {
    try {
      const response = await http({ url: '/pricing/range' });
      if (response && response.ranges) {
        setRanges(
          response.ranges.map((range) => {
            return {
              value: range._id,
              label: `${range.name}`,
              data: {
                from: range.from,
                to: range.to,
              },
            };
          }),
        );
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const prefillParams = async () => {
    if (rangeUrl) {
      form.setValue('range', rangeUrl);
    }
    if (groupUrl) form.setValue('group', groupUrl);
  };

  useEffect(() => {
    fetchFare();
    fetchRanges();
    prefillParams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mapCostsTimeframe = (timeUnit) => {
    return showCostTimeframe(timeUnit);
  };

  const removeFare = async (e) => {
    e.preventDefault();
    try {
      await http({
        method: 'DELETE',
        url: `/fares/${params.id}`,
      });
      toast.success('Tariffa eliminata');
      history.goBack();
    } catch (err) {
      console.error(err);
      toast.error(err?.error || 'Errore');
    }
  };

  const onSubmit = async (data) => {
    try {
      if (data.extraKmFare && typeof data.extraKmFare === 'string') {
        data.extraKmFare = Number(data.extraKmFare?.replace(',', '.'));
      }
      if (mode === 'create') {
        await http({
          method: 'POST',
          url: '/fares',
          form: data,
        });

        toast.success('Tariffa creata');
        history.goBack();
      } else if (mode === 'edit') {
        await http({
          method: 'PUT',
          url: `/fares/${params.id}`,
          form: data,
        });

        toast.success('Tariffa aggiornata');
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  return (
    <SettingsPage canAccess={[CLIENT_ROLE_ADMIN]} hasBox={false}>
      <CardsHeader
        title={mode === 'edit' ? 'Dettagli tariffa' : 'Nuova tariffa'}
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
            children: mode === 'Rimuovi tariffa',
            onClick: (e) => removeFare(e),
            form: 'fareForm',
            hiddenIf: license === 'movolab' || mode !== 'edit',
          },
          {
            children: mode === 'edit' ? 'Aggiorna tariffa' : 'Crea tariffa',
            form: 'fareForm',
            hiddenIf: license === 'movolab',
          },
        ]}
      />

      <WhiteBox className="mt-0 p-4">
        <form onSubmit={form.handleSubmit(onSubmit)} id="fareForm">
          <fieldset disabled={form.formState.isSubmitting}>
            <div>
              <div className="max-w-sm">
                <FormLabel>Gruppo</FormLabel>
                <SelectField
                  form={form}
                  name="group"
                  placeholder="Gruppo"
                  options={groups}
                  disabled={license === 'movolab'}
                />
              </div>
              <div className="max-w-sm">
                <FormLabel>Fascia</FormLabel>
                <SelectField
                  form={form}
                  name="range"
                  placeholder="Fascia"
                  options={ranges}
                  disabled={license === 'movolab'}
                />
              </div>
              <div className="max-w-sm">
                {form.watch('range') !== undefined && (
                  <div className="flex flex-wrap -mx-3 mt-4">
                    <div className="w-full px-3">
                      <div className="text-sm bg-gray-100 p-3 rounded-lg">
                        Riepilogo Fascia:{' '}
                        {ranges.filter((range) => range.value === form.watch('range'))[0]?.label}
                        <div>
                          Tipo tariffa:{' '}
                          {
                            ranges.filter((range) => range.value === form.watch('range'))[0]?.data
                              .timeUnit
                          }
                        </div>
                        <div>
                          Da:{' '}
                          {
                            ranges.filter((range) => range.value === form.watch('range'))[0]?.data
                              .from
                          }
                        </div>
                        <div>
                          A:{' '}
                          {
                            ranges.filter((range) => range.value === form.watch('range'))[0]?.data
                              .to
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex space-x-3">
                <div>
                  <FormLabel>Calcolo Costo</FormLabel>
                  <SelectField
                    form={form}
                    name="calculation"
                    type="text"
                    placeholder="Calcolo Costo"
                    disabled={license === 'movolab'}
                    options={[
                      { value: 'unit', label: mapCostsTimeframe(form.watch('timeUnit')) },
                      { value: 'range', label: 'Fisso' },
                    ]}
                  />
                </div>
                <div className="w-48">
                  {' '}
                  <FormLabel>Tariffa Base (Є)</FormLabel>
                  <TextField
                    form={form}
                    name="baseFare"
                    type="number"
                    placeholder="Tariffa Base"
                    disabled={license === 'movolab'}
                  />
                </div>
                <div className="w-44">
                  <FormLabel>Giorni Extra (Є)</FormLabel>
                  <TextField
                    form={form}
                    name="extraDayFare"
                    type="number"
                    placeholder="Giorni Extra"
                    disabled={license === 'movolab'}
                  />
                </div>
              </div>
              {/* <FormLabel>Tariffa Minima Giornaliera (Є)</FormLabel>
                <TextField
                  form={form}
                  name="minDailyFare"
                  type="number"
                  placeholder="Tariffa Minima Giornaliera"
                  disabled={license === 'movolab'}
                /> */}
              <div className="flex space-x-3">
                <div className="w-48">
                  <FormLabel>KM Giorno Inclusi</FormLabel>
                  <TextField
                    form={form}
                    name="freeDailyKm"
                    type="number"
                    placeholder="KM Giorno Inclusi"
                    disabled={license === 'movolab'}
                  />
                </div>
                <div className="w-44">
                  <FormLabel>KM Extra (Є)</FormLabel>
                  <TextField
                    form={form}
                    name="extraKmFare"
                    type="text"
                    placeholder="KM Extra"
                    disabled={license === 'movolab'}
                  />
                </div>
              </div>
            </div>
          </fieldset>
        </form>
      </WhiteBox>
    </SettingsPage>
  );
};

export default Fare;
