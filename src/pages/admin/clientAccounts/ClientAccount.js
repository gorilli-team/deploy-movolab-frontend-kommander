import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useHistory, useLocation, useParams } from 'react-router-dom';

import { TextField } from '../../../components/Form/TextField';
import { http } from '../../../utils/Utils';
import FormLabel from '../../../components/UI/FormLabel';
import AdminPage from '../../../components/Admin/AdminPage';

import GrayButton from '../../../components/UI/buttons/GrayButton';
import WhiteButton from '../../../components/UI/buttons/WhiteButton';
import LightGrayButton from '../../../components/UI/buttons/LightGrayButton';
import ElementLabel from '../../../components/UI/ElementLabel';

const ClientAccount = () => {
  const form = useForm();
  const params = useParams();
  const history = useHistory();
  const search = useLocation().search;
  const section = new URLSearchParams(search).get('section');

  const [clientAccount, setClientAccount] = useState({});
  const [fieldToUpdate, setFieldToUpdate] = useState(section || 'general');
  const mode = params.id ? 'edit' : 'create';

  useEffect(() => {
    fetchClientAccount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const fetchClientAccount = async () => {
    try {
      if (mode === 'edit') {
        const response = await http({ url: `/clientProfile/${params.id}` });
        setClientAccount(response);
        form.setValue('fullname', response.fullname);
        form.setValue('email', response.email);
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const onSubmit = async (data) => {
    try {
      if (mode === 'create') {
        await http({
          method: 'POST',
          url: '/clientProfile/create',
          form: data,
        });
        toast.success('Profilo Cliente aggiunto');
        history.goBack();
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
    <AdminPage>
      <div className="p-4">
        <div className="mb-4 space-x-2 p-2">
          <WhiteButton onClick={() => history.goBack()}>Indietro</WhiteButton>

          {mode === 'edit' ? (
            <>
              <LightGrayButton
                selected={fieldToUpdate === 'general'}
                onClick={() => setFieldToUpdate('general')}
              >
                Generale
              </LightGrayButton>
            </>
          ) : null}
        </div>

        <div className="flex">
          <div className="mb-4 p-2">
            <h1 className="text-2xl font-bold mb-2">
              {mode === 'create' ? 'Aggiungi' : 'Aggiorna'} Profilo Cliente
            </h1>
            <form onSubmit={form.handleSubmit(onSubmit)}>
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
                  />
                  <FormLabel>Email</FormLabel>
                  <TextField form={form} name="email" type="string" placeholder="Email" />

                  {mode === 'edit' && (
                    <>
                      <FormLabel>Stato</FormLabel>
                      <div className="mt-1">
                        {clientAccount?.enabled ? (
                          <ElementLabel bgColor="bg-green-600">ABILITATO</ElementLabel>
                        ) : (
                          <ElementLabel bgColor="bg-red-600">DISABILITATO</ElementLabel>
                        )}
                      </div>
                    </>
                  )}

                  <div className="mt-6">
                    {mode === 'edit' ? (
                      <div className="flex space-x-2">
                        <GrayButton>Aggiorna</GrayButton>
                        <GrayButton
                          onClick={(e) => {
                            e.preventDefault();
                            disableClientAccount();
                          }}
                        >
                          {clientAccount.enabled ? 'Disabilita' : 'Abilita'}
                        </GrayButton>
                      </div>
                    ) : (
                      <GrayButton>Aggiungi</GrayButton>
                    )}
                  </div>
                </div>
              </fieldset>
            </form>
          </div>
        </div>
      </div>
    </AdminPage>
  );
};

export default ClientAccount;
