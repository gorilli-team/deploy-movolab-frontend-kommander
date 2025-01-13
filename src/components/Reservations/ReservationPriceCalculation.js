import React, { useContext, useEffect, useState } from 'react';
import { FaPencilAlt } from 'react-icons/fa';
import { http, MOVOLAB_ROLE_ADMIN } from '../../utils/Utils';
import { convertPrice } from '../../utils/Prices';
import ElementLabelXS from '../UI/ElementLabelXS';
import UpdatePriceModal from '../UI/ManagementModal';
import PriceRow from '../UI/PriceRow';
import WhiteBox from '../UI/WhiteBox';
import PriceSection from '../Rents/rentElements/PriceSection';
import PriceRowDetails from '../Rents/rentElements/PriceRowDetails';
import toast from 'react-hot-toast';
import { UserContext } from '../../store/UserContext';

const ReservationPriceCalculation = ({
  reservation,
  phase,
  fromCorporate,
  mode,
  className = '',
  isCollapsible = true,
  children = null,
  innerClassName = '',
  fetchReservation,
}) => {
  const [expanded, setExpanded] = useState(true);
  const [reservationExtraServices, setReservationExtraServices] = useState([]); //eslint-disable-line
  const [isDiscounted, setIsDiscounted] = useState(false); //eslint-disable-line
  const [fare, setFare] = useState({}); //eslint-disable-line
  const [showCostModal, setShowCostModal] = useState(false);
  const [costType, setCostType] = useState('');
  const [costAmount, setCostAmount] = useState(0);
  const [kaskoAmount, setKaskoAmount] = useState(0); //eslint-disable-line
  const [reservationData, setReservationData] = useState(reservation);
  const [priceEditUtilizzo, setPriceEditUtilizzo] = useState(false);
  const [priceEditPercentageUtilizzo, setPriceEditPercentageUtilizzo] = useState(false);
  const [priceEditExtra, setPriceEditExtra] = useState(false);
  const extraServicesAmountInfo = reservation?.price?.priceInfo?.extraServicesAmountInfo || [];
  const extraCostsAmountInfo = reservation?.price?.priceInfo?.extraCostsAmountInfo || [];

  const { data: currentClient } = useContext(UserContext);
  const isAdmin = currentClient?.role === MOVOLAB_ROLE_ADMIN; // eslint-disable-line no-unused-vars

  let priceEdit = false;
  if (fromCorporate === true) {
    priceEdit = false;
  } else {
    priceEdit =
      reservation?.state === 'draft' ||
      reservation?.state === 'aperto' ||
      reservation?.state === 'attivo';
  }

  const definePriceEditUtilizzo = (priceEdit, faresDiscount) => {
    if (faresDiscount !== undefined) {
      if (priceEdit) {
        setPriceEditUtilizzo(faresDiscount);
      } else {
        setPriceEditUtilizzo(false);
      }
    }
  };

  const definePriceEditPercentageUtilizzo = (priceEdit, faresDiscount) => {
    if (faresDiscount !== undefined) {
      if (priceEdit) {
        setPriceEditPercentageUtilizzo(faresDiscount);
      } else {
        setPriceEditPercentageUtilizzo(false);
      }
    }
  };

  const definePriceEditExtra = (priceEdit, extraDiscount) => {
    if (extraDiscount !== undefined) {
      if (priceEdit) {
        setPriceEditExtra(extraDiscount);
      } else {
        setPriceEditExtra(false);
      }
    }
  };

  useEffect(() => {
    definePriceEditUtilizzo(
      priceEdit,
      reservation?.workflow?.administration?.faresDiscountMaxEuro > 0,
    );
    definePriceEditPercentageUtilizzo(
      priceEdit,
      reservation?.workflow?.administration?.faresDiscountMaxPercentage > 0,
    );
    definePriceEditExtra(priceEdit, reservation?.workflow?.administration?.extraDiscount);
  }, [priceEdit, reservation]);

  useEffect(() => {
    setReservationData(reservation);
  }, [reservation]);

  useEffect(() => {
    getFare();
    getKaskoAmount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reservationData]);

  useEffect(() => {
    fetchExtraServices();
    checkDiscounted();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reservationData]);

  const getKaskoAmount = async () => {
    if (reservationData?.price?.kaskoFranchiseAmount) {
      const value = Math.min(
        reservationData?.price?.kaskoFranchiseAmount,
        reservationData?.price?.damagesAmount,
      );
      setKaskoAmount(value);
    } else {
      setKaskoAmount(reservationData?.price?.damagesAmount);
    }
  };

  const fetchRanges = async () => {
    try {
      const response = await http({ url: '/pricing/range' });

      return response.ranges;
    } catch (err) {
      console.error(err);
    }
  };

  const closeModal = () => {
    setShowCostModal(false);
  };

  const getFare = async () => {
    const ranges = await fetchRanges();
    const priceList = reservationData?.priceList;

    if (!priceList) return;
    if (!priceList?.fares?.length) return;
    const range = ranges?.find(
      (item) => item.from <= reservationData?.totalDays && item.to >= reservationData?.totalDays,
    );
    const fare = priceList.fares.find((item) => {
      return item?.group === reservationData?.group?._id && item?.range === range?._id;
    });

    const response = await http({ url: `/fares/${fare?.fare}` });
    setFare(response);
  };

  const fetchExtraServices = async () => {
    if (!reservationData?._id) return;
    const response = await http({
      url: `/reservations/extraServices/${reservationData._id}?phase=pickUp`,
    });
    setReservationExtraServices(response.reservationExtraServices);
  };

  const openCostModal = (type, finalCost) => {
    setCostType(type);
    setCostAmount(finalCost);
    setShowCostModal(true);
  };

  const calculateDifference = (newPrice, oldPrice) => {
    const difference = parseFloat((newPrice - oldPrice).toFixed(2));
    if (difference > 0) {
      toast.error('Il prezzo inserito è maggiore del prezzo attuale');
      return oldPrice;
    } else {
      return difference;
    }
  };

  const updateCustomCost = async (amountType, element, value, discountPercentage) => {
    try {
      const update = await http({
        url: `/reservations/${reservationData._id}/applyDiscount`,
        method: 'PUT',
        form: {
          discountField: amountType,
          newPrice: parseFloat(value).toFixed(2),
          discountPercentage,
        },
      });
      setReservationData(update);
    } catch (error) {
      console.error(error);
      toast.error(error?.error);
    }
  };

  const updateExtraCostCost = async (type, extraCost, value, elementCount) => {
    try {
      const subTotal = extraCost?.amountInfo?.subTotal || 0;
      const newPrice = subTotal + calculateDifference(value, subTotal);

      await http({
        url: `/reservations/${reservationData._id}/applyExtraCostDiscount`,
        method: 'PUT',
        form: {
          extraCostId: extraCost.extraCost,
          elementCount: elementCount,
          newPrice: parseFloat(newPrice).toFixed(2),
        },
      });

      fetchReservation();
    } catch (error) {
      console.error(error);
    }
  };

  const updateExtraServiceCost = async (type, extraService, value, elementCount) => {
    try {
      const subTotal = extraService?.amountInfo?.subTotal || 0;
      const newPrice = subTotal + calculateDifference(value, subTotal);

      //eslint-disable-next-line
      const update = await http({
        url: `/reservations/${reservationData._id}/applyExtraServiceDiscount`,
        method: 'PUT',
        form: {
          extraServiceId: extraService.extraService,
          elementCount: elementCount,
          newPrice: parseFloat(newPrice).toFixed(2),
        },
      });

      fetchReservation();
    } catch (error) {
      console.error(error);
    }
  };

  const checkDiscounted = () => {
    if (reservationData?.price?.discount?.amount || reservationData?.price?.discount?.percentage) {
      setIsDiscounted(true);
    } else {
      setIsDiscounted(false);
    }
  };

  const discountedCost =
    reservationData?.price?.priceInfo?.amountInfo?.finalPrice -
    (reservationData?.price?.discount?.amount
      ? reservationData?.price?.discount?.amount
      : reservationData?.price?.discount?.percentage
      ? (reservationData?.price?.priceInfo?.amountInfo?.finalPrice *
          reservationData?.price?.discount?.percentage) /
        100
      : 0);

  const invTypes = { movolab: 'Movolab', customer: 'Diretta' };
  const invoicingType = (type) => invTypes[type] || '';

  if (!reservationData) return null;

  return (
    <WhiteBox
      className={`mx-0 ${className}`}
      innerClassName="px-6 py-5"
      collapsibleClassName={mode === 'small' || expanded ? 'px-6 pb-3' : 'p-0'}
      headerChildren={
        <div className="flex items-center justify-between">
          <div className="font-bold text-lg">Calcolo Prezzo</div>

          {mode !== 'small' && !expanded ? (
            <div className="flex text-sm font-semibold pr-10 gap-2">
              {reservationData?.price?.deposit > 0 ? (
                <div className="flex rounded-xl px-3 py-0.5 bg-gray-300">
                  <h4 className="mr-20">Deposito</h4>
                  <h4>{convertPrice(reservationData?.price?.deposit || 0)}</h4>
                </div>
              ) : null}

              <div className="flex rounded-xl px-3 py-0.5 bg-sky-600 text-white">
                <h4 className="mr-20">Totale movo</h4>
                <h4>{convertPrice(reservationData?.price?.totalAmount || 0)}</h4>
              </div>
            </div>
          ) : null}
        </div>
      }
      isExpanded={true}
      isCollapsible={isCollapsible}
      customCollapsing={true}
      onButtonClick={(exp) => setExpanded(exp)}
    >
      {children}

      <div className={innerClassName}>
        <PriceSection
          expanded={expanded}
          mode={mode}
          sectionTitle="Utilizzo"
          sectionTotal={convertPrice(
            reservationData?.price?.priceInfo?.amountInfo?.finalPrice || 0,
          )}
        >
          <PriceRowDetails
            label="Utilizzo"
            labelDescription={
              <>
                {reservationData?.fare?.calculation === 'unit' ? (
                  <>
                    {convertPrice(reservationData?.price?.dailyAmount)} x{' '}
                    {reservationData?.totalDays} giorn
                    {reservationData?.totalDays === 1 ? 'o' : 'i'}
                  </>
                ) : reservationData?.fare?.calculation === 'range' ? (
                  <>{convertPrice(reservationData?.price?.initialAmount)} (Fissa)</>
                ) : (
                  <></>
                )}
              </>
            }
            discount={reservationData?.price?.priceInfo?.amountInfo?.discountAmount}
            discountPercentage={reservationData?.price?.priceInfo?.amountInfo?.discountPercentage}
            priceEdit={priceEditUtilizzo}
            percentageDiscountEdit={priceEditPercentageUtilizzo}
            totalPriceDiscounted={
              reservationData?.price?.discount?.amount ||
              reservationData?.price?.discount?.percentage
                ? discountedCost
                : ''
            }
            totalPriceVat={reservationData?.price?.priceInfo?.amountInfo?.finalPrice || 0}
            totalPrice={reservationData?.price?.initialAmount}
            type="amountInfo"
            vat={reservationData?.price?.priceInfo?.amountInfo?.vatPercentage + '%'}
            invoicingType={invoicingType(
              reservationData?.price?.priceInfo?.amountInfo?.invoicingType,
            )}
            updatePriceFunction={updateCustomCost}
            mode={mode}
          />
        </PriceSection>

        <div>
          <div className="mt-2 flex flex-wrap">
            {reservationData.price?.rcaFranchiseAmount > 0 ? (
              <div className="flex flex-col mr-10 mb-1">
                <ElementLabelXS bgColor="bg-orange-600" text={'Franchigia RCA'} />

                <div className="flex space-x-2 font-semibold text-gray-600">
                  <span className="font-semibold">
                    {convertPrice(reservationData?.price?.rcaFranchiseAmount)}{' '}
                  </span>
                  {!isAdmin && reservationData.state === 'chiuso' ? null : (
                    <span
                      className="text-sm text-gray-600 mt-1"
                      onClick={() =>
                        openCostModal('rcaFranchise', reservationData?.price?.rcaFranchiseAmount)
                      }
                    >
                      <FaPencilAlt />
                    </span>
                  )}
                </div>
              </div>
            ) : null}
            {reservationData.price?.ifFranchiseAmount > 0 ? (
              <div className="flex flex-col mr-10 mb-1">
                <ElementLabelXS bgColor="bg-yellow-600" text={'Franchigia I/F'} />

                <div className="flex space-x-2 font-semibold text-gray-600">
                  <span className="font-semibold">
                    {convertPrice(reservationData?.price?.ifFranchiseAmount)}{' '}
                  </span>
                  {!isAdmin && reservationData.state === 'chiuso' ? null : (
                    <span
                      className="text-sm text-gray-600 mt-1"
                      onClick={() =>
                        openCostModal('ifFranchise', reservationData?.price?.ifFranchiseAmount)
                      }
                    >
                      <FaPencilAlt />
                    </span>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {extraCostsAmountInfo.length > 0 && (
          <PriceSection
            expanded={expanded}
            mode={mode}
            sectionTitle="Costi extra"
            sectionTotal={convertPrice(reservationData?.price?.extraCostsAmount || 0)}
          >
            {extraCostsAmountInfo.map((extra) => {
              return (
                <PriceRow
                  element={extra}
                  mode={mode}
                  key={extra._id}
                  type="extraCost"
                  updatePriceFunction={updateExtraCostCost}
                  priceEdit={priceEditExtra}
                />
              );
            })}
          </PriceSection>
        )}

        {extraServicesAmountInfo.length > 0 && (
          <PriceSection
            expanded={expanded}
            mode={mode}
            sectionTitle="Servizi extra"
            sectionTotal={convertPrice(reservationData?.price?.extraServicesAmount || 0)}
          >
            {extraServicesAmountInfo.map((extra) => {
              return (
                <PriceRow
                  element={extra}
                  mode={mode}
                  key={extra._id}
                  type="extraService"
                  updatePriceFunction={updateExtraServiceCost}
                  priceEdit={priceEditExtra}
                />
              );
            })}
          </PriceSection>
        )}

        <PriceSection
          expanded={expanded}
          mode={mode}
          sectionTitle="Preventivo movo"
          sectionBg="bg-sky-600 text-white"
          sectionTotal={convertPrice(reservationData?.price?.totalAmount || 0)}
        />

        {reservationData?.workflow &&
        reservationData?.workflow?.administration &&
        reservationData?.workflow?.administration.prepaidReservation > 0 ? (
          <PriceSection
            expanded={expanded}
            mode={mode}
            sectionTitle="Pagamento alla Prenotazione"
            sectionBg="bg-gray-100"
            sectionTotal={reservationData?.workflow?.administration.prepaidReservation + '%'}
          />
        ) : null}

        {reservationData?.price?.deposit > 0 ? (
          <PriceSection
            expanded={expanded}
            mode={mode}
            sectionTitle="Desposito"
            sectionBg="bg-gray-300"
            sectionTotal={convertPrice(reservationData?.price?.deposit || 0)}
          />
        ) : null}
      </div>
      {showCostModal ? (
        <UpdatePriceModal
          type={costType}
          costAmount={costAmount}
          updateCustomCost={updateCustomCost}
          closeModal={closeModal}
        />
      ) : null}
    </WhiteBox>
  );
};

export default ReservationPriceCalculation;
