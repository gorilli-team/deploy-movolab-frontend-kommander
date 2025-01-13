import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { http } from '../../utils/Utils';
import { useForm } from 'react-hook-form';
import { TextField } from '../Form/TextField';
import { SelectField } from '../Form/SelectField';
import Modal from '../UI/Modal';
import ModalConfirmDialog from '../UI/ModalConfirmDialog';

import Button from '../UI/buttons/Button';
import FormLabel from '../UI/FormLabel';
import { TextareaField } from '../Form/TextareaField';

const NoteModal = ({ vehicleId, reservationId, rentId, note, closeModal = () => {} }) => {
  const form = useForm();
  const [mode] = useState(note ? 'edit' : 'create');

  const [showCloseModalMessage, setShowCloseModalMessage] = useState(false);

  //eslint-disable-next-line
  const [avatar, setAvatar] = useState(undefined);
  //eslint-disable-next-line
  const [uploaded, setUploaded] = useState(false);
  //eslint-disable-next-line
  const [uploadingImg, setUploadingImg] = useState();

  if (note !== undefined) {
    form.setValue('name', note.name);
    form.setValue('description', note.description);
    form.setValue('status', note.status);
  }

  const onSubmit = async (data) => {
    data = {
      ...data,
    };

    if (vehicleId) {
      if (mode === 'edit') {
        await http({
          url: `/vehicles/vehicle/notes/update/${vehicleId}/${note._id}`,
          method: 'POST',
          form: data,
        });
        toast.success('Nota aggiornata con successo');
      } else {
        await http({
          url: `/vehicles/vehicle/notes/add/${vehicleId}`,
          method: 'POST',
          form: data,
        });
        toast.success('Nota inserita con successo');
      }
    }
    if (reservationId || note?.fromReservation) {
      reservationId = note?.fromReservation;
      if (mode === 'edit') {
        await http({
          url: `/reservations/notes/update/${reservationId}/${note._id}`,
          method: 'POST',
          form: data,
        });
        toast.success('Nota aggiornata con successo');
      } else {
        await http({
          url: `/reservations/notes/add/${reservationId}`,
          method: 'POST',
          form: data,
        });
        toast.success('Nota inserita con successo');
      }
    } else if (rentId) {
      if (mode === 'edit') {
        await http({
          url: `/rents/notes/update/${rentId}/${note._id}`,
          method: 'POST',
          form: data,
        });
        toast.success('Nota aggiornata con successo');
      } else {
        await http({
          url: `/rents/notes/add/${rentId}`,
          method: 'POST',
          form: data,
        });
        toast.success('Nota inserita con successo');
      }
    }
    closeModal();
  };

  const exitFromModal = () => {
    setShowCloseModalMessage(true);
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
        innerClassName="px-6 py-4 relative"
        headerChildren={note !== undefined ? 'Aggiorna nota' : 'Inserisci nota'}>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div>
            <FormLabel>Nome</FormLabel>
            <TextField
              form={form}
              name="name"
              type="string"
              placeholder="Titolo Nota"
              validation={{
                required: { value: true, message: 'Titolo nota obbligatorio' },
              }}
            />
          </div>
          
          <div>
            <FormLabel>Stato</FormLabel>
            <SelectField
              form={form}
              name="status"
              options={[
                { label: 'Aperto', value: 'open' },
                { label: 'Chiuso', value: 'closed' },
              ]}
              type="string"
              placeholder="Stato"
            />
          </div>

          <div>
            <FormLabel>Descrizione</FormLabel>
            <TextareaField
              form={form}
              name="description"
              type="string"
              placeholder="Descrizione"
              rows={4}
              validation={{
                required: { value: true, message: 'Descrizione obbligatoria' },
              }}
            />
          </div>

          <div className="flex justify-end py-1">
            <Button className="py-1" btnStyle="blue">
              {mode === 'edit' ? 'Aggiorna' : 'Inserisci'}
            </Button>
          </div>
        </form>
      </Modal>

      <ModalConfirmDialog
        isVisible={showCloseModalMessage}
        handleCancel={() => { setShowCloseModalMessage(false) }}
        handleOk={() => { closeModal() }} 
      />
    </>
  )
};

export default NoteModal;
