import React from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useHistory, useParams } from 'react-router-dom';

import { TextField } from '../../Form/TextField';
import { SelectField } from '../../Form/SelectField';
import { CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR, http } from '../../../utils/Utils';
import FormLabel from '../../UI/FormLabel';
import WhiteBox from '../../UI/WhiteBox';
import Button from '../../UI/buttons/Button';

const ClientProfileCreation = ({ setShowAddClientProfile }) => {
  const form = useForm();

  const params = useParams();
  const history = useHistory();

  const onSubmit = async (data) => {
    try {
      const clientData = {
        ...data,
        client: params.id,
      };

      await http({
        method: 'POST',
        url: '/clientProfile/create',
        form: clientData,
      });
      toast.success('Profilo Cliente aggiunto');
      setShowAddClientProfile(false);
      history.push(`/admin/clienti/anagrafica/${params.id}?tab=profili`);
    } catch (err) {
      console.error(err);
      toast.error('Errore durante la creazione del profilo cliente');
    }
  };

  return (
    <>
      <WhiteBox className="mt-0 p-4">
        <div className="flex gap-4">
          <div className="flex-1">
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
                  />
                  <FormLabel>Email</FormLabel>
                  <TextField form={form} name="email" type="string" placeholder="Email" />

                  <FormLabel>Ruolo</FormLabel>
                  <SelectField
                    name="role"
                    form={form}
                    options={[
                      { value: CLIENT_ROLE_ADMIN, label: 'Amministratore' },
                      { value: CLIENT_ROLE_OPERATOR, label: 'Operatore' },
                    ]}
                    placeholder="Ruolo"
                  />
                  <Button type="submit" className="mt-4">
                    Salva
                  </Button>
                </div>
              </fieldset>
            </form>
          </div>
        </div>
      </WhiteBox>
    </>
  );
};

export default ClientProfileCreation;
