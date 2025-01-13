import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { http } from '../../../utils/Utils';
import { convertPrice } from '../../../utils/Prices';
import InvoicingRow from '../../UI/InvoicingRow';
import WhiteBox from '../../UI/WhiteBox';
import PaymentBox from '../../UI/PaymentBox';
import PaymentReceipt from '../../Payments/PaymentReceipt';
import InvoiceReceipt from '../../Invoices/InvoiceReceipt';
import toast from 'react-hot-toast';
import { calculateRentClosingTotals } from '../../../utils/Rent';
import PriceSection from './PriceSection';
import { decideDamagesCostType } from '../../../utils/Damages';

const CloseInvoicing = ({ rent, rentId, className, mode, updatePayments }) => {
  const [expanded, setExpanded] = useState(true);
  const [pickUpExtraServices, setPickUpExtraServices] = useState([]); //eslint-disable-line
  const [isDiscounted, setIsDiscounted] = useState(false); //eslint-disable-line
  const [fare, setFare] = useState({}); //eslint-disable-line
  const [kaskoAmount, setKaskoAmount] = useState(0); //eslint-disable-line
  const [rentData, setRentData] = useState(rent);
  const [totalAmount, setTotalAmount] = useState(rent?.price?.amount);
  const [totalMovolab, setTotalMovolab] = useState(0); //eslint-disable-line
  const [totalCustom, setTotalCustom] = useState(0); //eslint-disable-line
  const [movolabToPay, setMovolabToPay] = useState(0); //eslint-disable-line
  const [customerToPay, setCustomerToPay] = useState(0); //eslint-disable-line
  const [movolabPayments, setMovolabPayments] = useState([]); //eslint-disable-line
  const [customerPayments, setCustomerPayments] = useState([]); //eslint-disable-line

  const form = useForm();

  useEffect(() => {
    setRentData(rent);
  }, [rent]);

  const fetchRent = async (rentId) => {
    try {
      if (rentId) {
        const response = await http({ url: `/rents/${rentId}` });
        setRentData(response);
      } else {
        setRentData(rent);
      }
    } catch (err) {
      console.error('rent', rent);
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRent(rentId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rentId]);

  useEffect(() => {
    getFare();
    getKaskoAmount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rentData]);

  useEffect(() => {
    fetchExtraServices();
    checkDiscounted();
    calculateTotals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rentData]);

  const updatePrice = (prevValue, newValue) => {
    const value = totalAmount - prevValue + newValue;
    setTotalAmount(value);
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
      if (!data.paymentMethod) {
        toast.error('Seleziona un metodo di pagamento');
        return;
      }

      let update = {
        paymentMethod: data.paymentMethod,
        paymentMoment: 'rentClosing',
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

      setRentData(response?.rent);
      if (updatePayments) {
        updatePayments(response?.rent);
      }
      const rentClosingTotals = calculateRentClosingTotals(rentData);

      setTotalMovolab(rentClosingTotals.totalMovolab);
      setTotalCustom(rentClosingTotals.totalCustom);
      setMovolabToPay(rentClosingTotals.missingMovolab);
      setCustomerToPay(rentClosingTotals.missingCustomer);

      toast.success('Pagamento effettuato');
    } catch (err) {
      console.error(err);
      toast.error('Errore nel pagamento');
    }
  };

  const calculateTotals = () => {
    if (!rentData?.price?.priceInfo || !rentData?.payments) return;

    setMovolabPayments(rentData?.payments.filter((item) => item.invoicingType === 'movolab'));
    setCustomerPayments(rentData?.payments.filter((item) => item.invoicingType === 'customer'));

    const rentClosingTotals = calculateRentClosingTotals(rentData);

    setTotalMovolab(rentClosingTotals.totalMovolab);
    setTotalCustom(rentClosingTotals.totalCustom);

    setMovolabToPay(rentClosingTotals.missingMovolab);
    setCustomerToPay(rentClosingTotals.missingCustomer);
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

  const rentInvoicesMovolab = rentData?.invoices?.filter(
    (invoice) =>
      invoice?.invoicingType === 'movolab' &&
      (invoice?.invoicingMoment === 'rentOpening' || invoice?.invoicingMoment === 'rentClosing'),
  );

  const rentInvoicesCustomer = rentData?.invoices?.filter(
    (invoice) =>
      invoice?.invoicingType === 'customer' &&
      (invoice?.invoicingMoment === 'rentOpening' || invoice?.invoicingMoment === 'rentClosing'),
  );

  if (!rentData) return null;

  const allPaid = movolabToPay + customerToPay === 0;

  if (totalMovolab + totalCustom === 0) return null;
  return (
    <>
      <WhiteBox
        className={`mx-0 ${className}`}
        innerClassName="px-6 py-5"
        collapsibleClassName={mode === 'small' || expanded ? 'px-6 pb-3' : 'p-0'}
        headerChildren={<div className="font-bold text-lg">Cassa</div>}
        isExpanded={true}
        isCollapsible={true}
        customCollapsing={true}
        onButtonClick={(exp) => setExpanded(exp)}
      >
        <div className="flex flex-col gap-y-2">
          {totalMovolab > 0 && (
            <div>
              <PriceSection
                expanded={expanded}
                mode={mode}
                sectionTitle="Fatturazione Movolab"
                sectionBg="bg-blue-500 text-white"
                sectionTotal={convertPrice(movolabToPay)}
                className={expanded ? 'mb-2' : ''}
                innerClassName=""
              >
                {movolabToPay > 0 ? (
                  <>
                    {rentData?.price?.priceInfo?.amountInfo?.invoicingType === 'movolab' && (
                      <InvoicingRow
                        rowName={'Utilizzo'}
                        price={
                          rentData?.price?.priceInfo?.amountInfo?.finalPrice -
                          rentData?.price?.priceInfo?.amountInfo?.amountPaid
                        }
                        subTotal={rentData?.price?.priceInfo?.amountInfo?.subTotal}
                        boldTytle={true}
                        colSpan={2}
                        form={form}
                        primary={true}
                        updatePrice={updatePrice}
                        mode={mode}
                      />
                    )}

                    {rentData?.price?.priceInfo?.amountInfo?.invoicingType === 'movolab' && (
                      <InvoicingRow
                        rowName={'Giorni Extra'}
                        price={
                          rentData?.price?.priceInfo?.extraDaysAmountInfo?.finalPrice -
                          rentData?.price?.priceInfo?.extraDaysAmountInfo?.amountPaid
                        }
                        subTotal={rentData?.price?.priceInfo?.extraDaysAmountInfo?.subTotal}
                        boldTytle={true}
                        colSpan={2}
                        form={form}
                        primary={true}
                        updatePrice={updatePrice}
                        mode={mode}
                      />
                    )}

                    {rentData?.price?.priceInfo?.extraServicesAmountInfo?.map((extraService) => {
                      if (extraService?.amountInfo?.invoicingType === 'movolab') {
                        return (
                          <InvoicingRow
                            rowName={extraService?.name}
                            price={
                              extraService?.amountInfo?.finalPrice -
                              extraService?.amountInfo?.amountPaid
                            }
                            subTotal={extraService?.amountInfo?.subTotal}
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
                      if (extraCost?.amountInfo?.invoicingType === 'movolab') {
                        return (
                          <InvoicingRow
                            rowName={extraCost?.name}
                            price={
                              extraCost?.amountInfo?.finalPrice - extraCost?.amountInfo?.amountPaid
                            }
                            subTotal={extraCost?.amountInfo?.subTotal}
                            boldTytle={true}
                            colSpan={2}
                            form={form}
                            primary={true}
                            updatePrice={updatePrice}
                            mode={mode}
                            key={extraCost?._id}
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
                          rentData?.price?.priceInfo?.fuelExtraAmountInfo?.finalPrice -
                          rentData?.price?.priceInfo?.fuelExtraAmountInfo?.amountPaid
                        }
                        subTotal={rentData?.price?.priceInfo?.fuelExtraAmountInfo?.subTotal}
                        form={form}
                        primary={true}
                        updatePrice={updatePrice}
                        mode={mode}
                      />
                    )}

                    {rentData?.price?.priceInfo?.kmExtraAmountInfo?.invoicingType === 'movolab' && (
                      <InvoicingRow
                        rowName={'Chilometri Extra'}
                        boldTytle={true}
                        colSpan={2}
                        price={
                          rentData?.price?.priceInfo?.kmExtraAmountInfo?.finalPrice -
                          rentData?.price?.priceInfo?.kmExtraAmountInfo?.amountPaid
                        }
                        subTotal={rentData?.price?.priceInfo?.kmExtraAmountInfo?.subTotal}
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
                              rentData?.price?.priceInfo?.kaskoFranchiseAmountInfo?.finalPrice -
                              rentData?.price?.priceInfo?.kaskoFranchiseAmountInfo?.amountPaid
                            }
                            subTotal={
                              rentData?.price?.priceInfo?.kaskoFranchiseAmountInfo?.subTotal
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
                              rentData?.price?.priceInfo?.damagesAmountInfo?.finalPrice -
                              rentData?.price?.priceInfo?.damagesAmountInfo?.amountPaid
                            }
                            subTotal={rentData?.price?.priceInfo?.damagesAmountInfo?.subTotal}
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
                          rentData?.price?.priceInfo?.ifFranchiseAmountInfo?.finalPrice -
                          rentData?.price?.priceInfo?.ifFranchiseAmountInfo?.amountPaid
                        }
                        subTotal={rentData?.price?.priceInfo?.ifFranchiseAmountInfo?.subTotal}
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
                          rentData?.price?.priceInfo?.rcaFranchiseAmountInfo?.finalPrice -
                          rentData?.price?.priceInfo?.rcaFranchiseAmountInfo?.amountPaid
                        }
                        subTotal={rentData?.price?.priceInfo?.rcaFranchiseAmountInfo?.subTotal}
                        form={form}
                        primary={true}
                        updatePrice={updatePrice}
                        mode={mode}
                      />
                    )}
                  </>
                ) : null}
              </PriceSection>

              {movolabToPay > 0 && expanded && (
                <PaymentBox
                  price={movolabToPay}
                  updatePayment={updatePayment}
                  mode={'movolab'}
                  invoicingMoment={'rentClosing'}
                  invoiceGenerated={
                    rentData?.invoices.filter(
                      (item) =>
                        item.invoicingType === 'movolab' && item.invoicingMoment === 'rentClosing',
                    ).length > 0
                  }
                  invoice={
                    rentData?.invoices.filter(
                      (item) =>
                        item.invoicingType === 'movolab' && item.invoicingMoment === 'rentClosing',
                    )[0]?._id
                  }
                  rentId={rentData?._id}
                  refetchFunction={updatePayments}
                  className="mb-2"
                  email={rentData?.customer?.email}
                />
              )}

              {!allPaid || expanded ? (
                <>
                  {rentInvoicesMovolab.length > 0
                    ? rentInvoicesMovolab?.map((invoice) => (
                        <InvoiceReceipt invoice={invoice} key={invoice._id} className="mt-2" />
                      ))
                    : null}

                  {movolabPayments.length > 0
                    ? movolabPayments.map((payment) =>
                        payment.paymentMoment === 'rentOpening' ||
                        payment.paymentMoment === 'rentClosing' ? (
                          <PaymentReceipt payment={payment} key={payment._id} className="mt-2" />
                        ) : null,
                      )
                    : null}
                </>
              ) : null}
            </div>
          )}
          {totalCustom > 0 && (
            <div>
              <PriceSection
                expanded={expanded}
                mode={mode}
                sectionTitle="Fatturazione diretta"
                sectionBg="bg-gray-500 text-white"
                sectionTotal={convertPrice(customerToPay)}
                className={expanded ? 'mb-2' : ''}
                innerClassName=""
              >
                {customerToPay > 0 ? (
                  <>
                    {rentData?.price?.priceInfo?.amountInfo?.invoicingType === 'customer' && (
                      <InvoicingRow
                        rowName={'Utilizzo'}
                        price={
                          rentData?.price?.priceInfo?.amountInfo?.finalPrice -
                          rentData?.price?.priceInfo?.amountInfo?.amountPaid
                        }
                        subTotal={rentData?.price?.priceInfo?.amountInfo?.subTotal}
                        boldTytle={true}
                        colSpan={2}
                        form={form}
                        primary={true}
                        updatePrice={updatePrice}
                        mode={mode}
                      />
                    )}

                    {rentData?.price?.priceInfo?.extraDaysAmountInfo?.invoicingType ===
                      'customer' && (
                      <InvoicingRow
                        rowName={'Giorni Extra'}
                        price={
                          rentData?.price?.priceInfo?.extraDaysAmountInfo?.finalPrice -
                          rentData?.price?.priceInfo?.extraDaysAmountInfo?.amountPaid
                        }
                        subTotal={rentData?.price?.priceInfo?.extraDaysAmountInfo?.subTotal}
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
                            price={
                              extraService?.amountInfo?.finalPrice -
                              extraService?.amountInfo?.amountPaid
                            }
                            subTotal={extraService?.amountInfo?.subTotal}
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
                            key={extraCost?._id}
                            rowName={extraCost?.name}
                            price={
                              extraCost?.amountInfo?.finalPrice - extraCost?.amountInfo?.amountPaid
                            }
                            subTotal={extraCost?.amountInfo?.subTotal}
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
                          rentData?.price?.priceInfo?.fuelExtraAmountInfo?.finalPrice -
                          rentData?.price?.priceInfo?.fuelExtraAmountInfo?.amountPaid
                        }
                        subTotal={rentData?.price?.priceInfo?.fuelExtraAmountInfo?.subTotal}
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
                          rentData?.price?.priceInfo?.kmExtraAmountInfo?.finalPrice -
                          rentData?.price?.priceInfo?.kmExtraAmountInfo?.amountPaid
                        }
                        subTotal={rentData?.price?.priceInfo?.kmExtraAmountInfo?.subTotal}
                        form={form}
                        primary={true}
                        updatePrice={updatePrice}
                        mode={mode}
                      />
                    )}

                    {decideDamagesCost === 'kasko'
                      ? rentData?.price?.priceInfo?.kaskoFranchiseAmountInfo?.invoicingType ===
                          'customer' && (
                          <InvoicingRow
                            rowName={'Franchigia Kasko'}
                            boldTytle={true}
                            colSpan={2}
                            price={
                              rentData?.price?.priceInfo?.kaskoFranchiseAmountInfo?.finalPrice -
                              rentData?.price?.priceInfo?.kaskoFranchiseAmountInfo?.amountPaid
                            }
                            subTotal={
                              rentData?.price?.priceInfo?.kaskoFranchiseAmountInfo?.subTotal
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
                              rentData?.price?.priceInfo?.damagesAmountInfo?.finalPrice -
                              rentData?.price?.priceInfo?.damagesAmountInfo?.amountPaid
                            }
                            subTotal={rentData?.price?.priceInfo?.damagesAmountInfo?.subTotal}
                            form={form}
                            primary={true}
                            updatePrice={updatePrice}
                            mode={mode}
                          />
                        )
                      : null}

                    {rentData?.price?.priceInfo?.ifFranchiseAmountInfo?.invoicingType ===
                      'customer' && (
                      <InvoicingRow
                        rowName={'Franchigia Incendio e Furto'}
                        boldTytle={true}
                        colSpan={2}
                        price={
                          rentData?.price?.priceInfo?.ifFranchiseAmountInfo?.finalPrice -
                          rentData?.price?.priceInfo?.ifFranchiseAmountInfo?.amountPaid
                        }
                        subTotal={rentData?.price?.priceInfo?.ifFranchiseAmountInfo?.subTotal}
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
                          rentData?.price?.priceInfo?.rcaFranchiseAmountInfo?.finalPrice -
                          rentData?.price?.priceInfo?.rcaFranchiseAmountInfo?.amountPaid
                        }
                        subTotal={rentData?.price?.priceInfo?.rcaFranchiseAmountInfo?.subTotal}
                        form={form}
                        primary={true}
                        updatePrice={updatePrice}
                        mode={mode}
                      />
                    )}
                  </>
                ) : null}
              </PriceSection>

              {customerToPay > 0 && expanded && (
                <PaymentBox
                  price={customerToPay}
                  updatePayment={updatePayment}
                  mode={'customer'}
                  invoicingMoment={'rentClosing'}
                  invoiceGenerated={
                    rentData?.invoices.filter(
                      (item) =>
                        item.invoicingType === 'customer' && item.invoicingMoment === 'rentClosing',
                    ).length > 0
                  }
                  invoice={
                    rentData?.invoices.filter(
                      (item) =>
                        item.invoicingType === 'customer' && item.invoicingMoment === 'rentClosing',
                    )[0]?._id
                  }
                  rentId={rentData?._id}
                  refetchFunction={updatePayments}
                  className="mb-2"
                  email={rentData?.customer?.email}
                />
              )}

              {!allPaid || expanded ? (
                <>
                  {rentInvoicesCustomer.length > 0
                    ? rentInvoicesCustomer?.map((invoice) => (
                        <InvoiceReceipt invoice={invoice} key={invoice._id} className="mt-2" />
                      ))
                    : null}

                  {customerPayments.length > 0
                    ? customerPayments.map((payment) =>
                        payment.paymentMoment === 'rentOpening' ||
                        payment.paymentMoment === 'rentClosing' ? (
                          <PaymentReceipt payment={payment} key={payment._id} className="mt-2" />
                        ) : null,
                      )
                    : null}
                </>
              ) : null}
            </div>
          )}
        </div>
      </WhiteBox>
    </>
  );
};

export default CloseInvoicing;
