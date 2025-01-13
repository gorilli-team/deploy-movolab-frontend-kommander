import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import AdminPage from '../../../../components/Admin/AdminPage';
import { TextField } from '../../../../components/Form/TextField';
import FormLabel from '../../../../components/UI/FormLabel';
import WhiteButton from '../../../../components/UI/buttons/WhiteButton';
import { MOVOLAB_ROLE_ADMIN, http } from '../../../../utils/Utils';
import GrayButton from '../../../../components/UI/buttons/GrayButton';
import { SelectField } from '../../../../components/Form/SelectField';

const AdminFranchise = () => {
  const form = useForm();
  const history = useHistory();
  const params = useParams();
  const search = useLocation().search;

  const groupUrl = new URLSearchParams(search).get('group');
  const listinoUrl = new URLSearchParams(search).get('listino');

  let goBackUrl = '';
  if (groupUrl) {
    goBackUrl = `/admin/movolab/listini/${listinoUrl}/aggiorna?group=${groupUrl}&section=franchigie`;
  }

  const fetchFranchise = async () => {
    try {
      if (!params.id || params.id === 'crea') return;
      const response = await http({ url: `/vehicles/franchise/${params.id}` });
      form.setValue('type', response.type);
      form.setValue('value', response.value);
      form.setValue('percent', response.percent);
      form.setValue('description', response.description);
      form.setValue('calculation', response.calculation);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  useEffect(() => {
    fetchFranchise();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (data) => {
    try {
      if (!data.calculation) {
        toast.error('Selezionare un tipo di Calcolo Franchigia');
        return;
      }
      if (data.calculation !== 'none' && data.value === undefined && data.percent === undefined) {
        toast.error('Inserire almeno un valore per la franchigia');
        return;
      }
      if (data.value !== undefined) {
        if (isNaN(data.value) || data.value < 0) {
          toast.error('Inserire un valore valido per la Valore franchigia');
          return;
        }
      }
      if (data.percent !== undefined) {
        if (isNaN(data.percent) || data.value < 0 || data.value > 100) {
          toast.error('Inserire un valore valido per la Percentuale franchigia');
          return;
        }
      }
      if (!params.id || params.id === 'crea') {
        data = {
          ...data,
          licenseType: 'movolab',
        };

        await http({
          method: 'POST',
          url: '/vehicles/franchise',
          form: data,
        });
        toast.success('Franchigia creata');
        history.push(goBackUrl || '/admin/movolab/franchigie');
      } else {
        await http({
          method: 'PUT',
          url: `/vehicles/franchise/${params.id}`,
          form: data,
        });
        toast.success('Franchigia aggiornata');
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const removeFranchise = async (e) => {
    e.preventDefault();
    try {
      await http({
        method: 'DELETE',
        url: `/vehicles/franchise/${params.id}`,
      });
      toast.success('Franchigia eliminata');
      history.goBack();
    } catch (err) {
      console.error(err);
      toast.error(err?.error || 'Errore');
    }
  };

  return (
    <AdminPage canAccess={MOVOLAB_ROLE_ADMIN}>
      <div className="p-4">
        <div className="mb-4">
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
          <div className="text-xl font-bold">
            {!params.id || params.id === 'crea'
              ? 'Creazione Franchigia'
              : 'Aggiornamento Franchigia'}{' '}
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)}>
            <fieldset disabled={form.formState.isSubmitting}>
              <div className="max-w-sm mt-4">
                <FormLabel>Nome Franchigia</FormLabel>
                <TextField
                  form={form}
                  name="type"
                  type="string"
                  placeholder="Nome Franchigia"
                  validation={{
                    required: { value: true, message: 'Nome Franchigia' },
                  }}
                />
                <FormLabel>Calcolo Franchigia</FormLabel>
                <SelectField
                  form={form}
                  name="calculation"
                  options={[
                    { label: 'Nessuna', value: 'none' },
                    { label: 'Minimale', value: 'min' },
                    { label: 'Massimale', value: 'max' },
                  ]}
                  placeholder="Calcolo Franchigia"
                />
                {form.watch('calculation') !== 'none' && (
                  <>
                    <FormLabel>Valore</FormLabel>
                    <TextField form={form} name="value" placeholder="Valore" />
                    <FormLabel>Percentuale</FormLabel>
                    <TextField form={form} name="percent" placeholder="Percentuale" />
                  </>
                )}
                <FormLabel>Descrizione</FormLabel>
                <TextField
                  form={form}
                  name="description"
                  placeholder="Descrizione"
                  validation={{
                    required: { value: true, message: 'Descrizione' },
                  }}
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-wrap -mx-3 mt-6 ">
                  <div className="w-full px-3">
                    {params.id === 'crea' ? (
                      <GrayButton>Crea Franchigia</GrayButton>
                    ) : (
                      <div className="flex space-x-2">
                        <GrayButton>Aggiorna Franchigia</GrayButton>
                        <GrayButton onClick={(e) => removeFranchise(e)}>
                          Rimuovi Franchigia
                        </GrayButton>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </fieldset>
          </form>
        </div>
      </div>
    </AdminPage>
  );
};

export default AdminFranchise;
