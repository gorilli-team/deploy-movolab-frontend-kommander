import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useHistory, useParams } from 'react-router-dom';
import AdminPage from '../../../../components/Admin/AdminPage';
import { TextField } from '../../../../components/Form/TextField';
import { SelectField } from '../../../../components/Form/SelectField';
import FormLabel from '../../../../components/UI/FormLabel';
import { MOVOLAB_ROLE_ADMIN, http } from '../../../../utils/Utils';
import GrayButton from '../../../../components/UI/buttons/GrayButton';
import WhiteButton from '../../../../components/UI/buttons/WhiteButton';

const Model = () => {
  const form = useForm();
  const history = useHistory();
  const params = useParams();
  const [brands, setBrands] = useState([]);
  const mode = params.id ? 'edit' : 'create';

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
        await http({
          method: 'POST',
          url: '/vehicles/model',
          form: data,
        });
        toast.success('Modello aggiunta');
      } else if (mode === 'edit') {
        await http({
          method: 'PUT',
          url: `/vehicles/model/${params.id}`,
          form: data,
        });
        toast.success('Modello aggiornato');
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  return (
    <AdminPage canAccess={MOVOLAB_ROLE_ADMIN}>
      <div className="p-4">
        <div className="mb-4">
          <WhiteButton onClick={() => history.goBack()}>Indietro</WhiteButton>
        </div>

        <div className="mb-4">
          <form onSubmit={form.handleSubmit(onSubmit)}>
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
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-wrap -mx-3 mt-6 ">
                  <div className="w-60 px-3">
                    <GrayButton>{mode === 'edit' ? 'Aggiorna Modello' : 'Crea Modello'}</GrayButton>
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

export default Model;
