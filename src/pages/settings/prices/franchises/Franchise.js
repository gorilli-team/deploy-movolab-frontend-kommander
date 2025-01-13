import React, { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useHistory, useParams } from 'react-router-dom';
import SettingsPage from '../../../../components/Settings/SettingsPage';
import { TextField } from '../../../../components/Form/TextField';
import FormLabel from '../../../../components/UI/FormLabel';
import { CLIENT_ROLE_ADMIN, http } from '../../../../utils/Utils';
import { UserContext } from '../../../../store/UserContext';
import ElementLabel from '../../../../components/UI/ElementLabel';
import WhiteBox from '../../../../components/UI/WhiteBox';
import CardsHeader from '../../../../components/UI/CardsHeader';

const Franchise = () => {
  const form = useForm();
  const history = useHistory();
  const params = useParams();
  const [licenseType, setLicenseType] = useState(null);
  const mode = params.id ? 'edit' : 'create';

  const { data: currentClient } = useContext(UserContext);
  const license = currentClient?.client?.license?.licenseOwner;

  const fetchFranchise = async () => {
    try {
      if (!params.id || params.id === 'crea') return;
      const response = await http({ url: `/vehicles/franchise/${params.id}` });
      setLicenseType(response.licenseType);
      form.setValue('type', response.type);
      form.setValue('value', response.value);
      form.setValue('percent', response.percent);
      form.setValue('description', response.description);
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
      if (!params.id || params.id === 'crea') {
        await http({
          method: 'POST',
          url: '/vehicles/franchise',
          form: data,
        });
        toast.success('Franchigia aggiunta');
        return history.goBack();
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

  return (
    <SettingsPage canAccess={[CLIENT_ROLE_ADMIN]} hasBox={false}>
      <CardsHeader
        title={mode === 'edit' ? 'Dettagli franchigia' : 'Nuova franchigia'}
        buttons={[
          {
            btnStyle: 'lightSlateTransparent',
            children: '« Indietro',
            onClick: () => {
              history.goBack();
            },
          },
          // {
          //   btnStyle: 'lightSlateTransparent',
          //   children: mode === 'Rimuovi franchigia',
          //   onClick: (e) => removeFranchiseForm(e),
          //   form: 'franchiseForm',
          //   hiddenIf: license === 'movolab' || mode !== 'edit',
          // },
          {
            children: mode === 'edit' ? 'Aggiorna franchigia' : 'Crea franchigia',
            form: 'franchiseForm',
            hiddenIf: !(license !== 'movolab' && licenseType !== 'movolab'),
          },
        ]}
      />

      <WhiteBox className="mt-0 p-4">
        <form onSubmit={form.handleSubmit(onSubmit)} id="franchiseForm">
          <fieldset disabled={form.formState.isSubmitting}>
            <div className="flex space-x-2 my-3">
              <FormLabel className="mt-2">Licenza</FormLabel>
              <p className="text-left font-semibold text-gray-600 w-20">
                {licenseType === 'movolab' ? (
                  <ElementLabel bgColor="bg-blue-500">Movolab</ElementLabel>
                ) : (
                  <ElementLabel bgColor="bg-gray-500">Personale</ElementLabel>
                )}
              </p>
            </div>
            <div className="max-w-sm">
              <FormLabel>Nome Franchigia</FormLabel>
              <TextField
                form={form}
                name="type"
                type="string"
                placeholder="Nome Franchigia"
                disabled={licenseType === 'movolab'}
                validation={{
                  required: { value: true, message: 'Nome Franchigia' },
                }}
              />{' '}
              <FormLabel>Valore</FormLabel>
              <TextField
                form={form}
                name="value"
                placeholder="Valore"
                disabled={licenseType === 'movolab'}
              />
              <FormLabel>Percentuale</FormLabel>
              <TextField
                form={form}
                name="percent"
                placeholder="Percentuale"
                disabled={licenseType === 'movolab'}
              />
              <FormLabel>Descrizione</FormLabel>
              <TextField
                form={form}
                name="description"
                placeholder="Descrizione"
                disabled={licenseType === 'movolab'}
                validation={{
                  required: { value: true, message: 'Descrizione' },
                }}
              />
            </div>
          </fieldset>
        </form>
      </WhiteBox>
    </SettingsPage>
  );
};

export default Franchise;
