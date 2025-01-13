import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import useGroups from '../../../../hooks/useGroups';
import { useParams, useHistory } from 'react-router-dom';
import AdminPage from '../../../../components/Admin/AdminPage';
import { TextField } from '../../../../components/Form/TextField';
import { SelectField } from '../../../../components/Form/SelectField';
import WhiteButton from '../../../../components/UI/buttons/WhiteButton';
import FormLabel from '../../../../components/UI/FormLabel';
import ImageUploader from '../../../../components/Form/ImageUploader';
import { MOVOLAB_ROLE_ADMIN, http } from '../../../../utils/Utils';
import { transmissionNames } from '../../../../utils/Vehicles';
import Button from '../../../../components/UI/buttons/Button';

const Version = () => {
  const form = useForm();
  const history = useHistory();
  const params = useParams();
  const mode = params.id ? 'edit' : 'create';

  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const groups = useGroups();
  const [showVersion, setShowVersion] = useState(false);
  const [versionImage, setVersionImage] = useState('');

  const fetchVersion = async () => {
    try {
      if (mode === 'edit') {
        const response = await http({ url: `/vehicles/version/${params.id}` });
        form.setValue('versionName', response.versionName);
        form.setValue('brandId', response.brandId._id);
        form.setValue('modelId', response.modelId._id);
        form.setValue('vehicleType', response.vehicleType);
        form.setValue('powerSupply', response.powerSupply);
        form.setValue('transmission', response.transmission);
        form.setValue('co2', response.co2);
        form.setValue('fuelCapacity', response.fuelCapacity);
        form.setValue('engineDisplacement', response.engineDisplacement);
        form.setValue('enginePower', response.enginePower);
        form.setValue('group', response.group?._id);
        form.setValue('imageUrl', response.imageUrl);
        form.setValue('numberOfSeats', response.numberOfSeats);
        form.setValue('numberOfDoors', response.numberOfDoors);
        setVersionImage(response.imageUrl);
      }
      setShowVersion(true);
    } catch (err) {
      console.error(err);
      history.push('/admin/veicoli/versioni');
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

  useEffect(() => {
    getModels(form.getValues().brandId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.getValues().brandId]);

  useEffect(() => {
    fetchVersion();
    fetchBrands();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getModels = async (brandId) => {
    try {
      if (!brandId) return;
      const response = await http({ url: `/vehicles/model/byBrand/${brandId}` });
      if (!response.model) return;
      setModels(
        response.model.map((model) => {
          return { value: model._id, label: model.modelName };
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
          url: '/vehicles/version',
          form: data,
        });
        toast.success('Versione aggiunta');
        history.goBack();
      } else if (mode === 'edit') {
        data.approved = true;
        await http({
          method: 'PUT',
          url: `/vehicles/version/${params.id}`,
          form: data,
        });
        toast.success('Versione aggiornata');
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const updateImageUrl = (url) => {
    form.setValue('imageUrl', url);
    setVersionImage(url);
  };

  const gn = (from, to) => Array.from({ length: to - from + 1 }, (_, index) => from + index);

  return (
    <AdminPage canAccess={MOVOLAB_ROLE_ADMIN}>
      <div className="p-4">
        <div className="mb-4">
          <WhiteButton onClick={() => history.goBack()}>Indietro</WhiteButton>
        </div>

        <div className="mb-4">
          {showVersion ? (
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <fieldset disabled={form.formState.isSubmitting}>
                <div className="flex">
                  <div className="grid grid-cols-1 gap-2 md:w-1/3 sm:w-full pr-3">
                    <div className="max-w-sm">
                      <FormLabel>Nome Versione</FormLabel>
                      <TextField
                        form={form}
                        name="versionName"
                        type="string"
                        placeholder="Nome Versione"
                        validation={{
                          required: { value: true, message: 'Nome Versione' },
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
                        onChangeFunction={(e) => {
                          getModels(form.getValues().brandId);
                        }}
                        options={brands}
                      />
                      <FormLabel>Modello</FormLabel>
                      <SelectField
                        form={form}
                        name="modelId"
                        placeholder="Modello"
                        validation={{
                          required: { value: true, message: 'Inserisci Modello' },
                        }}
                        options={models}
                      />
                      <FormLabel>Immagine</FormLabel>
                      <ImageUploader
                        imageUrl={versionImage}
                        updateImageUrl={updateImageUrl}
                      ></ImageUploader>
                      <FormLabel>Tipo Veicolo</FormLabel>
                      <SelectField
                        form={form}
                        name="vehicleType"
                        placeholder="Tipo Veicolo"
                        validation={{
                          required: { value: true, message: 'Inserisci Tipo Veicolo' },
                        }}
                        options={[
                          { value: 'citycar', label: 'Citycar' },
                          { value: 'berlina', label: 'Berlina' },
                          { value: 'station_wagon', label: 'Station wagon' },
                          { value: 'coupe', label: 'Coupè' },
                          { value: 'monovolume', label: 'Monovolume' },
                          { value: 'suv_crossover', label: 'SUV / Crossover' },
                          { value: 'veicoli_commerciali', label: 'Veicoli commerciali' },
                          { value: '2ruote', label: '2 ruote' },
                          { value: 'microcar', label: 'Microcar' },
                          { value: 'auto_depoca', label: "Auto d'epoca" },
                          { value: 'supercar', label: 'Supercar' },
                          { value: 'altro', label: 'Altro' },
                        ]}
                      />
                      <FormLabel>Alimentazione</FormLabel>
                      <SelectField
                        form={form}
                        name="powerSupply"
                        placeholder="Alimentazione"
                        validation={{
                          required: { value: true, message: 'Inserisci Alimentazione' },
                        }}
                        options={[
                          { value: 'benzina', label: 'Benzina' },
                          { value: 'diesel', label: 'Diesel' },
                          { value: 'gpl', label: 'GPL' },
                          { value: 'elettrico', label: 'Elettrico' },
                          { value: 'ibrida', label: 'Ibrida' },
                          { value: 'metano', label: 'Metano' },
                          { value: 'ibrido_plug-in', label: 'Ibrida Plug-in' },
                          { value: 'mild_hybrid', label: 'Mild Hybrid' },
                          { value: 'altro', label: 'Altro' },
                        ]}
                      />
                      <FormLabel>Capacità (lt/kw)</FormLabel>
                      <TextField
                        form={form}
                        name="fuelCapacity"
                        placeholder="Capacità"
                        type="number"
                        validation={{ min: 0, message: 'Valore minimo: 0' }}
                      />
                      <FormLabel>Trasmissione</FormLabel>
                      <SelectField
                        form={form}
                        name="transmission"
                        placeholder="Trasmissione"
                        validation={{
                          required: { value: true, message: 'Inserisci Trasmissione' },
                        }}
                        options={transmissionNames}
                      />
                      <div className="mt-6">
                        <Button>{mode === 'edit' ? 'Aggiorna Versione' : 'Crea Versione'}</Button>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-2 md:w-1/3 sm:w-full pl-3">
                    <div className="max-w-sm">
                      <FormLabel>Cilindrata</FormLabel>
                      <TextField
                        form={form}
                        name="engineDisplacement"
                        type="number"
                        placeholder="Cilindrata"
                      />
                      <FormLabel>Potenza</FormLabel>
                      <TextField
                        form={form}
                        name="enginePower"
                        type="number"
                        placeholder="Potenza"
                      />
                      <FormLabel>Co2</FormLabel>
                      <TextField form={form} name="co2" placeholder="C02" />
                      <FormLabel>Gruppo</FormLabel>
                      <SelectField form={form} name="group" placeholder="Gruppo" options={groups} />

                      <FormLabel>Numero di posti</FormLabel>
                      <SelectField
                        form={form}
                        name="numberOfSeats"
                        placeholder="Posti"
                        options={gn(1, 20).map((n) => ({ value: n, label: n }))}
                      />

                      <FormLabel>Numero di porte</FormLabel>
                      <SelectField
                        form={form}
                        name="numberOfDoors"
                        placeholder="Porte"
                        options={gn(1, 8).map((n) => ({ value: n, label: n }))}
                      />
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

export default Version;
