import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { http } from '../../../utils/Utils';
import { convertPrice } from '../../../utils/Prices';
import InvoicingRow from '../../UI/InvoicingRow';
import Button from '../../UI/buttons/Button';
import WhiteBox from '../../UI/WhiteBox';
import PaymentBox from '../../UI/PaymentBox';
import PaymentReceipt from '../../Payments/PaymentReceipt';
import InvoiceReceipt from '../../Invoices/InvoiceReceipt';
import toast from 'react-hot-toast';
import { calculateRentOpeningTotals } from '../../../utils/Rent';
import PriceSection from './PriceSection';
import { decideDamagesCostType } from '../../../utils/Damages';

const OpenInvoicing = ({ rent, prepaidRent, className, mode, updatePayments }) => {
  const [pickUpExtraServices, setPickUpExtraServices] = useState([]); //eslint-disable-line
  const [isDiscounted, setIsDiscounted] = useState(false); //eslint-disable-line
  const [fare, setFare] = useState({}); //eslint-disable-line
  const [showPaymentSection, setShowPaymentSection] = useState(false); //eslint-disable-line
  const [kaskoAmount, setKaskoAmount] = useState(0); //eslint-disable-line
  const [rentData, setRentData] = useState(rent);
  const [showPaymentSectionMovolab, setShowPaymentSectionMovolab] = useState(false);
  const [showPaymentSectionCustom, setShowPaymentSectionCustom] = useState(false); //eslint-disable-line
  const [totalAmount, setTotalAmount] = useState(rent?.price?.amount);
  const [totalMovolab, setTotalMovolab] = useState(0); //eslint-disable-line
  const [totalCustom, setTotalCustom] = useState(0); //eslint-disable-line
  const [movolabToPay, setMovolabToPay] = useState(0); //eslint-disable-line
  const [customerToPay, setCustomerToPay] = useState(0); //eslint-disable-line
  const [expanded, setExpanded] = useState(true);

  const [movolabPayments, setMovolabPayments] = useState([]); //eslint-disable-line
  const [customerPayments, setCustomerPayments] = useState([]); //eslint-disable-line
  const [invoicesMovolab, setInvoicesMovolab] = useState([]); //eslint-disable-line
  const [invoicesCustomer, setInvoicesCustomer] = useState([]); //eslint-disable-line

  const [prepaidRentPercentage] = useState(prepaidRent / 100 || 0);
  const form = useForm();

  useEffect(() => {
    fetchRent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rent]);

  useEffect(() => {
    getFare();
    getInvoices();
    getKaskoAmount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rentData]);

  useEffect(() => {
    fetchExtraServices();
    checkDiscounted();
    calculateTotals(rentData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rentData]);

  const fetchRent = async () => {
    try {
      const response = await http({ url: `/rents/${rent._id}` });

      setRentData(response);
    } catch (err) {
      console.error(err);
    }
  };

  const updatePrice = (prevValue, newValue) => {
    const value = totalAmount - prevValue + newValue;
    setTotalAmount(value);
  };

  const getInvoices = async () => {
    if (!rentData?._id) return;

    setInvoicesMovolab(rentData?.invoices?.find((item) => item.invoicingType === 'movolab'));
    setInvoicesCustomer(rentData?.invoices?.find((item) => item.invoicingType === 'customer'));
  };

  const getKaskoAmount = async () => {
    if (rentData?.price?.kaskoFranchiseAmount) {
      const value = Math.min(rentData?.price?.kaskoFranchiseAmount, rentData?.price?.damagesAmount);
      setKaskoAmount(value);
    } else {
      setKaskoAmount(rentData?.price?.damagesAmount);
    }
  };

  const decideDamagesCost = decideDamagesCostType(
    rentData?.price?.priceInfo?.kaskoFranchiseAmountInfo,
    rentData?.price?.priceInfo?.damagesAmountInfo,
  );

  const updatePayment = async (data, mode, paymentAmount, invoice) => {
    try {
      let update = {
        paymentMethod: data.paymentMethod,
        paymentMoment: 'rentOpening',
        paymentAmount: parseFloat(paymentAmount).toFixed(2),
        invoicingType: mode,
        invoice: invoice,
        priceInfo: rentData?.price?.priceInfo,
      };

      const response = await http({
        url: `/rents/payments/add/${rentData?._id}`,
        method: 'POST',
        form: update,
      });

      setRentData(response.rent);
      if (updatePayments) {
        updatePayments();
      }
      calculateTotals(response.rent);
      setShowPaymentSectionCustom(false);
      setShowPaymentSectionMovolab(false);

      toast.success('Pagamento effettuato');
    } catch (err) {
      console.error(err);
      toast.error('Errore nel pagamento');
    }
  };

  const calculateTotals = (rentData) => {
    if (!rentData?.payments) return;

    setMovolabPayments(rentData?.payments.filter((item) => item.invoicingType === 'movolab'));
    setCustomerPayments(rentData?.payments.filter((item) => item.invoicingType === 'customer'));

    const rentOpeningTotals = calculateRentOpeningTotals(rentData, prepaidRentPercentage);

    setTotalMovolab(rentOpeningTotals.totalMovolab);
    setTotalCustom(rentOpeningTotals.totalCustom);
    setMovolabToPay(rentOpeningTotals.missingMovolab);
    setCustomerToPay(rentOpeningTotals.missingCustomer);

    setShowPaymentSectionCustom(false);
    setShowPaymentSectionMovolab(false);
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
    const priceList = rentData?.priceList;

    if (!priceList) return;
    if (!priceList?.fares?.length) return;
    const range = ranges?.find(
      (item) => item.from <= rentData?.totalDays && item.to >= rentData?.totalDays,
    );
    const fare = priceList.fares.find((item) => {
      return item?.group === rentData?.group?._id && item?.range === range?._id;
    });

    const response = await http({ url: `/fares/${fare?.fare}` });
    setFare(response);
  };

  const fetchExtraServices = async () => {
    if (!rentData?._id) return;
    const response = await http({
      url: `/rents/extraServices/${rentData._id}?phase=pickUp`,
    });
    setPickUpExtraServices(response.pickUpExtraServices);
  };

  const checkDiscounted = () => {
    if (rentData?.price?.discount?.amount || rentData?.price?.discount?.percentage) {
      setIsDiscounted(true);
    } else {
      setIsDiscounted(false);
    }
  };

  const isAmountToShow = (amountInfo, invoicingType) => {
    if (amountInfo?.subTotal > 0 && amountInfo?.invoicingType === invoicingType) {
      return true;
    } else {
      return false;
    }
  };

  const refetchFunction = async () => {
    updatePayments();
    fetchRent();
  };

  if (!rentData) return null;

  if (totalMovolab + totalCustom === 0)
    return (
      <WhiteBox
        className={`mx-0 ${className}`}
        innerClassName="px-6 py-5"
        collapsibleClassName={mode === 'small' || expanded ? 'px-6 pb-3' : 'p-0'}
        headerChildren={<div className="font-bold text-lg">Cassa</div>}
        caretClassName={prepaidRent === 0 ? 'hidden' : ''}
        isExpanded={true}
        isCollapsible={true}
        customCollapsing={true}
        onButtonClick={(exp) => setExpanded(exp)}
      >
        <PriceSection
          mode={mode}
          sectionTitle="Pagamento Apertura Movo"
          sectionBg="bg-gray-100"
          sectionTotal={prepaidRent === 0 ? 'NO' : 'SI'}
          innerClassName=""
        />
        <PriceSection
          mode={mode}
          sectionTitle="Nessun Pagamento da Effettuare"
          sectionBg="bg-gray-100"
          innerClassName=""
          className="mb-0"
        />
      </WhiteBox>
    );

  return (
    <WhiteBox
      className={`mx-0 ${className}`}
      innerClassName="px-6 py-5"
      collapsibleClassName={mode === 'small' || expanded ? 'px-6 pb-3' : 'p-0'}
      headerChildren={<div className="font-bold text-lg">Cassa</div>}
      caretClassName={prepaidRent === 0 ? 'hidden' : ''}
      isExpanded={true}
      isCollapsible={true}
      customCollapsing={true}
      onButtonClick={(exp) => setExpanded(exp)}
    >
      <PriceSection
        mode={mode}
        sectionTitle="Pagamento Apertura Movo"
        sectionBg="bg-gray-100"
        sectionTotal={prepaidRent === 0 ? 'NO' : 'SI'}
        innerClassName=""
        className="mb-0"
      />
      <>
        {prepaidRent > 0 ? (
          <>
            <>
              {totalMovolab > 0 && (
                <div>
                  {prepaidRentPercentage > 0 ? (
                    <PriceSection
                      mode={mode}
                      sectionTitle="Fatturazione Movolab"
                      sectionBg="bg-blue-500 text-white"
                      sectionTotal={totalMovolab ? convertPrice(totalMovolab) : ''}
                      innerClassName=""
                    />
                  ) : null}
                  {!showPaymentSectionMovolab ? (
                    <>
                      {isAmountToShow(rentData?.price?.priceInfo?.amountInfo, 'movolab') && (
                        <InvoicingRow
                          rowName={'Utilizzo'}
                          price={
                            rentData?.price?.priceInfo?.amountInfo?.finalPrice *
                            prepaidRentPercentage
                          }
                          boldTytle={true}
                          colSpan={2}
                          form={form}
                          primary={true}
                          updatePrice={updatePrice}
                          mode={mode}
                        />
                      )}
                      {rentData?.price?.priceInfo?.extraServicesAmountInfo?.map(
                        (extraService, index) => {
                          if (extraService?.amountInfo?.invoicingType === 'movolab') {
                            return (
                              <InvoicingRow
                                key={index}
                                rowName={extraService?.name}
                                price={extraService?.amountInfo?.finalPrice * prepaidRentPercentage}
                                boldTytle={true}
                                colSpan={2}
                                form={form}
                                primary={true}
                                updatePrice={updatePrice}
                                mode={mode}
                              />
                            );
                          }
                          return null;
                        },
                      )}

                      {rentData?.price?.priceInfo?.extraCostsAmountInfo?.map((extraCost) => {
                        if (extraCost?.amountInfo?.invoicingType === 'movolab') {
                          return (
                            <InvoicingRow
                              key={extraCost?._id}
                              rowName={extraCost?.name}
                              price={extraCost?.amountInfo?.finalPrice * prepaidRentPercentage}
                              boldTytle={true}
                              colSpan={2}
                              form={form}
                              primary={true}
                              updatePrice={updatePrice}
                              mode={mode}
                            />
                          );
                        }
                        return null;
                      })}

                      {rentData?.price?.priceInfo?.fuelExtraAmountInfo?.invoicingType ===
                        'movolab' && (
                        <InvoicingRow
                          rowName={'Carburante Extra'}
                          boldTytle={true}
                          colSpan={2}
                          price={
                            rentData?.price?.priceInfo?.fuelExtraAmountInfo?.finalPrice *
                            prepaidRentPercentage
                          }
                          form={form}
                          primary={true}
                          updatePrice={updatePrice}
                          mode={mode}
                        />
                      )}
                      {rentData?.price?.priceInfo?.kmExtraAmountInfo?.invoicingType ===
                        'movolab' && (
                        <InvoicingRow
                          rowName={'Chilometri Extra'}
                          boldTytle={true}
                          colSpan={2}
                          price={
                            rentData?.price?.priceInfo?.kmExtraAmountInfo?.finalPrice *
                            prepaidRentPercentage
                          }
                          form={form}
                          primary={true}
                          updatePrice={updatePrice}
                          mode={mode}
                        />
                      )}
                      {decideDamagesCost === 'kasko'
                        ? rentData?.price?.priceInfo?.kaskoFranchiseAmountInfo?.invoicingType ===
                            'movolab' && (
                            <InvoicingRow
                              rowName={'Franchigia Kasko'}
                              boldTytle={true}
                              colSpan={2}
                              price={
                                rentData?.price?.priceInfo?.kaskoFranchiseAmountInfo?.finalPrice *
                                prepaidRentPercentage
                              }
                              form={form}
                              primary={true}
                              updatePrice={updatePrice}
                              mode={mode}
                            />
                          )
                        : decideDamagesCost === 'damages'
                        ? rentData?.price?.priceInfo?.damagesAmountInfo?.invoicingType ===
                            'movolab' && (
                            <InvoicingRow
                              rowName={'Addebito Danni'}
                              boldTytle={true}
                              colSpan={2}
                              price={
                                rentData?.price?.priceInfo?.damagesAmountInfo?.finalPrice *
                                prepaidRentPercentage
                              }
                              form={form}
                              primary={true}
                              updatePrice={updatePrice}
                              mode={mode}
                            />
                          )
                        : null}
                      {rentData?.price?.priceInfo?.ifFranchiseAmountInfo?.invoicingType ===
                        'movolab' && (
                        <InvoicingRow
                          rowName={'Franchigia Incendio e Furto'}
                          boldTytle={true}
                          colSpan={2}
                          price={
                            rentData?.price?.priceInfo?.ifFranchiseAmountInfo?.finalPrice *
                            prepaidRentPercentage
                          }
                          form={form}
                          primary={true}
                          updatePrice={updatePrice}
                          mode={mode}
                        />
                      )}
                      {rentData?.price?.priceInfo?.rcaFranchiseAmountInfo?.invoicingType ===
                        'movolab' && (
                        <InvoicingRow
                          rowName={'Franchigia RCA'}
                          boldTytle={true}
                          colSpan={2}
                          price={
                            rentData?.price?.priceInfo?.rcaFranchiseAmountInfo?.finalPrice *
                            prepaidRentPercentage
                          }
                          form={form}
                          primary={true}
                          updatePrice={updatePrice}
                          mode={mode}
                        />
                      )}
                      {movolabToPay > 0 && !showPaymentSectionMovolab && prepaidRentPercentage ? (
                        <div className="flex justify-center py-2">
                          <Button
                            btnStyle="blue"
                            onClick={() => {
                              setShowPaymentSectionMovolab(true);
                            }}
                            className="px-10"
                          >
                            Procedi
                          </Button>
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <PaymentBox
                      price={movolabToPay}
                      updatePayment={updatePayment}
                      mode={'movolab'}
                      invoicingMoment={'rentOpening'}
                      invoiceGenerated={
                        rentData?.invoices.filter(
                          (item) =>
                            item.invoicingType === 'movolab' &&
                            item.invoicingMoment === 'rentOpening',
                        ).length > 0
                      }
                      invoice={
                        rentData?.invoices?.filter(
                          (item) =>
                            item.invoicingType === 'movolab' &&
                            item.invoicingMoment === 'rentOpening',
                        )[0]?._id
                      }
                      rentId={rentData?._id}
                      refetchFunction={refetchFunction}
                      email={rentData?.customer?.email}
                    />
                  )}

                  <div className="mt-2">
                    {rentData?.invoices?.length > 0
                      ? rentData?.invoices?.map((invoice) =>
                          invoice?.invoicingType === 'movolab' &&
                          invoice?.invoicingMoment === 'rentOpening' ? (
                            <InvoiceReceipt invoice={invoice} key={invoice._id} />
                          ) : null,
                        )
                      : null}
                  </div>

                  <div className="mt-2">
                    {movolabPayments.length > 0
                      ? movolabPayments.map((payment) =>
                          payment.paymentMoment === 'rentOpening' ? (
                            <PaymentReceipt payment={payment} key={payment._id} className="mb-2" />
                          ) : null,
                        )
                      : null}
                  </div>
                </div>
              )}
            </>
            <>
              {totalCustom > 0 && (
                <div>
                  {prepaidRentPercentage > 0 ? (
                    <PriceSection
                      mode={mode}
                      sectionTitle="Fatturazione diretta"
                      sectionBg="bg-gray-500 text-white"
                      sectionTotal={customerToPay ? convertPrice(customerToPay) : ''}
                      innerClassName=""
                    />
                  ) : null}

                  {!showPaymentSectionCustom ? (
                    <>
                      {rentData?.price?.priceInfo?.amountInfo?.invoicingType === 'customer' && (
                        <InvoicingRow
                          rowName={'Utilizzo'}
                          info={rentData?.price?.priceInfo?.amountInfo * prepaidRentPercentage}
                          boldTytle={true}
                          colSpan={2}
                          form={form}
                          primary={true}
                          updatePrice={updatePrice}
                          mode={mode}
                        />
                      )}
                      {rentData?.price?.priceInfo?.extraServicesAmountInfo?.map((extraService) => {
                        if (extraService?.amountInfo?.invoicingType === 'customer') {
                          return (
                            <InvoicingRow
                              key={extraService._id}
                              rowName={extraService?.name}
                              price={extraService?.amountInfo?.finalPrice * prepaidRentPercentage}
                              boldTytle={true}
                              colSpan={2}
                              form={form}
                              primary={true}
                              updatePrice={updatePrice}
                              mode={mode}
                            />
                          );
                        }
                        return null;
                      })}

                      {rentData?.price?.priceInfo?.extraCostsAmountInfo?.map((extraCost) => {
                        if (extraCost?.amountInfo?.invoicingType === 'customer') {
                          return (
                            <InvoicingRow
                              key={extraCost._id}
                              rowName={extraCost?.name}
                              price={extraCost?.amountInfo?.finalPrice * prepaidRentPercentage}
                              boldTytle={true}
                              colSpan={2}
                              form={form}
                              primary={true}
                              updatePrice={updatePrice}
                              mode={mode}
                            />
                          );
                        }
                        return null;
                      })}
                      {rentData?.price?.priceInfo?.fuelExtraAmountInfo?.invoicingType ===
                        'customer' && (
                        <InvoicingRow
                          rowName={'Carburante Extra'}
                          boldTytle={true}
                          colSpan={2}
                          price={
                            rentData?.price?.priceInfo?.fuelExtraAmountInfo?.finalPrice *
                            prepaidRentPercentage
                          }
                          form={form}
                          primary={true}
                          updatePrice={updatePrice}
                          mode={mode}
                        />
                      )}
                      {rentData?.price?.priceInfo?.kmExtraAmountInfo?.invoicingType ===
                        'customer' && (
                        <InvoicingRow
                          rowName={'Chilometri Extra'}
                          boldTytle={true}
                          colSpan={2}
                          price={
                            rentData?.price?.priceInfo?.kmExtraAmountInfo?.finalPrice *
                            prepaidRentPercentage
                          }
                          form={form}
                          primary={true}
                          updatePrice={updatePrice}
                          mode={mode}
                        />
                      )}

                      <div>
                        {decideDamagesCost === 'kasko'
                          ? rentData?.price?.priceInfo?.kaskoFranchiseAmountInfo?.invoicingType ===
                              'customer' && (
                              <InvoicingRow
                                rowName={'Franchigia Kasko'}
                                boldTytle={true}
                                colSpan={2}
                                price={
                                  rentData?.price?.priceInfo?.kaskoFranchiseAmountInfo?.finalPrice *
                                  prepaidRentPercentage
                                }
                                form={form}
                                primary={true}
                                updatePrice={updatePrice}
                                mode={mode}
                              />
                            )
                          : decideDamagesCost === 'damages'
                          ? rentData?.price?.priceInfo?.damagesAmountInfo?.invoicingType ===
                              'customer' && (
                              <InvoicingRow
                                rowName={'Addebito Danni'}
                                boldTytle={true}
                                colSpan={2}
                                price={
                                  rentData?.price?.priceInfo?.damagesAmountInfo?.finalPrice *
                                  prepaidRentPercentage
                                }
                                form={form}
                                primary={true}
                                updatePrice={updatePrice}
                                mode={mode}
                              />
                            )
                          : null}
                      </div>

                      {rentData?.price?.priceInfo?.ifFranchiseAmountInfo?.invoicingType ===
                        'customer' && (
                        <InvoicingRow
                          rowName={'Franchigia Incendio e Furto'}
                          boldTytle={true}
                          colSpan={2}
                          price={
                            rentData?.price?.priceInfo?.ifFranchiseAmountInfo?.finalPrice *
                            prepaidRentPercentage
                          }
                          form={form}
                          primary={true}
                          updatePrice={updatePrice}
                          mode={mode}
                        />
                      )}
                      {rentData?.price?.priceInfo?.rcaFranchiseAmountInfo?.invoicingType ===
                        'customer' && (
                        <InvoicingRow
                          rowName={'Franchigia RCA'}
                          boldTytle={true}
                          colSpan={2}
                          price={
                            rentData?.price?.priceInfo?.rcaFranchiseAmountInfo?.finalPrice *
                            prepaidRentPercentage
                          }
                          form={form}
                          primary={true}
                          updatePrice={updatePrice}
                          mode={mode}
                        />
                      )}
                      {rentData?.price?.priceInfo?.extraCostsAmountInfo?.invoicingType ===
                        'customer' && (
                        <InvoicingRow
                          rowName={'Costi Automatici'}
                          boldTytle={true}
                          colSpan={2}
                          price={
                            rentData?.price?.priceInfo?.extraCostsAmountInfo?.finalPrice *
                            prepaidRentPercentage
                          }
                          form={form}
                          primary={true}
                          updatePrice={updatePrice}
                          mode={mode}
                        />
                      )}

                      {customerToPay > 0 &&
                      !showPaymentSectionCustom &&
                      prepaidRentPercentage > 0 ? (
                        <div className="flex justify-center py-2">
                          <Button
                            btnStyle="blue"
                            onClick={() => {
                              setShowPaymentSectionCustom(true);
                            }}
                            className="px-10"
                          >
                            Procedi
                          </Button>
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <PaymentBox
                      price={customerToPay}
                      updatePayment={updatePayment}
                      mode={'customer'}
                      invoicingMoment={'rentOpening'}
                      invoiceGenerated={
                        rentData?.invoices.filter(
                          (item) =>
                            item.invoicingType === 'customer' &&
                            item.invoicingMoment === 'rentOpening',
                        ).length > 0
                      }
                      invoice={
                        rentData?.invoices.filter(
                          (item) =>
                            item.invoicingType === 'customer' &&
                            item.invoicingMoment === 'rentOpening',
                        )[0]?._id
                      }
                      rentId={rentData?._id}
                      refetchFunction={refetchFunction}
                      email={rentData?.customer?.email}
                    />
                  )}

                  <div className="mt-2">
                    {rentData?.invoices?.length > 0
                      ? rentData?.invoices?.map((invoice) =>
                          invoice?.invoicingType === 'customer' &&
                          invoice?.invoicingMoment === 'rentOpening' ? (
                            <InvoiceReceipt invoice={invoice} key={invoice._id} />
                          ) : null,
                        )
                      : null}
                  </div>

                  <div className="mt-2">
                    {customerPayments.length > 0
                      ? customerPayments.map((payment) =>
                          payment.paymentMoment === 'rentOpening' ? (
                            <PaymentReceipt payment={payment} key={payment._id} className="mb-2" />
                          ) : null,
                        )
                      : null}
                  </div>
                </div>
              )}
            </>
          </>
        ) : null}
      </>
    </WhiteBox>
  );
};

export default OpenInvoicing;
