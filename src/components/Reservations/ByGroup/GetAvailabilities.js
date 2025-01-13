import React, { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import moment from 'moment';
import GroupsSelector from '../../UI/GroupsSelector';
import { TextField as TextInternal } from '../../../components/Form/TextField';
import { SelectField } from '../../../components/Form/SelectField';

import { http } from '../../../utils/Utils';
import useGroups from '../../../hooks/useGroups';
import FormLabel from '../../../components/UI/FormLabel';
import Button from '../../../components/UI/buttons/Button';
import WhiteBox from '../../../components/UI/WhiteBox';
import { fetchRentalLocations } from '../../../utils/Workflow';
import { countDays } from '../../../utils/Utils';

const GetAvailabilities = () => {
  const [rentalLocations, setRentalLocations] = useState([]);
  const form = useForm();
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [activePriceLists, setActivePriceLists] = useState([]);
  const [priceListsLabels, setPriceListsLabels] = useState([]);
  const [administration, setAdministration] = useState({});
  const [extraFields, setExtraFields] = useState([]);
  const [vatPercentage, setVatPercentage] = useState(0);
  const [selectedPriceList, setSelectedPriceList] = useState(undefined);
  const [ranges, setRanges] = useState([]);
  const [workflow, setWorkflow] = useState({});
  const [days, setDays] = useState(0);
  const [selectedRange, setSelectedRange] = useState(null);

  const groups = useGroups();
  const [pickUpDate, setPickUpDate] = useState('');
  const [rentBuffer, setRentBuffer] = useState(0);
  const [isBlocking, setIsBlocking] = useState(false);
  const [searchBtnEnabled, setSearchBtnEnabled] = useState(false);
  const [continuaBtnEnabled, setContinuaBtnEnabled] = useState(false);

  form.setValue('age', 20);
  form.setValue('pickUpLocation', '66ea9ae39d53a10b66934fca');
  form.setValue('dropOffLocation', '66ea9ae39d53a10b66934fca');
  form.setValue('pickUpDate', '2024-12-20T16:32');
  form.setValue('dropOffDate', '2024-12-22T16:32');
  form.setValue('nationality', 'IT');
  form.setValue('group', [
    { value: '63acb41afd939e8f05d5069a', label: '2WC - SCOOTER' },
    { value: '63acb43dfd939e8f05d5069d', label: '2WM - MOTO' },
    { value: '63acb44ffd939e8f05d506a0', label: '4W - QUADRICICLI' },
    { value: '63acb29cacaff598c5508793', label: 'A - CITY CAR' },
    { value: '66463f08649ad7fac3e117d5', label: 'A+ - CITY CAR' },
    { value: '63acb2d8acaff598c5508796', label: 'B - UTILITARIE' },
    { value: '6645ee56a7c9657d8f84d32d', label: 'B+ - UTILITARIE' },
    { value: '63acb302acaff598c550879c', label: 'C - MEDIE' },
    { value: '6645ee56a7c9657d8f84d32e', label: 'C+ - MEDIE' },
    { value: '63acb31bacaff598c550879f', label: 'D - GRANDI' },
    { value: '6645ee56a7c9657d8f84d32f', label: 'D+ - GRANDI' },
    { value: '63acb32eacaff598c55087a2', label: 'E - PREMIUM' },
    { value: '6645ee56a7c9657d8f84d330', label: 'E+ - PREMIUM' },
    { value: '6645ee56a7c9657d8f84d331', label: 'F - SUPERCAR' },
    { value: '63acb3ebfd939e8f05d50694', label: 'L - MONOVOLUMI 9 PAX' },
    { value: '63acb34cacaff598c55087a5', label: 'Z - COMMERCIALI' },
  ]);

  useEffect(() => {
    fetchWidgetWorkflow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchWidgetWorkflow = async () => {
    try {
      const response = await http({ url: '/workflow/widget' });

      if (response?._id) {
        const rentalLocations = await fetchRentalLocations(response?._id);
        setRentalLocations(rentalLocations);
      }

      setWorkflow(response);

      setSearchBtnEnabled(true);
      setContinuaBtnEnabled(true);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  useEffect(() => {
    fetchRanges();
  }, [selectedPriceList]); // eslint-disable-line

  const onSubmit = async (data) => {
    try {
      console.log('onSubmit', data);

      if (!data.group || data.group?.length === 0) {
        toast.error('Seleziona un gruppo per effettuare la ricerca');
        return;
      }
      setExtraFields(workflow.extraFields);
      setRentBuffer(workflow?.configuration?.rentBuffer);
      setAdministration(workflow?.administration);

      // setIsDiscountable(
      //   workflow?.administration?.faresDiscountMaxPercentage !== 0 ||
      //     workflow?.administration?.faresDiscountMaxEuro !== 0,
      // );
      // setIsDiscountPercentage(workflow?.administration?.faresDiscountMaxPercentage !== 0);

      if (data.pickUpDate > data.dropOffDate) {
        toast.error('La data di ritiro deve essere successiva alla data di consegna');
        return;
      }

      const totalDays = countDays(
        data.pickUpDate,
        data.dropOffDate,
        workflow?.configuration?.rentBuffer,
      );

      if (totalDays < 1) {
        toast.error('La prenotazione deve essere di almeno un giorno');
        // setVehicles([]);
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
      const priceLists = await http({ url: `/pricing/priceLists/workflow/${workflow?._id}` });
      setActivePriceLists(priceLists);
      getRangesFromPricelist(priceLists[0]);

      const groupIds = data.group.map((group) => group?.value);
      const response = await http({
        url: '/widget/availability/getAvail',
        method: 'POST',
        form: {
          group: groupIds,
          pickUpLocation: data.pickUpLocation,
          pickUpDate: data.pickUpDate,
          dropOffLocation: data.dropOffLocation,
          dropOffDate: data.dropOffDate,
        },
      });

      console.log('response', response);

      //   setVehicles(response.result);
      //   setSearchDone(true);
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

  const selectRange = (days) => {
    const validRanges = ranges.filter((item) => item.from <= days && item.to >= days);
    return validRanges;
  };

  const checkFormIsDirty = () => {
    if (
      form.getValues('pickUpLocation') !== '' ||
      form.getValues('dropOffLocation') !== '' ||
      form.getValues('pickUpDate') !== '' ||
      form.getValues('dropOffDate') !== '' ||
      form.getValues('group') !== ''
    ) {
      setIsBlocking(true);
    } else {
      setIsBlocking(false);
    }
    checkSearchBtnEnabled();
  };

  const checkSearchBtnEnabled = (selVehicle) => {
    // if (
    //   form.getValues('group') != null &&
    //   form.getValues('pickUpLocation') != null &&
    //   form.getValues('dropOffLocation') != null &&
    //   form.getValues('pickUpDate') != null &&
    //   form.getValues('dropOffDate') != null
    // ) {
    //   setSearchBtnEnabled(true);
    //   if (form.getValues('priceList') != null && (selVehicle != null || selectedVehicle != null)) {
    //     setContinuaBtnEnabled(true);
    //   } else {
    //     setContinuaBtnEnabled(false);
    //   }
    // } else {
    //   setSearchBtnEnabled(false);
    //   setContinuaBtnEnabled(false);
    // }
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

  const availableFilteredRanges = ranges.filter((item) => item.from <= days && item.to >= days);

  useEffect(() => {
    if (availableFilteredRanges?.length > 0) {
      form.setValue('range', availableFilteredRanges[0]?._id);
      updateRange(availableFilteredRanges[0]?._id);
    }
  }, [days, ranges]);

  return (
    <WhiteBox className="mt-0 mx-6 overflow-visible">
      <div className="p-4 w-full">
        <h1 className="text-xl font-medium">Ricerca</h1>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <fieldset disabled={form.formState.isSubmitting}>
            <div className="flex flex-wrap pt-2 gap-x-4">
              <div className="flex-none w-64">
                <FormLabel>Luogo Consegna</FormLabel>
                <SelectField
                  form={form}
                  name="pickUpLocation"
                  placeholder="Luogo Consegna"
                  options={rentalLocations.map((rentalLocation) => {
                    return { label: rentalLocation.name, value: rentalLocation._id };
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
              <div className="flex-initial w-64">
                <FormLabel>Luogo Ritiro</FormLabel>
                <SelectField
                  form={form}
                  name="dropOffLocation"
                  placeholder="Luogo Consegna"
                  options={rentalLocations.map((rentalLocation) => {
                    return { label: rentalLocation.name, value: rentalLocation._id };
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
              <div className="flex-initial w-64">
                <FormLabel>Consegna</FormLabel>
                <TextInternal
                  form={form}
                  name="pickUpDate"
                  type="datetime-local"
                  placeholder="Consegna"
                  min={moment().format('YYYY-MM-DDTHH:mm')}
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
              <div className="flex-initial w-64">
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
                    checkFormIsDirty();
                  }}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-x-4">
              <div className="flex pt-2">
                <div className="flex-none w-24 pr-2">
                  <FormLabel>Età</FormLabel>
                  <SelectField
                    form={form}
                    name="age"
                    placeholder="Età"
                    options={Array.from({ length: 83 }, (_, i) => ({
                      label: (i + 18).toString(),
                      value: (i + 18).toString(),
                    }))}
                    onChangeFunction={(e) => {
                      e.preventDefault();
                      checkFormIsDirty();
                    }}
                  />
                </div>
              </div>
              <div className="flex pt-2">
                <div className="flex-none w-48 pr-2">
                  <FormLabel>Nazionalità</FormLabel>
                  <SelectField
                    form={form}
                    name="nationality"
                    placeholder="Nazionalità"
                    options={[
                      { label: 'Italiano', value: 'IT' },
                      { label: 'Francese', value: 'FR' },
                      { label: 'Tedesco', value: 'DE' },
                      { label: 'Spagnolo', value: 'ES' },
                      { label: 'Americano', value: 'US' },
                      // Add more nationalities as needed
                    ]}
                    onChangeFunction={(e) => {
                      e.preventDefault();
                      checkFormIsDirty();
                    }}
                  />
                </div>
              </div>
              <div className="flex pt-2">
                <div className="flex-none w-72 pr-2">
                  <FormLabel>Codice Promo </FormLabel>
                  <TextInternal
                    form={form}
                    name="promoCode"
                    placeholder="Codice Promo"
                    onChangeFunction={checkFormIsDirty}
                  />
                </div>
              </div>
              <div className="flex pt-2">
                <div className="flex-initial min-w-[33rem]">
                  <FormLabel>Gruppo</FormLabel>
                  <GroupsSelector
                    form={form}
                    name="group"
                    groups={groups}
                    checkFormIsDirty={checkFormIsDirty}
                  />
                </div>
              </div>

              <div className="flex flex-1 justify-end items-end pt-6">
                <Button btnStyle="lightSlateTransparentOrange" disabled={!searchBtnEnabled}>
                  Cerca e continua
                </Button>
              </div>
            </div>
          </fieldset>
        </form>
      </div>
    </WhiteBox>
  );
};

export default GetAvailabilities;
