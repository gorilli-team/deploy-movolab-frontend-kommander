import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { http } from '../../utils/Utils';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { convertPrice } from '../../utils/Prices';
import Button from '../UI/buttons/Button';
import { SelectField } from '../../components/Form/SelectField';
import SendPaymentLinkModal from '../Payments/SendPaymentLinkModal';
import BlockCardModalMovolab from '../Payments/BlockCardModalMovolab';
import ModalConfirmDialog from './ModalConfirmDialog';
import Stepper from './Stepper';

const PaymentBox = ({
  price,
  updatePayment,
  mode,
  invoiceGenerated = false,
  rentId,
  reservationId,
  invoicingMoment,
  invoice,
  refetchFunction,
  className = '',
  email,
}) => {
  const form = useForm();
  const [isInvoiceGenerated, setIsInvoiceGenerated] = useState(invoiceGenerated);
  const [isPaymentCompleted, setIsPaymentCompleted] = useState(false);
  const [showSendByLinkConfirmMessage, setShowSendByLinkConfirmMessage] = useState(false);
  const [showBlockCardModalMovolab, setShowBlockCardModalMovolab] = useState(false);
  const [confirmInvoice, setConfirmInvoice] = useState(false);
  const [priceNumber, setPriceNumber] = useState(price);
  const [invoiceId, setInvoiceId] = useState(invoice);
  const [disabledInvoiceButton, setDisabledInvoiceButton] = useState(false);
  const [paymentOptions, setPaymentOptions] = useState([{ value: 'banco', label: 'Banco' }]);
  const [socket, setSocket] = useState(null);
  const [notificationShown, setNotificationShown] = useState(false);

  useEffect(() => {
    updatePrice(price);
  }, [price]);

  const updatePrice = (price) => {
    setPriceNumber(price);
  };

  useEffect(() => {
    fetchClient();

    // Connect to the socket.io server
    const newSocket = io(process.env.REACT_APP_API_URL);
    setSocket(newSocket);

    // Listen for 'paymentCompleted' events from the server
    newSocket.on('paymentCompleted', (data) => {
      if (!notificationShown && data.amount === price) {
        toast.success('✅ Pagamento completato con successo tramite Stripe', {
          duration: 20000, // 20 seconds
          icon: '🎉',
        });
        setNotificationShown(true);
        refetchFunction();
      }
    });

    // Clean up the socket connection on component unmount
    return () => {
      newSocket.disconnect();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (invoiceGenerated) {
      updateInvoiceGenerated(invoiceGenerated);
    }
  }, [invoiceGenerated]);

  useEffect(() => {
    if (!invoicingMoment) {
      toast.error(`Manca momento fatturazione: ${reservationId}`);
    }
  }, [invoicingMoment, reservationId]);

  const updateInvoiceGenerated = (value) => {
    setIsInvoiceGenerated(value);
  };

  const generateInvoice = async () => {
    try {
      setDisabledInvoiceButton(true);
      if (invoicingMoment === 'deposit') {
        const response = await http({
          url: `/invoice/deposit`,
          method: 'POST',
          form: {
            rentId: rentId,
            invoicingMoment: invoicingMoment,
            invoicingType: mode,
            amount: priceNumber,
          },
        });

        if (response?._id) {
          setInvoiceId(response._id);
          toast.success(`Fattura deposito generata`);
          setDisabledInvoiceButton(false);
          refetchFunction();
        }
        return;
      } else if (rentId) {
        const response = await http({
          url: `/invoice/rent`,
          method: 'POST',
          form: {
            rentId: rentId,
            invoicingMoment: invoicingMoment,
            invoicingType: mode,
          },
        });
        if (response?._id) {
          setInvoiceId(response._id);
          toast.success(`Fattura ${mode === 'movolab' ? 'Movolab' : 'diretta'} generata`);
          setDisabledInvoiceButton(false);
          updateInvoiceGenerated(true);
          refetchFunction();
        } else {
          toast('Nessuna fattura da generare');
        }
      } else if (reservationId) {
        const response = await http({
          url: `/invoice/reservation`,
          method: 'POST',
          form: {
            reservationId: reservationId,
            invoicingMoment: invoicingMoment,
            invoicingType: mode,
          },
        });

        if (response?._id) {
          setInvoiceId(response._id);
          toast.success(`Fattura ${mode === 'movolab' ? 'Movolab' : 'diretta'} generata`);
          setDisabledInvoiceButton(false);
          refetchFunction();
        } else {
          toast('Nessuna fattura da generare');
        }
        updateInvoiceGenerated(true);
      }
    } catch (err) {
      console.error(err);
      setDisabledInvoiceButton(false);
      toast.error('Errore nella generazione della fattura');
    }
  };

  const payInvoice = async (data) => {
    if (data.paymentMethod === 'pay_by_link') {
      setShowSendByLinkConfirmMessage(true);
    } else if (data.paymentMethod === 'capture_card') {
      if (price < 0.5) {
        toast.error("L'importo del deposito deve essere maggiore di quello inserito.");
      } else {
        setShowBlockCardModalMovolab(true);
      }
    } else {
      setDisabledInvoiceButton(true);
      await updatePayment(data, mode, price, invoiceId);
      await refetchFunction();
      setIsPaymentCompleted(true);
      setDisabledInvoiceButton(false);
    }
  };

  const fetchClient = async () => {
    try {
      const response = await http({
        method: 'GET',
        url: `/clients/client`,
      });

      if (response?.stripeConnect?.status === 'active') {
        if (invoicingMoment === 'deposit') {
          setPaymentOptions([
            ...paymentOptions,
            { value: 'capture_card', label: 'Blocca Plafond' },
          ]);
        } else {
          setPaymentOptions([...paymentOptions, { value: 'pay_by_link', label: 'Pay By Link' }]);
        }
      }

      return response;
    } catch (error) {
      console.error(error);
    }
  };

  const closeModalFromCardCapture = async () => {
    setShowBlockCardModalMovolab(false);
    await refetchFunction();
  };

  return (
    <>
      <div className="flex justify-center">
        <Stepper
          className="py-4"
          steps={[
            { content: '1', isCurrent: !isInvoiceGenerated },
            { content: '2', isCurrent: isInvoiceGenerated },
          ]}
        />
      </div>

      {!isInvoiceGenerated && (
        <div className={`flex flex-col p-5 bg-slate-100 rounded-xl mx-[-0.75rem] ${className}`}>
          <div className="flex flex-row justify-between items-center text-lg font-semibold">
            <div>Totale</div>
            <div>{convertPrice(priceNumber)}</div>
          </div>

          {priceNumber > 0 && (
            <div className="flex justify-center pt-2 space-x-2">
              <Button
                btnStyle="blue"
                isLoading={disabledInvoiceButton}
                onClick={(e) => {
                  e.preventDefault();
                  setConfirmInvoice(true);
                }}
                className="px-10"
              >
                Crea Fattura
              </Button>
              {invoicingMoment === 'deposit' && (
                <Button
                  btnStyle="darkGray"
                  isLoading={disabledInvoiceButton}
                  onClick={(e) => {
                    e.preventDefault();
                    updateInvoiceGenerated(true);
                  }}
                  className="px-10"
                >
                  Vai a Incasso
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {isInvoiceGenerated && !isPaymentCompleted && (
        <form onSubmit={form.handleSubmit(payInvoice)}>
          <div className={`flex flex-col p-5 bg-slate-100 rounded-xl mx-[-0.75rem] ${className}`}>
            <div className="flex flex-row justify-between items-center text-lg font-semibold">
              <div>Totale</div>
              <div>{convertPrice(priceNumber)}</div>
            </div>

            <div className="flex justify-center my-3">
              <SelectField
                name="paymentMethod"
                form={form}
                className="w-56"
                validation={{
                  required: {
                    value: true,
                    message:
                      invoicingMoment === 'deposit' ? 'Seleziona Tipologia' : 'Seleziona Metodo',
                  },
                }}
                options={paymentOptions}
                placeholder={
                  invoicingMoment === 'deposit' ? 'Tipologia Deposito' : 'Metodo di Pagamento'
                }
              />
            </div>

            <div className="flex justify-center">
              <Button className="w-40" isLoading={disabledInvoiceButton}>
                {invoicingMoment === 'deposit' ? 'Effettua Deposito' : 'Incassa'}
              </Button>
            </div>
          </div>
        </form>
      )}

      <ModalConfirmDialog
        headerChildren="Creazione fattura"
        title={`Confermi di voler fatturare?`}
        description={`Continuando, verrà subito emessa fattura per ${convertPrice(priceNumber)}`}
        okText="Fattura"
        isVisible={confirmInvoice}
        handleOk={() => {
          generateInvoice(true);
          setConfirmInvoice(false);
        }}
        handleCancel={() => {
          setConfirmInvoice(false);
        }}
      />
      {showSendByLinkConfirmMessage && (
        <SendPaymentLinkModal
          closeModal={() => setShowSendByLinkConfirmMessage(false)}
          invoiceId={invoiceId}
          invoicingMoment={invoicingMoment}
          mode={mode}
          email={email}
        />
      )}
      {showBlockCardModalMovolab && (
        <BlockCardModalMovolab
          closeModal={() => closeModalFromCardCapture()}
          rentId={rentId}
          userId={''}
          invoiceId={invoiceId}
          invoicingMoment={invoicingMoment}
          amount={price}
          mode={mode}
          email={email}
        />
      )}
    </>
  );
};

export default PaymentBox;
