import React, { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useParams, useHistory } from 'react-router-dom';
import SettingsPage from '../../../../components/Settings/SettingsPage';
import { TextField } from '../../../../components/Form/TextField';
import FormLabel from '../../../../components/UI/FormLabel';
import { CLIENT_ROLE_ADMIN, http } from '../../../../utils/Utils';
import { UserContext } from '../../../../store/UserContext';
import ImageUploader from '../../../../components/Form/ImageUploader';
import CardsHeader from '../../../../components/UI/CardsHeader';
import LoadingSpinner from '../../../../assets/icons/LoadingSpinner';
import WhiteBox from '../../../../components/UI/WhiteBox';

const Brand = () => {
  const form = useForm();
  const params = useParams();
  const history = useHistory();
  const mode = params.id ? 'edit' : 'create';
  const [showBrand, setShowBrand] = useState(false);
  const [brandImage, setBrandImage] = useState('');

  const userContext = useContext(UserContext);
  let userData = userContext.data || {};

  const fetchBrand = async () => {
    try {
      if (mode === 'edit') {
        const response = await http({ url: `/vehicles/brand/${params.id}` });

        form.setValue('brandName', response.brandName);
        form.setValue('brandImage', response.brandImage);
        setBrandImage(response.brandImage);
      }
      setShowBrand(true);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  useEffect(() => {
    fetchBrand();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (data) => {
    try {
      if (mode === 'create') {
        data.createdByClient = userData?.client?._id;
        data.approved = false;

        await http({
          method: 'POST',
          url: '/vehicles/brand',
          form: data,
        });
        toast.success('Marca aggiunta');
      } else if (mode === 'edit') {
        if (!data.createdByClient || data.createdByClient !== userData?.client?._id) {
          toast.error('Non puoi modificare questa marca di default');
          return;
        }

        await http({
          method: 'PUT',
          url: `/vehicles/brand/${params.id}`,
          form: data,
        });
        toast.success('Marca aggiornata');
      }
    } catch (err) {
      toast.error('Non puoi aggiungere questa marca. Controlla che sia già presente su Movolab.');
    }
  };

  const updateImageUrl = (url) => {
    setBrandImage(url);
    form.setValue('brandImage', url);
  };

  return (
    <SettingsPage canAccess={CLIENT_ROLE_ADMIN} hasBox={false}>
      <CardsHeader
        title={`${mode === 'edit' ? 'Modifica' : 'Aggiungi'} marca`}
        buttons={[
          {
            btnStyle: 'lightSlateTransparent',
            children: '« Indietro',
            onClick: () => history.goBack(),
          },
          {
            children: 'Salva marca',
            form: 'brandForm',
          },
        ]}
      />

      <WhiteBox className="mt-0 p-4">
        {showBrand ? (
          <form onSubmit={form.handleSubmit(onSubmit)} id="brandForm">
            <fieldset disabled={form.formState.isSubmitting}>
              <div className="max-w-sm">
                <FormLabel>Marca</FormLabel>
                <TextField
                  form={form}
                  name="brandName"
                  type="string"
                  placeholder="Nome Marca"
                  validation={{
                    required: { value: true, message: 'Nome Marca' },
                  }}
                />
                <FormLabel>Immagine Logo</FormLabel>
                <ImageUploader
                  imageUrl={brandImage}
                  updateImageUrl={updateImageUrl}
                ></ImageUploader>
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

export default Brand;
