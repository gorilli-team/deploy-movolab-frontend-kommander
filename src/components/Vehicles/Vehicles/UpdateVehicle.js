import React, { useState, useEffect, useContext } from 'react';
import Button from '../../UI/buttons/Button';
import { useForm } from 'react-hook-form';
import { TextField } from '../../Form/TextField';
import { TextareaField } from '../../Form/TextareaField';
import { SelectField } from '../../Form/SelectField';
import useGroups from '../../../hooks/useGroups';
import { http } from '../../../utils/Utils';
import toast from 'react-hot-toast';
import { useParams, useLocation, useHistory } from 'react-router-dom';
import UpdateEventsTable from '../../UpdateEvents/UpdateEventsTable';
import ActivitiesTable from './Activities/ActivitiesTable';

import Management from './Update/Management';
import PurchaseDetails from './Update/PurchaseDetails';
import Contract from './Update/Contract';
import Damages from '../../Damages/Damages';
import Documents from '../../Documents/Documents';
import Notes from '../../Notes/Notes';
import FormLabel from '../../UI/FormLabel';
import { getVehicleGroup, getVehicleImageUrl, transmissionNames } from '../../../utils/Vehicles';
import { capitalizeString } from '../../../utils/Strings';
import ImageUploader from '../../Form/ImageUploader';
import CardsHeader from '../../UI/CardsHeader';
import WhiteBox from '../../UI/WhiteBox';
import TableHeaderTab from '../../UI/TableHeaderTab';
import VehicleBoxesHeader from './VehicleBoxesHeader';
import { UserContext } from '../../../store/UserContext';

const UpdateVehicle = ({ setShowUpdateVehicle }) => {
  const form = useForm();
  const params = useParams();
  const search = useLocation().search;
  const history = useHistory();

  const section = new URLSearchParams(search).get('sezione');
  const { data: userData } = useContext(UserContext);

  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [versions, setVersions] = useState([]);
  const groups = useGroups();
  const [fieldToUpdate, setFieldToUpdate] = useState(section || 'datiVeicolo');
  const [vehicle, setVehicle] = useState({});
  const [customGroup, setCustomGroup] = useState(false);
  const [vehicleImageUrl, setVehicleImageUrl] = useState('');
  const [showVehicle, setShowVehicle] = useState(false);
  const [lastRent, setLastRent] = useState({});

  useEffect(() => {
    if (params.id) {
      fetchVehicle(params.id);
      getLastRent(params.id);
    } else {
      setShowVehicle(true);
    }
    fetchBrands();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchVehicle = async (id) => {
    try {
      const response = await http({ url: `/vehicles/vehicle/${id}` });
      setVehicle(response);
      await getModels(response?.brand?._id);

      await getVersions(response.model._id);
      const groupData = await getVehicleGroup(response);
      const imageUrlData = await getVehicleImageUrl(response);
      setCustomGroup(groupData?.custom);
      const transmissionName = transmissionNames.find(t => t.value === response.version?.transmission);
      form.setValue('ownerName', response.owner.ragioneSociale);
      form.setValue('plate', response.plate);
      form.setValue('brand', response.brand?._id);
      form.setValue('model', response.model?._id);
      form.setValue('version', response.version?._id);
      form.setValue('group', groupData?.group?._id);
      form.setValue('customGroup', groupData?.custom);
      form.setValue('alimentazione', capitalizeString(response.version?.powerSupply));
      form.setValue('trasmissione', transmissionName?.label || '---');
      form.setValue('fuelLevel', response.fuelLevel);
      form.setValue('km', response.km);
      form.setValue(
        'registrationDate',
        new Date(response.registrationDate).toISOString().split('T')[0],
      );

      form.setValue('numberOfDoors', response.version?.numberOfDoors);
      form.setValue('numberOfSeats', response.version?.numberOfSeats);

      form.setValue('vehicleImageUrl', imageUrlData.imageUrl);
      setVehicleImageUrl(imageUrlData.imageUrl);

      form.setValue('color', response.color);
      form.setValue('internalFeatures', response.internalFeatures);
      form.setValue('optionals', response.optionals);
      setShowVehicle(true);
    } catch (err) {
      console.error('Fetch error: ', err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  useEffect(() => {
    getLastRent(vehicle._id);
  }, [vehicle]);

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
          return { value: version._id, label: version.versionName };
        }),
      );
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

  const updateImageUrl = (url) => {
    form.setValue('vehicleImageUrl', url);
    setVehicleImageUrl(url);
  };

  const getLastRent = async (vehicleId) => {
    try {
      if (vehicleId === undefined) return;
      const response = await http({ url: `/rents/vehicle/${vehicleId}/lastrent` });
      setLastRent(response);
    } catch (error) {
      console.error(error);
    }
  };

  const onSubmit = async (data) => {
    try {
      if (!customGroup) {
        data.group = null;
      }
      if (vehicleImageUrl !== undefined) {
        data.imageUrl = vehicleImageUrl;
      }
      if (params.id) {
        await http({
          method: 'PUT',
          url: `/vehicles/vehicle/${params.id}`,
          form: data,
        });
        toast.success('Veicolo aggiornato');
        fetchVehicle(params.id);
      } else {
        const response = await http({
          method: 'POST',
          url: '/vehicles/vehicle',
          form: data,
        });
        toast.success('Veicolo aggiunto');
        setVehicle(response);
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const enableVehicle = async (value, message, fleetOffReason = null) => {
    try {
      if (!vehicle.rentalLocation && value) {
        toast.error(
          'Il veicolo non ha un punto nolo associato. Impossibile abilitarlo. Vai su Aggiorna > Punto Nolo.',
        );
        return;
      }

      await http({
        method: 'POST',
        url: value
          ? `/vehicles/vehicle/enable/${params.id}`
          : `/vehicles/vehicle/disable/${params.id}`,
        form: {
          declarations: {
            enabledDeclarationMessage: message,
          },
          fleetOffReason,
        },
      });
      toast.success('Veicolo aggiornato');
      fetchVehicle(params.id);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  // Finto alert per le tab auto-aggiornanti
  const onSubmitAlert = () => {
    toast.success('Veicolo aggiornato');
  };

  if (!userData) return null;
  const isMovolabLicense = userData.client?.license?.licenseOwner === 'movolab';

  return (
    <>
      <CardsHeader
        title="Modifica veicolo"
        buttons={[
          {
            btnStyle: 'lightSlateTransparent',
            children: '« Indietro',
            onClick: () => {
              history.goBack();
            },
          },
          {
            children: params.id ? 'Aggiorna Veicolo' : 'Inserisci Veicolo',
            form: 'saveVehicle',
            type: 'submit',
          },
        ]}
      />
      <WhiteBox className="mt-0 mx-6">
        <VehicleBoxesHeader
          viewMode={false}
          vehicle={vehicle}
          enableVehicle={enableVehicle}
          className="p-4"
        />

        <TableHeaderTab
          buttons={[
            {
              label: 'Dati veicolo',
              function: () => {
                setFieldToUpdate('datiVeicolo');
              },
              selected: fieldToUpdate === 'datiVeicolo',
            },
            {
              label: 'Dettagli acquisto',
              function: () => {
                setFieldToUpdate('dettagliAcquisto');
              },
              selected: fieldToUpdate === 'dettagliAcquisto',
            },
            {
              label: 'Servizi',
              function: () => {
                setFieldToUpdate('contratto');
              },
              selected: fieldToUpdate === 'contratto',
            },
            {
              label: 'Punto nolo',
              function: () => {
                setFieldToUpdate('puntoNolo');
              },
              selected: fieldToUpdate === 'puntoNolo',
            },
            {
              label: 'Danni',
              function: () => {
                setFieldToUpdate('danni');
              },
              selected: fieldToUpdate === 'danni',
            },
            {
              label: 'Documenti',
              function: () => {
                setFieldToUpdate('documenti');
              },
              selected: fieldToUpdate === 'documenti',
            },
            {
              label: 'Note',
              function: () => {
                setFieldToUpdate('note');
              },
              selected: fieldToUpdate === 'note',
            },
            {
              label: 'Attività',
              function: () => {
                setFieldToUpdate('attivita');
              },
              selected: fieldToUpdate === 'attivita',
            },
            {
              label: 'Aggiornamenti',
              function: () => {
                setFieldToUpdate('aggiornamenti');
              },
              selected: fieldToUpdate === 'aggiornamenti',
            },
          ]}
        />

        <div className="p-4 bg-slate-200 border-4 rounded-b-2xl border-white">
          {showVehicle && (
            <div>
              {fieldToUpdate === 'datiVeicolo' && (
                <form onSubmit={form.handleSubmit(onSubmit)} id="saveVehicle">
                  <fieldset disabled={form.formState.isSubmitting}>
                    <div className="flex gap-4 flex-wrap md:flex-nowrap">
                      <div className="w-full md:w-1/4">
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
                          placeholder="Versione - Seleziona modello"
                          label="Versione"
                          validation={{
                            required: { value: true, message: 'Inserisci Versione' },
                          }}
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
                      <div className="w-full md:w-1/4">
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
                          placeholder="Alimentazione"
                          label="Alimentazione"
                          className="mb-0"
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
                        <TextareaField
                          form={form}
                          name="internalFeatures"
                          rows={4}
                          placeholder="Interni"
                          label="Interni"
                        />
                        <TextareaField
                          form={form}
                          name="optionals"
                          rows={7}
                          placeholder="Optional"
                          label="Optional"
                        />
                      </div>
                      <div className="w-full sm:w-1/2 md:w-1/4">
                        <FormLabel>Immagine veicolo</FormLabel>
                        <ImageUploader
                          imageUrl={vehicleImageUrl}
                          updateImageUrl={updateImageUrl}
                        ></ImageUploader>
                      </div>
                    </div>
                  </fieldset>
                </form>
              )}
              {fieldToUpdate === 'dettagliAcquisto' && (
                <PurchaseDetails vehicle={vehicle} fetchVehicle={fetchVehicle} />
              )}
              {fieldToUpdate === 'contratto' && (
                <Contract vehicle={vehicle} fetchVehicle={fetchVehicle} />
              )}
              {fieldToUpdate === 'puntoNolo' && (
                <Management vehicle={vehicle} fetchVehicle={fetchVehicle} />
              )}
              {fieldToUpdate === 'danni' && (
                <>
                  <Damages vehicle={vehicle} expanded={true} noCollapsible={true} />
                  <form onSubmit={form.handleSubmit(onSubmitAlert)} id="saveVehicle" />
                </>
              )}
              {fieldToUpdate === 'documenti' && (
                <>
                  <Documents vehicle={vehicle} expanded={true} noCollapsible={true} />
                  <form onSubmit={form.handleSubmit(onSubmitAlert)} id="saveVehicle" />
                </>
              )}
              {fieldToUpdate === 'note' && (
                <>
                  <Notes vehicle={vehicle} expanded={true} noCollapsible={true} />
                  <form onSubmit={form.handleSubmit(onSubmitAlert)} id="saveVehicle" />
                </>
              )}
              {fieldToUpdate === 'attivita' && <ActivitiesTable vehicle={params.id} />}
              {fieldToUpdate === 'aggiornamenti' && (
                <UpdateEventsTable collectionName={'vehicles'} id={params.id} />
              )}
            </div>
          )}
        </div>
      </WhiteBox>
    </>
  );
};

export default UpdateVehicle;
