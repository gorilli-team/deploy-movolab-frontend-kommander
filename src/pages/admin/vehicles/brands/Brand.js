import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useParams, useHistory } from 'react-router-dom';
import AdminPage from '../../../../components/Admin/AdminPage';
import WhiteButton from '../../../../components/UI/buttons/WhiteButton';
import { TextField } from '../../../../components/Form/TextField';
import FormLabel from '../../../../components/UI/FormLabel';
import { MOVOLAB_ROLE_ADMIN, http } from '../../../../utils/Utils';
import ImageUploader from '../../../../components/Form/ImageUploader';
import GrayButton from '../../../../components/UI/buttons/GrayButton';

const Brand = () => {
  const form = useForm();
  const params = useParams();
  const history = useHistory();
  const mode = params.id ? 'edit' : 'create';
  const [showBrand, setShowBrand] = useState(false);
  const [brandImage, setBrandImage] = useState('');

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
        await http({
          method: 'POST',
          url: '/vehicles/brand',
          form: data,
        });
        toast.success('Marca aggiunta');
      } else if (mode === 'edit') {
        await http({
          method: 'PUT',
          url: `/vehicles/brand/${params.id}`,
          form: data,
        });
        toast.success('Marca aggiornata');
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const updateImageUrl = (url) => {
    setBrandImage(url);
    form.setValue('brandImage', url);
  };

  return (
    <AdminPage canAccess={MOVOLAB_ROLE_ADMIN}>
      <div className="p-4">
        <div className="mb-4">
          <WhiteButton onClick={() => history.goBack()}>Indietro</WhiteButton>
        </div>

        <div className="mb-4">
          {showBrand ? (
            <form onSubmit={form.handleSubmit(onSubmit)}>
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
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex flex-wrap -mx-3 mt-6 ">
                    <div className="w-60 px-3">
                      <GrayButton> {mode === 'edit' ? 'Aggiorna Marca' : 'Crea Marca'}</GrayButton>
                    </div>
                  </div>
                </div>
              </fieldset>
            </form>
          ) : (
            'Loading...'
          )}
        </div>
      </div>
    </AdminPage>
  );
};

export default Brand;
