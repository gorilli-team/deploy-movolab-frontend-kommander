import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useHistory, useLocation, useParams } from 'react-router-dom';

import { TextField } from '../../../components/Form/TextField';
import { SelectField } from '../../../components/Form/SelectField';
import { CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR, http } from '../../../utils/Utils';
import { Map as RenderMap } from '../../../components/UI/RenderMap';
import FormLabel from '../../../components/UI/FormLabel';
import SettingsPage from '../../../components/Settings/SettingsPage';
import ElementLabel from '../../../components/UI/ElementLabel';
import VehiclesTable from '../../../components/Vehicles/Vehicles/VehiclesTable';
import ClientProfilesTable from '../../../components/Clients/ClientProfiles/ClientProfilesTable';
import TableHeaderTab from '../../../components/UI/TableHeaderTab';
import WhiteBox from '../../../components/UI/WhiteBox';
import CardsHeader from '../../../components/UI/CardsHeader';
import Button from '../../../components/UI/buttons/Button';
import { FaPen, FaTrash, FaXmark } from 'react-icons/fa6';
import ToggleSwitch from '../../../components/UI/ToggleSwitch';
import SearchAddress from '../../../components/Places/SearchAddress';

const RentalLocation = () => {
  const form = useForm();
  const params = useParams();
  const history = useHistory();
  const search = useLocation().search;
  const section = new URLSearchParams(search).get('section');

  const [rentalLocation, setRentalLocation] = useState({});
  const [fieldToUpdate, setFieldToUpdate] = useState(section || 'general');
  const [openingHours, setOpeningHours] = useState([]);
  const [closingDays, setClosingDays] = useState([]);
  const [addOpeningHour, setAddOpeningHour] = useState(false);
  const [addClosingDay, setAddClosingDay] = useState(false);
  const mode = params.id ? 'edit' : 'create';

  const [location, setLocation] = useState({ lat: 41.9028, lng: 12.4964 });
  const [markers, setMarkers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [vehiclesCount, setVehiclesCount] = useState(0);
  const [from, setFrom] = useState(0);
  const [enabledHourField, setEnabledHourField] = useState(null);
  const [enabledDayField, setEnabledDayField] = useState(null);
  const [clientProfilesCount, setClientProfilesCount] = useState(0); // eslint-disable-line
  const [address, setAddress] = useState(null); // eslint-disable-line

  useEffect(() => {
    fetchRentalLocation();
    fetchVehicles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const disableRentalLocation = async () => {
    try {
      await http({
        method: 'PUT',
        url: `/clients/rentalLocation/${params.id}`,
        form: { enabled: !rentalLocation.enabled },
      });
      toast.success('Punto nolo disabilitato');
      await fetchRentalLocation();
    } catch (err) {
      console.error(err);
      toast.error(err?.error || 'Errore');
    }
  };

  const fetchRentalLocation = async () => {
    try {
      if (mode === 'edit') {
        const response = await http({ url: `/clients/rentalLocation/${params.id}` });
        const location = {
          lat: response.lat,
          lng: response.lng,
          name: response.name,
          address: response.address,
        };
        setLocation(location);
        setMarkers([location]);
        setRentalLocation(response);
        setOpeningHours(response.openingHours);
        setClosingDays(response.closingDays.sort((a, b) => new Date(a) - new Date(b)));
        setAddress(response.address);

        form.setValue('name', response.name);
        form.setValue('clientId', response.clientId);
        form.setValue('daysOfWeek', response.daysOfWeek);
        // form.setValue('address', response.address);
        form.setValue('phone', response.phone);
        form.setValue('email', response.email);
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const fetchVehicles = async (skip = 0, limit = 10) => {
    try {
      const response = await http({
        url: `/vehicles/vehicle?rentalLocation=${params.id}&skip=${skip}&limit=${limit}`,
      });
      setVehicles(response.vehicles);
      setVehiclesCount(response.count);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const precFunction = () => {
    if (from - 10 < 0) return;
    fetchVehicles(from - 10, 10);
    setFrom(from - 10);
  };

  const succFunction = () => {
    if (from + 10 > vehiclesCount) return;
    fetchVehicles(from + 10, 10);
    setFrom(from + 10);
  };

  const onSubmit = async (data) => {
    try {
      if (address) {
        data.address = address;
      } else {
        return toast.error('Inserire un indirizzo valido');
      }

      if (mode === 'create') {
        const rentalLocationData = {
          ...data,
          openingHours: [],
          closingDays: [],
        };
        const newRentalLocation = await http({
          method: 'POST',
          url: '/clients/rentalLocation',
          form: rentalLocationData,
        });
        toast.success('Punto nolo creato');
        history.push(`/settings/puntinolo/${newRentalLocation?.rentalLocation._id}`);
      } else if (mode === 'edit') {
        await http({
          method: 'PUT',
          url: `/clients/rentalLocation/${params.id}`,
          form: data,
        });
        toast.success('Punto nolo aggiornato');
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const updateOpeningHours = async () => {
    try {
      if (!addOpeningHour) return toast.success('Punto nolo aggiornato');

      if (!form.getValues('newOpening')) return toast.error('Inserisci Orario di Apertura');
      if (!form.getValues('newOpening.openingHour'))
        return toast.error('Inserisci Orario di Apertura');
      if (!form.getValues('newOpening.closingHour'))
        return toast.error('Inserisci Orario di Chiusura');
      if (!form.getValues('newOpening.day')) return toast.error('Inserisci Giorno');
      if (form.getValues('newOpening.openingHour') >= form.getValues('newOpening.closingHour'))
        return toast.error('Orario di Apertura deve essere minore di Orario di Chiusura');

      const newRentalLocation = {
        ...rentalLocation,
        openingHours: [...rentalLocation.openingHours, form.getValues('newOpening')],
      };

      await http({
        method: 'PUT',
        url: `/clients/rentalLocation/${params.id}`,
        form: newRentalLocation,
      });
      toast.success('Orari di apertura aggiornati');
      setOpeningHours([]);
      await fetchRentalLocation();
      setAddOpeningHour(false);
      form.setValue('newOpening', undefined);
      setEnabledHourField(null);
      setEnabledDayField(null);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const updateEnabledField = async (e, index) => {
    try {
      e.preventDefault();
      const newOpening = form.getValues(`openingHours[${index}].openingHour`);
      const newClosure = form.getValues(`openingHours[${index}].closingHour`);

      const newOpeningHours = openingHours.map((openingHour, i) => {
        if (i === index) {
          return {
            ...openingHour,
            openingHour: newOpening,
            closingHour: newClosure,
          };
        }
        return openingHour;
      });

      const newRentalLocation = {
        ...rentalLocation,
        openingHours: newOpeningHours,
      };

      await http({
        method: 'PUT',
        url: `/clients/rentalLocation/${params.id}`,
        form: newRentalLocation,
      });
      toast.success('Orari di apertura aggiornati');
      setOpeningHours([]);
      await fetchRentalLocation();
      setEnabledHourField(null);
      setEnabledDayField(null);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const updateClosingDay = async (e, index) => {
    try {
      e.preventDefault();
      const newClosingDay = {
        from: new Date(form.getValues(`closingDays[${index}].from`)),
        to: new Date(form.getValues(`closingDays[${index}].to`)),
      };

      const newClosingDays = closingDays.map((closingDay, i) => {
        if (i === index) {
          const newDate = newClosingDay;
          return newDate;
        }

        return closingDay;
      });

      const newRentalLocation = {
        ...rentalLocation,
        closingDays: newClosingDays,
      };

      await http({
        method: 'PUT',
        url: `/clients/rentalLocation/${params.id}`,
        form: newRentalLocation,
      });
      toast.success('Orari di apertura aggiornati');
      setClosingDays([]);
      await fetchRentalLocation();
      setEnabledHourField(null);
      setEnabledDayField(null);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const updateClosingDays = async () => {
    try {
      if (!addClosingDay) return toast.success('Punto nolo aggiornato');

      if (!form.getValues('from')) return toast.error('Inserisci Giorno di Inizio Chiusura');
      if (!form.getValues('to')) return toast.error('Inserisci Giorno di Fine Chiusura');
      if (form.getValues('from') >= form.getValues('to'))
        return toast.error(
          'Giorno di Inizio Chiusura deve essere precedente al Giorno di Fine Chiusura',
        );

      const newClosingDay = {
        from: new Date(form.getValues('from')),
        to: new Date(form.getValues('to')),
      };

      const newRentalLocation = {
        ...rentalLocation,
        closingDays: [...rentalLocation.closingDays, newClosingDay],
      };

      await http({
        method: 'PUT',
        url: `/clients/rentalLocation/${params.id}`,
        form: newRentalLocation,
      });
      toast.success('Giorni di chiusura aggiornati');
      setClosingDays([]);
      await fetchRentalLocation();
      setAddClosingDay(false);
      form.setValue('newClosingDay', undefined);
      setEnabledDayField(null);

      form.setValue('from', null);
      form.setValue('to', null);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const enableOpeningHour = async (e, index) => {
    e.preventDefault();
    setEnabledHourField(index);
  };

  const disableOpeningHours = async (e) => {
    e.preventDefault();
    setEnabledHourField(null);
  };

  const enableClosingDay = async (e, index) => {
    e.preventDefault();
    setEnabledDayField(index);
  };

  const disableClosingDay = async (e) => {
    e.preventDefault();
    setEnabledDayField(null);
  };

  const deleteOpeningHour = async (e, index) => {
    e.preventDefault();
    rentalLocation.openingHours.splice(index, 1);

    await http({
      method: 'PUT',
      url: `/clients/rentalLocation/${params.id}`,
      form: rentalLocation,
    });
    toast.success('Orario di Apertura eliminato');
    setOpeningHours([]);
    await fetchRentalLocation();
  };

  const deleteClosingDay = async (e, index) => {
    e.preventDefault();
    rentalLocation.closingDays.splice(index, 1);

    await http({
      method: 'PUT',
      url: `/clients/rentalLocation/${params.id}`,
      form: rentalLocation,
    });
    toast.success('Giorno di chiusura eliminato');
    setClosingDays([]);
    await fetchRentalLocation();
  };

  return (
    <SettingsPage canAccess={[CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR]} hasBox={false}>
      <CardsHeader
        title={mode === 'edit' ? 'Aggiorna punto nolo' : 'Nuovo punto nolo'}
        buttons={[
          {
            btnStyle: 'lightSlateTransparent',
            children: '« Indietro',
            onClick: () => history.goBack(),
            // hiddenIf: !showUpdate,
          },
          /* {
            children: 'Modifica',
            onClick: () => switchMode(),
            hiddenIf: showUpdate,
          }, */
          {
            children: mode === 'edit' ? 'Salva modifiche' : 'Crea punto nolo',
            form: 'rentLocationForm',
            // hiddenIf: !showUpdate,
          },
        ]}
      />

      <WhiteBox className="mt-0 !overflow-visible">
        {mode === 'edit' && (
          <>
            <div className="flex pt-4 px-4 gap-x-4">
              <div className="p-3 flex-1">
                <div className="text-3xl font-semibold">{rentalLocation?.name}</div>
                <div className="text-md">{rentalLocation?.address}</div>
              </div>
              <div className="text-right p-1">
                <div className="mb-4">
                  {rentalLocation?.enabled ? (
                    <ElementLabel bgColor="bg-green-600">Abilitato</ElementLabel>
                  ) : (
                    <ElementLabel bgColor="bg-red-600">Disabilitato</ElementLabel>
                  )}
                </div>

                <ToggleSwitch
                  switches={[
                    {
                      label: 'ON',
                      onClick: (e) => {
                        disableRentalLocation();
                      },
                      selected: rentalLocation?.enabled,
                    },
                    {
                      label: 'OFF',
                      onClick: (e) => {
                        disableRentalLocation();
                      },
                      selected: !rentalLocation?.enabled,
                    },
                  ]}
                />
              </div>
            </div>
            <TableHeaderTab
              buttons={[
                {
                  label: 'Generale',
                  function: () => setFieldToUpdate('general'),
                  selected: fieldToUpdate === 'general',
                },
                {
                  label: 'Veicoli',
                  function: () => setFieldToUpdate('vehicles'),
                  selected: fieldToUpdate === 'vehicles',
                },
                {
                  label: 'Orari di Apertura',
                  function: () => setFieldToUpdate('openingHours'),
                  selected: fieldToUpdate === 'openingHours',
                },
                {
                  label: 'Giorni di Chiusura',
                  function: () => setFieldToUpdate('closingDays'),
                  selected: fieldToUpdate === 'closingDays',
                },
                // {
                //   label: 'Operatori Abilitati',
                //   function: () => setFieldToUpdate('clientProfilesEnabled'),
                //   selected: fieldToUpdate === 'clientProfilesEnabled',
                // },
              ]}
            />
          </>
        )}

        <div
          className={`bg-slate-200 border-4 rounded-b-2xl border-white ${fieldToUpdate !== 'vehicles' && 'p-4'
            } ${mode !== 'edit' && 'rounded-t-2xl'}`}
        >
          {fieldToUpdate === 'general' ? (
            <div className="flex">
              <div className="w-2/5">
                <form onSubmit={form.handleSubmit(onSubmit)} id="rentLocationForm">
                  <fieldset disabled={form.formState.isSubmitting}>
                    <div className="max-w-sm">
                      <TextField
                        form={form}
                        name="name"
                        type="string"
                        placeholder="Nome punto nolo"
                        label="Nome punto nolo"
                        validation={{
                          required: { value: true, message: 'Nome Punto Nolo obbligatorio' },
                        }}
                      />
                      <SearchAddress
                        returnAddress={(addr, x, location) => {
                          setAddress(addr);
                          setLocation({ lat: location?.lat(), lng: location?.lng() });
                          setMarkers([{ lat: location?.lat(), lng: location?.lng() }]);
                        }}
                        startAddress={rentalLocation?.address}
                        placeholder="Indirizzo"
                        label="Indirizzo punto nolo"
                        validation={{
                          required: { value: true, message: 'Indirizzo obbligatorio' },
                        }}
                      />
                      <TextField
                        form={form}
                        name="phone"
                        type="string"
                        placeholder="Telefono"
                        label="Telefono"
                        validation={{
                          required: { value: true, message: 'Numero di telefono obbligatorio' },
                        }}
                      />
                      <TextField
                        form={form}
                        name="email"
                        type="string"
                        placeholder="Email"
                        label="Email"
                        validation={{
                          required: { value: true, message: 'Indirizzo email obbligatorio' },
                        }}
                      />
                    </div>
                  </fieldset>
                </form>
              </div>
              {mode === 'edit' ? (
                <div className="w-3/5 bg-blue-300">
                  {location.lat === 0 && location.lng === 0 ? <h1>Caricamento...</h1> : null}
                  <RenderMap location={location} markers={markers} zoom={15} />
                </div>
              ) : null}
            </div>
          ) : null}

          {fieldToUpdate === 'openingHours' ? (
            <form onSubmit={form.handleSubmit(updateOpeningHours)} id="rentLocationForm">
              {openingHours
                .sort((a, b) => a.day - b.day)
                .map((openingHour, index) => {
                  form.setValue(`openingHours[${index}].day`, openingHour.day);
                  form.setValue(`openingHours[${index}].openingHour`, openingHour.openingHour);
                  form.setValue(`openingHours[${index}].closingHour`, openingHour.closingHour);

                  return (
                    <div className="flex space-x-2" key={index}>
                      <div className="w-40">
                        <FormLabel>Giorno</FormLabel>
                        <SelectField
                          form={form}
                          name={`openingHours[${index}].day`}
                          disabled={true}
                          placeholder="Giorno"
                          enabled={false}
                          options={[
                            { value: 1, label: 'Lunedì' },
                            { value: 2, label: 'Martedì' },
                            { value: 3, label: 'Mercoledì' },
                            { value: 4, label: 'Giovedì' },
                            { value: 5, label: 'Venerdì' },
                            { value: 6, label: 'Sabato' },
                            { value: 7, label: 'Domenica' },
                          ]}
                        />
                      </div>
                      <div className="w-60">
                        <FormLabel>Apertura</FormLabel>

                        <TextField
                          form={form}
                          disabled={enabledHourField !== index}
                          name={`openingHours[${index}].openingHour`}
                          type="time"
                          placeholder="Apertura"
                          bgColor={enabledHourField === index ? 'bg-green-50' : ''}
                        />
                      </div>
                      <div className="w-60">
                        <FormLabel>Chiusura</FormLabel>

                        <TextField
                          form={form}
                          disabled={enabledHourField !== index}
                          name={`openingHours[${index}].closingHour`}
                          type="time"
                          placeholder="Chiusura"
                          bgColor={enabledHourField === index ? 'bg-green-50' : ''}
                        />
                      </div>
                      {enabledHourField !== index ? (
                        <>
                          <div className="ml-2">
                            <FormLabel>&nbsp;</FormLabel>
                            <Button
                              type="button"
                              btnStyle="inFormStyle"
                              onClick={(e) => {
                                enableOpeningHour(e, index);
                              }}
                            >
                              <FaPen />
                            </Button>
                          </div>
                          <div className="ml-2">
                            <FormLabel>&nbsp;</FormLabel>
                            <Button
                              type="button"
                              btnStyle="inFormStyle"
                              className="!text-red-500 !border-red-500"
                              onClick={(e) => {
                                deleteOpeningHour(e, index);
                              }}
                            >
                              <FaTrash />
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="ml-2">
                            <FormLabel>&nbsp;</FormLabel>
                            <Button
                              type="button"
                              btnStyle="inFormStyle"
                              onClick={(e) => {
                                updateEnabledField(e, index);
                              }}
                            >
                              Salva
                            </Button>
                          </div>
                          <div className="ml-2">
                            <FormLabel>&nbsp;</FormLabel>
                            <Button
                              type="button"
                              btnStyle="inFormStyle"
                              // className="!text-red-500 !border-red-500"
                              onClick={(e) => {
                                disableOpeningHours(e, index);
                              }}
                            >
                              <FaXmark />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              <div>
                {addOpeningHour ? (
                  <div>
                    <h1 className="text-md font-bold mt-4">Nuovo Orario di Apertura</h1>
                    <div className="flex mt-1 space-x-2">
                      <div className="w-40">
                        <SelectField
                          form={form}
                          name={'newOpening.day'}
                          placeholder="Giorno"
                          enabled={false}
                          validation={{
                            required: {
                              value: true,
                              message: 'Inserisci Giorno',
                            },
                          }}
                          options={[
                            { value: 1, label: 'Lunedì' },
                            { value: 2, label: 'Martedì' },
                            { value: 3, label: 'Mercoledì' },
                            { value: 4, label: 'Giovedì' },
                            { value: 5, label: 'Venerdì' },
                            { value: 6, label: 'Sabato' },
                            { value: 7, label: 'Domenica' },
                          ]}
                        />
                      </div>
                      <div className="w-60">
                        <TextField
                          form={form}
                          name={`newOpening.openingHour`}
                          type="time"
                          placeholder="Apertura"
                          validation={{
                            required: {
                              value: true,
                              message: 'Inserisci Orario di Apertura',
                            },
                          }}
                        />
                      </div>
                      <div className="w-60">
                        <TextField
                          form={form}
                          name={`newOpening.closingHour`}
                          type="time"
                          placeholder="Chiusura"
                          validation={{
                            required: {
                              value: true,
                              message: 'Inserisci Orario di Chiusura',
                            },
                          }}
                        />
                      </div>
                      <div className="w-20">
                        <Button
                          btnStyle="inFormStyle"
                          onClick={() => setFieldToUpdate('openingHours')}
                        >
                          Aggiungi
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2">
                    <Button
                      type="button"
                      btnStyle="white"
                      onClick={(e) => {
                        setAddOpeningHour(true);
                      }}
                    >
                      Aggiungi Orario di Apertura
                    </Button>
                  </div>
                )}
              </div>
            </form>
          ) : null}

          {fieldToUpdate === 'closingDays' ? (
            <form onSubmit={form.handleSubmit(updateClosingDays)} id="rentLocationForm">
              {closingDays.map((closingDay, index) => {
                if (closingDay?.from && !isNaN(Date.parse(closingDay?.from))) {
                  form.setValue(
                    `closingDays[${index}].from`,
                    new Date(closingDay?.from).toISOString().split('T')[0],
                  );
                } else {
                  console.error(`Invalid date: ${closingDay?.from}`);
                }
                if (closingDay?.to && !isNaN(Date.parse(closingDay?.to))) {
                  form.setValue(
                    `closingDays[${index}].to`,
                    new Date(closingDay?.to).toISOString().split('T')[0],
                  );
                } else {
                  console.error(`Invalid date: ${closingDay?.from}`);
                }
                return (
                  <div className="flex space-x-2" key={index}>
                    <div className="w-60">
                      <FormLabel>Chiuso dal</FormLabel>
                      <TextField
                        form={form}
                        disabled={enabledDayField !== index}
                        name={`closingDays[${index}].from`}
                        max={form.getValues(`closingDays[${index}].to`) || ''}
                        type="date"
                        placeholder="Giorno di Chiusura"
                        bgColor={enabledDayField === index ? 'bg-green-50' : ''}
                      />
                    </div>
                    <div className="w-60">
                      <FormLabel>al</FormLabel>
                      <TextField
                        form={form}
                        disabled={enabledDayField !== index}
                        name={`closingDays[${index}].to`}
                        min={form.getValues(`closingDays[${index}].from`) || ''}
                        type="date"
                        placeholder="Giorno di Chiusura"
                        bgColor={enabledDayField === index ? 'bg-green-50' : ''}
                      />
                    </div>
                    {enabledDayField !== index ? (
                      <>
                        <div className="ml-2">
                          <FormLabel>&nbsp;</FormLabel>
                          <Button
                            type="button"
                            btnStyle="inFormStyle"
                            onClick={(e) => {
                              enableClosingDay(e, index);
                            }}
                          >
                            <FaPen />
                          </Button>
                        </div>
                        <div className="ml-2">
                          <FormLabel>&nbsp;</FormLabel>
                          <Button
                            type="button"
                            btnStyle="inFormStyle"
                            className="!text-red-500 !border-red-500"
                            onClick={(e) => {
                              deleteClosingDay(e, index);
                            }}
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="ml-2">
                          <FormLabel>&nbsp;</FormLabel>
                          <Button
                            type="button"
                            btnStyle="inFormStyle"
                            onClick={(e) => {
                              updateClosingDay(e, index);
                            }}
                          >
                            Salva
                          </Button>
                        </div>
                        <div className="ml-2">
                          <FormLabel>&nbsp;</FormLabel>
                          <Button
                            type="button"
                            btnStyle="inFormStyle"
                            // className="!text-red-500 !border-red-500"
                            onClick={(e) => {
                              disableClosingDay(e, index);
                            }}
                          >
                            <FaXmark />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
              <div>
                {addClosingDay ? (
                  <div>
                    <h1 className="text-md font-bold mt-4">Nuovo Giorno di Chiusura</h1>
                    <div className="flex mt-1 space-x-2">
                      <div className="w-60">
                        <FormLabel>Chiuso dal</FormLabel>
                        <TextField
                          form={form}
                          name={`from`}
                          type="date"
                          placeholder="Giorno di Chiusura"
                          validation={{
                            required: {
                              value: true,
                              message: 'Inserisci Giorno di Inizio Chiusura',
                            },
                          }}
                        />
                      </div>
                      <div className="w-60">
                        <FormLabel>al</FormLabel>
                        <TextField
                          form={form}
                          name={`to`}
                          type="date"
                          placeholder="Giorno di Chiusura"
                          validation={{
                            required: {
                              value: true,
                              message: 'Inserisci Giorno di Fine Chiusura',
                            },
                          }}
                        />
                      </div>
                      <div>
                        <FormLabel>&nbsp;</FormLabel>
                        <Button
                          btnStyle="inFormStyle"
                          onClick={() => setFieldToUpdate('closingDays')}
                        >
                          Inserisci
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2">
                    <Button
                      btnStyle="white"
                      type="button"
                      onClick={(e) => {
                        setAddClosingDay(true);
                      }}
                    >
                      Aggiungi Giorno Di Chiusura
                    </Button>
                  </div>
                )}
              </div>
            </form>
          ) : null}

          {fieldToUpdate === 'vehicles' ? (
            <VehiclesTable
              elements={vehicles}
              from={from}
              count={vehiclesCount}
              precFunction={precFunction}
              succFunction={succFunction}
            />
          ) : null}

          {fieldToUpdate === 'clientProfilesEnabled' ? (
            <ClientProfilesTable
              role={'client'}
              rentalLocationId={rentalLocation?._id}
              setCount={setClientProfilesCount}
            />
          ) : null}
        </div>
      </WhiteBox>
    </SettingsPage>
  );
};

export default RentalLocation;
