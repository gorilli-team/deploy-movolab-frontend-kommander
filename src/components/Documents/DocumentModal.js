import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { http } from '../../utils/Utils';
import { useForm } from 'react-hook-form';
import { TextField } from '../Form/TextField';
import { TextareaField } from '../Form/TextareaField';
import DocumentUploader from '../Form/DocumentUploader';

import Button from '../UI/buttons/Button';
import FormLabel from '../UI/FormLabel';
import ModalConfirmDialog from '../UI/ModalConfirmDialog';
import Modal from '../UI/Modal';
import { documentLabels as docTypes } from '../../utils/Documents';
import { SelectField } from '../Form/SelectField';

const DocumentModal = ({
  resource,
  document,
  phase,
  modalOnlyUpload = false,
  closeModal = () => {},
}) => {
  const form = useForm();
  const [showCloseModalMessage, setShowCloseModalMessage] = useState(false);
  const [fileUrl, setFileUrl] = useState(document?.fileUrl || '');

  const mode = document ? 'edit' : 'create';
  const documentLabels = docTypes[resource._type];

  if (document !== undefined) {
    form.setValue('name', document.name);
    form.setValue('label', document.label);
    form.setValue('description', document.description);
    form.setValue('fileUrl', document.fileUrl);
  }

  const onSubmit = async (data) => {
    data = {
      ...data,
      fileUrl: fileUrl,
    };

    if (mode === 'edit') {
      await http({
        url: resource._settings.save.url(resource._id, document._id, phase),
        method: resource._settings.save?.method || 'POST',
        form: resource._settings.save?.dataFormat
          ? resource._settings.save?.dataFormat(data)
          : data,
      });
      toast.success('Documento aggiornato con successo');
    } else {
      await http({
        url: resource._settings.new.url(resource._id, phase),
        method: resource._settings.new?.method || 'POST',
        form: resource._settings.new?.dataFormat ? resource._settings.new?.dataFormat(data) : data,
      });
      toast.success('Documento inserito con successo');
    }
    closeModal();
  };

  const uploadDocumentUrl = async (documentFile) => {
    setFileUrl(documentFile);
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
        headerChildren={`${
          document !== undefined ? (modalOnlyUpload ? 'Carica' : 'Aggiorna') : 'Inserisci'
        } documento`}
        onClose={(e) => {
          e.preventDefault();
          exitFromModal();
        }}
        innerClassName="px-6 py-4 relative"
      >
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="mt-2">
            <FormLabel>Nome</FormLabel>
            <TextField
              form={form}
              name="name"
              type="string"
              placeholder="Nome"
              disabled={modalOnlyUpload}
              validation={{
                required: { value: true, message: 'Nome documento obbligatorio' },
              }}
            />
          </div>
          <div className="mt-2">
            <FormLabel>Descrizione</FormLabel>
            <TextareaField
              form={form}
              name="description"
              type="string"
              placeholder="Descrizione"
              rows={4}
              disabled={modalOnlyUpload}
              validation={{
                required: {
                  value: !resource._type === 'client',
                  message: 'Descrizione obbligatoria',
                },
              }}
            />
          </div>
          <div>
            <FormLabel>Tipo documento</FormLabel>
            <SelectField
              form={form}
              name="label"
              options={documentLabels || []}
              type="string"
              placeholder="Tipo documento"
              disabled={modalOnlyUpload}
              validation={{
                required: { value: true, message: 'Seleziona il tipo documento' },
              }}
            />
          </div>
          <div className="mt-4">
            <DocumentUploader
              uploadDocumentUrl={uploadDocumentUrl}
              bucket={'movolab-rent-documents'}
            />
          </div>

          <div className="flex justify-end space-x-2 mt-2">
            <Button btnStyle="blue" className="py-1">
              {mode === 'edit' ? (modalOnlyUpload ? 'Salva e continua' : 'Aggiorna') : 'Inserisci'}
            </Button>
          </div>
        </form>
      </Modal>

      <ModalConfirmDialog
        isVisible={showCloseModalMessage}
        description="Documento non inserito o aggiornato."
        handleCancel={() => {
          setShowCloseModalMessage(false);
        }}
        handleOk={closeModal}
      />
    </>
  );
};

export default DocumentModal;
