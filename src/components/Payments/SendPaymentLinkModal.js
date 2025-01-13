import React from 'react';
import toast from 'react-hot-toast';
import { http } from '../../utils/Utils';
import { useForm } from 'react-hook-form';
import { TextField } from '../Form/TextField';

import Button from '../UI/buttons/Button';
import FormLabel from '../UI/FormLabel';
import Modal from '../UI/Modal';

const SendPaymentLinkModal = ({ closeModal = () => {}, invoiceId, email }) => {
  const form = useForm();

  form.setValue('email', email);

  const onSubmit = async (data) => {
    try {
      await http({
        url: `/payments/stripe-connect/generatePaymentLink`,
        method: 'POST',
        form: {
          email: data.email,
          invoiceId: invoiceId,
        },
      });

      toast.success('Link di pagamento inviato al cliente');
      closeModal();
    } catch (error) {
      console.error(error);
      toast.error("Errore nell'invio del link");
    }
  };

  const exitFromModal = () => {
    closeModal();
  };

  return (
    <>
      <Modal
        isVisible={true}
        size="xs"
        bgClassName="items-start"
        className="md:mt-40"
        headerChildren={'Invia link pagamento'}
        onClose={(e) => {
          e.preventDefault();
          exitFromModal();
        }}
        innerClassName="px-6 py-4 relative"
      >
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="mt-2">
            <p className="text-sm">
              Inserisci l'indirizzo email a cui desideri inviare il link di pagamento per completare
              il saldo.
            </p>
            <FormLabel>Email</FormLabel>
            <TextField
              form={form}
              name="email"
              type="string"
              placeholder="Email"
              validation={{
                required: { value: true, message: 'Indirizzo Email obbligatorio' },
              }}
            />
          </div>

          <div className="flex justify-end space-x-2 mt-2">
            <Button btnStyle="blue" className="py-1">
              Invia Link di Pagamento
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default SendPaymentLinkModal;
