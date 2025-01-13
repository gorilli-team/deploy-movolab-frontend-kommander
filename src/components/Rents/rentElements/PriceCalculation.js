import React, { useEffect, useState } from 'react';
import { http } from '../../../utils/Utils';
import { convertPrice } from '../../../utils/Prices';
import PriceRow from '../../UI/PriceRow';
import WhiteBox from '../../../components/UI/WhiteBox';
import PriceRowDetails from './PriceRowDetails';
import PriceSection from './PriceSection';
import toast from 'react-hot-toast';
import { decideDamagesCostType } from '../../../utils/Damages';
import { FaEye, FaRegEye } from 'react-icons/fa6';

const PriceCalculation = ({
  rent,
  phase,
  mode = 'full',
  className = '',
  isExpanded = true,
  startExpanded = true,
  isCollapsible = true,
  children = null,
  innerClassName = '',
  ...props
}) => {
  const [expanded, setExpanded] = useState(startExpanded);
  const [showRevenue, setShowRevenue] = useState(false);
  const [revenueShare, setRevenueShare] = useState(null);
  const [kaskoAmount, setKaskoAmount] = useState(0); //eslint-disable-line
  const [rentData, setRentData] = useState(rent);
  const [priceEditUtilizzo, setPriceEditUtilizzo] = useState(false);
  const [priceEditPercentageUtilizzo, setPriceEditPercentageUtilizzo] = useState(false);
  const [priceEditExtra, setPriceEditExtra] = useState(false);
  const extraServicesAmountInfo = rentData?.price?.priceInfo?.extraServicesAmountInfo || [];
  const extraCostsAmountInfo = rentData?.price?.priceInfo?.extraCostsAmountInfo || [];

  const fetchRent = async (rentId) => {
    if (!rentData?.price) {
      try {
        const response = await http({ url: `/rents/${rentId || rent?._id}` });
        setRentData(response);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const fetchRevenue = async (rentData) => {
    if (!rentData?.price) {
      return;
    }

    try {
      const response = await http({ url: `/clientPayments/revenueShares/rent/${rentData?._id}` });
      if (response?.clientAmount) {
        setRevenueShare({ 
          receivedRevenue: rentData?.price?.totalAmount - (response?.movolabAmount?.expectedRevenue || 0),
          estimated: false 
        });

        return;
      }
    } catch (err) {
      if (err?.error !== 'Nessun corrispettivo trovato')
        console.error(err);
    }

    const movolabPayments =
      Object.entries(rentData?.price?.priceInfo)
        .map(([_, itm]) => itm)
        .filter((item) => item?.invoicingType === 'movolab')
        .reduce((s, p) => s + p.subTotal, 0);

    if (movolabPayments) {
      const revenueShare =
      rentData?.priceList?.revenueShare?.priority == 'fares' && rentData?.fare?.revenueShare?.percentage ?
        rentData?.fare?.revenueShare?.percentage :
        rentData?.priceList?.revenueShare?.percentage;

      setRevenueShare({ 
        receivedRevenue: rentData?.price?.totalAmount - (movolabPayments * revenueShare / 100),
        estimated: true 
      });
    }
  };

  useEffect(() => {
    fetchRent(rent.id);
  }, [rent]); // eslint-disable-line

  // Fix-Me
  /* useEffect(() => {
    fetchRevenue(rentData);
  }, [rentData]); // eslint-disable-line */

  const amountInfo = {
    name: 'Utilizzo',
    amountInfo: rentData?.price?.priceInfo?.amountInfo,
  };

  const extraDaysAmountInfo = {
    name: 'Giorni Extra',
    amountInfo: rentData?.price?.priceInfo?.extraDaysAmountInfo,
  };

  const damagesAmountInfo = {
    name: 'Costo Danni',
    amountInfo: rentData?.price?.priceInfo?.damagesAmountInfo,
  };
  const kmExtraAmountInfo = {
    name: 'KM Extra',
    amountInfo: rentData?.price?.priceInfo?.kmExtraAmountInfo,
  };
  const fuelExtraAmountInfo = {
    name: 'Extra Carburante',
    amountInfo: rentData?.price?.priceInfo?.fuelExtraAmountInfo,
  };
  const rcaFranchise = {
    name: 'Franchigia RCA',
    amountInfo: rentData?.price?.priceInfo?.rcaFranchiseAmountInfo,
  };
  const kaskoFranchise = {
    name: 'Franchigia Kasko',
    amountInfo: rentData?.price?.priceInfo?.kaskoFranchiseAmountInfo,
  };
  const ifFranchise = {
    name: 'Franchigia Incendio e Furto',
    amountInfo: rentData?.price?.priceInfo?.ifFranchiseAmountInfo,
  };

  const decideDamagesCost = decideDamagesCostType(
    rentData?.price?.priceInfo?.kaskoFranchiseAmountInfo,
    rentData?.price?.priceInfo?.damagesAmountInfo,
  );

  const priceEdit =
    rentData?.state === 'draft' || rentData?.state === 'aperto' || rentData?.state === 'attivo';

  const definePriceEditUtilizzo = (priceEdit, faresDiscount) => {
    if (faresDiscount !== undefined) {
      if (priceEdit) {
        setPriceEditUtilizzo(faresDiscount > 0);
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
    definePriceEditUtilizzo(priceEdit, rent?.workflow?.administration?.faresDiscountMaxEuro);

    definePriceEditPercentageUtilizzo(
      priceEdit,
      rent?.workflow?.administration?.faresDiscountMaxPercentage,
    );
    definePriceEditExtra(priceEdit, rent?.workflow?.administration?.extraDiscount);
  }, [priceEdit, rent]);

  useEffect(() => {
    fetchRent(rent.id);
  }, [rent]); // eslint-disable-line

  useEffect(() => {
    // getFare();
    getKaskoAmount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rentData]);

  const getKaskoAmount = async () => {
    if (rentData?.price?.kaskoFranchiseAmount) {
      const value = Math.min(rentData?.price?.kaskoFranchiseAmount, rentData?.price?.damagesAmount);
      setKaskoAmount(value);
    } else {
      setKaskoAmount(rentData?.price?.damagesAmount);
    }
  };

  const calculateDifference = (newPrice, oldPrice) => {
    const difference = parseFloat((newPrice - oldPrice).toFixed(2));
    if (difference > 0) {
      return oldPrice;
    } else {
      return difference;
    }
  };

  const updateCustomCost = async (amountType, element, value, discountPercentage) => {
    try {
      const subTotal = rentData?.price?.priceInfo?.[amountType]?.subTotal || 0;
      const newPrice = subTotal + calculateDifference(value, subTotal);

      await http({
        url: `/rents/${rentData._id}/applyDiscount`,
        method: 'PUT',
        form: {
          discountField: amountType,
          newPrice: newPrice,
          discountPercentage: discountPercentage,
        },
      });

      fetchRent(rentData._id);
    } catch (err) {
      toast.error(err.error || 'Errore');
      console.error(err);
    }
  };

  const updateExtraServiceCost = async (type, extraService, value, elementCount) => {
    try {
      const subTotal = extraService?.amountInfo?.subTotal || 0;
      const newPrice = subTotal + calculateDifference(value, subTotal);

      await http({
        url: `/rents/${rentData._id}/applyExtraServiceDiscount`,
        method: 'PUT',
        form: {
          extraServiceId: extraService.extraService,
          elementCount: elementCount,
          newPrice: parseFloat(newPrice).toFixed(2),
        },
      });

      fetchRent(rentData._id);
    } catch (err) {
      toast.error(err.error || 'Errore');
      console.error(err);
    }
  };

  const updateExtraCostCost = async (type, extraCost, value, elementCount) => {
    try {
      const subTotal = extraCost?.amountInfo?.subTotal || 0;
      const newPrice = subTotal + calculateDifference(value, subTotal);

      await http({
        url: `/rents/${rentData._id}/applyExtraCostDiscount`,
        method: 'PUT',
        form: {
          extraCostId: extraCost.extraCost,
          elementCount: elementCount,
          newPrice: parseFloat(newPrice).toFixed(2),
        },
      });

      fetchRent(rentData._id);
    } catch (err) {
      toast.error(err.error || 'Errore');
      console.error(err);
    }
  };

  const invTypes = { movolab: 'Movolab', customer: 'Diretta' };
  const invoicingType = (type) => invTypes[type] || '';

  if (!rentData) return null;

  const totalUserPrice =
    (rentData?.price?.priceInfo?.amountInfo?.finalPrice || 0) +
    (fuelExtraAmountInfo?.amountInfo?.finalPrice || 0) +
    (kmExtraAmountInfo?.amountInfo?.finalPrice || 0);

  const kaskoInitial = kaskoFranchise?.amountInfo?.initialPrice || 0; // eslint-disable-line
  const damageInitial = damagesAmountInfo?.amountInfo?.initialPrice || 0;
  const damagesCost = damagesAmountInfo?.amountInfo?.finalPrice || 0;
  const rcaInitialCost = rcaFranchise?.amountInfo?.initialPrice || 0;
  const ifInitialCost = ifFranchise?.amountInfo?.initialPrice || 0;

  const totalFranchisesCost =
    rcaFranchise?.amountInfo?.finalPrice +
    ifFranchise?.amountInfo?.finalPrice +
    (decideDamagesCost === 'kasko' ? kaskoFranchise?.amountInfo?.finalPrice : 0) +
    (decideDamagesCost === 'damages' ? damagesAmountInfo?.amountInfo?.finalPrice : 0);

  const shouldShowFranchisesSection =
    totalFranchisesCost > 0 || damageInitial > 0 || rcaInitialCost > 0 || ifInitialCost > 0;

  return (
    <WhiteBox
      className={`mx-0 ${className}`}
      innerClassName="px-6 py-5"
      collapsibleClassName={mode === 'small' || expanded ? 'px-6 pb-3' : 'p-0'}
      headerChildren={
        <div className="flex items-center justify-between" {...props}>
          <div className="font-bold text-lg">Calcolo Prezzo</div>

          {mode !== 'small' && !expanded ? (
            <div className="flex text-sm font-semibold pr-10 gap-2">
              {rentData?.price?.deposit > 0 ? (
                <div className="flex rounded-xl px-3 py-0.5 bg-gray-300">
                  <h4 className="mr-20">Deposito</h4>
                  <h4>{convertPrice(rentData?.price?.deposit || 0)}</h4>
                </div>
              ) : null}

              <div className="flex rounded-xl px-3 py-0.5 bg-sky-600 text-white">
                <h4 className="mr-20">Totale movo
                  {revenueShare ?
                    <>
                      <button type="button" className="relative top-0.5 left-0.5 inline-block px-1" title="Mostra incasso netto" onClick={() => setShowRevenue(!showRevenue)}>
                        {showRevenue ? <FaRegEye /> : <FaEye />}
                      </button>
                      {showRevenue ? ` Netto${revenueShare?.estimated ? ' stimato' : ''}: ${convertPrice(revenueShare.receivedRevenue)}` : null}
                    </>
                    : null}
                </h4>
                <h4>{convertPrice(rentData?.price?.totalAmount || 0)}</h4>
              </div>
            </div>
          ) : null}
        </div>
      }
      isExpanded={false}
      isCollapsible={isCollapsible}
      customCollapsing={true}
      onButtonClick={() => setExpanded(!expanded)}
    >
      {children}

      {mode === 'small' || expanded ? (
        <div className={innerClassName}>
          <PriceSection
            expanded={expanded}
            mode={mode}
            sectionTitle="Utilizzo"
            sectionTotal={convertPrice(totalUserPrice || 0)}
          >
            <PriceRowDetails
              element={amountInfo}
              label="Utilizzo"
              labelDescription={
                <>
                  {rentData?.fare?.calculation === 'unit' ? (
                    <>
                      {convertPrice(rentData?.price?.dailyAmount)} x {rentData?.totalDays} giorn
                      {rentData?.totalDays === 1 ? 'o' : 'i'}
                    </>
                  ) : rentData?.fare?.calculation === 'range' ? (
                    <>{convertPrice(rentData?.price?.initialAmount)} (Fissa)</>
                  ) : (
                    <></>
                  )}
                </>
              }
              discount={
                rentData?.price?.priceInfo?.amountInfo?.discountAmount > 0
                  ? rentData?.price?.priceInfo?.amountInfo?.discountAmount
                  : null
              }
              discountPercentage={rentData?.price?.priceInfo?.amountInfo?.discountPercentage}
              priceEdit={priceEditUtilizzo}
              percentageDiscountEdit={priceEditPercentageUtilizzo}
              totalPriceDiscounted={
                rentData?.price?.priceInfo?.amountInfo?.finalPriceDiscounted || 0
              }
              totalPriceVat={rentData?.price?.priceInfo?.amountInfo?.finalPrice || 0}
              totalPrice={rentData?.price?.initialAmount || 0}
              type="amountInfo"
              vat={rentData?.price?.priceInfo?.amountInfo?.vatPercentage + '%'}
              invoicingType={invoicingType(rentData?.price?.priceInfo?.amountInfo?.invoicingType)}
              mode={mode}
              updatePriceFunction={updateCustomCost}
            />

            {fuelExtraAmountInfo && fuelExtraAmountInfo?.amountInfo?.subTotal > 0 && (
              <PriceRow
                element={fuelExtraAmountInfo}
                type="fuelExtraAmountInfo"
                mode={mode}
                labelDescription={`${rentData?.pickUpState?.fuelLevel - rentData?.dropOffState?.fuelLevel
                  } unità utilizzate`}
                priceEdit={priceEditExtra}
                updatePriceFunction={updateCustomCost}
              />
            )}
            {kmExtraAmountInfo && kmExtraAmountInfo?.amountInfo?.subTotal > 0 && (
              <PriceRow
                element={kmExtraAmountInfo}
                mode={mode}
                labelDescription={`${rentData?.km?.total} km percorsi`}
                type="kmExtraAmountInfo"
                priceEdit={priceEditExtra}
                updatePriceFunction={updateCustomCost}
              />
            )}
          </PriceSection>

          {extraDaysAmountInfo && extraDaysAmountInfo?.amountInfo?.subTotal > 0 && (
            <PriceSection
              expanded={expanded}
              mode={mode}
              sectionTitle="Giorni Extra"
              sectionTotal={convertPrice(extraDaysAmountInfo?.amountInfo?.subTotal || 0)}
            >
              <PriceRowDetails
                element={extraDaysAmountInfo}
                label="Giorni Extra"
                labelDescription={
                  <>
                    <>
                      {convertPrice(rentData?.price?.extraDayAmount)} x {rentData?.extraDays} giorn
                      {rentData?.extraDays === 1 ? 'o' : 'i'}
                    </>
                  </>
                }
                priceEdit={priceEditUtilizzo}
                discount={
                  rentData?.price?.priceInfo?.extraDaysAmountInfo?.discountAmount > 0
                    ? rentData?.price?.priceInfo?.extraDaysAmountInfo?.discountAmount
                    : null
                }
                discountPercentage={
                  rentData?.price?.priceInfo?.extraDaysAmountInfo?.discountPercentage
                }
                totalPriceDiscounted={
                  rentData?.price?.priceInfo?.extraDaysAmountInfo?.finalPriceDiscounted || 0
                }
                totalPriceVat={rentData?.price?.priceInfo?.extraDaysAmountInfo?.finalPrice || 0}
                totalPrice={extraDaysAmountInfo?.amountInfo?.initialPrice || 0}
                type="extraDaysAmountInfo"
                vat={rentData?.price?.priceInfo?.extraDaysAmountInfo?.vatPercentage + '%'}
                invoicingType={invoicingType(
                  rentData?.price?.priceInfo?.extraDaysAmountInfo?.invoicingType,
                )}
                mode={mode}
                updatePriceFunction={updateCustomCost}
              />
            </PriceSection>
          )}

          {extraCostsAmountInfo.length > 0 && (
            <PriceSection
              expanded={expanded}
              mode={mode}
              sectionTitle="Costi extra"
              sectionTotal={convertPrice(rentData?.price?.extraCostsAmount || 0)}
            >
              {extraCostsAmountInfo.map((extra) => {
                return (
                  <PriceRow
                    element={extra}
                    mode={mode}
                    type="extraCost"
                    key={extra._id}
                    priceEdit={priceEdit}
                    updatePriceFunction={updateExtraCostCost}
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
              sectionTotal={convertPrice(rentData?.price?.extraServicesAmount || 0)}
            >
              {extraServicesAmountInfo.map((extra) => {
                return (
                  <PriceRow
                    element={extra}
                    mode={mode}
                    type="extraService"
                    key={extra._id}
                    elementCount={extraServicesAmountInfo.indexOf(extra)}
                    priceEdit={priceEditExtra}
                    updatePriceFunction={updateExtraServiceCost}
                  />
                );
              })}
            </PriceSection>
          )}

          {shouldShowFranchisesSection && (
            <PriceSection
              expanded={expanded}
              mode={mode}
              sectionTitle="Franchigie e danni"
              sectionTotal={convertPrice(totalFranchisesCost || 0)}
            >
              {decideDamagesCost === 'kasko' && damageInitial > 0 ? (
                <PriceRow
                  element={kaskoFranchise}
                  mode={mode}
                  type="kaskoFranchiseAmountInfo"
                  priceEdit={priceEditExtra}
                  updatePriceFunction={updateCustomCost}
                />
              ) : decideDamagesCost === 'damages' && damagesCost > 0 ? (
                <PriceRow
                  element={damagesAmountInfo}
                  mode={mode}
                  type="damagesAmountInfo"
                  priceEdit={priceEditExtra}
                  updatePriceFunction={updateCustomCost}
                />
              ) : null}
              {rcaFranchise && rcaFranchise?.amountInfo?.initialPrice > 0 && (
                <PriceRow
                  element={rcaFranchise}
                  mode={mode}
                  type="rcaFranchiseAmountInfo"
                  priceEdit={priceEditExtra}
                  updatePriceFunction={updateCustomCost}
                />
              )}
              {ifFranchise && ifFranchise?.amountInfo?.initialPrice > 0 && (
                <PriceRow
                  element={ifFranchise}
                  mode={mode}
                  type="ifFranchiseAmountInfo"
                  priceEdit={priceEditExtra}
                  updatePriceFunction={updateCustomCost}
                />
              )}
            </PriceSection>
          )}

          <PriceSection
            expanded={expanded}
            mode={mode}
            sectionTitle={<>
              Totale movo
              {revenueShare ?
                <>
                  <button type="button" className="relative top-0.5 left-0.5 inline-block px-1" title="Mostra incasso netto" onClick={() => setShowRevenue(!showRevenue)}>
                    {showRevenue ? <FaRegEye /> : <FaEye />}
                  </button>
                  {showRevenue ? ` Netto${revenueShare?.estimated ? ' stimato' : ''}: ${convertPrice(revenueShare.receivedRevenue)}` : null}
                </>
                : null}
            </>}
            sectionBg="bg-sky-600 text-white"
            sectionTotal={convertPrice(rentData?.price?.totalAmount || 0)}
          />

          {rentData?.price?.deposit > 0 ? (
            <PriceSection
              expanded={expanded}
              mode={mode}
              sectionTitle="Deposito"
              sectionBg="bg-gray-300"
              sectionTotal={convertPrice(rentData?.price?.deposit || 0)}
            />
          ) : null}
        </div>
      ) : null}
    </WhiteBox>
  );
};

export default PriceCalculation;
