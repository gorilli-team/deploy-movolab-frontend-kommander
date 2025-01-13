import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { http } from '../../utils/Utils';
import toast from 'react-hot-toast';
import Button from '../UI/buttons/Button';
import { SelectField } from '../../components/Form/SelectField';
import { convertPrice } from '../../utils/Prices';
import Stepper from './Stepper';
import ModalConfirmDialog from './ModalConfirmDialog';

const ReturnMoneyBox = ({
  price,
  updatePayment,
  mode,
  invoiceGenerated = false,
  rentId,
  reservationId,
  invoicingMoment,
  invoice,
  refetchFunction,
}) => {
  const form = useForm();

  const [isInvoiceGenerated, setIsInvoiceGenerated] = useState(invoiceGenerated);
  const [cardCaptures, setCardCaptures] = useState([]);
  const [priceNumber, setPriceNumber] = useState(price);
  const [confirmInvoice, setConfirmInvoice] = useState(false);
  const [invoiceId, setInvoiceId] = useState(invoice);
  const [disabledInvoiceButton, setDisabledInvoiceButton] = useState(false);

  useEffect(() => {
    fetchCardCaptures(rentId);
  }, [rentId, reservationId]);

  useEffect(() => {
    updatePrice(price);
  }, [price]);

  const updatePrice = (price) => {
    setPriceNumber(price);
  };

  useEffect(() => {
    if (invoiceGenerated) {
      setIsInvoiceGenerated(true);
    }
  }, [invoiceGenerated]);

  useEffect(() => {
    if (!invoicingMoment) {
      toast.error(`Manca momento fatturazione: ${reservationId}`);
    }
  }, [invoicingMoment, reservationId]);

  const fetchCardCaptures = async (rentId) => {
    try {
      const response = await http({ url: `/payments/card-captures/${rentId}` });
      setCardCaptures(response);
    } catch (error) {
      toast.error(error);
    }
  };

  const generateInvoice = async () => {
    try {
      setDisabledInvoiceButton(true);
      if (invoicingMoment === 'returnDeposit') {
        const response = await http({
          url: `/invoice/deposit`,
          method: 'POST',
          form: {
            rentId: rentId,
            invoicingMoment: invoicingMoment,
            invoicingType: mode,
            amount: price,
          },
        });

        if (response?._id) {
          setInvoiceId(response._id);
          toast.success(`Fattura deposito generata`);
          setDisabledInvoiceButton(false);
          refetchFunction();
        }
        return;
      }
    } catch (err) {
      console.error(err);
      toast.error('Errore nella generazione della fattura');
    }
  };

  const refundReservation = async (data) => {
    try {
      setDisabledInvoiceButton(true);
      await updatePayment(data, mode, priceNumber, invoiceId);
      await refetchFunction();
    } catch (err) {
      console.error(err);
      toast.error('Errore nel rimborsamento');
    } finally {
      setDisabledInvoiceButton(false);
    }
  };

  const stripeCardCaptureHandling = async (data) => {
    try {
      const capture = cardCaptures.find((capture) => capture._id === data.capture);

      if (data.action === 'sblocca') {
        await http({
          url: `/payments/card-captures/release-funds`,
          method: 'POST',
          form: {
            paymentIntentId: capture.paymentIntentId,
            invoicingType: mode,
          },
        });
        toast.success('Sblocco Fondi');
        await refetchFunction();
      }
    } catch (error) {
      toast.error('Problema nel rilascio del Plafond');
    }
  };

  const handleSbloccaClick = (e) => {
    e.preventDefault();
    form.setValue('action', 'sblocca');
    form.handleSubmit(stripeCardCaptureHandling)();
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

      {!isInvoiceGenerated ? (
        <div className="flex flex-col p-5 bg-slate-100 rounded-xl mx-[-0.75rem]">
          <div className="flex flex-row justify-between items-center text-lg font-semibold">
            <div>Totale rimborso</div>
            <div>{convertPrice(priceNumber)}</div>
          </div>

          <div className="flex justify-center pt-2">
            <Button
              btnStyle="blue"
              isLoading={disabledInvoiceButton}
              onClick={(e) => {
                e.preventDefault();
                setConfirmInvoice(true);
              }}
              className="px-10"
            >
              Fattura
            </Button>
          </div>
        </div>
      ) : (
        <>
          {cardCaptures?.length === 0 ? (
            <form onSubmit={form.handleSubmit(refundReservation)}>
              <div className="flex flex-col p-5 bg-slate-100 rounded-xl mx-[-0.75rem]">
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
                        message: 'Inserisci Metodo',
                      },
                    }}
                    options={[{ value: 'banco', label: 'Banco' }]}
                    placeholder="Metodo di pagamento"
                  />
                </div>

                <div className="flex justify-center">
                  <Button className="w-32" isLoading={disabledInvoiceButton}>
                    Rimborsa
                  </Button>
                </div>
              </div>
            </form>
          ) : (
            <form>
              <div className="flex flex-col p-5 bg-slate-100 rounded-xl mx-[-0.75rem]">
                <div className="flex flex-row justify-between items-center text-lg font-semibold">
                  <div>Totale</div>
                  <div>{convertPrice(priceNumber)}</div>
                </div>

                <div className="flex justify-center my-3">
                  <SelectField
                    name="capture"
                    form={form}
                    className="w-56"
                    validation={{
                      required: {
                        value: true,
                        message: 'Inserisci Metodo',
                      },
                    }}
                    options={cardCaptures?.map((capture) => ({
                      value: capture._id,
                      label: `Sblocca ${convertPrice(capture?.amountCapturable / 100)}`,
                    }))}
                    placeholder={'Seleziona Plafond'}
                  />
                </div>

                <div className="flex justify-center space-x-2">
                  <Button
                    btnStyle="white"
                    className="w-24"
                    isLoading={disabledInvoiceButton}
                    onClick={handleSbloccaClick}
                  >
                    Sblocca
                  </Button>
                </div>
              </div>
            </form>
          )}
        </>
      )}

      <ModalConfirmDialog
        headerChildren="Creazione nota di rimborso"
        title={`Confermi di voler rimborsare?`}
        //description="Il movo è stato chiuso (o la prenotazione è stata convertita a movo)"
        description={`Continuando, verrà subito emessa la nota per ${convertPrice(price)}`}
        okText="Rimborsa"
        isVisible={confirmInvoice}
        handleOk={() => {
          generateInvoice(true);
          setConfirmInvoice(false);
        }}
        handleCancel={() => {
          setConfirmInvoice(false);
        }}
      />
    </>
  );
};

export default ReturnMoneyBox;
