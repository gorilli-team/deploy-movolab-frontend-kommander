import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../UI/Modal';

import Button from '../UI/buttons/Button';
import FormLabel from '../UI/FormLabel';

const UpdateInvoiceNumberModal = ({ closeModal, invoiceNumber, updateInvoiceNumber }) => {
  useEffect(() => {}, []);
  const form = useForm();

  const onSubmitCompany = (data) => {
    updateInvoiceNumber(data);
    closeModal();
  };

  return (
    <Modal
      isVisible={true}
      onClose={closeModal}
      innerClassName="px-6 py-4 relative"
      headerChildren={'Aggiorna numero fattura'}
    >
      <form onSubmit={form.handleSubmit(onSubmitCompany)}>
        <div className="w-96">
          <FormLabel>Numero Fattura</FormLabel>
          <input
            className="w-full form-input text-gray-800 border-slate-700 rounded px-3 py-1 bg-white"
            type="text"
            placeholder="Numero Fattura"
            defaultValue={invoiceNumber}
            {...form.register('invoiceNumber')}
          />
        </div>

        <div className="mt-2 flex justify-end">
          <Button btnStyle="white" className="!py-1">
            Conferma
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default UpdateInvoiceNumberModal;
