import React, { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useHistory, useParams } from 'react-router-dom';
import SettingsPage from '../../../../components/Settings/SettingsPage';
import { UserContext } from '../../../../store/UserContext';
import { TextField } from '../../../../components/Form/TextField';
import { SelectField } from '../../../../components/Form/SelectField';
import FormLabel from '../../../../components/UI/FormLabel';
import { CLIENT_ROLE_ADMIN, http } from '../../../../utils/Utils';
import CardsHeader from '../../../../components/UI/CardsHeader';
import WhiteBox from '../../../../components/UI/WhiteBox';
import LoadingSpinner from '../../../../assets/icons/LoadingSpinner';

const Model = () => {
  const form = useForm();
  const history = useHistory();
  const params = useParams();
  const [brands, setBrands] = useState([]);
  const [model, setModel] = useState({});
  const mode = params.id ? 'edit' : 'create';

  const userContext = useContext(UserContext);
  let userData = userContext.data || {};

  useEffect(() => {
    fetchModel();
    fetchBrands();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchModel = async () => {
    try {
      if (mode === 'edit') {
        const response = await http({ url: `/vehicles/model/${params.id}` });
        form.setValue('modelName', response.modelName);
        form.setValue('brandId', response.brandId);
        setModel(response);
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await http({ url: '/vehicles/brand' });
      setBrands(
        response.brands.map((brand) => {
          return { value: brand._id, label: brand.brandName };
        }),
      );
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const onSubmit = async (data) => {
    try {
      if (mode === 'create') {
        data.createdByClient = userData?.client?._id;
        data.approved = false;

        await http({
          method: 'POST',
          url: '/vehicles/model',
          form: data,
        });
        toast.success('Modello aggiunta');
      } else if (mode === 'edit') {
        if (model.createdByClient !== userData?.client?._id) {
          toast.error('Non puoi modificare questo modello. Non avendolo creato tu.');
          return;
        }
        await http({
          method: 'PUT',
          url: `/vehicles/model/${params.id}`,
          form: data,
        });
        toast.success('Modello aggiornato');
      }
    } catch (err) {
      toast.error('Non puoi aggiungere questo modello. Controlla che sia già presente su Movolab.');
    }
  };

  return (
    <SettingsPage canAccess={CLIENT_ROLE_ADMIN} hasBox={false}>
      <CardsHeader
        title={`${mode === 'edit' ? 'Modifica' : 'Aggiungi'} modello`}
        buttons={[
          {
            btnStyle: 'lightSlateTransparent',
            children: '« Indietro',
            onClick: () => history.goBack(),
          },
          {
            children: 'Salva modello',
            form: 'modelForm',
          },
        ]}
      />

      <WhiteBox className="mt-0 p-4">
        {brands ? (
          <form onSubmit={form.handleSubmit(onSubmit)} id="modelForm">
            <fieldset disabled={form.formState.isSubmitting}>
              <div className="max-w-sm">
                <FormLabel>Nome Modello</FormLabel>
                <TextField
                  form={form}
                  name="modelName"
                  type="string"
                  placeholder="Nome Modello"
                  validation={{
                    required: { value: true, message: 'Inserisci Nome Modello' },
                  }}
                />
                <FormLabel>Marca</FormLabel>
                <SelectField
                  form={form}
                  name="brandId"
                  placeholder="Marca"
                  validation={{
                    required: { value: true, message: 'Inserisci Marca' },
                  }}
                  options={brands}
                />
              </div>
            </fieldset>
          </form>
        ) : (
          <LoadingSpinner addText />
        )}
      </WhiteBox>
    </SettingsPage>
  );
};

export default Model;
