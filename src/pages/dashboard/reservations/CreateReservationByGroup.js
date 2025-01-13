import React, { useContext, useEffect, useState } from 'react';
import Page from '../../../components/Dashboard/Page';
import { CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR } from '../../../utils/Utils';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useHistory } from 'react-router-dom';
import { UserContext } from '../../../store/UserContext';
import { TextField as TextInternal } from '../../../components/Form/TextField';
import { SelectField } from '../../../components/Form/SelectField';
import ElementLabel from '../../../components/UI/ElementLabel';

import { http } from '../../../utils/Utils';
import useGroups from '../../../hooks/useGroups';
import FormLabel from '../../../components/UI/FormLabel';
import { RouterPrompt } from '../../../components/UI/RouterPrompt';
import { countDays } from '../../../utils/Utils';
import { calculateBasePrice, calculatePrice, convertPrice } from '../../../utils/Prices';
import { getVehicleGroup } from '../../../utils/Vehicles';
import { checkUsers } from '../../../utils/Users';
import WhiteBox from '../../../components/UI/WhiteBox';
import CardsHeader from '../../../components/UI/CardsHeader';
import Stepper from '../../../components/UI/Stepper';
import { updateWorkflowParams, fetchRentalLocations } from '../../../utils/Workflow';
import GetAvailabilities from '../../../components/Reservations/ByGroup/GetAvailabilities';

const CreateReservationByGroup = ({
  pageTitle = 'Nuova Prenotazione per Gruppo',
  activeStep = 1,
  searchParams = null,
  searchString = '',
}) => {
  const [rentalLocations, setRentalLocations] = useState([]);
  const form = useForm();
  const history = useHistory();
  const userContext = useContext(UserContext);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedVehicleIndex, setSelectedVehicleIndex] = useState(-1);
  const [movementType, setMovementType] = useState('');
  const [activePriceLists, setActivePriceLists] = useState([]);
  const [priceListsLabels, setPriceListsLabels] = useState([]);
  const [extraFields, setExtraFields] = useState([]);
  const [searchDone, setSearchDone] = useState(false);
  const [vatPercentage, setVatPercentage] = useState(0);
  const [storedDiscountAmount, setStoredDiscountAmount] = useState(0);
  const [storedDiscountPercentage, setStoredDiscountPercentage] = useState(0);
  const [availableMovementTypes, setAvailableMovementTypes] = useState([]);
  const [reservationCompleted, setReservationCompleted] = useState(false);
  const [reservationId, setReservationId] = useState('');
  const [administration, setAdministration] = useState({});
  const [isDiscountable, setIsDiscountable] = useState(false);
  const [isDiscountPercentage, setIsDiscountPercentage] = useState(null);
  const [selectedPriceList, setSelectedPriceList] = useState(undefined);
  const [ranges, setRanges] = useState([]);
  const [workflows, setWorkflows] = useState([]);
  const [days, setDays] = useState(0);
  const [selectedRange, setSelectedRange] = useState(null);
  const [prices, setPrices] = useState([]); //eslint-disable-line

  const [driver, setDriver] = useState(null);
  const [customDriver, setCustomDriver] = useState(true);
  const [customDriverConfirm, setCustomDriverConfirm] = useState(false);
  const [showDriverModal, setShowDriverModal] = useState(false);

  const [customer, setCustomer] = useState(null);
  const [customerCompany, setCustomerCompany] = useState(null);
  const [customCustomer, setCustomCustomer] = useState(true);
  const [customClientConfirm, setCustomClientConfirm] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showCustomerCompanyModal, setShowCustomerCompanyModal] = useState(false);

  const groups = useGroups();
  const [rentBuffer, setRentBuffer] = useState(0);
  const [isBlocking, setIsBlocking] = useState(false);
  const [searchBtnEnabled, setSearchBtnEnabled] = useState(false);
  const [continuaBtnEnabled, setContinuaBtnEnabled] = useState(false);

  const mode = window.location.pathname.split('/')[1];

  useEffect(() => {
    fetchWorkflows();
    fetchRentalLocations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Imposta il pricelist di default se ce n'è solo uno
    if (priceListsLabels.length === 1) {
      form.setValue('priceList', priceListsLabels[0].value);
    } else {
      form.setValue('priceList', null);
    }
    updatePriceList();
  }, [priceListsLabels]); // eslint-disable-line

  const setForm = async () => {
    form.setValue('workflow', searchParams?.workflow);
    await fetchWorkflowParams(searchParams?.workflow);

    form.setValue('movementType', searchParams?.movementType);
    form.setValue('pickUpDate', searchParams?.pickUpDate);
    form.setValue('pickUpLocation', searchParams?.pickUpLocation);
    form.setValue('dropOffDate', searchParams?.dropOffDate);
    form.setValue('dropOffLocation', searchParams?.dropOffLocation);

    if (groups && searchParams?.selectedGroups) {
      form.setValue(
        'group',
        searchParams?.selectedGroups.split(',').map((groupId) => ({
          value: groupId,
          label: groups.find((g) => g.value === groupId)?.label,
        })),
      );

      onSubmit(form.getValues());
    }
  };

  useEffect(() => {
    if (searchParams) {
      setForm();
    }
  }, [workflows, groups]); // eslint-disable-line

  useEffect(() => {
    fetchRanges();
  }, [selectedPriceList]); // eslint-disable-line

  useEffect(() => {
    if (searchParams) {
      const selectedVh = Object.values(vehicles).find(
        (vh) => vh.plate === searchParams?.selectedVehicle,
      );

      if (selectedVh) {
        setSelectedVehicle(selectedVh);
        checkSearchBtnEnabled(true);
      }
    }
  }, [vehicles]); // eslint-disable-line

  const onSubmit = async (data) => {
    try {
      if (!data.group || data.group?.length === 0) {
        toast.error('Seleziona un gruppo per effettuare la ricerca');
        return;
      }
      setVehicles([]);

      let workflow = data.workflow;
      if (!data.workflow) {
      } else {
        workflow = await http({ url: `/workflow/${data.workflow}` });
        setExtraFields(workflow.extraFields);
      }

      setRentBuffer(workflow?.configuration?.rentBuffer);

      setAdministration(workflow?.administration);

      setIsDiscountable(
        workflow?.administration?.faresDiscountMaxPercentage !== 0 ||
          workflow?.administration?.faresDiscountMaxEuro !== 0,
      );
      setIsDiscountPercentage(workflow?.administration?.faresDiscountMaxPercentage !== 0);

      if (data.pickUpDate > data.dropOffDate) {
        toast.error('La data di ritiro deve essere successiva alla data di consegna');
        setVehicles([]);
        return;
      }

      const totalDays = countDays(
        data.pickUpDate,
        data.dropOffDate,
        workflow?.configuration?.rentBuffer,
      );

      if (totalDays < 1) {
        toast.error('La prenotazione deve essere di almeno un giorno');
        setVehicles([]);
        return;
      }

      if (totalDays > workflow?.administration?.maxDays && workflow?.administration?.maxDays > 0) {
        toast.error(
          `Il Flusso selezionato permette Prenotazioni di massimo ${
            workflow?.administration?.maxDays
          } ${workflow?.administration?.maxDays === 1 ? 'giorno' : 'giorni'}.`,
          {
            duration: 5000,
          },
        );
        return;
      }

      setDays(totalDays);
      setPriceListsLabels(
        workflow.priceLists.map((priceList) => {
          return { value: priceList._id, label: priceList.name };
        }),
      );
      const priceLists = await http({ url: `/pricing/priceLists/workflow/${data.workflow}` });
      setActivePriceLists(priceLists);
      getRangesFromPricelist(priceLists[0]);

      setMovementType(data.movementType);
      const groupIds = data.group.map((group) => group?.value);
      const response = await http({
        url: '/rents/availability/getAvailSimple',
        method: 'POST',
        form: {
          workflow: data.workflow,
          movementType: data.movementType,
          group: groupIds,
          pickUpLocation: data.pickUpLocation,
          pickUpDate: data.pickUpDate,
          dropOffLocation: data.dropOffLocation,
          dropOffDate: data.dropOffDate,
          priceList: data.priceList,
          initiator: mode,
        },
      });

      setVehicles(response.result);
      setSearchDone(true);
    } catch (err) {
      toast.error(err?.error || 'Errore');
    }
  };

  const fetchRanges = async () => {
    const priceList = activePriceLists.find((item) => item._id === selectedPriceList);
    if (!priceList) return;

    const availRanges = [];
    priceList.fares.forEach((fare) => {
      if (!availRanges.find((r) => r._id === fare.range._id)) {
        availRanges.push(fare.range);
      }
    });
    setRanges(availRanges);
  };

  const getRangesFromPricelist = (priceList) => {
    if (!priceList) return;
    const availRanges = [];
    priceList.fares.forEach((fare) => {
      if (!availRanges.find((r) => r._id === fare.range._id)) {
        availRanges.push(fare.range);
      }
    });
    setRanges(availRanges);
  };

  const fetchWorkflowParams = async (workflowId) => {
    try {
      const response = await updateWorkflowParams(workflowId);
      setAvailableMovementTypes(response.movementTypes);

      if (mode === 'corporate') {
        const workflow = await http({ url: `/workflow/${workflowId}` });
        setRentalLocations(workflow.rentalLocations);
      } else {
        setRentalLocations(response.rentalLocations);
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const selectRange = (days) => {
    const validRanges = ranges.filter((item) => item.from <= days && item.to >= days);
    return validRanges;
  };

  const openUserCompaniesModal = async (userCompanyId = true) => {
    setShowCustomerModal(false);
    setShowCustomerCompanyModal(userCompanyId);
  };

  const getFare = (group) => {
    if (!selectedPriceList) return;
    if (!activePriceLists || activePriceLists.length === 0) return;
    const priceList = activePriceLists.find((item) => item._id === selectedPriceList);
    if (!priceList) return;
    if (!priceList?.fares?.length) return;

    const days = countDays(form.getValues('pickUpDate'), form.getValues('dropOffDate'), rentBuffer);

    let range = selectRange(days)[0];
    form.setValue('selectedRange', range?._id);
    if (selectedRange) {
      range = selectedRange;
    }

    const fare = priceList.fares.find((item) => {
      return item?.group?._id === group?._id && item?.range?._id === range?._id;
    });
    return fare;
  };

  const fetchInitialAmount = (group) => {
    const fare = getFare(group);
    if (!fare) return;

    const price = calculateBasePrice(movementType, fare.fare, days);

    return price;
  };

  const fetchPrice = (group) => {
    const fare = getFare(group);

    if (!fare) return;

    const price = calculatePrice(movementType, fare.fare, days, 0, 0, 2);
    return price;
  };

  const checkFormIsDirty = () => {
    if (
      form.getValues('workflow') !== '' ||
      form.getValues('movementType') !== '' ||
      form.getValues('pickUpLocation') !== '' ||
      form.getValues('dropOffLocation') !== '' ||
      form.getValues('pickUpDate') !== '' ||
      form.getValues('dropOffDate') !== '' ||
      form.getValues('group') !== '' ||
      form.getValues('priceList') !== '' ||
      form.getValues('discountAmount') !== '' ||
      form.getValues('discountPercentage') !== '' ||
      form.getValues('driverFullName') !== '' ||
      form.getValues('driverPhone') !== '' ||
      form.getValues('customerFullName') !== '' ||
      form.getValues('customerPhone') !== ''
    ) {
      setIsBlocking(true);
    } else {
      setIsBlocking(false);
    }
    checkSearchBtnEnabled();
  };

  const updatePriceList = (e) => {
    const priceListId = form.getValues('priceList');
    setSelectedPriceList(priceListId);
    const priceList = activePriceLists.find((item) => item._id === priceListId);
    setVatPercentage(priceList?.configuration?.fares?.vatPercentage || 0);
  };

  const checkSearchBtnEnabled = (selVehicle) => {
    if (
      form.getValues('workflow') != null &&
      form.getValues('movementType') != null &&
      form.getValues('group') != null &&
      form.getValues('pickUpLocation') != null &&
      form.getValues('dropOffLocation') != null &&
      form.getValues('pickUpDate') != null &&
      form.getValues('dropOffDate') != null
      //form.getValues('driverFullName') != null &&
      //form.getValues('driverPhone') != null &&
      //form.getValues('customerFullName') != null &&
      //form.getValues('customerPhone') != null
    ) {
      setSearchBtnEnabled(true);

      if (form.getValues('priceList') != null && (selVehicle != null || selectedVehicle != null)) {
        setContinuaBtnEnabled(true);
      } else {
        setContinuaBtnEnabled(false);
      }
    } else {
      setSearchBtnEnabled(false);
      setContinuaBtnEnabled(false);
    }
  };

  const updateRange = async (data) => {
    try {
      const ranges = selectRange(days);
      const priceListToUse = activePriceLists.find((item) => item._id === selectedPriceList);
      setVatPercentage(priceListToUse?.configuration?.fares?.vatPercentage || 0);
      setSelectedRange(ranges.find((item) => item._id === data));
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const getFareForGroup = (group) => {
    if (prices.length > 0) {
      const price = prices.find((item) => item.group?.value === group?._id);
      const fare = price?.activeFare || '';
      return fare;
    } else {
      const fare = getFare(group);
      return fare?.fare;
    }
  };

  const saveReservation = async (data) => {
    try {
      if (!selectedVehicle._id) {
        toast.error('Selezionare un veicolo');
        return;
      }

      if (customDriver && !data.driverFullName) {
        toast.error('Inserire il nome del conducente');
        return;
      }

      if (!customDriver && !driver) {
        toast.error('Inserire conducente');
        return;
      }

      if (customDriver) {
        data.driver = undefined;
      } else {
        data.driver = driver._id;
        data.driverFullName = driver.name + ' ' + driver.surname;
        data.driverPhone = driver.phone;
      }

      if (customCustomer && !data.customerFullName) {
        toast.error('Inserire il nome del cliente');
        return;
      }

      if (!customCustomer && !customer && customerCompany === null) {
        toast.error('Inserire Cliente');
        return;
      }

      if (customCustomer) {
        data.customer = undefined;
      } else if (customer) {
        data.customer = customer._id;
        data.customerFullName = customer?.name + ' ' + customer?.surname;
        data.customerPhone = customer?.phone;
      } else {
        data.customerCompany = customerCompany._id;
        data.customerFullName = customerCompany?.ragioneSociale;
        data.customerPhone = customerCompany?.phone;
      }

      if (!customDriver && !customCustomer) {
        if (!checkUsers(customer, driver, null, data.dropOffDate, data.customerCompany)) return;
      }

      if (data.movementType === 'NOL' && !data.priceList) {
        toast.error('Selezionare un listino');
        return;
      }
      if (data.pickUpDate > data.dropOffDate) {
        toast.error('La data di ritiro deve essere successiva alla data di consegna');
        return;
      }

      let price = { amount: 0 };

      if (movementType !== 'NOL') {
        price.amount = 0;
      } else {
        price = {
          dailyAmount: fetchInitialAmount(getVehicleGroup(selectedVehicle).group) / days,
          amount: fetchInitialAmount(getVehicleGroup(selectedVehicle).group),
          discount: {
            amount: storedDiscountAmount,
            percentage: storedDiscountPercentage,
          },
          totalAmount: fetchPrice(getVehicleGroup(selectedVehicle).group),
        };

        if (price && price.amount === undefined) {
          toast.error('Tariffa non disponibile per il listino selezionato');
          return;
        }
      }

      const extraFieldsInput = data.extraFields?.map((extraField, index) => {
        return { name: extraFields[index].field, value: extraField };
      });

      const inputData = {
        workflow: data.workflow,
        movementType: data.movementType,
        group: getVehicleGroup(selectedVehicle).group?._id,
        pickUpLocation: data.pickUpLocation,
        pickUpDate: data.pickUpDate,
        dropOffLocation: data.dropOffLocation,
        dropOffDate: data.dropOffDate,
        vehicle: selectedVehicle._id,
        driver: data.driver,
        driverFullName: data.driverFullName,
        driverPhone: data.driverPhone,
        customer: data.customer,
        customerCompany: data.customerCompany,
        customerFullName: data.customerFullName,
        customerPhone: data.customerPhone,
        totalDays: countDays(data.pickUpDate, data.dropOffDate, rentBuffer),
        fare: getFareForGroup(getVehicleGroup(selectedVehicle).group)?._id,
        range: data.range,
        price,
        discountAmount: storedDiscountAmount,
        discountPercentage: storedDiscountPercentage,
        extraFields: extraFieldsInput,
        priceList: data.priceList,
        initiator: mode,
      };

      const response = await http({
        url: '/reservations',
        method: 'POST',
        form: inputData,
      });
      setReservationId(response.updatedReservation._id);
      setReservationCompleted(true);

      let userData = await userContext.getUserInfo();

      window.analytics.track({
        userId: userData?._id,
        event: 'Create Simple Reservation',
        properties: {
          plate: data?.vehicle?.plate,
          pickUpDate: data?.pickUpDate,
          dropOffDate: data?.dropOffDate,
          group: data?.group,
        },
      });

      toast.success('Prenotazione salvata');
      if (mode === 'corporate') {
        history.push(`/corporate/prenotazioni/${response.updatedReservation._id}`);
      } else {
        history.push(`/dashboard/prenotazioni/${response.updatedReservation._id}`);
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || err?.error || 'Errore');
    }
  };

  const validateDiscountAmount = (value) => {
    if (value < 0) {
      return 0;
    }

    if (value > administration?.faresDiscountMaxEuro) {
      return administration?.faresDiscountMaxEuro;
    }
    return value;
  };

  const validateDiscountPercentage = (value) => {
    if (value < 0) {
      return 0;
    }
    if (value > administration?.faresDiscountMaxPercentage) {
      return administration?.faresDiscountMaxPercentage;
    }
    return value;
  };

  const calculateFinalPrice = (group) => {
    const initialPrice = fetchPrice(group);
    if (!initialPrice) return undefined;
    const priceVat = initialPrice * (vatPercentage / 100);
    const subTotal = initialPrice + priceVat;

    const discountAmount = storedDiscountAmount || 0;
    const discountPercentage = storedDiscountPercentage || 0;

    if (discountAmount > 0) {
      const finalPrice = subTotal - discountAmount;
      return finalPrice;
    } else if (discountPercentage > 0) {
      const finalPrice = subTotal - subTotal * (discountPercentage / 100);
      return finalPrice;
    }
    return subTotal;
  };

  useEffect(() => {
    if (workflows?.length === 1) {
      form.setValue('workflow', workflows[0].value);
      // setSelectedWorkflow(workflows[0]);
      fetchWorkflowParams(workflows[0].value);
    }
  }, [workflows]);

  const fetchWorkflows = async () => {
    try {
      const response = await http({ url: '/workflow/active?initiator=' + mode });

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
    if (availableMovementTypes?.length === 1 && movementType === '') {
      form.setValue('movementType', availableMovementTypes[0]?.value);
    }
  }, [availableMovementTypes]);

  const availableFilteredRanges = ranges.filter((item) => item.from <= days && item.to >= days);

  useEffect(() => {
    if (availableFilteredRanges?.length > 0) {
      form.setValue('range', availableFilteredRanges[0]?._id);
      updateRange(availableFilteredRanges[0]?._id);
    }
  }, [days, ranges]);

  return (
    <Page canAccess={[CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR]} bodyClassName={'pb-4'}>
      <RouterPrompt
        when={isBlocking && !reservationCompleted}
        title="Sei sicuro di voler lasciare la pagina?"
        description="Le modifiche non salvate andranno perse"
        cancelText="Cancella"
        okText="Conferma"
        onOK={() => true}
        onCancel={() => false}
      />
      <CardsHeader
        title={pageTitle}
        buttons={[
          {
            btnStyle: 'lightSlateTransparent',
            children: '« Indietro',
            onClick: activeStep !== 2 ? () => history.goBack() : null,
            to:
              activeStep === 2
                ? mode === 'corporate'
                  ? `/corporate/prenotazioni/crea${searchString}`
                  : `/dashboard/prenotazioni/crea/avanzata${searchString}`
                : null,
          },
          {
            btnStyle: 'blue',
            children: 'Continua',
            disabled: !continuaBtnEnabled,
            hiddenIf: reservationCompleted,
            form: 'createReservation',
          },
          {
            btnStyle: 'blue',
            children: 'Vai alla Prenotazione',
            hiddenIf: !reservationCompleted,
            to: `/dashboard/prenotazioni/${reservationId}`,
          },
        ]}
      >
        <Stepper
          className="pr-[12rem]"
          colorScheme="orange"
          steps={[
            { content: '1', isCurrent: activeStep === 1 },
            { content: '2', isCurrent: activeStep === 2 },
          ]}
        />
      </CardsHeader>
      <GetAvailabilities />

      {searchDone === true && vehicles.length === 0 && (
        <WhiteBox className="mt-0 mx-6 overflow-visible">
          <div className="p-4 w-full">
            <div className="mt-5">
              <div className="flex justify-center mt-5">
                <div className="flex flex-col items-center">
                  <div className="text-2xl font-bold">Nessun veicolo disponibile</div>
                  <div className="text-gray-500">Cambia i parametri di ricerca</div>
                </div>
              </div>
            </div>
          </div>
        </WhiteBox>
      )}
      {vehicles.length > 0 && (
        <form onSubmit={form.handleSubmit(saveReservation)} id="createReservation">
          <WhiteBox className="mt-0 mx-6 overflow-visible">
            <h1 className="text-xl font-medium p-4 pb-0">Listino</h1>
            <div className="p-4 pt-3 w-full">
              <fieldset disabled={form.formState.isSubmitting}>
                <div className="flex flex-wrap gap-x-4">
                  <div className="flex-none w-96">
                    <FormLabel>Listino</FormLabel>
                    <SelectField
                      form={form}
                      name="priceList"
                      placeholder="Listino"
                      options={priceListsLabels}
                      onChangeFunction={(e) => {
                        updatePriceList();
                        checkFormIsDirty();
                      }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-x-4">
                    <div className="flex-none w-96">
                      {' '}
                      <FormLabel>
                        Fascia
                        {availableFilteredRanges.length > 0
                          ? `(${availableFilteredRanges.length} ${
                              availableFilteredRanges.length === 1 ? 'disponibile' : 'disponibili'
                            })`
                          : ''}
                      </FormLabel>
                      <SelectField
                        className="pr-2"
                        form={form}
                        name="range"
                        placeholder={selectedPriceList ? 'Fascia' : 'Seleziona un listino...'}
                        options={availableFilteredRanges.map((range) => ({
                          value: range._id,
                          label: range.name,
                        }))}
                        onChangeFunction={(e) => {
                          e.preventDefault();
                          updateRange(e.target.value);
                        }}
                        validation={{
                          required: { value: true, message: 'Seleziona una fascia' },
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex-initial">
                    {movementType === 'NOL' && isDiscountable && administration.faresDiscount && (
                      <div className="flex-initial mt-3">
                        <FormLabel>Sconto {isDiscountPercentage ? '(%)' : '(€)'} </FormLabel>
                        <div className="flex">
                          {isDiscountPercentage && (
                            <div className="w-64">
                              <TextInternal
                                className="pr-2"
                                form={form}
                                name="discountPercentage"
                                placeholder="Percentuale Sconto"
                                type="number"
                                min={0}
                                max={100}
                                validation={{
                                  min: {
                                    value: 0,
                                    message: 'Lo sconto deve avere un valore positivo',
                                  },
                                  max: {
                                    value: administration?.faresDiscountMaxPercentage
                                      ? administration?.faresDiscountMaxPercentage
                                      : 100,
                                    message: `Lo sconto per questo flusso non può superare il ${administration?.faresDiscountMaxPercentage}%`,
                                  },
                                }}
                                onChangeFunction={(e) => {
                                  setStoredDiscountPercentage(
                                    validateDiscountPercentage(
                                      form.getValues('discountPercentage'),
                                    ),
                                  );
                                  setStoredDiscountAmount(0);
                                }}
                              />
                            </div>
                          )}
                          {!isDiscountPercentage && (
                            <div className="w-64">
                              <TextInternal
                                className="pr-2"
                                form={form}
                                name="discountAmount"
                                placeholder="Sconto in Euro"
                                validation={{
                                  min: {
                                    value: 0,
                                    message: 'Lo sconto deve avere un valore positivo',
                                  },
                                  max: {
                                    value: administration?.faresDiscountMaxEuro
                                      ? administration?.faresDiscountMaxEuro
                                      : 100,
                                    message: `Lo sconto per questo flusso non può superare ${administration?.faresDiscountMaxEuro}€`,
                                  },
                                }}
                                type="number"
                                onChangeFunction={(e) => {
                                  setStoredDiscountAmount(
                                    validateDiscountAmount(form.getValues('discountAmount')),
                                  );
                                  setStoredDiscountPercentage(0);
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </fieldset>
            </div>
          </WhiteBox>

          <WhiteBox className="mt-0 mx-6 overflow-visible">
            <div className="p-4">
              <h1 className="text-xl font-medium mb-4">Veicoli</h1>
              <div className="bg-white rounded-lg shadow-lg">
                <div className="">
                  {/* Table */}

                  <div className="">
                    <table className="table-auto w-full">
                      {/* Table header */}
                      <thead className="text-xs font-semibold uppercase text-gray-500 bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap"></th>
                          <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                            <div className="font-semibold text-left">Targa</div>
                          </th>
                          <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                            <div className="font-semibold text-left">Km Attuali</div>
                          </th>
                          <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                            <div className="font-semibold text-left">Modello</div>
                          </th>
                          <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                            <div className="font-semibold text-left">Gruppo</div>
                          </th>

                          {movementType === 'NOL' && (
                            <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                              <div className="font-semibold text-left">Tariffa</div>
                            </th>
                          )}
                          <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                            <div className="font-semibold text-left">Giorni</div>
                          </th>
                          <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                            <div className="font-semibold text-left">Prezzo imponibile</div>
                          </th>
                          <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                            <div className="font-semibold text-left">Prezzo IVA inclusa</div>
                          </th>
                          <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                            <div className="font-semibold text-left">Sconto</div>
                          </th>
                          <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                            <div className="font-semibold text-left">Prezzo Finale</div>
                          </th>
                        </tr>
                      </thead>
                      {/* Table body */}
                      <tbody className="text-sm divide-y divide-gray-200">
                        {vehicles.map((vehicle, index) => (
                          <tr
                            key={index}
                            onClick={(e) => {
                              setSelectedVehicle(vehicle);
                              setSelectedVehicleIndex(index);
                              checkSearchBtnEnabled(true);
                            }}
                            className="hover:bg-gray-50 active:bg-gray-100 cursor-pointer"
                          >
                            <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                              <input
                                type="radio"
                                name="vehicle"
                                value={index}
                                checked={
                                  selectedVehicleIndex === index ||
                                  searchParams?.selectedVehicle === vehicle.plate
                                }
                                onInput={(e) => {
                                  setSelectedVehicle(vehicles[e.target.value]);
                                  checkSearchBtnEnabled(true);
                                }}
                              />
                            </td>
                            <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                              <p className="text-left font-semibold text-gray-600">
                                {vehicle.plate ? vehicle.plate.toUpperCase() : 'N/A'}
                              </p>
                            </td>
                            <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                              <p className="text-left font-semibold text-gray-600">{vehicle.km}</p>
                            </td>
                            <td className="first:pl-5 last:pr-5 py-1 flex items-center gap-2 whitespace-nowrap">
                              <div>
                                <img
                                  src={vehicle.imageUrl || vehicle?.version?.imageUrl}
                                  className="max-w-12"
                                />
                              </div>
                              <p className="text-left font-semibold text-gray-600 py-2">
                                {vehicle.brand?.brandName} {vehicle.model?.modelName}
                              </p>
                            </td>
                            <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                              <p className="text-left font-semibold text-gray-600">
                                {getVehicleGroup(vehicle).group?.mnemonic !== undefined}
                                {vehicle.version?.group?.mnemonic !== undefined
                                  ? `${getVehicleGroup(vehicle).group?.mnemonic} - ${
                                      getVehicleGroup(vehicle).group?.description
                                    }`
                                  : 'Nessun Gruppo'}
                              </p>
                            </td>
                            {movementType === 'NOL' && (
                              <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                                <p className="text-left font-semibold text-gray-600">
                                  {getFareForGroup(getVehicleGroup(vehicle).group)?.calculation ===
                                  'range' ? (
                                    <ElementLabel bgColor="bg-yellow-600">Fissa</ElementLabel>
                                  ) : getFareForGroup(getVehicleGroup(vehicle).group)
                                      ?.calculation === 'unit' ? (
                                    <ElementLabel>Giornaliera</ElementLabel>
                                  ) : (
                                    <ElementLabel>Non definita</ElementLabel>
                                  )}
                                </p>
                              </td>
                            )}
                            <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                              <p className="text-left font-semibold text-gray-600">{days}</p>
                            </td>

                            <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap w-60">
                              <p className="text-left font-semibold text-gray-600">
                                {fetchPrice(getVehicleGroup(vehicle).group) !== undefined
                                  ? convertPrice(fetchPrice(getVehicleGroup(vehicle).group))
                                  : 'N/A'}
                              </p>
                            </td>

                            <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap w-60">
                              <p className="text-left font-semibold text-gray-600">
                                {fetchPrice(getVehicleGroup(vehicle).group) !== undefined
                                  ? convertPrice(
                                      fetchPrice(getVehicleGroup(vehicle).group) *
                                        (1 + vatPercentage / 100),
                                    )
                                  : 'N/A'}
                              </p>
                            </td>

                            <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                              <p className="text-left font-semibold text-gray-600">
                                {storedDiscountAmount || storedDiscountPercentage
                                  ? storedDiscountAmount
                                    ? convertPrice(storedDiscountAmount)
                                    : `${storedDiscountPercentage}%`
                                  : 'N/A'}
                              </p>
                            </td>
                            <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                              <p className="text-left font-semibold text-gray-600">
                                {calculateFinalPrice(getVehicleGroup(vehicle).group) !== undefined
                                  ? convertPrice(
                                      calculateFinalPrice(getVehicleGroup(vehicle).group),
                                    )
                                  : 'N/A'}
                              </p>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </WhiteBox>
        </form>
      )}
    </Page>
  );
};

export default CreateReservationByGroup;
