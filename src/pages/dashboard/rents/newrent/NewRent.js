import React, { useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import moment from 'moment';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import Page from '../../../../components/Dashboard/Page';
import { http } from '../../../../utils/Utils';
import { CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR } from '../../../../utils/Utils';
import { useForm } from 'react-hook-form';
import useGroups from '../../../../hooks/useGroups';
import useFetchRent from '../../../../hooks/useFetchRent';

import { TextField as TextInternal } from '../../../../components/Form/TextField';
import { SelectField } from '../../../../components/Form/SelectField';
import UsersModal from '../../../../components/Users/UsersModal';
import UserCompaniesModal from '../../../../components/UserCompanies/UserCompaniesModal';
import LoadReservationModal from '../../../../components/Reservations/LoadReservationModal';
import { UserContext } from '../../../../store/UserContext';

import FormLabel from '../../../../components/UI/FormLabel';
import Button from '../../../../components/UI/buttons/Button';
import { RouterPrompt } from '../../../../components/UI/RouterPrompt';
import ElementLabel from '../../../../components/UI/ElementLabel';
import { Link } from 'react-router-dom';

import { getVehicleGroup } from '../../../../utils/Vehicles';
import { countDays } from '../../../../utils/Utils';
import { calculateBasePrice, calculatePrice, convertPrice } from '../../../../utils/Prices';
import { checkUsers } from '../../../../utils/Users';
import { updateWorkflowParams, fetchRentalLocations } from '../../../../utils/Workflow';
import { FaPlusCircle, FaMinusCircle } from 'react-icons/fa';
import GroupsSelector from '../../../../components/UI/GroupsSelector';
import WhiteBox from '../../../../components/UI/WhiteBox';
import CardsHeader from '../../../../components/UI/CardsHeader';
import Stepper from '../../../../components/UI/Stepper';

const NewRent = () => {
  const history = useHistory();
  const params = useParams();
  const form = useForm();
  const userContext = useContext(UserContext);

  const [showDriverModal, setShowDriverModal] = useState(false);
  const [showSecondDriverModal, setShowSecondDriverModal] = useState(false);
  const [showLoadReservationModal, setShowLoadReservationModal] = useState(false);

  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showCustomerCompanyModal, setShowCustomerCompanyModal] = useState(false);
  const [pickUpDate, setPickUpDate] = useState();
  const [dropOffDate, setDropOffDate] = useState();

  const [vehicles, setVehicles] = useState([]);
  const [reservationVehicle, setReservationVehicle] = useState(null); //eslint-disable-line
  const [searchDone, setSearchDone] = useState(false);
  const [vatPercentage, setVatPercentage] = useState(0);

  const [driverFullName, setDriverFullName] = useState('');
  const [secondDriverFullName, setSecondDriverFullName] = useState(''); //eslint-disable-line
  const [customerFullName, setCustomerFullName] = useState(''); //eslint-disable-line
  const [showSecondDriver, setShowSeconDriver] = useState(false);
  const [driverId, setDriverId] = useState('');
  const [secondDriverId, setSecondDriverId] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState({});
  const [assignedGroup, setAssignedGroup] = useState(null);

  const [workflows, setWorkflows] = useState([]);
  const [rentalLocations, setRentalLocations] = useState([]);
  const [reservation, setReservation] = useState(null);
  const [fares, setFares] = useState([]); //eslint-disable-line
  const [ranges, setRanges] = useState([]);
  const [selectedRange, setSelectedRange] = useState(null);
  const [rentBuffer, setRentBuffer] = useState(0);
  const [administration, setAdministration] = useState({});
  const [days, setDays] = useState(0);
  const [movementType, setMovementType] = useState('');
  const [priceListsLabels, setPriceListsLabels] = useState([]);
  const [activePriceLists, setActivePriceLists] = useState([]);
  const [isDiscountable, setIsDiscountable] = useState(false);
  const [isDiscountPercentage, setIsDiscountPercentage] = useState(null);
  const [selectedPriceList, setSelectedPriceList] = useState(null);
  const [storedDiscountAmount, setStoredDiscountAmount] = useState(0);
  const [storedDiscountPercentage, setStoredDiscountPercentage] = useState(0);
  const [selectedFare, setSelectedFare] = useState(undefined); //eslint-disable-line
  const [availableMovementTypes, setAvailableMovementTypes] = useState([]);
  const [rentCompleted, setRentCompleted] = useState(false);
  const [rentId, setRentId] = useState(null);
  const [prices, setPrices] = useState([]); //eslint-disable-line
  const [showCustomerMissingMessage, setShowCustomerMissingMessage] = useState(false);
  const [showDriverMissingMessage, setShowDriverMissingMessage] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);
  const [continuaBtnEnabled, setContinuaBtnEnabled] = useState(false);
  const [searchBtnEnabled, setSearchBtnEnabled] = useState(false);
  const [selectedVehicleIndex, setSelectedVehicleIndex] = useState(-1);

  const groups = useGroups();

  const search = useLocation().search;
  const reservationId = new URLSearchParams(search).get('prenotazione');

  const rentData = useFetchRent(params.id);

  let userData = userContext.data || {};
  const licenseType = userData?.client?.license?.licenseOwner;

  useEffect(() => {
    getRentData();
  }, [rentData]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Imposta il pricelist di default se ce n'è solo uno
    if (priceListsLabels.length === 1) {
      form.setValue('priceList', priceListsLabels[0].value);
    } else {
      form.setValue('priceList', null);
    }
    updatePriceList();
  }, [priceListsLabels]); // eslint-disable-line

  const getRentData = async () => {
    try {
      if (params.id) {
        fillRentData(rentData, 'rent');
      } else {
        form.setValue('pickUpDate', moment().format().slice(0, 16));
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const fillRentData = async (data, source) => {
    try {
      if (!data._id) return;
      if (data.workflow?._id !== undefined) {
        if (!workflows.some((workflow) => workflow.value === data.workflow)) {
          //get workflow
          const workflowResponse = await http({ url: `/workflow/${data.workflow._id}` });
          setWorkflows([
            ...workflows,
            { value: workflowResponse?._id, label: workflowResponse?.name },
          ]);
        }
        form.setValue('workflow', data.workflow?._id);
      } else {
        form.setValue('workflow', data.workflow);
      }
      form.setValue('movementType', data.movementType);
      setMovementType(data.movementType);
      if (data.pickUpLocation?._id !== undefined) {
        form.setValue('pickUpLocation', data.pickUpLocation?._id);
      } else {
        form.setValue('pickUpLocation', data.pickUpLocation);
      }
      if (source === 'reservation') {
        form.setValue('pickUpDate', moment().format().slice(0, 16));
        setPickUpDate(moment().format('YYYY-MM-DDTHH:mm'));
        setDays(countDays(data.pickUpDate, data.dropOffDate, rentBuffer));
      } else {
        form.setValue('pickUpDate', moment(data.pickUpDate).format().slice(0, 16));
        setPickUpDate(moment(data.pickUpDate).format('YYYY-MM-DDTHH:mm'));
        setDays(data.totalDays);
      }
      if (data.dropOffLocation?._id !== undefined) {
        form.setValue('dropOffLocation', data.dropOffLocation?._id);
      } else {
        form.setValue('dropOffLocation', data.dropOffLocation);
      }

      form.setValue('dropOffDate', moment(data.dropOffDate).format().slice(0, 16));

      form.setValue('group', [
        {
          value: data.group?._id,
          label: `${data.group?.mnemonic} - ${data.group?.description}`,
        },
      ]);

      if (data.customer !== undefined) {
        form.setValue('customer', data?.customer);
        form.setValue('customerFullName', data.customer?.name + ' ' + data.customer?.surname);
      } else if (data.customerCompany !== undefined) {
        form.setValue('customerCompany', data?.customerCompany);
        form.setValue('customerFullName', data?.customerCompany?.ragioneSociale);
      } else {
        if (!source || source === 'reservation') {
          setShowCustomerMissingMessage(true);
        }
      }

      if (data.driver !== undefined) {
        form.setValue('driver', data.driver);
        form.setValue('driverFullName', data.driver?.name + ' ' + data.driver?.surname);
      } else {
        if (!source || source === 'reservation') {
          setShowDriverMissingMessage(true);
        }
      }

      if (reservationId === null || reservationId === undefined) {
        if (data.secondDriver !== undefined) {
          form.setValue('secondDriver', data.secondDriver);
          form.setValue(
            'secondDriverFullName',
            data.secondDriver?.name + ' ' + data.secondDriver?.surname,
          );
          setShowSeconDriver(true);
        } else {
          if (!source) {
            setShowDriverMissingMessage(true);
          }
        }
      }

      const priceListResponse = await http({
        url: '/pricing/priceLists/workflow/' + data.workflow._id,
      });

      setPriceListsLabels(
        priceListResponse.map((priceList) => {
          return { value: priceList._id, label: priceList.name };
        }),
      );
      setActivePriceLists(priceListResponse);

      form.setValue('priceList', data.priceList?._id);
      setSelectedPriceList(data.priceList?._id);

      priceListResponse.forEach((priceList) => {
        if (priceList._id === data.priceList?._id) {
          setVatPercentage(priceList?.configuration?.fares?.vatPercentage || 0);
        }
      });

      setVehicles([data.vehicle]);
      setSelectedVehicle(data.vehicle);

      if (source === 'reservation') {
        setReservationVehicle(data.vehicle);
      }
      if (data.movementType === 'NOL') {
        if (data?.price?.discount?.percentage) {
          form.setValue('discountPercentage', data.price.discount.percentage);
          setStoredDiscountPercentage(data.price.discount.percentage);
          setIsDiscountPercentage(true);
        } else if (data?.price?.discount?.amount) {
          form.setValue('discountAmount', data.price.discount.amount);
          setStoredDiscountAmount(data.price.discount.amount);
          setIsDiscountPercentage(false);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  useEffect(() => {
    if (!selectedPriceList) return;

    const faresFromResponse = activePriceLists.find((item) => item._id === selectedPriceList);

    setFares(
      faresFromResponse?.fares.map((item) => {
        const res = { value: item.baseFare, label: item.baseFare };
        return res;
      }),
    );

    if (!selectedFare) return;
  }, [
    pickUpDate,
    dropOffDate,
    selectedPriceList,
    storedDiscountAmount,
    storedDiscountPercentage,
    activePriceLists,
    selectedFare,
  ]);

  useEffect(() => {
    if (workflows?.length === 1) {
      form.setValue('workflow', workflows[0].value);
      fetchWorkflowParams(workflows[0].value);
    }
  }, [workflows]); // eslint-disable-line

  const getAvailableVehicles = async (data) => {
    try {
      if (!data.group || data.group?.length === 0) {
        toast.error('Selezionare almeno un gruppo', {
          duration: 5000,
        });
        return;
      }
      setVehicles([]);
      const workflowResponse = await http({ url: `/workflow/${data.workflow}` });
      setRentBuffer(workflowResponse?.configuration?.rentBuffer);
      setAdministration(workflowResponse?.administration);

      setIsDiscountable(
        workflowResponse?.administration?.faresDiscountMaxPercentage !== 0 ||
          workflowResponse?.administration?.faresDiscountMaxEuro !== 0,
      );
      setIsDiscountPercentage(workflowResponse?.administration?.faresDiscountMaxPercentage !== 0);

      checkUsers(
        data.customer,
        data.driver,
        data.secondDriver,
        data.dropOffDate,
        data.customerCompany,
        false,
      );

      const groupIds = data.group.map((group) => group?.value);

      const priceListResponse = await http({
        url: '/pricing/priceLists/workflow/' + data.workflow,
      });

      const totalDays = countDays(
        data.pickUpDate,
        data.dropOffDate,
        workflowResponse?.configuration?.rentBuffer,
      );

      if (
        totalDays > workflowResponse?.administration?.maxDays &&
        workflowResponse?.administration?.maxDays > 0
      ) {
        toast.error(
          `Il Flusso selezionato permette Movo di massimo ${
            workflowResponse?.administration?.maxDays
          } ${workflowResponse?.administration?.maxDays === 1 ? 'giorno' : 'giorni'}.`,
          {
            duration: 5000,
          },
        );
        return;
      }

      setDays(totalDays);

      setPriceListsLabels(
        priceListResponse.map((priceList) => {
          return { value: priceList._id, label: priceList.name };
        }),
      );
      setActivePriceLists(priceListResponse);
      setMovementType(data.movementType);

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
        },
      });

      setVehicles(response.result);
      setSearchDone(true);
    } catch (err) {
      console.error(err);
      toast.error(err?.error || 'Errore');
    }
  };

  const getDepositForGroup = (group) => {
    if (!group) return 0;

    if (!selectedPriceList) return;
    if (!activePriceLists || activePriceLists.length === 0) return;
    const priceList = activePriceLists.find((item) => item._id === selectedPriceList);
    if (!priceList) return;
    if (!priceList?.deposits?.length) return;
    return priceList.deposits.find((item) => item?.group?._id === group?._id)?.amount || 0;
  };

  const updatePriceList = async (data) => {
    try {
      setSelectedPriceList(form.getValues('priceList'));
      const priceList = activePriceLists.find((item) => item._id === form.getValues('priceList'));

      if (!priceList) {
        return;
      }

      const priceListFares = priceList.fares;
      setVatPercentage(priceList?.configuration?.fares?.vatPercentage || 0);

      const range = selectedRange || selectRange(days)[0];
      form.setValue('selectedRange', range?._id);
      const price = groups.map((group) => {
        const activeFare = priceListFares.find((item) => {
          return item?.group?._id === group?.value && item?.range?._id === range?._id;
        });

        return {
          group: group,
          price: calculatePrice(
            movementType,
            activeFare?.fare,
            days,
            storedDiscountPercentage,
            storedDiscountAmount,
            1,
          ),
          activeFare: getActiveFare(group, priceListFares, range)?.fare,
        };
      });

      setPrices(price);
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

  useEffect(() => {
    const availRanges = ranges.filter((item) => item.from <= days && item.to >= days);

    if (availRanges?.length === 1) {
      form.setValue('range', availRanges[0]?._id);
      updateRange(availRanges[0]?._id);
    }
  }, [days, ranges]);

  const updateRange = async (data) => {
    try {
      const ranges = selectRange(days);
      const rangeIdentified = ranges.find((item) => item._id === data);

      let priceListToUse;
      if (!selectedPriceList) {
        priceListToUse = activePriceLists[0];
      } else {
        priceListToUse = activePriceLists.find((item) => item._id === selectedPriceList);
      }

      // const priceListToUse = activePriceLists.find((item) => item._id === selectedPriceList);
      const priceListFares = priceListToUse?.fares;

      setVatPercentage(priceListToUse?.configuration?.fares?.vatPercentage || 0);
      setSelectedRange(ranges.find((item) => item._id === data));

      const price = groups.map((group) => {
        return {
          group: group,
          activeFare: getActiveFare(group, priceListFares, rangeIdentified)?.fare,
        };
      });

      setPrices(price);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const updateRentGroup = async (data) => {
    try {
      setAssignedGroup(data);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const getActiveFare = (group, fares, range) => {
    let fare = fares?.find((item) => {
      return item?.group?._id === group?.value && item?.range?._id === range?._id;
    });

    if (!fares && reservation !== null) {
      fare = reservation?.fare;
    }

    return fare;
  };

  const saveRent = async (data) => {
    try {
      if (!params.id) {
        const check = await checkAvailability(selectedVehicle);
        if (!check) {
          return;
        }
      }

      if (!selectedVehicle._id) {
        toast.error('Selezionare un veicolo', {
          duration: 5000,
        });
        return;
      }

      if (
        !checkUsers(
          data.customer,
          data.driver,
          data.secondDriver,
          data.dropOffDate,
          data.customerCompany,
        )
      )
        return;

      if (movementType === 'NOL' && !selectedPriceList) {
        toast.error('Selezionare un listino');
        return;
      }
      if (data.pickUpDate >= data.dropOffDate) {
        toast.error('La data di ritiro deve essere maggiore della data di consegna', {
          duration: 5000,
        });
        return;
      }

      let price = { amount: 0 };

      if (movementType !== 'NOL') {
        price.amount = 0;
        price.initialAmount = 0;
        price.dailyAmount = 0;
        price.totalAmount = 0;
      } else {
        price = {
          dailyAmount: fetchInitialAmount(getVehicleGroup(selectedVehicle).group) / days,
          initialAmount: fetchInitialAmount(getVehicleGroup(selectedVehicle).group),
          discount: {
            amount: storedDiscountAmount,
            percentage: storedDiscountPercentage,
          },
          amount: fetchPrice(getVehicleGroup(selectedVehicle).group),
          totalAmount: fetchPrice(getVehicleGroup(selectedVehicle).group),
          deposit: getDepositForGroup(getVehicleGroup(selectedVehicle).group),
        };

        if (price && price.amount === undefined) {
          toast.error('Tariffa non disponibile per il listino selezionato', {
            duration: 5000,
          });
          return;
        }
      }

      if (params.id) {
        await http({
          url: `/rents/${params.id}`,
          method: 'PUT',
          form: {
            workflow: data.workflow,
            movementType: data.movementType,
            group: getVehicleGroup(selectedVehicle).group,
            fare: getFareForGroup(getVehicleGroup(selectedVehicle).group)?._id,
            pickUpLocation: data.pickUpLocation,
            pickUpDate: data.pickUpDate,
            dropOffLocation: data.dropOffLocation,
            dropOffDate: data.dropOffDate,
            vehicle: selectedVehicle._id,
            totalDays: countDays(data.pickUpDate, data.dropOffDate, rentBuffer),
            price,
            discountAmount: storedDiscountAmount,
            discountPercentage: storedDiscountPercentage,
          },
        });

        toast.success('Movo modificato correttamente');
        history.push(`/dashboard/movimenti/crea/2/${params.id}`);
        return;
      }

      const inputData = {
        workflow: data.workflow,
        movementType: data.movementType,
        group: getVehicleGroup(selectedVehicle).group,
        assignedGroup: assignedGroup,
        pickUpLocation: data.pickUpLocation,
        pickUpDate: data.pickUpDate,
        dropOffLocation: data.dropOffLocation,
        dropOffDate: data.dropOffDate,
        vehicle: selectedVehicle._id,
        driver: data.driver,
        secondDriver: data.secondDriver,
        customer: data.customer,
        customerCompany: data.customerCompany,
        fare: getFareForGroup(getVehicleGroup(selectedVehicle).group)?._id,
        priceList: selectedPriceList,
        totalDays: countDays(data.pickUpDate, data.dropOffDate, rentBuffer),
        price,
        discountAmount: storedDiscountAmount,
        discountPercentage: storedDiscountPercentage,
        reservation: data.reservationId,
      };

      const response = await http({
        url: '/rents',
        method: 'POST',
        form: inputData,
      });
      setRentId(response.rent._id);
      setRentCompleted(true);

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
      history.push(`/dashboard/movimenti/crea/2/${response.rent._id}`);
    } catch (err) {
      console.error(err);
      toast.error(err?.error || 'Errore');
    }
  };

  const CustomToastWithLink = (text, link, linkText) => (
    <div>
      {text}
      <Link className="underline" to={link}>
        {linkText}
      </Link>
    </div>
  );

  const checkAvailability = async (vehicle) => {
    try {
      const id = vehicle?._id || reservation?.vehicle?._id;
      if (!id) return true;

      const response = await http({
        url: '/rents/availability/byVehicle/' + id,
        method: 'POST',
        form: {
          pickUpDate: form.getValues('pickUpDate') || reservation?.pickUpDate,
          dropOffDate: form.getValues('dropOffDate') || reservation?.dropOffDate,
          reservation: reservation?._id,
        },
      });

      if (!response.available) {
        if (response.reservation !== null && response.reservation !== undefined) {
          toast.error(
            CustomToastWithLink(
              `Veicolo non disponibile per le date selezionate. \n\n Conflitto con prenotazione \n`,
              `/dashboard/prenotazioni/${response.reservation._id}`,
              response.reservation.code,
            ),

            {
              duration: 10000,
            },
          );
        } else {
          if (response.rent !== null && response.rent !== undefined) {
            toast.error(
              CustomToastWithLink(
                `Veicolo non disponibile per le date selezionate. \n\n Conflitto con movo \n`,
                `/dashboard/movimenti/${response.rent._id}`,
                response.rent.code,
              ),
              {
                duration: 10000,
              },
            );
          } else {
            toast.error(`Veicolo non disponibile per le date selezionate.`, {
              duration: 10000,
              width: 500,
            });
          }
        }
        return false;
      } else {
        return true;
      }
    } catch (err) {
      toast.error(err?.error || 'Errore');
    }
  };

  const checkFormIsDirty = () => {
    if (
      form.getValues('workflow') !== '' ||
      form.getValues('movementType') !== '' ||
      form.getValues('group') !== '' ||
      form.getValues('pickUpLocation') !== '' ||
      form.getValues('dropOffLocation') !== '' ||
      form.getValues('pickUpDate') !== '' ||
      form.getValues('dropOffDate') !== '' ||
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

      if (
        form.getValues('priceList') != null &&
        (selVehicle != null || selectedVehicle != null || vehicles.length === 1)
      ) {
        setContinuaBtnEnabled(true);
      } else {
        setContinuaBtnEnabled(false);
      }
    } else {
      setSearchBtnEnabled(false);
      setContinuaBtnEnabled(false);
    }
  };

  const returnReservationId = async (reservationId) => {
    window.location.replace(`/dashboard/movimenti/crea?prenotazione=${reservationId}`);
  };

  const openDriverModal = async (show) => {
    setShowDriverModal(show);
  };

  const closeDriverModal = () => {
    setShowDriverModal(false);
  };

  const openSecondDriverModal = async (show) => {
    setShowSecondDriverModal(show);
  };

  const closeSecondDriverModal = () => {
    setShowSecondDriverModal(false);
  };

  const openCustomerModal = async (show) => {
    setShowCustomerModal(show);
  };

  const closeCustomerModal = () => {
    setShowCustomerModal(false);
  };

  const closeCustomerCompanyModal = () => {
    setShowCustomerCompanyModal(false);
  };

  const openLoadReservationModal = async (show) => {
    setShowLoadReservationModal(show);
  };

  const closeLoadReservationModal = () => {
    setShowLoadReservationModal(false);
  };

  const returnDriver = (driver) => {
    setDriverFullName(driver.name + ' ' + driver.surname);
    form.setValue('driverFullName', driver.name + ' ' + driver.surname);
    form.setValue('driver', driver);
    setDriverId(driver._id);
    setShowDriverModal(false);
    checkFormIsDirty();
  };

  const returnSecondDriver = (secondDriver) => {
    setSecondDriverFullName(secondDriver?.name + ' ' + secondDriver?.surname);
    form.setValue('secondDriverFullName', secondDriver?.name + ' ' + secondDriver?.surname);
    form.setValue('secondDriver', secondDriver);
    setSecondDriverId(secondDriver._id);
    setShowSecondDriverModal(false);
    checkFormIsDirty();
  };

  const returnCustomer = (customer) => {
    setCustomerFullName(customer?.name + ' ' + customer?.surname);
    form.setValue('customerFullName', customer?.name + ' ' + customer?.surname);
    form.setValue('customer', customer);
    setShowCustomerModal(false);
    checkFormIsDirty();
  };

  const returnCustomerCompany = (customerCompany) => {
    setCustomerFullName(customerCompany?.ragioneSociale);
    form.setValue('customerFullName', customerCompany?.ragioneSociale);
    form.setValue('customerCompany', customerCompany);
    setShowCustomerModal(false);
    setShowCustomerCompanyModal(false);
    checkFormIsDirty();
  };

  const removeSecondDriver = () => {
    setSecondDriverFullName('');
    form.setValue('secondDriverFullName', '');
    form.setValue('secondDriver', undefined);
  };

  const checkMissingDriverCustomerInfo = () => {
    if (showCustomerMissingMessage || showDriverMissingMessage) {
      return true;
    }
    return false;
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

    const groupIdToUse = assignedGroup ? assignedGroup : group?._id;

    let fare = priceList.fares.find((item) => {
      return item?.group?._id === groupIdToUse && item?.range?._id === range?._id;
    });
    if (!fare && reservation !== null) {
      fare = {
        fare: reservation?.fare,
        group: group,
        range: range,
      };
    }
    return fare;
  };

  const getFareForGroup = (group) => {
    const groupIdToUse = assignedGroup ? assignedGroup : group?._id;

    if (prices.length > 0) {
      const price = prices.find((item) => item.group?.value === groupIdToUse);
      let fare = price?.activeFare || '';
      if (!fare && reservation !== null) {
        fare = reservation?.fare;
      }
      return fare;
    } else {
      const fare = getFare(group);
      return fare?.fare;
    }
  };

  const fetchPrice = (group) => {
    const fare = getFare(group);

    if (!fare) return;

    const price = calculatePrice(movementType, fare.fare, days, 0, 0, 2);
    return price;
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

  const fetchInitialAmount = (group) => {
    const fare = getFare(group);
    if (!fare) return;

    const price = calculateBasePrice(movementType, fare.fare, days);

    return price;
  };

  const fetchRangesAndGroups = async () => {
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

  const openUserCompaniesModal = async (userCompanyId = true) => {
    setShowCustomerModal(false);
    setShowCustomerCompanyModal(userCompanyId);
  };

  const selectRange = (days) => {
    const validRanges = ranges.filter((item) => item.from <= days);
    return validRanges;
  };

  const fetchWorkflowParams = async (workflowId) => {
    try {
      const response = await updateWorkflowParams(workflowId);
      setRentalLocations(response.rentalLocations);
      setAvailableMovementTypes(response.movementTypes);

      const priceListResponse = await http({
        url: '/pricing/priceLists/workflow/' + workflowId,
      });

      setActivePriceLists(priceListResponse);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const fetchWorkflows = async () => {
    try {
      const response = await http({ url: '/workflow/active?initiator=dashboard' });
      setWorkflows(
        response.workflows.map((workflow) => {
          return { value: workflow._id, label: workflow.name };
        }),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const checkPhoneNumbers = (phone) => {
    if (phone === undefined || phone === null) {
      return false;
    }
    return true;
  };

  const fetchReservation = async () => {
    try {
      if (reservationId) {
        const response = await http({ url: `/reservations/${reservationId}` });
        const reservation = response;
        const timeDiff = moment(reservation.dropOffDate).diff(
          moment(reservation.pickUpDate),
          'minutes',
        );

        reservation.pickUpDate = moment().format().slice(0, 16);
        reservation.dropOffDate = moment().add(timeDiff, 'minutes').format().slice(0, 16);
        reservation.totalDays = countDays(
          reservation.pickUpDate,
          reservation.dropOffDate,
          rentBuffer,
        );

        setReservation(reservation);
        fillRentData(reservation);
        form.setValue('reservationId', reservation._id);
        form.setValue('priceList', reservation.priceList?._id);
        form.setValue('range', reservation.range);
        form.setValue('selectedRange', reservation.range);
        updateRange(reservation.range);
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  useEffect(() => {
    fetchWorkflows();
    fetchRentalLocations();
    fetchReservation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchRangesAndGroups();
  }, [selectedPriceList]);

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
        when={isBlocking && !rentCompleted}
        title="Sei sicuro di voler lasciare la pagina?"
        description="Le modifiche non salvate andranno perse"
        cancelText="Cancella"
        okText="Conferma"
        onOK={() => true}
        onCancel={() => false}
      />

      <CardsHeader
        title="Apertura movo"
        buttons={[
          {
            btnStyle: 'lightSlateTransparent',
            children: '« Indietro',
            onClick: () => history.goBack(),
          },
          {
            btnStyle: 'slate',
            children: 'Carica Prenotazione',
            onClick: () => openLoadReservationModal(true),
          },
          {
            btnStyle: 'blue',
            children: 'Continua',
            disabled: !continuaBtnEnabled,
            hiddenIf: rentCompleted,
            form: 'createRent',
          },
          {
            btnStyle: 'blue',
            children: 'Vai al movo',
            hiddenIf: !rentCompleted,
            to: `/dashboard/movimenti/${rentId}`,
          },
        ]}
      >
        <Stepper
          colorScheme="orange"
          steps={[{ content: '1', isCurrent: true }, { content: '2' }]}
        />
      </CardsHeader>
      <WhiteBox className="mt-0 mx-6 overflow-visible">
        <div className="p-4 w-full">
          <h1 className="text-xl font-medium">
            Ricerca <small>{reservationId ? `da prenotazione ${reservation?.code}` : ''}</small>
          </h1>

          <form
            onSubmit={form.handleSubmit(getAvailableVehicles)}
            id="newRentForm"
            className="flex flex-wrap"
          >
            <fieldset disabled={form.formState.isSubmitting}>
              <div className="flex flex-wrap pt-2 gap-x-4">
                <div className="flex-none w-full md:w-64">
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
                      checkFormIsDirty();
                    }}
                  />
                </div>
                <div className="flex-initial w-full md:w-64">
                  <FormLabel>Tipo movimento</FormLabel>
                  <SelectField
                    form={form}
                    name="movementType"
                    placeholder="Tipo Movimento"
                    options={availableMovementTypes}
                    onChangeFunction={(e) => {
                      e.preventDefault();
                      setMovementType(e.target.value);
                      checkFormIsDirty();
                    }}
                    validation={{
                      required: { value: true, message: 'Tipo movimento' },
                    }}
                  />
                </div>
                <div className="flex-initial w-full md:w-auto lg:min-w-[33rem]">
                  <FormLabel>Gruppo</FormLabel>
                  <GroupsSelector
                    form={form}
                    name="group"
                    groups={groups}
                    checkFormIsDirty={checkFormIsDirty}
                  />
                </div>
              </div>
              <div className="flex flex-wrap pt-2 gap-x-4">
                <div className="flex-none w-full md:w-64">
                  <FormLabel>Luogo Consegna</FormLabel>
                  <SelectField
                    form={form}
                    name="pickUpLocation"
                    placeholder="Luogo Consegna"
                    options={rentalLocations?.map((rentalLocation) => {
                      return { label: rentalLocation?.name, value: rentalLocation?._id };
                    })}
                    validation={{
                      required: { value: true, message: 'Luogo Consegna' },
                    }}
                    onChangeFunction={(e) => {
                      e.preventDefault();
                      checkFormIsDirty();
                    }}
                  />
                </div>
                <div className="flex-initial w-full md:w-64">
                  <FormLabel>Consegna</FormLabel>
                  <TextInternal
                    form={form}
                    name="pickUpDate"
                    type="datetime-local"
                    placeholder="Consegna"
                    min={new Date().toISOString().slice(0, 16).replace('T', ' ')}
                    disabled={true}
                    onChangeFunction={(e) => {
                      e.preventDefault();
                      setPickUpDate(e.target.value);
                      checkFormIsDirty();
                    }}
                    validation={{
                      required: { value: true, message: 'Consegna' },
                    }}
                  />
                </div>
                <div className="flex-initial w-full md:w-64">
                  <FormLabel>Luogo Ritiro</FormLabel>
                  <SelectField
                    form={form}
                    name="dropOffLocation"
                    placeholder="Luogo Ritiro"
                    options={rentalLocations?.map((rentalLocation) => {
                      return { label: rentalLocation?.name, value: rentalLocation?._id };
                    })}
                    validation={{
                      required: { value: true, message: 'Luogo Ritiro' },
                    }}
                    onChangeFunction={(e) => {
                      e.preventDefault();
                      checkFormIsDirty();
                    }}
                  />
                </div>
                <div className="flex-initial w-full md:w-64">
                  <FormLabel>Ritiro</FormLabel>
                  <TextInternal
                    form={form}
                    name="dropOffDate"
                    type="datetime-local"
                    min={pickUpDate || new Date().toISOString().slice(0, 16).replace('T', ' ')}
                    placeholder="Data arrivo"
                    onChangeFunction={(e) => {
                      e.preventDefault();
                      setDropOffDate(e.target.value);
                      checkFormIsDirty();
                    }}
                    validation={{
                      required: { value: true, message: 'Inserisci data di ritiro' },
                    }}
                  />
                </div>
              </div>
              <div>
                {checkMissingDriverCustomerInfo() === true && (
                  <div className="text-black mt-2 p-3 bg-yellow-50 text-sm">
                    {showDriverMissingMessage && (
                      <div className="mt-1">
                        <span role="img" aria-label="Info" className="mr-1">
                          ℹ️
                        </span>{' '}
                        Conducente da inserire in modo completo (nella prenotazione:{' '}
                        <span className="font-semibold">
                          {reservation?.driverFullName}
                          {checkPhoneNumbers(reservation?.driverPhone) &&
                            ` | ${reservation?.driverPhone}`}{' '}
                        </span>
                        )
                      </div>
                    )}
                    {showCustomerMissingMessage && (
                      <div className="mt-1">
                        <span role="img" aria-label="Info" className="mr-1">
                          ℹ️
                        </span>{' '}
                        Cliente da inserire in modo completo (nella prenotazione:{' '}
                        <span className="font-semibold">
                          {reservation?.customerFullName}
                          {checkPhoneNumbers(reservation?.customerPhone) &&
                            ` | ${reservation?.customerPhone}`}{' '}
                        </span>
                        )
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-x-4">
                <div className="flex pt-2 w-full md:w-auto">
                  <div className="mr-2 flex-1 md:flex-initial md:w-64">
                    <FormLabel>Conducente</FormLabel>
                    <TextInternal
                      form={form}
                      name="driverFullName"
                      placeholder="Conducente"
                      disabled={true}
                    />
                  </div>
                  <div className="flex-none w-auto">
                    <FormLabel>&nbsp;</FormLabel>
                    <Button
                      btnStyle="white"
                      className="py-2 px-2 mt-[-1px]"
                      onClick={(e) => {
                        e.preventDefault();
                        checkFormIsDirty();
                        openDriverModal(true);
                      }}
                    >
                      <FaPlusCircle className="text-black text-xl" />
                    </Button>
                  </div>
                </div>
                <div className="flex pt-2 w-full md:w-auto">
                  <div className="mr-2 flex-1 md:flex-initial md:w-64">
                    <FormLabel>Cliente</FormLabel>
                    <TextInternal
                      form={form}
                      name="customerFullName"
                      placeholder="Cliente"
                      disabled={true}
                    />
                  </div>
                  <div className="flex-none">
                    <FormLabel>&nbsp;</FormLabel>
                    <Button
                      btnStyle="white"
                      className="py-2 px-2 mt-[-1px]"
                      onClick={(e) => {
                        e.preventDefault();
                        checkFormIsDirty();
                        openCustomerModal(true);
                      }}
                    >
                      <FaPlusCircle className="text-black text-xl" />
                    </Button>
                  </div>
                </div>
                {(driverFullName !== '' || showSecondDriver) && (
                  <div className="flex pt-2 w-full md:w-auto">
                    <div className="mr-2 flex-1 md:flex-initial md:w-64">
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
                          openSecondDriverModal(true);
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
                          removeSecondDriver();
                        }}
                      >
                        <FaMinusCircle className="text-black text-xl" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </fieldset>

            <div className="flex flex-1 justify-end items-end pt-6">
              <Button btnStyle="lightSlateTransparentOrange" disabled={!searchBtnEnabled}>
                Cerca e continua
              </Button>
            </div>
          </form>

          {searchDone === true && vehicles.length === 0 && (
            <div className="mt-5">
              <hr />
              <div className="flex justify-center mt-5">
                <div className="flex flex-col items-center">
                  <div className="text-2xl font-bold">Nessun veicolo disponibile</div>
                  <div className="text-gray-500">Cambia i parametri di ricerca</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </WhiteBox>

      {vehicles.length > 0 && (
        <form onSubmit={form.handleSubmit(saveRent)} id="createRent">
          <WhiteBox className="mt-0 mx-6 overflow-visible">
            <h1 className="text-xl font-medium p-4 pb-0">Listino</h1>
            <div className="flex flex-wrap p-4 pt-0">
              <div className="flex-none w-full md:w-96 mt-3">
                <FormLabel>Listino</FormLabel>
                <SelectField
                  className="pr-2"
                  form={form}
                  name="priceList"
                  placeholder="Listino"
                  options={priceListsLabels}
                  onChangeFunction={(e) => {
                    e.preventDefault();
                    updatePriceList();
                  }}
                />
              </div>
              <div className="flex-none w-full md:w-64 mt-3">
                <FormLabel>
                  Fascia{' '}
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
                  options={availableFilteredRanges.map((range) => {
                    return { value: range._id, label: range.name };
                  })}
                  onChangeFunction={(e) => {
                    e.preventDefault();
                    updateRange(e.target.value);
                  }}
                />
              </div>
              {form.getValues('priceList') !== undefined &&
                form.getValues('range') !== undefined &&
                licenseType !== 'movolab' && (
                  <div className="flex-none w-full md:w-64 mt-3">
                    <FormLabel>Gruppo Assegnato</FormLabel>
                    <SelectField
                      className="pr-2"
                      form={form}
                      name="assignedGroup"
                      placeholder={'Seleziona Gruppo'}
                      options={[
                        { value: '', label: 'Seleziona un gruppo' },
                        ...groups.map((group) => {
                          return { value: group.value, label: group.label };
                        }),
                      ]}
                      onChangeFunction={(e) => {
                        e.preventDefault();
                        updateRentGroup(e.target.value);
                      }}
                    />
                  </div>
                )}

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
                              validateDiscountPercentage(form.getValues('discountPercentage')),
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
          </WhiteBox>

          <WhiteBox className="mt-0 mx-6 overflow-visible">
            <div className="p-4">
              <h1 className="text-xl font-medium mb-4">Veicoli</h1>
              <div className="bg-white rounded-lg shadow-lg overflow-scroll">
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
                            <div className="font-semibold text-left">Imponibile</div>
                          </th>
                          <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                            <div className="font-semibold text-left">Iva Incl</div>
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
                        {vehicles.map((vehicle, index) => {
                          return (
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
                                  checked={selectedVehicleIndex === index}
                                  onInput={(e) => {
                                    setSelectedVehicle(vehicles[e.target.value]);
                                    checkSearchBtnEnabled(true);
                                  }}
                                />
                              </td>
                              <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                                <p className="text-left font-semibold text-gray-600">
                                  {vehicle.plate.toUpperCase()}
                                </p>
                              </td>
                              <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                                <p className="text-left font-semibold text-gray-600">
                                  {vehicle.km}
                                </p>
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
                                  {vehicle?.version?.group !== undefined
                                    ? `${getVehicleGroup(vehicle)?.group?.mnemonic} - ${
                                        getVehicleGroup(vehicle)?.group?.description
                                      }`
                                    : reservation.group !== undefined
                                    ? `${reservation.group?.mnemonic} - ${reservation.group?.description}`
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

                              {movementType === 'NOL' && (
                                <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                                  <p className="text-left font-semibold text-gray-600">
                                    {getFareForGroup(getVehicleGroup(vehicle).group)
                                      ?.calculation === 'range' ? (
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
                                <p className="text-left font-semibold text-gray-600">
                                  {countDays(
                                    form.getValues('pickUpDate'),
                                    form.getValues('dropOffDate'),
                                    rentBuffer,
                                  )}
                                </p>
                              </td>
                              <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                                <p className="text-left font-semibold text-gray-600">
                                  {fetchPrice(getVehicleGroup(vehicle).group) !== undefined ? (
                                    <>{convertPrice(fetchPrice(getVehicleGroup(vehicle).group))}</>
                                  ) : (
                                    <>N/A</>
                                  )}
                                </p>
                              </td>
                              <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                                <p className="text-left font-semibold text-gray-600">
                                  {fetchPrice(getVehicleGroup(vehicle).group) !== undefined ? (
                                    <>
                                      {convertPrice(
                                        fetchPrice(getVehicleGroup(vehicle).group) *
                                          (1 + vatPercentage / 100),
                                      )}
                                    </>
                                  ) : (
                                    <>N/A</>
                                  )}
                                </p>
                              </td>
                              <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                                <p className="text-left font-semibold text-gray-600">
                                  {storedDiscountAmount || storedDiscountPercentage ? (
                                    <>
                                      {storedDiscountAmount
                                        ? convertPrice(storedDiscountAmount)
                                        : `${storedDiscountPercentage}%`}
                                    </>
                                  ) : (
                                    <>N/A</>
                                  )}
                                </p>
                              </td>
                              <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                                <p className="text-left font-semibold text-gray-600">
                                  {calculateFinalPrice(getVehicleGroup(vehicle).group) !==
                                  undefined ? (
                                    <>
                                      {convertPrice(
                                        calculateFinalPrice(getVehicleGroup(vehicle).group),
                                      )}
                                    </>
                                  ) : (
                                    <>N/A</>
                                  )}
                                </p>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                {reservationId ? (
                  <>
                    <div className="pt-2">
                      <Button
                        btnStyle="white"
                        onClick={(e) => {
                          e.preventDefault();
                          getAvailableVehicles(form.getValues());
                        }}
                      >
                        Seleziona altro veicolo
                      </Button>
                      <Button
                        btnStyle="white"
                        className="text-red-500"
                        onClick={(e) => {
                          e.preventDefault();
                          window.location.reload();
                        }}
                      >
                        Reimposta dati
                      </Button>
                    </div>
                  </>
                ) : (
                  <></>
                )}
              </div>
            </div>
          </WhiteBox>
        </form>
      )}

      {showDriverModal ? (
        <UsersModal
          inputType={'driver'}
          closeModal={closeDriverModal}
          returnUser={returnDriver}
          excludeUser={secondDriverId}
          workflow={form.getValues('workflow')}
        />
      ) : null}
      {showSecondDriverModal ? (
        <UsersModal
          inputType={'secondDriver'}
          closeModal={closeSecondDriverModal}
          returnUser={returnSecondDriver}
          excludeUser={driverId}
          workflow={form.getValues('workflow')}
        />
      ) : null}
      {showCustomerModal ? (
        <UsersModal
          inputType={'customer'}
          closeModal={closeCustomerModal}
          returnUser={returnCustomer}
          returnUserCompany={returnCustomerCompany}
          openUserCompaniesModal={openUserCompaniesModal}
          workflow={form.getValues('workflow')}
        />
      ) : null}
      {showCustomerCompanyModal ? (
        <UserCompaniesModal
          mode={showCustomerCompanyModal === true ? 'add' : 'edit'}
          userCompanyId={showCustomerCompanyModal === true ? null : showCustomerCompanyModal}
          inputType={'customerCompany'}
          closeModal={closeCustomerCompanyModal}
          returnUserCompany={returnCustomerCompany}
        />
      ) : null}
      {showLoadReservationModal ? (
        <LoadReservationModal
          returnReservationId={returnReservationId}
          closeModal={closeLoadReservationModal}
        />
      ) : null}
    </Page>
  );
};

export default NewRent;
