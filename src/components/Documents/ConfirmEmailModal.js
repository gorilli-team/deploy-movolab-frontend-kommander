import React, { useEffect } from 'react';
import Modal from '../UI/Modal';
import { TextField } from '../Form/TextField';
import Button from '../UI/buttons/Button';
import { useForm } from 'react-hook-form';
import { http } from '../../utils/Utils';
import toast from 'react-hot-toast';

const ConfirmEmailModal = ({
  email,
  customer = null,
  rentId,
  reservationId,
  closeModal,
  text,
  phase = 'pickUp',
  mode,
}) => {
  useEffect(() => {}, []);
  const form = useForm();

  if (customer) {
    email = customer.email;
  }

  form.setValue('email', email);

  const onSubmit = async (data) => {
    try {
      if (!mode) {
        toast.error('Errore: Modalità non definita');
      }

      if (mode === 'sendLink') {
        if (rentId) {
          const update = {
            email: customer?.email || data.email,
            rentId: rentId,
            phase: phase,
          };

          await http({
            url: `/rents/signature/sendLink`,
            method: 'POST',
            form: update,
          });
          toast.success('Email inviata con successo a ' + data.email);

          closeModal();
        }

        if (reservationId) {
          const update = {
            email: customer?.email || data.email,
            reservationId: reservationId,
            phase: phase,
          };

          await http({
            url: `/reservations/signature/sendLink`,
            method: 'POST',
            form: update,
          });
          toast.success('Email inviata con successo a ' + data.email);

          closeModal();
        }
      } else if (mode === 'sendReservationEmail') {
        const update = {
          email: customer?.email || data.email,
          reservationId: reservationId,
          phase: phase,
        };

        await http({
          url: `/reservations/emails/send/${reservationId}`,
          method: 'POST',
          form: update,
        });
        toast.success('Email inviata con successo a ' + data.email);

        closeModal();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Modal
      isVisible={true}
      onClose={closeModal}
      innerClassName="px-6 py-4 relative"
      headerChildren="Conferma email"
    >
      <div dangerouslySetInnerHTML={{ __html: text }} />{' '}
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {customer ? (
          <div className="mt-1">
            L'email verrà inviata a{' '}
            <strong>{customer?.ragioneSociale || `${customer.name} ${customer.surname}`}</strong> (
            {customer.phone})<br />
            all'indirizzo <strong>{customer?.email}</strong>
          </div>
        ) : (
          <TextField
            form={form}
            name="email"
            type="email"
            placeholder="Email"
            className="my-3"
            validation={{
              required: { value: true, message: 'Email obbligatoria' },
            }}
          />
        )}
        <div className="mt-2 flex justify-end">
          <Button type="submit" btnStyle="blue" className="py-1">
            Invia conferma
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ConfirmEmailModal;
