import React from 'react';
import { useForm } from 'react-hook-form';
import { TextField } from '../Form/TextField';
import Modal from '../UI/Modal';
import SmartAssistantButton from './SmartAssistantButton';

const SmartAssistantModal = ({ closeModal = () => {} }) => {
  const form = useForm();

  const onSubmit = async (data) => {};

  const exitFromModal = () => {
    closeModal();
  };

  return (
    <>
      <Modal
        isVisible={true}
        size="sm"
        bgClassName="items-start"
        className="md:mt-28"
        onClose={(e) => {
          e.preventDefault();
          exitFromModal();
        }}
      >
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <TextField
            form={form}
            name="description"
            type="string"
            placeholder="Cosa vuoi fare..."
            className="mt-2 p-1 rounded-lg bg-gradient-to-r from-blue-400 to-purple-400 text-white placeholder-white focus:outline-none focus:ring-0"
          />
          <div className="flex justify-end mt-2">
            <SmartAssistantButton text={'Vai ✨'} />{' '}
          </div>
        </form>
      </Modal>
    </>
  );
};

export default SmartAssistantModal;
