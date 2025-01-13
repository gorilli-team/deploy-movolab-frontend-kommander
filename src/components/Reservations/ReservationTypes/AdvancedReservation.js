import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { TextField } from '../../Form/TextField';
import { SelectField } from '../../Form/SelectField';
import { http, urlSerialize } from '../../../utils/Utils';
import { Map as RenderMap } from '../../UI/RenderMap';
import FormLabel from '../../UI/FormLabel';

import { useHistory } from 'react-router-dom';
import useGroups from '../../../hooks/useGroups';
import RentalLocations from './RentalLocations';
import { updateWorkflowParams } from '../../../utils/Workflow';
import WhiteBox from '../../UI/WhiteBox';
import CardsHeader from '../../UI/CardsHeader';
import Stepper from '../../UI/Stepper';
import GroupsSelector from '../../UI/GroupsSelector';
import AutocompleteMap from '../../UI/RenderAutocompleteMap';
import { useLocation } from 'react-router-dom/cjs/react-router-dom.min';
import moment from 'moment/moment';

const distances = [
  { label: '5 km', value: 5 },
  { label: '10 km', value: 10 },
  { label: '50 km', value: 50 },
  { label: '100 km', value: 100 },
];

const AdvancedReservation = () => {
  const [pickUpRentalLocations, setPickUpRentalLocations] = useState([]);
  const [dropOffRentalLocations, setDropOffRentalLocations] = useState([]);
  const [showRentalLocations, setShowRentalLocations] = useState(false);
  const [markers, setMarkers] = useState([]);
  const [pickUpLocationSearch, setPickUpLocationSearch] = useState({
    lat: 41.9028,
    lng: 12.4964,
    address: null,
  });
  const [dropOffLocationSearch, setDropOffLocationSearch] = useState({
    lat: null,
    lng: null,
    address: null,
  });
  const form = useForm();
  const history = useHistory();
  const [pickUpDate, setPickUpDate] = useState();
  const [dropOffDate, setDropOffDate] = useState();
  const [group, setGroup] = useState('');
  const [movementType, setMovementType] = useState('');
  const [workflows, setWorkflows] = useState([]);
  const [workflow, setWorkflow] = useState('');
  const [zoom, setZoom] = useState(12);
  const groups = useGroups();
  const [selectedVehicle, setSelectedVehicle] = useState(false);
  const [selectedPickupLocation, setSelectedPickupLocation] = useState(undefined);
  const [availableMovementTypes, setAvailableMovementTypes] = useState([]);

  const mode = window.location.pathname.split('/')[1];

  let redirectUrl = '/dashboard/prenotazioni/completa';

  if (mode === 'corporate') {
    redirectUrl = '/corporate/prenotazioni/completa';
  }

  const searchString = useLocation().search || '';
  const searchParams = Object.fromEntries(new URLSearchParams(searchString).entries());

  const setForm = async () => {
    if (!searchString) return;

    setPickUpLocationSearch({
      lat: parseFloat(searchParams?.pickUpSearch_lat),
      lng: parseFloat(searchParams?.pickUpSearch_lon),
      address: searchParams?.pickUpSearch_addr,
    });
    setDropOffLocationSearch({
      lat: parseFloat(searchParams?.dropOffSearch_lat),
      lng: parseFloat(searchParams?.dropOffSearch_lon),
      address: searchParams?.dropOffSearch_addr,
    });

    if (!availableMovementTypes) {
      await fetchWorkflowParams(searchParams?.workflow);
    }

    if (groups && availableMovementTypes && searchParams?.selectedGroups) {
      form.setValue('workflow', searchParams?.workflow);

      form.setValue('movementType', searchParams?.movementType);
      form.setValue('pickUpLocation', searchParams?.pickUpLocation);
      form.setValue('pickUpDistance', searchParams?.pickUpDistance);
      form.setValue('pickUpDate', searchParams?.pickUpDate);
      form.setValue('dropOffLocation', searchParams?.dropOffLocation);
      form.setValue('dropOffDistance', searchParams?.dropOffDistance);
      form.setValue('dropOffDate', searchParams?.dropOffDate);

      const selectedGroups = searchParams?.selectedGroups.split(',').map((groupId) => ({
        value: groupId,
        label: groups.find((g) => g.value === groupId)?.label,
      }));

      form.setValue('group', selectedGroups);

      onSubmit(form.getValues());
    }
  };

  const onSubmit = async (data) => {
    if (!data.pickUpDate) {
      toast.error(`è richiesta la data di ritiro`);
      return;
    }

    if (!data.dropOffDate) {
      toast.error(`è richiesta la data di riconsegna`);
      return;
    }

    if (!(dropOffLocationSearch.address && pickUpLocationSearch.address)) return;

    setPickUpDate(data.pickUpDate);
    setDropOffDate(data.dropOffDate);
    setMovementType(data.movementType);
    setWorkflow(data.workflow);
    const groupIds = data.group.map((group) => group?.value);
    setGroup(groupIds);
    setZoom(calculateZoom(data.pickUpDistance));

    try {
      const pickup_avail = await http({
        url: '/rents/availability/getAvail',
        method: 'POST',
        form: {
          lat: pickUpLocationSearch.lat,
          lng: pickUpLocationSearch.lng,
          distance: data.pickUpDistance,
          group: groupIds,
          workflow: data.workflow,
          pickUpDate: data.pickUpDate,
          dropOffDate: data.dropOffDate,
        },
      });
      setPickUpRentalLocations(pickup_avail.result);

      setShowRentalLocations(true);
      setDropOffRentalLocations([]);
      setMarkers([...pickup_avail.result]);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const fetchWorkflows = async () => {
    try {
      const response = await http({ url: `/workflow/active?initiator=${mode}` });
      setWorkflows(
        response.workflows.map((workflow) => {
          return { value: workflow._id, label: workflow.name };
        }),
      );
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  useEffect(() => {
    fetchWorkflows();
    setForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groups, availableMovementTypes]);

  const fetchWorkflowParams = async (workflowId) => {
    try {
      const response = await updateWorkflowParams(workflowId);
      // setPickUpRentalLocations(response.rentalLocations);
      setAvailableMovementTypes(response.movementTypes);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const updatePickUpLocation = async (rentalLocation) => {
    setSelectedPickupLocation(rentalLocation._id);
    const dropOffLocation = await http({
      url:
        '/clients/rentalLocation/dropOffByClient/' +
        rentalLocation.clientId +
        '?lat=' +
        rentalLocation.lat +
        '&lng=' +
        rentalLocation.lng +
        '&time=' +
        dropOffDate,
    });
    dropOffLocation.rentalLocations = dropOffLocation?.rentalLocations.map((location) => {
      return {
        ...location,
        lat: location.lat,
        lng: location.lng,
        distance: location.distance,
      };
    });
    setDropOffRentalLocations(dropOffLocation.rentalLocations);
  };

  const calculateZoom = (distance) => {
    if (distance <= 5) {
      return 13;
    } else if (distance <= 10) {
      return 11;
    } else if (distance <= 50) {
      return 10;
    } else if (distance <= 100) {
      return 9;
    } else {
      return 8;
    }
  };

  return (
    <>
      <CardsHeader
        title="Nuova Prenotazione"
        buttons={[
          {
            btnStyle: 'lightSlateTransparent',
            children: '« Indietro',
            onClick: () => history.goBack(),
          },
          {
            btnStyle: 'blue',
            children: 'Cerca',
            form: 'locationSearch',
          },
        ]}
      >
        <Stepper
          className="pr-[12rem]"
          colorScheme="orange"
          steps={[{ content: '1', isCurrent: true }, { content: '2' }]}
        />
      </CardsHeader>
      <WhiteBox className="mt-0 mx-4 relative">
        <div className="p-4 pt-3 w-full absolute z-10 bg-white bg-opacity-75">
          {/*<h1 className="text-xl font-medium">Seleziona il Punto Nolo</h1>*/}

          <form onSubmit={form.handleSubmit(onSubmit)} id="locationSearch">
            <fieldset disabled={form.formState.isSubmitting} className="w-full">
              <div className="flex gap-x-3 flex-wrap lg:flex-nowrap">
                <div className="w-1/2 lg:w-52">
                  <FormLabel>Flusso</FormLabel>
                  <SelectField
                    form={form}
                    name="workflow"
                    placeholder="Flusso"
                    options={workflows}
                    validation={{
                      required: { value: true, message: 'Flusso' },
                    }}
                    onChangeFunction={(e) => {
                      e.preventDefault();
                      fetchWorkflowParams(e.target.value);
                    }}
                  />
                </div>
                <div className="w-1/2 lg:w-56">
                  <FormLabel>Tipo movimento</FormLabel>
                  <SelectField
                    form={form}
                    name="movementType"
                    placeholder="Tipo Movimento"
                    options={availableMovementTypes}
                    validation={{
                      required: { value: true, message: 'Tipo movimento' },
                    }}
                  />
                </div>
                <div className="flex-1 w-full sm:w-auto sm:min-w-[33rem]">
                  <FormLabel>Gruppo</FormLabel>
                  <GroupsSelector
                    form={form}
                    name="group"
                    groups={groups}
                    validation={{
                      required: { value: true, message: 'Seleziona almeno un gruppo' },
                    }}
                  />
                </div>
              </div>
              <div className="flex gap-x-3 flex-wrap relative">
                <div className="w-full sm:w-56">
                  <FormLabel>Luogo Ritiro</FormLabel>
                  <AutocompleteMap
                    updateLocation={(loc) => {
                      setPickUpLocationSearch(loc);

                      if (!dropOffLocationSearch.address) {
                        setDropOffLocationSearch(loc);
                      }
                    }}
                    required={true}
                    defaultValue={searchParams?.pickUpSearch_addr || ''}
                  />

                  {showRentalLocations && (
                    <RentalLocations
                      showVehicles={true}
                      rentalLocations={pickUpRentalLocations}
                      setSelectedVehicle={setSelectedVehicle}
                      selectedVehicle={selectedVehicle}
                      onRentalSelect={(rentalLocation) => {
                        updatePickUpLocation(rentalLocation);
                      }}
                      className="absolute bg-white rounded w-1/4 mt-2 z-10 max-h-[60vh] overflow-auto divide-y divide-slate-100"
                    />
                  )}
                </div>
                <div className="w-full sm:w-28">
                  <FormLabel>Distanza</FormLabel>
                  <SelectField
                    form={form}
                    name="pickUpDistance"
                    placeholder="Distanza"
                    options={distances}
                    onChangeFunction={(e) => {
                      form.setValue('dropOffDistance', e.target.value);
                    }}
                    validation={{
                      required: { value: true, message: 'Distanza' },
                    }}
                  />
                </div>
                <div className="w-full sm:w-56">
                  <FormLabel>Data Ritiro</FormLabel>
                  <TextField
                    form={form}
                    min={moment().format('YYYY-MM-DDTHH:mm')}
                    name="pickUpDate"
                    type="datetime-local"
                    placeholder="Data partenza"
                    onChangeFunction={(e) => {
                      setPickUpDate(e.target.value);
                    }}
                    validation={{
                      required: { value: true, message: 'Data partenza' },
                    }}
                  />
                </div>

                <div className="flex-1" />

                <div className="w-full sm:w-56">
                  <FormLabel>Luogo Consegna</FormLabel>
                  <AutocompleteMap
                    updateLocation={setDropOffLocationSearch}
                    required={true}
                    defaultValue={
                      searchParams?.dropOffSearch_addr || pickUpLocationSearch.address || ''
                    }
                  />

                  {selectedVehicle && (
                    <RentalLocations
                      showVehicles={false}
                      rentalLocations={dropOffRentalLocations}
                      setSelectedVehicle={setSelectedVehicle}
                      className="absolute bg-white rounded w-1/4 mt-2 z-10 max-h-[60vh] overflow-auto divide-y divide-slate-200"
                      onRentalSelect={(rentalLocation) => {
                        history.push(
                          `${redirectUrl}/?${urlSerialize({
                            workflow: workflow,
                            // rentalLocation: rentalLocation._id,
                            selectedGroups: group,
                            pickUpDate: pickUpDate,
                            dropOffDate: dropOffDate,
                            movementType: movementType,
                            selectedVehicle: selectedVehicle.plate,
                            pickUpLocation: selectedPickupLocation,
                            dropOffLocation: rentalLocation._id,
                            pickUpSearch_lat: pickUpLocationSearch.lat,
                            pickUpSearch_lon: pickUpLocationSearch.lng,
                            pickUpSearch_addr: pickUpLocationSearch.address,
                            pickUpDistance: form.getValues('pickUpDistance'),
                            dropOffSearch_lat: dropOffLocationSearch.lat,
                            dropOffSearch_lon: dropOffLocationSearch.lng,
                            dropOffSearch_addr: dropOffLocationSearch.address,
                            dropOffDistance: form.getValues('dropOffDistance'),
                          })}`,
                        );
                      }}
                    />
                  )}
                </div>

                <div className="w-full sm:w-28">
                  <FormLabel>Distanza</FormLabel>
                  <SelectField
                    form={form}
                    name="dropOffDistance"
                    placeholder="Distanza"
                    options={distances}
                    validation={{
                      required: { value: true, message: 'Distanza' },
                    }}
                  />
                </div>

                <div className="w-full sm:w-56">
                  <FormLabel>Data Consegna</FormLabel>
                  <TextField
                    form={form}
                    name="dropOffDate"
                    type="datetime-local"
                    min={pickUpDate}
                    placeholder="Data arrivo"
                    onChangeFunction={(e) => {
                      setDropOffDate(e.target.value);
                    }}
                    validation={{
                      required: { value: true, message: 'Inserisci data di consegna' },
                    }}
                  />
                </div>

                {/* <div className="w-auto">
                  <FormLabel>&nbsp;</FormLabel>
                  <Button btnStyle="inFormStyle">Cerca</Button>
                </div> */}
              </div>
            </fieldset>
          </form>
        </div>

        <RenderMap
          location={selectedVehicle ? dropOffLocationSearch : pickUpLocationSearch}
          markers={markers}
          height="80vh"
          className="w-full overflow-hidden rounded-2xl"
          zoom={zoom}
        />
      </WhiteBox>
    </>
  );
};

export default AdvancedReservation;
