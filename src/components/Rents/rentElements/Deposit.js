import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { http } from '../../../utils/Utils';
import { convertPrice } from '../../../utils/Prices';
import WhiteBox from '../../UI/WhiteBox';
import PaymentBox from '../../UI/PaymentBox';
import PaymentReceipt from '../../Payments/PaymentReceipt';
import InvoiceReceipt from '../../Invoices/InvoiceReceipt';
import toast from 'react-hot-toast';
import ReturnMoneyBox from '../../UI/ReturnMoneyBox';
import { FaPen } from 'react-icons/fa6';
import Button from '../../UI/buttons/Button';
import PriceSection from './PriceSection';

const Deposit = ({
  rent,
  deposit,
  className,
  mode,
  modality,
  updatePayments,
  invoicingType,
  isExpanded = false,
  fromCorporate = false,
}) => {
  const [rentData, setRentData] = useState(rent);
  const [isCardExpanded, setExpanded] = useState(isExpanded);

  const [depositAmount, setDepositAmount] = useState(0); //eslint-disable-line
  const [refundAmount, setRefundAmount] = useState(0); //eslint-disable-line
  const [isDepositAmountEditable, setIsDepositAmountEditable] = useState(false); //eslint-disable-line
  const [depositPayments, setDepositPayments] = useState(null); //eslint-disable-line
  const [returnDepositPayments, setReturnDepositPayments] = useState(null); //eslint-disable-line
  const [editDepositAmount, setEditDepositAmount] = useState(false); //eslint-disable-line
  const [isDepositInvoice, setIsDepositInvoice] = useState(null); //eslint-disable-line
  const form = useForm();

  useEffect(() => {
    fetchRent();
    getDepositAmount();
    getDepositInvoicingMode();
    getDepositInvoice(rentData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rent]);

  const fetchRent = async () => {
    try {
      if (rent?._id) {
        const response = await http({ url: `/rents/${rent._id}` });
        setRentData(response);
        checkIsDepositAmountEditable(response);
        const retrievedDepositPayments = response?.payments?.filter((item) => {
          return item?.paymentMoment === 'deposit';
        });
        setDepositPayments(retrievedDepositPayments);
        const retrievedReturnDepositPayments = response?.payments?.filter((item) => {
          return item?.paymentMoment === 'returnDeposit';
        });
        setReturnDepositPayments(retrievedReturnDepositPayments);
      } else {
        setRentData(rent);
        setIsDepositAmountEditable(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getDepositInvoice = async (rentData) => {
    try {
      if (rentData?.workflow === undefined) return;
      setIsDepositInvoice(rentData?.workflow?.administration?.depositInvoice);
    } catch (err) {
      console.error(err);
    }
  };

  const checkIsDepositAmountEditable = async (responseRentData) => {
    if (modality === 'returnDeposit') {
      if (responseRentData?.paidDeposit?.depositType === 'card_capture') {
        setIsDepositAmountEditable(false);
      } else if (
        responseRentData?.payments?.filter((item) => item.paymentMoment === 'returnDeposit')
          .length > 0
      ) {
        setIsDepositAmountEditable(false);
      } else {
        if (
          responseRentData?.invoices?.filter(
            (item) =>
              item.invoicingType === invoicingType && item.invoicingMoment === 'returnDeposit',
          ).length > 0
        ) {
          setIsDepositAmountEditable(false);
        } else {
          setIsDepositAmountEditable(true);
        }
      }
    } else {
      if (
        responseRentData?.payments?.filter((item) => item.paymentMoment === 'deposit').length > 0
      ) {
        setIsDepositAmountEditable(false);
      } else {
        if (
          responseRentData?.invoices?.filter(
            (item) => item.invoicingType === invoicingType && item.invoicingMoment === 'deposit',
          ).length > 0
        ) {
          setIsDepositAmountEditable(false);
        } else {
          setIsDepositAmountEditable(true);
        }
      }
    }
  };

  const getDepositInvoicingMode = async () => {
    const priceList = rentData?.priceList;

    if (!priceList) return;
    if (!priceList?.deposits?.length) return;

    priceList.deposits.find((item) => {
      return item?.group === rentData?.group?.id;
    });
  };

  const getDepositAmount = async () => {
    let depositAmountValue = 0;
    let refundAmountValue = 0;

    if (rentData?.refundedDeposit?.refundedAmount !== undefined) {
      refundAmountValue = rentData?.refundedDeposit?.refundedAmount;
    } else if (rentData?.paidDeposit?.amount !== undefined) {
      //if paid deposit is defined, we use it as refund amount, since we are want to return the deposit already paid as default
      refundAmountValue = rentData?.paidDeposit?.amount;
    } else {
      refundAmountValue = await getDepositAmountFromPriceList(rentData?.priceList);
    }

    if (rentData?.paidDeposit?.amount !== undefined) {
      depositAmountValue = rentData?.paidDeposit?.amount;
    } else {
      depositAmountValue = await getDepositAmountFromPriceList(rentData?.priceList);
    }

    if (rentData?.paidDeposit && !rentData?.refundedDeposit) {
      setExpanded(true);
    }

    setDepositAmount(depositAmountValue);
    setRefundAmount(refundAmountValue);

    const retrievedDepositPayments = rentData?.payments?.filter((item) => {
      return item?.paymentMoment === 'deposit';
    });
    setDepositPayments(retrievedDepositPayments);

    const retrievedReturnDepositPayments = rentData?.payments?.filter((item) => {
      return item?.paymentMoment === 'returnDeposit';
    });
    setReturnDepositPayments(retrievedReturnDepositPayments);
  };

  const getDepositAmountFromPriceList = async (priceList) => {
    if (!priceList) return;
    if (!priceList?.deposits?.length) return;

    const deposit = priceList.deposits.find((item) => {
      return item?.group === rentData?.group?._id;
    });

    if (!deposit) return 200;

    return deposit?.amount || 200;
  };

  const updateDepositAmount = async (amount) => {
    try {
      if (modality === 'giveDeposit') {
        setDepositAmount(parseFloat(amount).toFixed(2));
        if (!rentData.paidDeposit) rentData.paidDeposit = {};
        rentData.paidDeposit.amount = parseFloat(amount).toFixed(2);
        setEditDepositAmount(false);

        await http({
          url: `/rents/${rentData?._id}`,
          method: 'PUT',
          form: {
            paidDeposit: {
              amount: parseFloat(amount).toFixed(2),
            },
          },
        });

        toast.success('Deposito aggiornato');
      } else if (modality === 'returnDeposit') {
        setRefundAmount(parseFloat(amount).toFixed(2));
        if (!rentData.refundedDeposit) rentData.refundedDeposit = {};
        rentData.refundedDeposit.refundedAmount = parseFloat(amount).toFixed(2);
        setEditDepositAmount(false);

        await http({
          url: `/rents/${rentData?._id}`,
          method: 'PUT',
          form: {
            refundedDeposit: {
              refundedAmount: parseFloat(amount).toFixed(2),
            },
          },
        });
        toast.success('Rimborso deposito aggiornato');
      }
    } catch (err) {
      console.error(err);
      toast.error("Errore nell'aggiornamento del deposito");
    }
  };

  const updatePayment = async (data, value1, value2, invoice) => {
    try {
      const amount = modality === 'returnDeposit' ? refundAmount || depositAmount : depositAmount;

      let update = {
        paymentMethod: data.paymentMethod,
        paymentMoment: modality === 'giveDeposit' ? 'deposit' : 'returnDeposit',
        paymentAmount: parseFloat(amount).toFixed(2),
        invoicingType: invoicingType,
      };

      const paymentItems = [];

      if (modality === 'giveDeposit') {
        paymentItems.push({
          itemPaid: 'deposit',
          itemDescription: 'Deposito',
          rentDepositId: rentData?.price?.priceInfo?.deposit?._id,
          amount: parseFloat(amount).toFixed(2),
        });
      } else if (modality === 'returnDeposit') {
        paymentItems.push({
          itemPaid: 'returnDeposit',
          itemDescription: 'Restituzione Deposito',
          rentDepositId: rentData?.price?.priceInfo?.deposit?._id,
          amount: parseFloat(amount).toFixed(2),
        });
      }

      update.paymentItems = paymentItems;
      update.invoice = invoice;

      const response = await http({
        url: `/rents/deposits/add/${rentData?._id}`,
        method: 'POST',
        form: update,
      });

      setRentData(response.rent);
      if (updatePayments) {
        updatePayments();
      }

      toast.success('Pagamento effettuato');
    } catch (err) {
      console.error(err);
      toast.error('Errore nel pagamento');
    }
  };

  const refetchFunction = async () => {
    try {
      updatePayments();
      fetchRent();
      getDepositAmount();
    } catch (err) {
      console.error(err);
      toast.error('Errore nel recupero del deposito');
    }
  };

  if (!rentData) {
    return null;
  }
  if (!deposit) {
    return null;
  }

  if (
    modality === 'returnDeposit' &&
    (rentData?.paidDeposit === undefined || rentData?.paidDeposit?.paidDate === undefined)
  ) {
    return null;
  }

  if (!depositAmount && !refundAmount) {
    return null;
  }

  if (deposit) {
    return (
      <WhiteBox
        className={`mx-0 ${className}`}
        innerClassName="px-6 py-5"
        collapsibleClassName="px-6 pb-3"
        headerChildren={<div className="font-bold text-lg">Deposito</div>}
        isExpanded={isCardExpanded}
        isCollapsible={true}
        id="depositBox"
      >
        {invoicingType === 'movolab' ? (
          <PriceSection
            mode={mode}
            sectionTitle="Fatturazione Movolab"
            sectionBg="bg-blue-500 text-white"
          />
        ) : invoicingType === 'customer' ? (
          <PriceSection
            mode={mode}
            sectionTitle="Fatturazione diretta"
            sectionBg="bg-gray-500 text-white"
          />
        ) : (
          <PriceSection
            mode={mode}
            sectionTitle="Manca fatturazione"
            sectionBg="bg-gray-600 text-white"
          />
        )}

        {modality === 'returnDeposit' && (
          <div className="justify-between flex flex-wrap text-sm">
            <div className="font-semibold">
              {' '}
              {rentData?.paidDeposit?.depositType === 'card_capture'
                ? 'Blocco Plafond'
                : 'Pagamento'}
            </div>
            <div className={`${mode !== 'small' ? 'mx-3' : ''} text-end flex`}>
              <div className="">{depositAmount && convertPrice(depositAmount)}</div>
            </div>
          </div>
        )}
        <div className="justify-between flex flex-wrap text-sm">
          <div className="font-semibold">
            {}
            {rentData?.paidDeposit?.depositType === 'card_capture'
              ? modality === 'giveDeposit'
                ? 'Blocco Plafond'
                : 'Sblocco Plafond'
              : modality === 'giveDeposit'
              ? 'Deposito'
              : 'Rimborso'}
          </div>
          {isDepositAmountEditable && !fromCorporate ? (
            <>
              {!editDepositAmount ? (
                <div className={`${mode !== 'small' ? 'mx-3' : ''} text-end flex`}>
                  <div className="">
                    {modality === 'returnDeposit'
                      ? convertPrice(refundAmount || depositAmount)
                      : convertPrice(depositAmount)}
                  </div>
                  <div className="p-1">
                    <FaPen
                      className="text-gray-800 cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        setEditDepositAmount(true);
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className={`${mode !== 'small' ? 'mx-3' : ''} text-end flex`}>
                  <form onSubmit={form.handleSubmit(updatePayment)}>
                    <div className="flex flex-row">
                      <input
                        className="w-20 text-right border rounded-lg px-1 py-0 rounded-r-none border-sky-600"
                        type="number"
                        step="0.01"
                        min="0"
                        defaultValue={refundAmount || depositAmount}
                        {...form.register('depositAmount')}
                      />
                      <Button
                        className="py-0 px-2 border-l-0 rounded-l-none"
                        onClick={(e) => {
                          e.preventDefault();
                          updateDepositAmount(form.getValues('depositAmount'));
                        }}
                        btnStyle="inFormStyle"
                      >
                        Salva
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </>
          ) : (
            <>
              {modality === 'giveDeposit' && (
                <div className={`${mode !== 'small' ? 'mx-3' : ''} text-end flex`}>
                  <div className="">{depositAmount && convertPrice(depositAmount)}</div>
                </div>
              )}
              {modality === 'returnDeposit' && (
                <div className={`${mode !== 'small' ? 'mx-3' : ''} text-end flex`}>
                  <div className="">
                    {refundAmount && convertPrice(refundAmount || depositAmount)}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {modality === 'giveDeposit' ? (
          <>
            {depositPayments && depositPayments.length === 0 ? (
              <PaymentBox
                price={depositAmount}
                updatePayment={updatePayment}
                mode={invoicingType}
                invoicingMoment={'deposit'}
                invoiceGenerated={
                  rentData?.invoices.filter(
                    (item) =>
                      item.invoicingType === invoicingType && item.invoicingMoment === 'deposit',
                  ).length > 0 || !isDepositInvoice
                }
                invoice={
                  rentData?.invoices.filter(
                    (item) =>
                      item.invoicingType === invoicingType && item.invoicingMoment === 'deposit',
                  )[0]?._id
                }
                rentId={rentData?._id}
                refetchFunction={refetchFunction}
                email={rentData?.customer?.email}
              />
            ) : null}
          </>
        ) : null}
        {modality === 'returnDeposit' ? (
          <>
            {!fromCorporate && returnDepositPayments && returnDepositPayments.length === 0 ? (
              <ReturnMoneyBox
                price={refundAmount}
                updatePayment={updatePayment}
                mode={invoicingType}
                invoicingMoment={'returnDeposit'}
                invoiceGenerated={
                  rentData?.invoices.filter(
                    (item) =>
                      item.invoicingType === invoicingType &&
                      item.invoicingMoment === 'returnDeposit',
                  ).length > 0 || !isDepositInvoice
                }
                invoice={
                  rentData?.invoices.filter(
                    (item) =>
                      item.invoicingType === invoicingType &&
                      item.invoicingMoment === 'returnDeposit',
                  )[0]?._id
                }
                rentId={rentData?._id}
                refetchFunction={refetchFunction}
              />
            ) : null}
          </>
        ) : null}

        {rentData?.invoices?.length > 0
          ? rentData?.invoices?.map((invoice) =>
              invoice?.invoicingMoment === 'deposit' ||
              invoice?.invoicingMoment === 'returnDeposit' ? (
                <InvoiceReceipt invoice={invoice} key={invoice._id} className="mt-2" />
              ) : null,
            )
          : null}

        {depositPayments?.length > 0
          ? depositPayments?.map((payment) =>
              payment?.paymentMoment === 'deposit' ? (
                <PaymentReceipt payment={payment} key={payment._id} className="mt-2" />
              ) : null,
            )
          : null}

        {returnDepositPayments?.length > 0
          ? returnDepositPayments?.map((payment) =>
              payment?.paymentMoment === 'returnDeposit' ? (
                <PaymentReceipt payment={payment} key={payment._id} className="mt-2" />
              ) : null,
            )
          : null}
      </WhiteBox>
    );
  }
};

export default Deposit;
