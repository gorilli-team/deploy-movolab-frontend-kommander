import React, { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import useGroups from '../../../../hooks/useGroups';

import GrayButton from '../../../../components/UI/buttons/GrayButton';
import WhiteButton from '../../../../components/UI/buttons/WhiteButton';

import AdminPage from '../../../../components/Admin/AdminPage';
import { TextField } from '../../../../components/Form/TextField';
import { SelectField } from '../../../../components/Form/SelectField';
import FormLabel from '../../../../components/UI/FormLabel';
import { MOVOLAB_ROLE_ADMIN, http } from '../../../../utils/Utils';
import { UserContext } from '../../../../store/UserContext';

const AdminFare = () => {
  const form = useForm();
  const history = useHistory();
  const search = useLocation().search;
  const params = useParams();
  const groups = useGroups();

  const [ranges, setRanges] = useState([]);
  const [revenueSharePriority, setRevenueSharePriority] = useState('');
  const mode = params.id ? 'edit' : 'create';

  const groupUrl = new URLSearchParams(search).get('group');
  const rangeUrl = new URLSearchParams(search).get('range');
  const listinoUrl = new URLSearchParams(search).get('listino');
  if (groupUrl) form.setValue('group', groupUrl);
  if (rangeUrl) form.setValue('range', rangeUrl);

  const { data: currentClient } = useContext(UserContext);
  const license = currentClient?.client?.license?.licenseOwner;
  const role = currentClient?.role;

  let goBackUrl = '';
  if (groupUrl && rangeUrl) {
    goBackUrl = `/admin/movolab/listini/${listinoUrl}/aggiorna?group=${groupUrl}&section=tariffe`;
  }

  const fetchFare = async () => {
    try {
      if (mode === 'edit') {
        const response = await http({ url: `/fares/${params.id}` });
        form.setValue('baseFare', response.baseFare);
        form.setValue('extraDayFare', response.extraDayFare);
        form.setValue('freeDailyKm', response.freeDailyKm);
        form.setValue('extraKmFare', response.extraKmFare);
        form.setValue('group', response.group);
        form.setValue('range', response.range);
        form.setValue('calculation', response.calculation);
        form.setValue('revenueShare.percentage', response.revenueShare?.percentage);
        form.setValue('revenueShare.priority', response.revenueShare?.priority);
        setRevenueSharePriority(response.revenueShare?.priority);
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const fetchRanges = async () => {
    try {
      const response = await http({ url: '/pricing/range' });
      setRanges(
        response.ranges.map((range) => {
          return { value: range._id, label: `${range.name} - ${range.description}` };
        }),
      );
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  useEffect(() => {
    fetchFare();
    fetchRanges();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

        if (isNaN(data.extraKmFare)) {
          toast.error('Inserisci un prezzo valido per i KM Extra', {
            duration: 5000,
            icon: '❌',
          });
          return;
        }
      }

      if (mode === 'create') {
        data = {
          ...data,
          licenseType: 'movolab',
        };

        await http({
          method: 'POST',
          url: '/fares',
          form: data,
        });

        toast.success('Tariffa creata');
        history.push(goBackUrl || '/admin/movolab/listini/');
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
    <AdminPage canAccess={MOVOLAB_ROLE_ADMIN}>
      <div className="p-4">
        <div className="mb-4 p-3 pb-0">
          <WhiteButton
            onClick={() => {
              if (goBackUrl) {
                history.push(goBackUrl);
              } else {
                history.goBack();
              }
            }}
          >
            Indietro
          </WhiteButton>
        </div>

        <div className="mb-4">
          <div className="text-xl font-bold p-3 pb-0">
            {!params.id || params.id === 'crea' ? 'Creazione Tariffa' : 'Aggiornamento Tariffa'}
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)}>
            <fieldset disabled={form.formState.isSubmitting}>
              <div className="flex w-full md:space-x-2 flex-wrap px-3">
                <div className="max-w-sm w-80 mt-4">
                  <FormLabel>Gruppo</FormLabel>
                  <SelectField form={form} name="group" placeholder="Gruppo" options={groups} />
                  <FormLabel>Tariffa Base (Є)</FormLabel>
                  <TextField form={form} name="baseFare" type="text" placeholder="Tariffa Base" />
                  <FormLabel>KM Giorno Inclusi</FormLabel>
                  <TextField
                    form={form}
                    name="freeDailyKm"
                    type="number"
                    placeholder="KM Giorno Inclusi"
                  />
                  <FormLabel>Calcolo</FormLabel>
                  <SelectField
                    form={form}
                    name="calculation"
                    placeholder="Calcolo"
                    options={[
                      { value: 'unit', label: 'Unitario' },
                      { value: 'range', label: 'Fascia' },
                    ]}
                  />
                </div>
                <div className="max-w-sm w-80 mt-4">
                  <FormLabel>Fascia</FormLabel>
                  <SelectField form={form} name="range" placeholder="Fascia" options={ranges} />
                  <FormLabel>Giorni Extra (Є)</FormLabel>
                  <TextField
                    form={form}
                    name="extraDayFare"
                    type="number"
                    placeholder="Giorni Extra"
                  />
                  <FormLabel>KM Extra (Є)</FormLabel>
                  <TextField form={form} name="extraKmFare" type="text" placeholder="KM Extra" />
                </div>
              </div>
              {license === 'movolab' && (
                <div className="mt-4 inline-block bg-yellow-300 rounded-md p-3">
                  <div className="w-full md:w-auto rounded-md">
                    <div className="w-full md:w-60 text-md font-semibold capitalize mt-2">
                      Percentuale Corrispettivi
                    </div>
                    <div className="text-sm w-full md:w-full mt-2">
                      Se la priorità di assegnazione della percentuale è impostata su Listino, la
                      percentuale verrà assegnata in base al listino selezionato.
                      <br />
                      Altrimenti verrà assegnata in base alla tariffa selezionata.
                    </div>
                  </div>
                  <div className="flex w-full flex-wrap">
                    <div className="max-w-sm w-80">
                      <FormLabel>Percentuale</FormLabel>
                      <TextField
                        className="m-0 w-full"
                        name={`revenueShare.percentage`}
                        form={form}
                        disabled={revenueSharePriority === 'priceList'}
                        min={0}
                        max={100}
                        type="number"
                      />
                    </div>
                  </div>
                </div>
              )}

              {(license !== 'movolab' || role === MOVOLAB_ROLE_ADMIN) && (
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex flex-wrap -mx-3 mt-4 ">
                    <div className="w-full px-3">
                      {mode === 'edit' ? (
                        <div className="flex space-x-2">
                          <GrayButton>Aggiorna Tariffa</GrayButton>
                          <GrayButton onClick={(e) => removeFare(e)}>Rimuovi Tariffa</GrayButton>
                        </div>
                      ) : (
                        <GrayButton>Crea Tariffa</GrayButton>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </fieldset>
          </form>
        </div>
      </div>
    </AdminPage>
  );
};

export default AdminFare;
