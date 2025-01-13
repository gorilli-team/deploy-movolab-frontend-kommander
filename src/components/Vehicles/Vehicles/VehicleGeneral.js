import React, { useState, useContext, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { SelectField } from '../../Form/SelectField';
import FormLabel from '../../UI/FormLabel';
import { TextField } from '../../Form/TextField';
import { TextareaField } from '../../Form/TextareaField';
import { http } from '../../../utils/Utils';
import toast from 'react-hot-toast';
import ImageUploader from '../../Form/ImageUploader';
import { UserContext } from '../../../store/UserContext';
import { useParams } from 'react-router-dom';
import Button from '../../UI/buttons/Button';
import useGroups from '../../../hooks/useGroups';
import { getVehicleGroup, getVehicleImageUrl, transmissionNames } from '../../../utils/Vehicles';
import { capitalizeString } from '../../../utils/Strings';

const VehicleGeneral = ({ vehicle, fetchVehicle, onSubmitted, vehicleImageUrl }) => {
  const form = useForm();
  const params = useParams();
  const userContext = useContext(UserContext);
  const [brands, setBrands] = useState([]);
  const [groupName, setGroupName] = useState('Gruppo'); // eslint-disable-line
  const [models, setModels] = useState([]);
  const [versions, setVersions] = useState([]);
  const [customGroup, setCustomGroup] = useState(false);
  const groups = useGroups();

  const userData = userContext.data;

  const setVersionData = async (versionId) => {
    const version = versions.filter((v) => v.value === versionId)[0];
    setGroupName(`${version?.group?.mnemonic} - ${version?.group?.description}`);

    const transmissionName = transmissionNames.find(t => t.value === version?.transmission);
    form.setValue('group', version?.group?._id);
    form.setValue('alimentazione', capitalizeString(version?.powerSupply));
    form.setValue('trasmissione', transmissionName?.label || '---');
    form.setValue('numberOfDoors', version?.numberOfDoors);
    form.setValue('numberOfSeats', version?.numberOfSeats);
  };

  const updateImageUrl = (url) => {
    form.setValue('vehicleImageUrl', url);
    // setVehicleImageUrl(url);
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

  const getModels = async (brand) => {
    try {
      if (brand) {
        const response = await http({ url: `/vehicles/model/byBrand/${brand}` });
        if (!response.model) return;
        setModels(
          response.model.map((model) => {
            return { value: model._id, label: model.modelName };
          }),
        );
        setVersions([]);
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const getVersions = async (model) => {
    try {
      const response = await http({ url: `/vehicles/version/byModel/${model}` });

      if (!response.versions) return;
      setVersions(
        response.versions.map((version) => {
          return {
            value: version._id,
            label: version.versionName,
            ...version
          };
        }),
      );
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const refillForm = async () => {
    if (vehicle) {
      await fetchBrands();
      await getModels(vehicle.brand._id);
      await getVersions(vehicle.model._id);
      await setVersionData(vehicle.version._id);

      const groupData = getVehicleGroup(vehicle);
      const imageUrlData = getVehicleImageUrl(vehicle);

      setCustomGroup(groupData?.custom);

      form.setValue('ownerName', vehicle.owner.ragioneSociale);
      form.setValue('plate', vehicle.plate);
      form.setValue('brand', vehicle.brand._id);
      form.setValue('model', vehicle.model._id);
      form.setValue('version', vehicle.version._id);
      form.setValue('group', groupData?.group?._id);
      form.setValue('km', vehicle.km);
      form.setValue('customGroup', groupData?.custom);
      form.setValue(
        'registrationDate',
        new Date(vehicle.registrationDate).toISOString().split('T')[0],
      );

      form.setValue('vehicleImageUrl', imageUrlData);

      form.setValue('color', vehicle.color);
      form.setValue('internalFeatures', vehicle.internalFeatures);
      form.setValue('optionals', vehicle.optionals);
      form.setValue('km', vehicle.km);
    }
  };

  useEffect(() => {
    fetchBrands();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    refillForm();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicle]);

  if (!userData) return null;
  const isMovolabLicense = userData.client?.license?.licenseOwner === 'movolab';

  const onSubmit = async (data) => {
    try {
      if (!customGroup) {
        data.group = null;
      }
      if (vehicleImageUrl !== undefined) {
        data.imageUrl = vehicleImageUrl;
      }

      data.creationStep = 1;

      if (vehicle && vehicle._id) {
        await http({
          method: 'PUT',
          url: `/vehicles/vehicle/${vehicle._id}`,
          form: data,
        });
        toast.success('Veicolo aggiornato');
        fetchVehicle(params.id);
        onSubmitted(vehicle);
      } else {
        // Creo un documento vuoto "Carta di circolazione"
        data.documents = [
          {
            label: 'insurance',
            name: 'Polizza RCA',
            description: 'Documento polizza assicurazione RCA',
          },
          {
            label: 'registration',
            name: 'Carta di circolazione',
            description: 'Caricare la carta di circolazione del veicolo',
          },
        ];

        const response = await http({
          method: 'POST',
          url: '/vehicles/vehicle',
          form: data,
        });
        toast.success('Veicolo aggiunto');
        onSubmitted(response);

        let userData = await userContext.getUserInfo();

        window.analytics.track({
          userId: userData?._id,
          event: 'Create Vehicle',
          properties: {
            plate: data?.plate,
            brand: brands.find((brand) => brand.value === data?.brand).value,
            model: models.find((model) => model.value === data?.model).value,
            version: versions.find((version) => version.value === data?.version).value,
            group: data?.group,
          },
        });
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const lastRent = false;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} id="saveVehicle">
      <fieldset disabled={form.formState.isSubmitting}>
        <div className="flex flex-wrap md:flex-nowrap gap-4">
          <div className="w-full sm:w-1/2 md:w-1/4">
            <TextField
              form={form}
              name="plate"
              placeholder="Targa"
              label="Targa"
              validation={{
                required: { value: true, message: 'Inserisci la targa' },
              }}
            />
            <SelectField
              form={form}
              name="brand"
              placeholder="Marca"
              label="Marca"
              options={brands}
              onChangeFunction={() => {
                getModels(form.getValues().brand);
              }}
              validation={{
                required: { value: true, message: 'Scegli la marca' },
              }}
            />
            <SelectField
              form={form}
              name="model"
              placeholder="Modello - Seleziona Marca"
              label="Modello"
              validation={{
                required: { value: true, message: 'Inserisci Modello' },
              }}
              onChangeFunction={() => getVersions(form.getValues().model)}
              onClick={(e) => {
                e.preventDefault();
                if (form.getValues().brand) {
                  getModels(form.getValues().brand);
                } else {
                  toast.error('Seleziona marca');
                }
              }}
              options={models}
            />
            <SelectField
              form={form}
              name="version"
              label="Versione"
              placeholder="Versione - Seleziona modello"
              validation={{
                required: { value: true, message: 'Inserisci Versione' },
              }}
              onChangeFunction={() => setVersionData(form.getValues().version)}
              options={versions}
            />
            <FormLabel>Gruppo</FormLabel>
            <div className="flex">
              <div className="flex-1">
                <SelectField
                  form={form}
                  name="group"
                  placeholder="Gruppo"
                  options={groups}
                  disabled={isMovolabLicense || !customGroup}
                />
              </div>
              {!isMovolabLicense ? (
                <div className="pl-3">
                  <Button
                    btnStyle="inFormStyle"
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setCustomGroup(true);
                    }}
                  >
                    Modifica
                  </Button>
                </div>
              ) : null}
            </div>
            <div className="flex gap-2">
              <TextField
                form={form}
                name="numberOfDoors"
                disabled={true}
                placeholder="Numero porte"
                label="Numero di porte"
              />
              <TextField
                form={form}
                name="numberOfSeats"
                disabled={true}
                placeholder="Numero posti"
                label="Numero di posti"
              />
            </div>
          </div>
          <div className="w-full sm:w-1/2 md:w-1/4">
            <TextField
              form={form}
              name="registrationDate"
              type="date"
              placeholder="Data immatricolazione"
              label="Data immatricolazione"
              validation={{
                required: { value: true, message: 'Data immatricolazione' },
              }}
            />
            <TextField form={form} name="color" placeholder="Colore" label="Colore" />
            <TextField
              form={form}
              name="alimentazione"
              disabled={true}
              label="Alimentazione"
              placeholder="Alimentazione"
            />
            <TextField
              form={form}
              name="trasmissione"
              label="Trasmissione"
              className="mb-0"
              disabled={true}
            />
            <div className="flex gap-2">
              <TextField
                form={form}
                name="km"
                placeholder="KM"
                label="KM percorsi" />
              <TextField
                form={form}
                name="fuelLevel"
                type="number"
                disabled={lastRent?.state === 'aperto'}
                placeholder="Livello Carburante (da 0 a 8)"
                label="Livello Carburante"
              />
            </div>
          </div>
          <div className="w-full sm:w-1/2 md:w-1/4">
            <FormLabel>Interni</FormLabel>
            <TextareaField form={form} name="internalFeatures" rows={4} placeholder="Interni" />
            <FormLabel>Optional</FormLabel>
            <TextareaField form={form} name="optionals" rows={7} placeholder="Optional" />
          </div>
          <div className="w-full sm:w-1/2 md:w-1/4">
            <FormLabel>Immagine veicolo</FormLabel>
            <ImageUploader
              imageUrl={vehicleImageUrl}
              updateImageUrl={updateImageUrl}
            ></ImageUploader>

            {/*
            <div className="w-60 mt-2">
              <Button>
                {' '}
                {params.id ? 'Aggiorna Veicolo' : 'Inserisci Veicolo'}
              </Button>
            </div>*/}
          </div>
        </div>
      </fieldset>
    </form>
  );
};

export default VehicleGeneral;
