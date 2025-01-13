import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../../store/UserContext';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Button from '../UI/buttons/Button';
import FormLabel from '../UI/FormLabel';
import { SelectField } from '../Form/SelectField';
import { TextField as TextInternal } from '../Form/TextField';
import { FaPlusCircle, FaMinusCircle, FaEraser } from 'react-icons/fa';
import { http } from '../../utils/Utils';
import UsersModal from '../Users/UsersModal';
import { checkUsers } from '../../utils/Users';
import { calculatePrice, convertPrice } from '../../utils/Prices';
import { countDays } from '../../utils/Utils';
import ModalConfirmDialog from '../UI/ModalConfirmDialog';
import moment from 'moment';
import UserCompaniesModal from '../UserCompanies/UserCompaniesModal';
import { updateWorkflowParams, fetchRentalLocations } from '../../utils/Workflow';
import { getVehicleGroup } from '../../utils/Vehicles';
import ElementLabel from '../../components/UI/ElementLabel';
import Table from '../UI/Table';
import useGroups from '../../hooks/useGroups';

const NewEventForm = ({
  eventData,
  dateTimeStart,
  dateTimeEnd,
  type,
  canOpenMovo,
  calendarFilters,
  onBackButton,
  onSave,
}) => {
  const form = useForm();
  const userContext = useContext(UserContext);
  const [rentalLocations, setRentalLocations] = useState([]);
  const [workflows, setWorkflows] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState(calendarFilters.selectedWorkflow);
  const [movementType, setMovementType] = useState('');
  const [isDiscountPercentage, setIsDiscountPercentage] = useState(true);
  const [priceLists, setPriceLists] = useState([]);
  const [ranges, setRanges] = useState([]);
  const [totalDays, setTotalDays] = useState(0);
  const [selectedPriceList, setSelectedPriceList] = useState(0);
  const [selectedRange, setSelectedRange] = useState(null);
  const [selectedFare, setSelectedFare] = useState(null);

  const [curPrice, setCurPrice] = useState(null);
  const [pickUpDate, setPickUpDate] = useState('');
  const [customDriver, setCustomDriver] = useState(true);
  const [customCustomer, setCustomCustomer] = useState(true);
  const [customClientConfirm, setCustomClientConfirm] = useState(false);
  const [customDriverConfirm, setCustomDriverConfirm] = useState(false);
  const [showCustomerCompanyModal, setShowCustomerCompanyModal] = useState(false);
  const [availableMovementTypes, setAvailableMovementTypes] = useState([]);
  const [activePriceLists, setActivePriceLists] = useState([]);

  const mode = window.location.pathname.split('/')[1];

  const [driver, setDriver] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [customerCompany, setCustomerCompany] = useState(null);
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showSecondDriverModal, setShowSecondDriverModal] = useState(false);
  const [storedDiscountAmount, setStoredDiscountAmount] = useState(0);
  // const [secondDriver, setSecondDriver] = useState('');

  const groups = useGroups();

  const getCorporateData = async () => {
    if (mode === 'corporate') {
      setCustomCustomer(false);

      let userData = userContext.data || {};
      setCustomerCompany(userContext?.user?.company);
      const userCompany = await http({ url: `/userCompanies/${userData?.userCompany}` });
      setCustomerCompany(userCompany);
      returnCustomerCompany(userCompany);
    }
  };

  const userData = userContext.data;
  const userCompany = userContext.data?.company;
  const companyName = userContext.data?.company?.name;
  const vatNumber = userContext.data?.company?.vatNumber;
  const licenseType = userData?.client?.license?.licenseOwner;

  useEffect(() => {
    getCorporateData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData, userCompany, companyName, vatNumber]);

  var selectedRentalId = eventData.rental?._id;

  const availableFilteredRanges = ranges.filter(
    (item) => item.from <= totalDays && item.to >= totalDays,
  );

  useEffect(() => {
    fetchWorkflows();

    const workflowId = calendarFilters.selectedWorkflow?._id;
    if (workflowId) {
      form.setValue('workflow', workflowId);
      setSelectedWorkflow(calendarFilters.selectedWorkflow);
      fetchWorkflowParams(workflowId);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (workflows?.length === 1) {
      form.setValue('workflow', workflows[0]._id);
      setSelectedWorkflow(workflows[0]);
      fetchWorkflowParams(workflows[0]._id);
    }
  }, [workflows]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchRentalLocations();
    fetchPriceLists();
    // fetchRanges();
    updateTotalDays();
  }, [selectedWorkflow]); // eslint-disable-line

  useEffect(() => {
    // Set default price list if only one is available
    if (priceLists.length === 1) {
      form.setValue('priceList', priceLists[0].value);
      setSelectedPriceList(priceLists.find((list) => list._id === priceLists[0].value));
    } else {
      form.setValue('priceList', null);
    }
  }, [priceLists]); // eslint-disable-line

  useEffect(() => {
    fetchRanges();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedWorkflow,
    selectedPriceList,
    movementType,
    totalDays,
    storedDiscountAmount,
    isDiscountPercentage,
  ]);

  useEffect(() => {
    fetchPrice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFare, selectedWorkflow, movementType]);

  if (selectedRentalId) {
    form.setValue('pickUpLocation', selectedRentalId);
    form.setValue('dropOffLocation', selectedRentalId);

    if (moment().isBefore(dateTimeStart)) {
      form.setValue('pickUpDate', dateTimeStart.format('YYYY-MM-DDTHH:mm'));
    }
    if (moment().isBefore(dateTimeEnd)) {
      form.setValue('dropOffDate', dateTimeEnd.format('YYYY-MM-DDTHH:mm'));
    }

    if (type === 'rent') {
      form.setValue('pickUpDate', moment().format().slice(0, 16));
    }
  }

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

  const fetchWorkflows = async () => {
    try {
      const response = await http({
        url: `/workflow/active?initiator=${mode}&rentalLocation=${selectedRentalId}`,
      });

      setWorkflows(
        response.workflows.map((workflow) => {
          return { value: workflow._id, label: workflow.name, ...workflow };
        }),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRanges = async () => {
    const priceList = activePriceLists.find((item) => item._id === selectedPriceList?._id);
    if (!priceList) return;

    const availRanges = [];
    priceList.fares.forEach((fare) => {
      if (!availRanges.find((r) => r._id === fare.range._id)) {
        availRanges.push(fare.range);
      }
    });

    setRanges(availRanges);
  };

  const fetchPriceLists = async () => {
    try {
      if (selectedWorkflow) {
        const priceLists = await http({
          url: `/pricing/priceLists/workflow/${selectedWorkflow._id}`,
        });

        setIsDiscountPercentage(selectedWorkflow?.administration?.faresDiscountMaxPercentage !== 0);

        setPriceLists(
          priceLists.map((priceList) => {
            return { value: priceList._id, label: priceList.name, ...priceList };
          }),
        );
        setActivePriceLists(priceLists);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPrice = async () => {
    if (!selectedPriceList?.fares?.length) return;
    const rangesResponse = (await http({ url: '/pricing/range' }))?.ranges;

    const range =
      selectedRange ||
      rangesResponse?.find((item) => item.from <= totalDays && item.to >= totalDays);

    const activePriceLists = await http({
      url: `/pricing/priceLists/workflow/${selectedWorkflow._id}`,
    });
    const priceList = activePriceLists.find((item) => item._id === selectedPriceList._id);
    /* const groupId = getVehicleGroup(eventData?.vehicle).group?._id;
    //eslint-disable-next-line
    const fare = priceList?.fares?.find((item) => {
      return item.group?._id === groupId && item.range?._id === range?._id;
    }); */

    const priceToStore = calculatePrice(
      movementType,
      selectedFare,
      totalDays,
      isDiscountPercentage ? storedDiscountAmount : 0,
      isDiscountPercentage ? 0 : storedDiscountAmount,
    );
    setCurPrice(priceToStore);
  };

  const getDepositForGroup = async (group) => {
    if (!group) return 0;

    const activePriceLists = await http({
      url: `/pricing/priceLists/workflow/${selectedWorkflow._id}`,
    });
    if (!selectedPriceList) return;
    if (!activePriceLists || activePriceLists.length === 0) return;
    const priceList = activePriceLists.find((item) => item._id === selectedPriceList);
    if (!priceList) return;
    if (!priceList?.deposits?.length) return;
    return priceList.deposits.find((item) => item?.group?._id === group?._id)?.amount || 0;
  };

  const selectRange = (days) => {
    const validRanges = ranges.filter((item) => {
      return item.from <= days && item.to >= days;
    });
    return validRanges;
  };

  const onSubmit = async (data) => {
    try {
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

      if (!customCustomer && !customer && customerCompany === undefined) {
        toast.error('Inserire Cliente');
        return;
      }

      if (customCustomer) {
        data.customer = undefined;
      } else if (customer) {
        data.customer = customer._id;
        data.customerFullName = customer.name + ' ' + customer.surname;
        data.customerPhone = customer.phone;
      } else {
        data.customerCompany = customerCompany._id;
        data.customerFullName = customerCompany?.ragioneSociale;
        data.customerPhone = customerCompany?.phone;
      }

      if (!customCustomer && !customDriver) {
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

      /*const extraFieldsInput = data.extraFields?.map((extraField, index) => {
        return { name: extraFields[index].field, value: extraField };
      });*/
      let price = { amount: 0 };

      if (type === 'reservation') {
        if (data.movementType !== 'NOL') {
          price.amount = 0;
        } else {
          price = {
            dailyAmount: curPrice / totalDays,
            amount: curPrice,
            discount: {
              amount: isDiscountPercentage ? 0 : storedDiscountAmount,
              percentage: isDiscountPercentage ? storedDiscountAmount : 0,
            },
          };

          if (price && price.amount === undefined) {
            toast.error('Tariffa non disponibile per il listino selezionato');
            return;
          }
        }

        const inputData = {
          workflow: data.workflow,
          movementType: data.movementType,
          group: vehicleGroup,
          pickUpLocation: data.pickUpLocation,
          pickUpDate: data.pickUpDate,
          dropOffLocation: data.dropOffLocation,
          dropOffDate: data.dropOffDate,
          vehicle: eventData.vehicle._id,
          driver: data.driver,
          driverFullName: data.driverFullName,
          driverPhone: data.driverPhone,
          customer: data.customer,
          customerCompany: data.customerCompany,
          customerFullName: data.customerFullName,
          customerPhone: data.customerPhone,
          totalDays: totalDays,
          fare: selectedFare,
          range: selectedRange,
          price,
          discountAmount: isDiscountPercentage ? 0 : storedDiscountAmount,
          discountPercentage: isDiscountPercentage ? storedDiscountAmount : 0,
          //extraFields: extraFieldsInput,
          priceList: data.priceList,
        };

        const response = await http({
          url: '/reservations',
          method: 'POST',
          form: inputData,
        });

        const removeData = {
          vehicle: eventData.vehicle._id,
          rentalLocation: eventData.rental?._id,
          plate: eventData.vehicle.plate,
        };

        await http({
          url: `/vehicles/vehiclelock/remove`,
          method: 'PUT',
          form: removeData,
        });

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
        onSave(response, type);
      }

      if (type === 'rent') {
        if (movementType !== 'NOL') {
          price.amount = 0;
          price.initialAmount = 0;
          price.dailyAmount = 0;
          price.totalAmount = 0;
        } else {
          price = {
            dailyAmount: curPrice / totalDays,
            initialAmount: curPrice,
            discount: {
              amount: isDiscountPercentage ? 0 : storedDiscountAmount,
              percentage: isDiscountPercentage ? storedDiscountAmount : 0,
            },
            amount: curPrice,
            totalAmount: curPrice,
            deposit: await getDepositForGroup(vehicleGroup),
          };

          if (price && price.amount === undefined) {
            toast.error('Tariffa non disponibile per il listino selezionato', {
              duration: 5000,
            });
            return;
          }
        }

        const inputData = {
          driver: data.driver,
          secondDriver: data.secondDriver,
          customer: data.customer,
          customerCompany: data.customerCompany,
          workflow: data.workflow,
          movementType: data.movementType,
          group: vehicleGroup,
          pickUpLocation: data.pickUpLocation,
          pickUpDate: data.pickUpDate,
          priceList: selectedPriceList,
          fare: selectedFare,
          dropOffLocation: data.dropOffLocation,
          dropOffDate: data.dropOffDate,
          vehicle: eventData.vehicle._id,
          totalDays: totalDays,
          price,
          discountAmount: isDiscountPercentage ? 0 : storedDiscountAmount,
          discountPercentage: isDiscountPercentage ? storedDiscountAmount : 0,
          reservation: data.reservationId,
        };

        const response = await http({
          url: '/rents',
          method: 'POST',
          form: inputData,
        });

        const removeData = {
          vehicle: eventData.vehicle._id,
          rentalLocation: eventData.rental?._id,
          plate: eventData.vehicle.plate,
        };

        await http({
          url: `/vehicles/vehiclelock/remove`,
          method: 'PUT',
          form: removeData,
        });

        let userData = await userContext.getUserInfo();

        window.analytics.track({
          userId: userData?._id,
          event: 'Create Rent',
          properties: {
            plate: data?.vehicle?.plate,
            pickUpDate: data?.pickUpDate,
            dropOffDate: data?.dropOffDate,
            group: data?.group,
          },
        });

        toast.success('Movo creato correttamente');
        onSave(response, type);
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.error || 'Errore');
    }
  };

  const faresDiscount = selectedWorkflow?.administration?.faresDiscount
    ? {
      maxPercentage: selectedWorkflow?.administration?.faresDiscountMaxPercentage,
      maxEuro: selectedWorkflow?.administration?.faresDiscountMaxEuro,
    }
    : null;

  const assignedGroup = form.watch('assignedGroup') ? 
    form.watch('assignedGroup') : null;

  const realGroup = getVehicleGroup(eventData?.vehicle).group?._id;

  const vehicleGroup = assignedGroup || realGroup;

  const updateTotalDays = () => {
    const rentBuffer = selectedWorkflow?.configuration?.rentBuffer;

    setTotalDays(
      countDays(form.getValues('pickUpDate'), form.getValues('dropOffDate'), rentBuffer || 0),
    );
  };

  const searchBtnEnabled = () => {
    return true;
  };

  const openUserCompaniesModal = async (userCompanyId = true) => {
    setShowCustomerModal(false);
    setShowCustomerCompanyModal(userCompanyId);
  };

  const returnDriver = async (driver) => {
    setCustomDriver(false);
    form.setValue('driverFullName', driver.name + ' ' + driver.surname);
    form.setValue('driverPhone', driver.phone);
    setDriver(driver);
    setShowDriverModal(false);
  };

  const returnSecondDriver = (secondDriver) => {
    form.setValue('secondDriverFullName', secondDriver?.name + ' ' + secondDriver?.surname);
    form.setValue('secondDriver', secondDriver);
    // setSecondDriver(secondDriver);
    setShowSecondDriverModal(false);
  };

  const returnCustomer = async (customer) => {
    setCustomCustomer(false);
    form.setValue('customerFullName', customer?.name + ' ' + customer?.surname);
    form.setValue('customerPhone', customer?.phone);
    setCustomer(customer);
    setShowCustomerModal(false);
  };

  const returnCustomerCompany = async (customerCompany) => {
    setCustomCustomer(false);
    form.setValue('customerFullName', customerCompany?.ragioneSociale);
    form.setValue('customerPhone', customerCompany?.phone);
    setCustomerCompany(customerCompany);
    setShowCustomerModal(false);
  };

  const updatePriceList = async (data) => {
    try {
      const priceList = activePriceLists.find((item) => item._id === form.getValues('priceList'));
      if (!priceList) {
        return;
      }
      setSelectedPriceList(priceList);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const updateRange = async (data) => {
    try {
      const ranges = selectRange(totalDays);
      const rangeIdentified = ranges.find((item) => item._id === data);
      setSelectedRange(rangeIdentified);

      retrieveFare(selectedPriceList, rangeIdentified);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const retrieveFare = (priceList, range, group = null) => {
    if (!priceList.fares) return;

    try {
      const fare = priceList.fares.find((item) => {
        return (
          item?.group?._id === (group || vehicleGroup) &&
          item?.range?._id === range?._id
        );
      })?.fare;
      setSelectedFare(fare);

      return fare;
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  useEffect(() => {
    if (availableMovementTypes?.length === 1 && movementType === '') {
      form.setValue('movementType', availableMovementTypes[0]?.value);
      setMovementType(availableMovementTypes[0]?.value);
    }
  }, [availableMovementTypes]);

  useEffect(() => {
    if (availableFilteredRanges?.length > 0) {
      form.setValue('range', availableFilteredRanges[0]?._id);
      updateRange(availableFilteredRanges[0]?._id);
    }
  }, [ranges, selectedPriceList]);

  const calculateVatPrice = (initialPrice) =>
    initialPrice * (1 + (selectedPriceList?.configuration?.fares?.vatPercentage || 0) / 100) ||
    null;

  const calculateFinalPrice = (initialPrice) => {
    const vatPrice = calculateVatPrice(initialPrice);
    const discountAmount = isDiscountPercentage
      ? vatPrice * (storedDiscountAmount / 100)
      : storedDiscountAmount;

    if (discountAmount > 0) {
      return vatPrice - discountAmount;
    }

    return vatPrice;
  };

  return (
    <>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <fieldset disabled={form.formState.isSubmitting} className="min-w-0">
          <div className="flex flex-wrap md:gap-4">
            <div className="flex flex-col w-full md:w-64">
              <FormLabel>Flusso</FormLabel>
              <SelectField
                form={form}
                name="workflow"
                placeholder="Seleziona flusso..."
                options={workflows}
                disabled={calendarFilters.selectedWorkflow?._id}
                validation={{
                  required: { value: true, message: 'Seleziona il flusso' },
                }}
                onChangeFunction={(e) => {
                  e.preventDefault();
                  setSelectedWorkflow(workflows.find((elm) => elm.value === e.target.value));
                  fetchWorkflowParams(e.target.value);
                  selectedRentalId = null;
                }}
              />
              <FormLabel>Tipo movimento</FormLabel>
              <SelectField
                form={form}
                name="movementType"
                placeholder="Seleziona tipo movimento..."
                options={availableMovementTypes}
                validation={{
                  required: { value: true, message: 'Seleziona il tipo di movimento' },
                }}
                onChangeFunction={(e) => {
                  e.preventDefault();
                  setMovementType(e.target.value);
                }}
              />
            </div>
            <div className="flex flex-col w-full md:w-64">
              <FormLabel>Luogo Consegna</FormLabel>
              <SelectField
                form={form}
                name="pickUpLocation"
                placeholder="Luogo consegna..."
                disabled={true} //{selectedRentalId}
                options={rentalLocations.map((rentalLocation) => {
                  return { label: rentalLocation.name, value: rentalLocation._id };
                })}
                validation={{
                  required: { value: true, message: 'Inserisci luogo Consegna' },
                }}
                onChangeFunction={(e) => {
                  e.preventDefault();
                }}
              />
              <FormLabel>Consegna</FormLabel>
              <TextInternal
                form={form}
                name="pickUpDate"
                type="datetime-local"
                placeholder="Consegna"
                min={moment().format('YYYY-MM-DDTHH:mm')}
                disabled={type === 'rent'}
                onChangeFunction={(e) => {
                  e.preventDefault();
                  setPickUpDate(e.target.value);
                }}
                validation={{
                  required: { value: true, message: 'Inserisci data consegna' },
                }}
              />
            </div>
            <div className="flex flex-col w-full md:w-64">
              <FormLabel>Luogo Ritiro</FormLabel>
              <SelectField
                form={form}
                name="dropOffLocation"
                placeholder="Luogo ritiro..."
                options={rentalLocations.map((rentalLocation) => {
                  return { label: rentalLocation.name, value: rentalLocation._id };
                })}
                validation={{
                  required: { value: true, message: 'Inserisci luogo Ritiro' },
                }}
                onChangeFunction={(e) => {
                  e.preventDefault();
                  updateTotalDays();
                }}
              />
              <FormLabel>Ritiro</FormLabel>
              <TextInternal
                form={form}
                name="dropOffDate"
                type="datetime-local"
                min={pickUpDate}
                placeholder="Data arrivo"
                validation={{
                  required: { value: true, message: 'Inserisci data di ritiro' },
                }}
                onChangeFunction={(e) => {
                  e.preventDefault();
                  updateTotalDays();
                }}
              />
            </div>
          </div>

          <div className="flex flex-wrap md:gap-4">
            <div className="flex pt-2 w-full md:w-auto">
              <div
                className="flex-1 md:flex-none md:w-64 pr-2"
                onClick={() => {
                  if (!customDriver && type === 'reservation') setCustomDriverConfirm(true);
                }}
              >
                <FormLabel>
                  Conducente{' '}
                  {type === 'reservation' && customDriver === false && (
                    <FaEraser
                      className="inline cursor-pointer"
                      title="Inserisci altro conducente"
                    />
                  )}
                </FormLabel>
                <TextInternal
                  form={form}
                  name="driverFullName"
                  placeholder="Conducente"
                  disabled={customDriver === false || type === 'rent'}
                  validation={{
                    required: { value: true, message: 'Seleziona un conducente' },
                  }}
                />
                <FormLabel>Telefono conducente</FormLabel>
                <TextInternal
                  form={form}
                  name="driverPhone"
                  placeholder="Telefono"
                  disabled={customDriver === false || type === 'rent'}
                />
              </div>
              <div className="flex-none w-auto">
                <FormLabel>&nbsp;</FormLabel>
                <Button
                  btnStyle="white"
                  className="py-2 px-2 mt-[-1px]"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowDriverModal(true);
                  }}
                >
                  <FaPlusCircle className="text-black text-xl" />
                </Button>
              </div>
            </div>
            <div className="flex pt-2 w-full md:w-auto">
              <div
                className="flex-1 md:flex-none md:w-64 pr-2"
                onClick={() => {
                  if (!customCustomer && type === 'reservation' && mode !== 'corporate')
                    setCustomClientConfirm(true);
                }}
              >
                <FormLabel>
                  Cliente{' '}
                  {type === 'reservation' && mode !== 'corporate' && customCustomer === false && (
                    <FaEraser className="inline cursor-pointer" title="Inserisci altro cliente" />
                  )}
                </FormLabel>
                <TextInternal
                  form={form}
                  name="customerFullName"
                  placeholder="Cliente"
                  disabled={customCustomer === false || type === 'rent'}
                  validation={{
                    required: { value: true, message: 'Seleziona un cliente' },
                  }}
                />
                <FormLabel>Telefono cliente</FormLabel>
                <TextInternal
                  form={form}
                  name="customerPhone"
                  placeholder="Telefono"
                  disabled={customCustomer === false || type === 'rent'}
                />
              </div>
              <div className="flex-none">
                {mode !== 'corporate' ? (
                  <>
                    <FormLabel>&nbsp;</FormLabel>
                    <Button
                      btnStyle="white"
                      className="py-2 px-2 mt-[-1px]"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowCustomerModal(true);
                      }}
                    >
                      <FaPlusCircle className="text-black text-xl" />
                    </Button>
                  </>
                ) : null}
              </div>
            </div>
          </div>

          {type === 'rent' && driver && (
            <div className="flex pt-2 w-full md:w-auto">
              <div className="flex-1 md:flex-none md:w-64 pr-2">
                <FormLabel>Secondo Conducente</FormLabel>
                <TextInternal
                  form={form}
                  name="secondDriverFullName"
                  placeholder="Secondo Conducente"
                  disabled={true}
                />
              </div>
              <div className="flex-none pr-1">
                <FormLabel>&nbsp;</FormLabel>
                <Button
                  btnStyle="white"
                  className="py-2 px-2 mt-[-1px]"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowSecondDriverModal(true);
                  }}
                >
                  <FaPlusCircle className="text-black text-xl" />
                </Button>
              </div>
              <div className="flex-none pr-1">
                <FormLabel>&nbsp;</FormLabel>
                <Button
                  btnStyle="white"
                  className="py-2 px-2 mt-[-1px]"
                  onClick={(e) => {
                    e.preventDefault();
                    // setSecondDriver(null);
                    form.setValue('secondDriverFullName', '');
                    form.setValue('secondDriver', undefined);
                  }}
                >
                  <FaMinusCircle className="text-black text-xl" />
                </Button>
              </div>
            </div>
          )}

          {selectedWorkflow && (
            <div className="flex flex-wrap gap-x-4">
              <SelectField
                form={form}
                className="flex-none w-full md:w-64"
                label="Listino"
                name="priceList"
                placeholder="Seleziona listino..."
                options={priceLists}
                onChangeFunction={(e) => {
                  e.preventDefault();
                  updatePriceList();
                }}
              />
              {selectedPriceList ?
                <SelectField
                  form={form}
                  className="flex-none w-full md:w-36"
                  name="range"
                  label={`Fascia ${availableFilteredRanges.length > 0
                    ? `(${availableFilteredRanges.length} ${availableFilteredRanges.length === 1 ? 'disponibile' : 'disponibili'})` : ''}`}
                  placeholder={selectedPriceList ? 'Fascia' : '...'}
                  options={availableFilteredRanges.map(range => ({ value: range._id, label: range.name }))}
                  onChangeFunction={(e) => {
                    e.preventDefault();
                    updateRange(e.target.value);
                  }}
                />
                : null}
              {form.getValues('priceList') !== undefined &&
                form.getValues('range') !== undefined &&
                licenseType !== 'movolab' && (
                  <SelectField
                    className="flex-none w-full md:w-60"
                    form={form}
                    name="assignedGroup"
                    label="Gruppo Assegnato"
                    placeholder="Seleziona gruppo"
                    options={[
                      { value: '', label: 'Seleziona un gruppo' },
                      ...groups.map((group) => ({ value: group.value, label: group.label })),
                    ]}
                    onChangeFunction={(e) => {
                      retrieveFare(selectedPriceList, selectedRange, e.target.value || realGroup);
                    }}
                  />
                )}
              <div className="w-full md:w-auto">
                {faresDiscount && movementType === 'NOL' ? (
                  <>
                    <FormLabel>Sconto {isDiscountPercentage ? '(%)' : '(€)'}</FormLabel>

                    <div className="flex">
                      <div className="flex-1 md:w-36 md:flex-initial">
                        {isDiscountPercentage ? (
                          <TextInternal
                            form={form}
                            name="discountPercentage"
                            placeholder="Percentuale Sconto"
                            type="number"
                            min={0}
                            max={faresDiscount.maxPercentage}
                            validation={{
                              min: { value: 0, message: 'Percentuale Sconto' },
                              max: {
                                value: faresDiscount.maxPercentage,
                                message: `Sconto percentuale massimo ${faresDiscount.maxPercentage}%`,
                              },
                            }}
                            onChangeFunction={(e) => {
                              setStoredDiscountAmount(form.getValues('discountPercentage'));
                            }}
                          />
                        ) : (
                          <TextInternal
                            form={form}
                            name="discountAmount"
                            placeholder="Sconto in Euro"
                            min={0}
                            max={faresDiscount.maxEuro}
                            validation={{
                              min: { value: 0, message: 'Sconto in Euro' },
                              max: {
                                value: faresDiscount.maxEuro,
                                message: `Sconto in Euro massimo ${faresDiscount.maxEuro}`,
                              },
                            }}
                            type="number"
                            onChangeFunction={(e) => {
                              setStoredDiscountAmount(form.getValues('discountAmount'));
                            }}
                          />
                        )}
                      </div>
                      {/* <div className="flex-none">
                        <ToggleSwitch
                          className="mt-[3px] ml-2"
                          switches={[
                            {
                              label: '%',
                              onClick: (e) => {
                                setIsDiscountPercentage(true);
                              },
                            },
                            {
                              label: '€',
                              onClick: (e) => {
                                setIsDiscountPercentage(false);
                              },
                            },
                          ]}
                        />
                      </div> */}
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          )}

          {selectedPriceList && movementType ? (
            <>
              <h3 className="text-md font-semibold mt-4 mb-2">Riepilogo</h3>

              <Table
                header={[
                  'Veicolo',
                  'Targa',
                  'Km Attuali',
                  'Giorni',
                  movementType === 'NOL' ? 'Tariffa' : '',
                  'Costo',
                  'Iva Incl',
                  storedDiscountAmount > 0 ? 'Sconto' : '',
                  'Prezzo Finale',
                ]}
                headClassName="text-gray-500 bg-gray-50 border-gray-200"
                customTable
              >
                <tr className="whitespace-nowrap">
                  <td className="py-3 pl-4 pr-2">
                    <p>{eventData.vehicle.brand.brandName} {eventData.vehicle.model.modelName}</p>

                    <p className="text-left font-semibold text-gray-600">
                      {eventData.vehicle?.version?.group !== undefined
                        ? `${getVehicleGroup(eventData.vehicle)?.group?.mnemonic} - ${getVehicleGroup(eventData.vehicle)?.group?.description}`
                        : 'Nessun Gruppo'}
                    </p>
                    {assignedGroup && (
                      <p className="text-left text-xs font-semibold text-gray-600">
                        Assegnato:{' '}
                        {groups.find((group) => group.value === assignedGroup)?.label ||
                          'Nessun Gruppo'}
                      </p>
                    )}
                  </td>
                  <td className="py-3 pr-2">{eventData?.vehicle?.plate.toUpperCase()}</td>
                  <td className="py-3 pr-2">{eventData.vehicle.km} km</td>
                  <td className="py-3 pr-2">{totalDays}</td>
                  <td className="py-3 pr-2">
                    {movementType === 'NOL' && (
                      <p className="text-left font-semibold text-gray-600">
                        {selectedFare?.calculation === 'range' ? (
                          <ElementLabel bgColor="bg-yellow-600">Fissa</ElementLabel>
                        ) : selectedFare?.calculation === 'unit' ? (
                          <ElementLabel>Giornaliera</ElementLabel>
                        ) : (
                          <ElementLabel>Non definita</ElementLabel>
                        )}
                      </p>
                    )}
                  </td>
                  <td className="py-3 pr-2">
                    {curPrice || curPrice === 0 ? convertPrice(curPrice) : 'N/A'}
                  </td>
                  <td className="py-3 pr-2">
                    {curPrice || curPrice === 0 ? convertPrice(calculateVatPrice(curPrice)) : 'N/A'}
                  </td>
                  <td className="py-3 pr-2">
                    {storedDiscountAmount > 0
                      ? isDiscountPercentage
                        ? storedDiscountAmount + '%'
                        : convertPrice(storedDiscountAmount)
                      : ''}
                  </td>
                  <td className="py-3 pr-2">
                    {curPrice || curPrice === 0
                      ? convertPrice(calculateFinalPrice(curPrice))
                      : 'N/A'}
                  </td>
                </tr>
              </Table>
            </>
          ) : (
            ''
          )}

          <div className="mt-2 flex justify-end">
            {canOpenMovo ? (
              <Button
                type="button"
                btnStyle="white"
                className="!py-1 text-red-500"
                onClick={onBackButton}
              >
                Indietro
              </Button>
            ) : (
              ''
            )}
            <Button type="submit" btnStyle="white" className="!py-1" disabled={!searchBtnEnabled()}>
              Continua
            </Button>
          </div>
        </fieldset>
      </form>

      {showDriverModal ? (
        <UsersModal
          inputType={'driver'}
          closeModal={() => setShowDriverModal(false)}
          returnUser={returnDriver}
        />
      ) : null}
      {showCustomerModal ? (
        <UsersModal
          inputType={'customer'}
          closeModal={() => setShowCustomerModal(false)}
          returnUser={returnCustomer}
          returnUserCompany={returnCustomerCompany}
          openUserCompaniesModal={openUserCompaniesModal}
        />
      ) : null}
      {showSecondDriverModal ? (
        <UsersModal
          inputType={'secondDriver'}
          closeModal={() => setShowSecondDriverModal(false)}
          returnUser={returnSecondDriver}
          excludeUser={driver._id}
          workflow={form.getValues('workflow')}
        />
      ) : null}
      {showCustomerCompanyModal ? (
        <UserCompaniesModal
          mode={showCustomerCompanyModal === true ? 'add' : 'edit'}
          userCompanyId={showCustomerCompanyModal === true ? null : showCustomerCompanyModal}
          inputType={'customerCompany'}
          closeModal={() => setShowCustomerCompanyModal(false)}
          returnUserCompany={returnCustomerCompany}
        />
      ) : null}
      <ModalConfirmDialog
        headerChildren="Modifica cliente"
        title="&Egrave; già stato selezionato un cliente"
        description="Vuoi inserire invece un nome cliente arbitrario?"
        okText="Si, modifica"
        isVisible={customClientConfirm}
        handleOk={() => {
          setCustomCustomer(true);
          setCustomClientConfirm(false);
        }}
        handleCancel={() => {
          setCustomClientConfirm(false);
        }}
      />
      <ModalConfirmDialog
        headerChildren="Modifica conducente"
        title="&Egrave; già stato selezionato un conducente"
        description="Vuoi inserire invece un nome conducente arbitrario?"
        okText="Si, modifica"
        isVisible={customDriverConfirm}
        handleOk={() => {
          setCustomDriver(true);
          setCustomDriverConfirm(false);
        }}
        handleCancel={() => {
          setCustomDriverConfirm(false);
        }}
      />
    </>
  );
};

export default NewEventForm;
