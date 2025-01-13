import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { http } from '../../utils/Utils';
import { convertPrice } from '../../utils/Prices';
import InvoicingRow from '../UI/InvoicingRow';
import Button from '../UI/buttons/Button';
import WhiteBox from '../UI/WhiteBox';
import PaymentBox from '../UI/PaymentBox';
import toast from 'react-hot-toast';
import { calculateReservationTotals } from '../../utils/Reservation';
import PaymentReceipt from '../Payments/PaymentReceipt';
import InvoiceReceipt from '../Invoices/InvoiceReceipt';
import PriceSection from '../Rents/rentElements/PriceSection';

const ReservationInvoicing = ({ reservation, phase, className, mode, updatePayments }) => {
  const [pickUpExtraServices, setPickUpExtraServices] = useState([]); //eslint-disable-line
  const [isDiscounted, setIsDiscounted] = useState(false); //eslint-disable-line
  const [fare, setFare] = useState({}); //eslint-disable-line
  const [showPaymentSectionMovolab, setShowPaymentSectionMovolab] = useState(false); //eslint-disable-line
  const [reservationData, setReservationData] = useState(reservation);
  const [totalAmount, setTotalAmount] = useState(reservation?.price?.amount);
  const [totalMovolab, setTotalMovolab] = useState(0); //eslint-disable-line
  const [totalCustom, setTotalCustom] = useState(0); //eslint-disable-line
  const [movolabToPay, setMovolabToPay] = useState(0); //eslint-disable-line
  const [customerToPay, setCustomerToPay] = useState(0); //eslint-disable-line
  const [movolabPayments, setMovolabPayments] = useState([]); //eslint-disable-line
  const [customerPayments, setCustomerPayments] = useState([]); //eslint-disable-line
  const [invoicesMovolab, setInvoicesMovolab] = useState([]); //eslint-disable-line
  const [invoicesCustomer, setInvoicesCustomer] = useState([]); //eslint-disable-line
  const [expanded, setExpanded] = useState(true);
  const [prepaidReservationPercentage] = useState(
    reservationData?.workflow?.administration?.prepaidReservation / 100 || 0,
  );

  const form = useForm();
  useEffect(() => {
    setReservationData(reservation);
  }, [reservation]);

  useEffect(() => {
    getFare();
    getInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reservationData]);

  useEffect(() => {
    fetchExtraServices();
    checkDiscounted();
    calculateTotals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reservationData]);

  const updatePriceElem = (prevValue, newValue) => {
    const value = totalAmount - prevValue + newValue;
    setTotalAmount(value);
  };

  const calculateTotals = () => {
    if (!reservationData?.price?.priceInfo || !reservationData?.payments) return;

    setMovolabPayments(
      reservationData?.payments.filter((item) => item.invoicingType === 'movolab'),
    );
    setCustomerPayments(
      reservationData?.payments.filter((item) => item.invoicingType === 'customer'),
    );

    const reservationTotals = calculateReservationTotals(
      reservationData,
      prepaidReservationPercentage,
    );

    setTotalMovolab(reservationTotals.totalMovolab);
    setTotalCustom(reservationTotals.totalCustom);
    setMovolabToPay(reservationTotals.missingMovolab);
    setCustomerToPay(reservationTotals.missingCustomer);
  };

  const getInvoices = async () => {
    if (!reservationData?._id) return;

    setInvoicesMovolab(reservationData?.invoices?.find((item) => item.invoicingType === 'movolab'));
    setInvoicesCustomer(
      reservationData?.invoices?.find((item) => item.invoicingType === 'customer'),
    );
  };

  const fetchRanges = async () => {
    try {
      const response = await http({ url: '/pricing/range' });

      return response.ranges;
    } catch (err) {
      console.error(err);
    }
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
    if (phase === 'pickUp') {
      const response = await http({
        url: `/reservations/extraServices/${reservationData._id}?phase=pickUp`,
      });
      setPickUpExtraServices(response.pickUpExtraServices);
    } else {
      const response = await http({
        url: `/reservations/extraServices/${reservationData._id}?phase=pickUp`,
      });
      setPickUpExtraServices(response.pickUpExtraServices);
    }
  };

  const checkDiscounted = () => {
    if (reservationData?.price?.discount?.amount || reservationData?.price?.discount?.percentage) {
      setIsDiscounted(true);
    } else {
      setIsDiscounted(false);
    }
  };

  const updatePayment = async (data, mode, paymentAmount, invoice) => {
    try {
      let update = {
        paymentMethod: data.paymentMethod,
        paymentMoment: 'reservation',
        paymentAmount: parseFloat(paymentAmount).toFixed(2),
        invoicingType: mode,
        invoice: invoice,
        priceInfo: reservationData?.price?.priceInfo,
      };

      const response = await http({
        url: `/reservations/payments/add/${reservationData?._id}`,
        method: 'POST',
        form: update,
      });

      setReservationData(response?.reservation);
      if (updatePayments) {
        updatePayments();
      }
      const reservationTotals = calculateReservationTotals(
        reservationData,
        prepaidReservationPercentage,
      );

      setMovolabToPay(reservationTotals.missingMovolab);
      setCustomerToPay(reservationTotals.missingCustomer);

      toast.success('Pagamento effettuato');
    } catch (err) {
      toast.error('Errore nel pagamento');
    }
  };

  if (!reservationData) return null;

  if (totalMovolab + totalCustom === 0) return null;
  return (
    <>
      <WhiteBox
        className={`mx-0 ${className}`}
        innerClassName="px-6 py-5"
        collapsibleClassName={mode === 'small' || expanded ? 'px-6 pb-3' : 'p-0'}
        headerChildren={<div className="font-bold text-lg">Cassa</div>}
        caretClassName={prepaidReservationPercentage === 0 ? 'hidden' : ''}
        isExpanded={true}
        isCollapsible={true}
        customCollapsing={true}
        onButtonClick={(exp) => setExpanded(exp)}
      >
        <PriceSection
          mode={mode}
          sectionTitle="Pagamento alla prenotazione"
          sectionBg="bg-gray-100"
          sectionTotal={prepaidReservationPercentage === 0 ? 'NO' : 'SI'}
          innerClassName=""
          className="mb-0"
        />

        {prepaidReservationPercentage > 0 && (
          <div className="mt-2">
            {totalMovolab > 0 && (
              <div>
                {mode === 'small' ? (
                  <PriceSection
                    mode={mode}
                    sectionTitle="Fatturazione Movolab"
                    sectionBg="bg-blue-500 text-white"
                    sectionTotal={totalMovolab ? convertPrice(totalMovolab) : ''}
                    innerClassName=""
                    className="mb-0"
                  />
                ) : (
                  <div className="bg-blue-500 mt-2 text-white font-semibold p-1 rounded-xl">
                    <div className="grid grid-cols-8">
                      <div className="mx-3 col-span-4">Fatturazione: Movolab</div>
                      <div className="mx-3 text-end"></div>
                      <div className="mx-3 text-end"></div>
                      <div className="mx-3 text-end"> {convertPrice(totalMovolab)}</div>
                      <div className="mx-3 text-end">
                        {reservation.invoiceMovolab !== undefined ? (
                          <Button
                            btnStyle="gray"
                            text={'Aggiungi costo'}
                            onClick={() => {
                              setShowPaymentSectionMovolab(true);
                            }}
                          >
                            Vai alla fattura
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                )}

                {expanded && (
                  <>
                    <div className="mt-3">
                      {reservationData?.price?.priceInfo?.amountInfo?.invoicingType ===
                        'movolab' && (
                        <InvoicingRow
                          rowName={'Utilizzo'}
                          price={
                            reservationData?.price?.priceInfo?.amountInfo?.finalPrice *
                            prepaidReservationPercentage
                          }
                          boldTytle={true}
                          colSpan={2}
                          form={form}
                          primary={true}
                          updatePrice={updatePriceElem}
                          mode={mode}
                        />
                      )}
                    </div>
                    {reservationData?.price?.priceInfo?.extraServicesAmountInfo?.map(
                      (extraService) => {
                        if (extraService?.amountInfo?.invoicingType === 'movolab') {
                          return (
                            <div className="mt-3">
                              <InvoicingRow
                                rowName={extraService?.name}
                                price={
                                  extraService?.amountInfo?.finalPrice *
                                  prepaidReservationPercentage
                                }
                                boldTytle={true}
                                colSpan={2}
                                form={form}
                                primary={true}
                                updatePrice={updatePriceElem}
                                mode={mode}
                              />
                            </div>
                          );
                        }
                        return null;
                      },
                    )}

                    {reservationData?.price?.priceInfo?.extraCostsAmountInfo?.map((extraCost) => {
                      if (extraCost?.amountInfo?.invoicingType === 'movolab') {
                        return (
                          <div className="mt-3" key={extraCost?._id}>
                            <InvoicingRow
                              rowName={extraCost?.name}
                              price={
                                extraCost?.amountInfo?.finalPrice * prepaidReservationPercentage
                              }
                              boldTytle={true}
                              colSpan={2}
                              form={form}
                              primary={true}
                              updatePrice={updatePriceElem}
                              mode={mode}
                            />
                          </div>
                        );
                      }
                      return null;
                    })}

                    {movolabToPay > 0 && reservationData.state !== 'stornato' ? (
                      <PaymentBox
                        price={totalMovolab}
                        updatePayment={updatePayment}
                        mode={'movolab'}
                        invoicingMoment={'reservation'}
                        invoiceGenerated={
                          reservationData?.invoices.filter(
                            (item) =>
                              item.invoicingType === 'movolab' &&
                              item.invoicingMoment === 'reservation',
                          ).length > 0
                        }
                        invoice={
                          reservationData?.invoices.filter(
                            (item) =>
                              item.invoicingType === 'movolab' &&
                              item.invoicingMoment === 'reservation',
                          )[0]?._id
                        }
                        reservationId={reservationData?._id}
                        refetchFunction={updatePayments}
                        email={reservationData?.customer?.email}
                      />
                    ) : null}

                    <div className="mt-2">
                      {reservationData?.invoices?.length > 0
                        ? reservationData?.invoices?.map((invoice) =>
                            invoice?.invoicingType === 'movolab' ? (
                              <InvoiceReceipt invoice={invoice} key={invoice._id} />
                            ) : null,
                          )
                        : null}
                    </div>

                    <div className="mt-2">
                      {movolabPayments.length > 0
                        ? movolabPayments.map((payment) => (
                            <PaymentReceipt payment={payment} key={payment._id} className="mb-2" />
                          ))
                        : null}
                    </div>
                  </>
                )}
              </div>
            )}

            {totalCustom > 0 && (
              <div>
                {mode === 'small' ? (
                  <PriceSection
                    mode={mode}
                    sectionTitle="Fatturazione diretta"
                    sectionBg="bg-gray-500 text-white"
                    sectionTotal={totalCustom ? convertPrice(totalCustom) : ''}
                    innerClassName=""
                    className="my-2"
                  />
                ) : (
                  <div className="bg-gray-500 mt-2 text-white font-semibold p-1 rounded-xl">
                    <div className="grid grid-cols-8">
                      <div className="mx-3 col-span-4">Fatturazione: Personalizzata</div>
                      <div className="mx-3 text-end"></div>
                      <div className="mx-3 text-end"></div>

                      <div className="mx-3 text-end"> {convertPrice(totalCustom)}</div>
                      <div className="mx-3 text-end">Non Incassato</div>
                    </div>{' '}
                  </div>
                )}

                {expanded && (
                  <>
                    <div className="mt-3">
                      {reservationData?.price?.priceInfo?.amountInfo?.invoicingType ===
                        'customer' && (
                        <InvoicingRow
                          rowName={'Utilizzo'}
                          info={reservationData?.price?.priceInfo?.amountInfo}
                          boldTytle={true}
                          colSpan={2}
                          form={form}
                          primary={true}
                          updatePrice={updatePriceElem}
                          mode={mode}
                        />
                      )}
                    </div>

                    {reservationData?.price?.priceInfo?.extraServicesAmountInfo?.map(
                      (extraService) => {
                        if (extraService?.amountInfo?.invoicingType === 'customer') {
                          return (
                            <div className="mt-3" key={extraService._id}>
                              <InvoicingRow
                                rowName={extraService?.name}
                                price={extraService?.amountInfo?.finalPrice}
                                boldTytle={true}
                                colSpan={2}
                                form={form}
                                primary={true}
                                updatePrice={updatePriceElem}
                                mode={mode}
                              />
                            </div>
                          );
                        }
                        return null;
                      },
                    )}

                    {reservationData?.price?.priceInfo?.extraCostsAmountInfo?.map((extraCost) => {
                      if (extraCost?.amountInfo?.invoicingType === 'customer') {
                        return (
                          <div className="mt-3" key={extraCost?._id}>
                            <InvoicingRow
                              rowName={extraCost?.name}
                              price={extraCost?.amountInfo?.finalPrice}
                              boldTytle={true}
                              colSpan={2}
                              form={form}
                              primary={true}
                              updatePrice={updatePriceElem}
                              mode={mode}
                            />
                          </div>
                        );
                      }
                      return null;
                    })}

                    {reservationData?.price?.priceInfo?.extraCostsAmountInfo?.map((extraCost) => {
                      if (extraCost?.amountInfo?.invoicingType === 'customer') {
                        return (
                          <div className="mt-3" key={extraCost?._id}>
                            <InvoicingRow
                              rowName={extraCost?.name}
                              price={extraCost?.amountInfo?.finalPrice}
                              boldTytle={true}
                              colSpan={2}
                              form={form}
                              primary={true}
                              updatePrice={updatePriceElem}
                              mode={mode}
                            />
                          </div>
                        );
                      }
                      return null;
                    })}

                    {customerToPay > 0 && reservationData.state !== 'stornato' && (
                      <PaymentBox
                        price={totalCustom}
                        updatePayment={updatePayment}
                        mode={'customer'}
                        invoicingMoment={'reservation'}
                        invoiceGenerated={
                          reservationData?.invoices.filter(
                            (item) =>
                              item.invoicingType === 'customer' &&
                              item.invoicingMoment === 'reservation',
                          ).length > 0
                        }
                        invoice={
                          reservationData?.invoice?.filter(
                            (item) =>
                              item.invoicingType === 'customer' &&
                              item.invoicingMoment === 'reservation',
                          )[0]?._id
                        }
                        reservationId={reservationData?._id}
                        refetchFunction={updatePayments}
                        email={reservationData?.customer?.email}
                      />
                    )}

                    <div className="mt-2">
                      {reservationData?.invoices?.length > 0
                        ? reservationData?.invoices?.map((invoice) =>
                            invoice?.invoicingType === 'customer' ? (
                              <InvoiceReceipt invoice={invoice} key={invoice._id} />
                            ) : null,
                          )
                        : null}
                    </div>

                    <div className="mt-2">
                      {customerPayments.length > 0
                        ? customerPayments.map((payment) => (
                            <PaymentReceipt payment={payment} key={payment._id} className="mb-2" />
                          ))
                        : null}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </WhiteBox>
    </>
  );
};

export default ReservationInvoicing;
