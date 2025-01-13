import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import moment from 'moment';
import { http } from '../../../utils/Utils';
import { TextField } from '../../Form/TextField';
import { SelectField } from '../../Form/SelectField';
import Button from '../../UI/buttons/Button';
import FormLabel from '../../UI/FormLabel';
import Loader from '../../UI/Loader';
import { convertPrice } from '../../../utils/Prices';
import { countDays } from '../../../utils/Utils';
import WhiteBox from '../../../components/UI/WhiteBox';
import Modal from '../../UI/Modal';
import toast from 'react-hot-toast';
import { FaPen } from 'react-icons/fa6';
import { rentStateIsEqualOrAfter } from '../../../utils/Rent';

const PickupDropoffInfo = ({
  rent,
  phase,
  getCloseRentInfo,
  updatePrice,
  viewMode = false,
  fromCorporate,
  returnCloseTime = () => {},
  isClosingMovo = false
}) => {
  const form = useForm();

  const rentBuffer = rent.workflow?.configuration?.rentBuffer || 0;

  const [closeRentInfo, setCloseRentInfo] = useState({});
  const [days, setDays] = useState(countDays(rent?.pickUpDate, rent?.dropOffDate, rentBuffer));
  const [plannedDays, setPlannedDays] = useState(
    countDays(rent?.pickUpDate, rent?.dropOffDate, rentBuffer),
  );
  const [freeDailyKm, setFreeDailyKm] = useState(0);
  const [extraKmCost, setExtraKmCost] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [rentData, setRentData] = useState(rent); //eslint-disable-line
  const [ranges, setRanges] = useState([]);
  const [rangesAvailable, setRangesAvailable] = useState([]);
  const [fareDetails, setFareDetails] = useState(null);
  const [showRangeSelector, setShowRangeSelector] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModal, setErrorModal] = useState('');

  const [showLoading, setShowLoading] = useState(false);
  const [errorToastEnabled, setErrorToastEnabled] = useState(false);
  const [errorToastMessage, setErrorToastMessage] = useState('');

  useEffect(() => {
    getFare();
    fetchRanges();

    if (rentData) {
      form.setValue('km.pickUp', rentData?.km?.pickUp || '0');

      form.setValue(
        'km.dropOff',
        phase === 'pickUp' ? undefined : rentData?.km?.dropOff || rentData?.km?.pickUp || '0',
      );
      form.setValue('startTime', moment(rentData.pickUpDate).format().slice(0, 16));
      form.setValue('closeTime', moment(rentData.expectedDropOffDate).format('YYYY-MM-DDTHH:mm'));
      form.setValue('dropOffDate', moment(rentData.dropOffDate).format('YYYY-MM-DDTHH:mm'));
      form.setValue('newRange', rentData?.range);
      setCloseRentInfo({
        km: {
          pickUp: rentData?.km?.pickUp || '0',
          dropOff: rentData?.km?.dropOff || rentData?.km?.pickUp || '0',
        },
        startTime: moment(rentData.pickUpDate).format().slice(0, 16),
        closeTime: moment(rentData.dropOffDate).format('YYYY-MM-DDTHH:mm'),
      });
    }
  }, [rentData]); // eslint-disable-line

  useEffect(() => {
    updateFinalKmCost();
    //eslint-disable-next-line
  }, [form.watch('km.pickUp')]);

  useEffect(() => {
    updateFinalKmCost();
    //eslint-disable-next-line
  }, [form.watch('km.dropOff')]);

  useEffect(() => {
    updateFinalKmCost();
    //eslint-disable-next-line
  }, [form.watch('closeTime')]);

  useEffect(() => {
    const newDays = countDays(rentData?.pickUpDate, rentData?.dropOffDate, rentBuffer);
    setDays(newDays);
    updateFinalKmCost();
    //eslint-disable-next-line
    const data = {
      dropOffDate: form.getValues('closeTime'),
    };

    //eslint-disable-next-line
  }, [form.watch('closeTime')]);

  const updateRange = async (rangeId) => {
    try {
      //eslint-disable-next-line
      const data = {
        range: rangeId,
      };

      //eslint-disable-next-line
      const fareData = rentData?.priceList.fares.find((item) => {
        return item?.group === rentData?.group?._id && item?.range === form.getValues('newRange');
      });

      const selectedFare = await http({ url: `/fares/${fareData?.fare}` });
      setFareDetails(selectedFare);

      // data.fare = selectedFare._id;

      await http({
        url: `/rents/${rentData._id}`,
        method: 'PUT',
        form: data,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const updateRangesAvailable = async (date) => {
    try {
      const newDays = countDays(rentData?.pickUpDate, date, rentBuffer);
      setPlannedDays(newDays);
      const rangesToUse = ranges.filter((range) => {
        return range.from <= newDays && range.to >= newDays;
      });

      setRangesAvailable(rangesToUse);
      form.setValue('newRange', rangesToUse[0]?._id);
      // const selectedFare = await getFare(ranges.find((range) => range._id === rangesToUse[0]?._id));

      const fareData = rentData?.priceList.fares.find((item) => {
        return item?.group === rentData?.group?._id && item?.range === rangesToUse[0]?._id;
      });

      const fare = await http({ url: `/fares/${fareData?.fare}` });
      setFareDetails(fare);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRanges = async () => {
    try {
      const response = await http({ url: '/pricing/range' });
      setRanges(response.ranges);
      const rangesToUse = response.ranges.filter((range) => {
        return range.from <= plannedDays && range.to >= plannedDays;
      });
      setRangesAvailable(rangesToUse);

      return response.ranges;
    } catch (err) {
      console.error(err);
    }
  };

  const getFare = async (rangeInput = null) => {
    // let range = null;
    // if (!rangeInput) {
    //   const ranges = await fetchRanges();
    //   range = ranges?.find((item) => item.from <= plannedDays && item.to >= plannedDays);

    //   if (!range) {
    //     toast.error('Errore nel calcolo della fascia');
    //     return;
    //   }

    // } else {
    //   range = rangeInput;
    // }
    // const priceList = rentData?.priceList;

    // if (!priceList) return;
    // if (!priceList?.fares?.length) return;

    // const fare = priceList.fares.find((item) => {
    //   return item?.group === rentData?.group?._id && item?.range === range?._id;
    // });

    const fare = rentData?.fare;

    // const info = await http({ url: `/fares/${fare?.fare}` });

    setFareDetails(fare);
    if (!fare) return;
    // const response = await http({ url: `/fares/${fare?.fare}` });

    // if (response) {
    //   setFreeDailyKm(response?.freeDailyKm);
    //   setExtraKmCost(response?.extraKmFare);
    // }

    // return response;

    if (fare) {
      setFreeDailyKm(fare?.freeDailyKm);
      setExtraKmCost(fare?.extraKmFare);
    }

    return fare;
  };

  const updateFinalKmCost = async () => {
    try {
      // Retrieve up-to-date form values directly
      const { pickUp, dropOff } = form.getValues('km');

      if (!extraKmCost) return;

      // Reset error toast
      setErrorToastEnabled(false);
      setErrorToastMessage('');

      // Calculate km difference
      const kmDiff = dropOff - pickUp;

      // Show error toast if dropOff km is less than pickUp km
      if (dropOff < pickUp) {
        setErrorToastEnabled(true);
        setErrorToastMessage(
          'Attenzione: i Km Finali non possono essere inferiori dei Km Iniziali',
        );
        return; // Stop execution if this condition is met
      }

      setFareDetails(
        rentData?.priceList.fares.find((item) => {
          return item?.group === rentData?.group?._id && item?.range === form.getValues('newRange');
        }),
      );

      const freeKm = freeDailyKm * days;
      const update = {
        km: {
          pickUp: pickUp,
          dropOff: dropOff,
          total: kmDiff,
          freeKm: freeKm,
          extraKm: Math.max(0, kmDiff - freeKm),
          kmPrice: extraKmCost,
        },
        freeDailyKm: freeDailyKm,
        kmExtraAmount: Math.max(0, extraKmCost * (kmDiff - freeKm)).toFixed(2),
      };

      await http({
        url: `/rents/km/${rentData._id}`,
        method: 'PUT',
        form: update,
      });

      if (phase === 'dropOff') {
        const response = await http({ url: `/rents/${rentData?._id}` });
        updatePrice(response);
      }
    } catch (err) {
      setErrorToastEnabled(true);
      console.error(err);
      const error = err?.error?.replace('Error: ', 'Attenzione: ');
      setErrorToastMessage(error);
    }
  };

  const calculateExtraKmCost = () => {
    const extraKm = Math.max(
      0,
      form.watch('km.dropOff') - form.watch('km.pickUp') - freeDailyKm * days,
    );
    const extraCost = extraKm * extraKmCost;
    return extraCost;
  };

  const updateShowModal = (dropOffType = 'prevista') => {
    if (rentData?.state === 'aperto') {
      setShowModal(showModal ? null : dropOffType);
      form.setValue(
        'newCloseTime',
        moment(rentData.expectedDropOffDate).format('YYYY-MM-DDTHH:mm'),
      );
      form.setValue('newRange', rentData?.range);
      setPlannedDays(countDays(rentData.pickUpDate, rentData.dropOffDate, rentBuffer));
      setShowRangeSelector(false);
    } else {
      toast.error('Non è possibile modificare la data di chiusura');
    }
  };

  const updateMovoCloseTime = async (type = false) => {
    try {
      if (type == 'effettiva') {
        const dropOffDate = moment(form.getValues('dropOffDate'));
        const elapsed = dropOffDate.diff(moment(), 'minutes') * -1;

        if (elapsed > 60 || elapsed < 0) {
          if (elapsed < 0) {
            toast.error('Non è possibile impostare la data di chiusura nel futuro');
          } else {
            toast.error('Non è possibile modificare la data effettiva di chiusura a più di un\'ora fa');
          }
          form.setValue('dropOffDate', moment().format('YYYY-MM-DD HH:mm'))
          return;
        }

        returnCloseTime(form.getValues('dropOffDate'));
        setShowModal(false);
        return;
      }

      setShowErrorModal(false);
      setShowLoading(true);

      const priceList = rentData?.priceList;

      if (!priceList) return;
      if (!priceList?.fares?.length) return;

      const fareData = priceList.fares.find((item) => {
        return item?.group === rentData?.group?._id && item?.range === form.getValues('newRange');
      });

      const data = {
        expectedDropOffDate: form.getValues('newCloseTime'),
        fare: fareData?.fare,
        mode: 'newCloseTime',
        range: form.getValues('newRange'),
      };

      const response = await http({
        url: `/rents/${rentData._id}`,
        method: 'PUT',
        form: data,
      });

      setRentData(response);

      await updatePrice(response);

      setPlannedDays(countDays(rentData.pickUpDate, form.getValues('newCloseTime'), rentBuffer));

      setShowLoading(false);
      setShowModal(false);
    } catch (err) {
      console.error(err);
      setShowLoading(false);
      setShowErrorModal(true);
      setErrorModal(err.error);
    }
  };

  const isUpdateDropOffDateDisabled = () => {
    const state = rentData?.state; //eslint-disable-line
    return true;
  };

  const triggerOnBlurToastMessage = () => {
    if (errorToastEnabled) {
      toast.error(errorToastMessage);
      setErrorToastEnabled(false, '');
    }
  };

  return (
    <WhiteBox className="mx-0 p-6">
      <div className="transition-all duration-1000">
        <form>
          <fieldset disabled={form.formState.isSubmitting} className="w-full">
            <div className="flex gap-x-3 flex-wrap md:flex-nowrap">
              <div className="w-1/5 max-w-64">
                <FormLabel>Inizio</FormLabel>
                <TextField
                  form={form}
                  name="startTime"
                  type="datetime-local"
                  placeholder="Inizio"
                  disabled={true}
                />
              </div>
              <div className="w-2/12 max-w-64">
                <FormLabel>KM Iniziali</FormLabel>
                <TextField
                  form={form}
                  name="km.pickUp"
                  type="number"
                  placeholder="KM Iniziali"
                  disabled={phase === 'dropOff' || viewMode}
                  onChangeFunction={(e) => {
                    setCloseRentInfo({
                      km: { pickUp: e.target.value, dropOff: closeRentInfo.km.dropOff },
                      closeTime: closeRentInfo.closeTime,
                    });
                  }}
                  validation={{
                    required: { value: true, message: 'KM Iniziali' },
                  }}
                />
              </div>
              {rentStateIsEqualOrAfter(rent, 'chiuso') ? (
                <>
                  <div className="w-1/5 max-w-64">
                    <div className="flex">
                      <FormLabel>Fine Prevista</FormLabel>
                      {rentData?.state === 'aperto' ? !fromCorporate && (
                        <div
                          className="mt-2.5 ml-1 cursor-pointer hover:opacity-70 text-sm"
                          onClick={() => {
                            updateShowModal();
                          }}
                        >
                          <FaPen />
                        </div>
                      ) : null}
                    </div>
                    <TextField
                      form={form}
                      name="closeTime"
                      type="datetime-local"
                      placeholder="Fine Prevista"
                      disabled={isUpdateDropOffDateDisabled()}
                      min={moment
                        .max(moment(rent.pickUpDate), moment().subtract(2, 'hours'))
                        .format('YYYY-MM-DD HH:mm')}
                    />
                  </div>
                  <div className="w-1/5 max-w-64">
                    <div className="flex">
                      <FormLabel>Fine</FormLabel>
                    </div>
                    <TextField
                      form={form}
                      name="dropOffDate"
                      type="datetime-local"
                      placeholder="Fine"
                      disabled={true}
                    />
                  </div>
                </>
              ) : (<>
                <div className="w-1/5 max-w-64">
                  <div className="flex">
                    <FormLabel>Fine Prevista</FormLabel>
                    {rentData?.state === 'aperto' && !fromCorporate && (
                      <div
                        className="mt-2.5 ml-1 cursor-pointer hover:opacity-70 text-sm"
                        onClick={() => {
                          updateShowModal();
                        }}
                      >
                        <FaPen />
                      </div>
                    )}
                  </div>
                  <TextField
                    form={form}
                    name="closeTime"
                    type="datetime-local"
                    placeholder="Fine Prevista"
                    disabled={isUpdateDropOffDateDisabled()}
                    min={moment
                      .max(moment(rent.pickUpDate), moment().subtract(2, 'hours'))
                      .format('YYYY-MM-DD HH:mm')}
                  />
                </div>

                <div className="w-1/5 max-w-64">
                  <div className="flex">
                    <FormLabel>Fine</FormLabel>
                    {rentData?.state === 'aperto' && isClosingMovo ? (
                      <div
                        className="mt-2.5 ml-1 cursor-pointer hover:opacity-70 text-sm"
                        onClick={() => {
                          updateShowModal('effettiva');
                        }}
                      >
                        <FaPen />
                      </div>
                    ) : null}
                  </div>
                  <TextField
                    form={form}
                    name="dropOffDate"
                    type="datetime-local"
                    placeholder="Fine"
                    disabled={true}
                  />
                </div>
              </>
              )}
              <div className="w-2/12 max-w-64">
                <FormLabel>KM Finali</FormLabel>
                <TextField
                  form={form}
                  name="km.dropOff"
                  type="number"
                  placeholder="KM Finali"
                  disabled={phase === 'pickUp' || viewMode}
                  onChangeFunction={(e) => {
                    getCloseRentInfo({
                      km: { pickUp: closeRentInfo.km.pickUp, dropOff: e.target.value },
                      closeTime: closeRentInfo.closeTime,
                    });
                    setCloseRentInfo({
                      km: { pickUp: closeRentInfo.km.pickUp, dropOff: e.target.value },
                      closeTime: closeRentInfo.closeTime,
                    });
                  }}
                  onBlur={(e) => {
                    triggerOnBlurToastMessage();
                  }}
                  validation={{
                    required: { value: true, message: 'KM Finali' },
                  }}
                  min={rentData?.km?.pickUp || 0}
                />
              </div>
            </div>
          </fieldset>
        </form>
        {phase === 'dropOff' ? (
          <>
            <div className="mt-5 flex space-x-5">
              <div className="flex flex-col">
                <div className="font-semibold text-sm">Km previsti totali</div>
                <p className="text-left font-semibold text-gray-600">
                  {freeDailyKm * days}{' '}
                  {`(${days} ${days === 1 ? 'giorno' : 'giorni'} x ${freeDailyKm} km)`}
                </p>
              </div>
              <div className="flex flex-col">
                <div className="font-semibold text-sm">Giorni totali</div>
                <p className="text-left font-semibold text-gray-600">
                  {`${days} ${days === 1 ? 'giorno' : 'giorni'}`}
                </p>
              </div>
              <div className="flex flex-col">
                <div className="font-semibold text-sm">Km totali</div>
                <p className="text-left font-semibold text-gray-600">
                  {Math.max(0, form.watch('km.dropOff') - form.watch('km.pickUp')) + ''}
                </p>
              </div>
              <div className="flex flex-col">
                <div className="font-semibold text-sm">Km extra</div>
                <p className="text-left font-semibold text-gray-600">
                  {Math.max(
                    0,
                    form.watch('km.dropOff') - form.watch('km.pickUp') - freeDailyKm * days,
                  ) + ''}
                </p>
              </div>
              <div className="flex flex-col">
                <div className="font-semibold text-sm">Costo Km extra</div>
                <p className="text-left font-semibold text-gray-600">{convertPrice(extraKmCost)}</p>
              </div>
              <div className="flex flex-col">
                <div className="font-semibold text-sm">Stima costo extra</div>
                <p className="text-left font-semibold text-gray-600">
                  {convertPrice(calculateExtraKmCost())}
                </p>
              </div>
            </div>
          </>
        ) : null}
      </div>

      <Modal
        headerChildren={'Aggiorna Prevista Fine'}
        isVisible={showModal}
        onClose={updateShowModal}
      >
        {showLoading ? (
          <div className="w-64 h-32 flex items-center">
            <Loader />
          </div>
        ) : (
          <div className="lg:min-w-60">
            <div className="flex justify-end">
              <div className="flex-initial w-64 pr-6">
                <FormLabel>Inizio</FormLabel>
                <TextField
                  form={form}
                  name="startTime"
                  type="datetime-local"
                  placeholder="Inizio"
                  disabled={true}
                />
              </div>
              {showModal === 'prevista' ?
                <div className="flex-initial w-64">
                  <FormLabel>Fine Prevista</FormLabel>
                  <TextField
                    form={form}
                    name="newCloseTime"
                    type="datetime-local"
                    min={moment().format('YYYY-MM-DDTHH:mm')}
                    placeholder="Fine Prevista"
                    disabled={false}
                    onChangeFunction={(e) => {
                      updateRangesAvailable(e.target.value);
                      setShowRangeSelector(true);
                    }}
                  />
                </div>
                : showModal === 'effettiva' ?
                  <div className="flex-initial w-64">
                    <FormLabel>Fine effettiva</FormLabel>
                    <TextField
                      form={form}
                      name="dropOffDate"
                      type="datetime-local"
                      placeholder="Fine effettiva"
                      disabled={false}
                      onChangeFunction={(e) => {
                        updateRangesAvailable(e.target.value);
                        setShowRangeSelector(true);
                      }}
                    />
                  </div>
                  : null}
            </div>
            <div className="flex">
              <div className="flex-initial w-1/5 max-w-64 pr-6">
                {showRangeSelector && showModal === 'prevista' && (
                  <div>
                    <FormLabel>Fascia</FormLabel>
                    <SelectField
                      className=""
                      form={form}
                      name="newRange"
                      placeholder="Fascia"
                      options={rangesAvailable.map((range) => {
                        return { value: range._id, label: range.name };
                      })}
                      onChangeFunction={(e) => {
                        e.preventDefault();
                        updateRange(e.target.value);
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
            {plannedDays && showModal === 'prevista' ? (
              <div className="flex">
                <div className="w-full p-2 mt-4 mb-2">
                  {/* add fare details here */}
                  {fareDetails && (
                    <div className="flex gap-4 justify-between">
                      <div className="flex flex-col">
                        <div className="font-semibold text-sm">Giorni Totali</div>
                        <p className="text-left font-semibold text-gray-600">{plannedDays}</p>
                      </div>
                      <div className="flex flex-col">
                        <div className="font-semibold text-sm">Tariffa Base</div>
                        <p className="text-left font-semibold text-gray-600">
                          {convertPrice(fareDetails.baseFare)}
                        </p>
                      </div>
                      <div className="flex flex-col">
                        <div className="font-semibold text-sm">Giorno Extra</div>
                        <p className="text-left font-semibold text-gray-600">
                          {convertPrice(fareDetails.extraDayFare)}
                        </p>
                      </div>
                      <div className="flex flex-col">
                        <div className="font-semibold text-sm">Km Extra</div>
                        <p className="text-left font-semibold text-gray-600">
                          {convertPrice(fareDetails.extraKmFare)}
                        </p>
                      </div>
                      <div className="flex flex-col">
                        <div className="font-semibold text-sm">Km Inclusi</div>
                        <p className="text-left font-semibold text-gray-600">
                          {fareDetails.freeDailyKm * plannedDays} km
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <></>
            )}
            <div className="text-right">
              <Button
                onClick={() => {
                  updateMovoCloseTime(showModal);
                }}
                btnStyle="white"
                className="!py-1"
                disabled={form.formState.isSubmitting || !plannedDays}
              >
                Aggiorna
              </Button>
            </div>
            {showErrorModal && (
              <div className="text-red-700 bg-red-200 rounded-lg p-4 mt-3 text-md">
                {errorModal}
              </div>
            )}
          </div>
        )}
      </Modal>
    </WhiteBox>
  );
};

export default PickupDropoffInfo;
