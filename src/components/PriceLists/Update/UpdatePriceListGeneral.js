import React, { useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { useHistory } from 'react-router-dom';
import { http, MOVOLAB_ROLE_ADMIN } from '../../../utils/Utils';

import { TextField } from '../../Form/TextField';
import { SelectField } from '../../Form/SelectField';
import FormLabel from '../../UI/FormLabel';
import { UserContext } from '../../../store/UserContext';
import Button from '../../UI/buttons/Button';
import ModalConfirmDialog from '../../UI/ModalConfirmDialog';

const UpdatePriceListGeneral = (props) => {
  const form = useForm();
  const params = useParams();
  const history = useHistory();
  const [showModal, setShowModal] = useState(false);
  const [priceList, setPriceList] = useState({}); // eslint-disable-line no-unused-vars
  const [clients, setClients] = useState([]);
  const mode = params.id ? 'edit' : 'create';

  const { data: currentClient } = useContext(UserContext);
  const role = currentClient?.role;

  useEffect(() => {
    fetchPriceList();
    fetchClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, currentClient]);

  let licenseTypes;

  if (role === MOVOLAB_ROLE_ADMIN) {
    licenseTypes = [
      { label: 'Movolab', value: 'movolab' },
      { label: 'Cliente - Licenziatario', value: 'client' },
    ];
  } else {
    licenseTypes = [{ label: 'Cliente - Licenziatario', value: 'client' }];
  }

  const fetchPriceList = async () => {
    try {
      if (props.mode === 'edit') {
        const response = await http({ url: `/pricing/priceLists/${params.id}` });
        setPriceList(response);

        form.setValue('name', response.name);
        form.setValue('licenseType', response.licenseType);
        form.setValue('description', response.description);
        form.setValue('client', response.client);
        if (response.validFrom !== undefined) {
          form.setValue('validFrom', new Date(response.validFrom).toISOString().split('T')[0]);
        }
        if (response.validTo !== undefined) {
          form.setValue('validTo', new Date(response.validTo).toISOString().split('T')[0]);
        }
        form.setValue('status', response.status);
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const fetchClients = async () => {
    try {
      if (role === MOVOLAB_ROLE_ADMIN) {
        const response = await http({ url: '/clients/client/all' });
        setClients(
          response.result.map((client) => {
            return {
              value: client._id,
              label: `${client.ragioneSociale} - ${client.partitaIva}`,
            };
          }),
        );
      } else {
        setClients([
          {
            value: currentClient?.client?._id,
            label: `${currentClient?.client?.ragioneSociale} - ${currentClient?.client?.partitaIva}`,
          },
        ]);
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const openModal = (e) => {
    e.preventDefault();
    setShowModal(true);
  };

  const removePriceList = async (e) => {
    e.preventDefault();
    try {
      await http({
        method: 'DELETE',
        url: `/pricing/priceLists/${params.id}`,
      });
      toast.success('Listino eliminato');
      history.push('/admin/movolab/listini');
    } catch (err) {
      console.error(err);
      toast.error(err?.error || 'Errore');
    }
  };

  const onSubmit = async (data) => {
    try {
      if (props.mode === 'create') {
        if (role === MOVOLAB_ROLE_ADMIN) {
          data = {
            ...data,
            licenseType: 'movolab',
          };
        }

        const result = await http({
          method: 'POST',
          url: '/pricing/priceLists',
          form: data,
        });
        toast.success('Listino creato');
        props.updatePriceList(result);
        if (role === MOVOLAB_ROLE_ADMIN) {
          history.push(`/admin/movolab/listini/${result._id}/aggiorna`);
        } else {
          history.push(`/settings/listini/${result._id}/aggiorna`);
        }
      } else if (props.mode === 'edit') {
        await http({
          method: 'PUT',
          url: `/pricing/priceLists/${params.id}`,
          form: data,
        });
        toast.success('Listino aggiornato');
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  return (
    <>
      <form onSubmit={form.handleSubmit(onSubmit)} id="priceListForm">
        <fieldset disabled={form.formState.isSubmitting}>
          <div className="max-w-sm mt-2">
            <FormLabel>Nome</FormLabel>
            <TextField
              form={form}
              name="name"
              type="text"
              placeholder="Nome Listino"
              validation={{
                required: { value: true, message: 'Nome Listino' },
              }}
            />
            <FormLabel>Tipo Licenza</FormLabel>
            <SelectField
              form={form}
              name="licenseType"
              placeholder="Tipo Licenza"
              // disabled={role !== MOVOLAB_ROLE_ADMIN}
              validation={{
                required: {
                  value: true,
                  message: 'Inserisci Tipo Licenza',
                },
              }}
              options={licenseTypes}
            />
            <FormLabel>Cliente Associato</FormLabel>
            <SelectField
              form={form}
              name="client"
              placeholder="Cliente Associato"
              // disabled={role !== MOVOLAB_ROLE_ADMIN}
              validation={{
                required: {
                  value: form.watch('licenseType') === 'client',
                  message: 'Inserisci Cliente Associato',
                },
              }}
              options={clients}
            />
            <FormLabel>Descrizione</FormLabel>
            <TextField form={form} name="description" type="text" placeholder="Descrizione" />
            <FormLabel>Valido dal</FormLabel>
            <TextField
              form={form}
              name="validFrom"
              type="date"
              placeholder="Valido dal"
              validation={{
                required: { value: true, message: 'Valido dal' },
              }}
            />
            <FormLabel>Valido Al</FormLabel>
            <TextField
              form={form}
              name="validTo"
              type="date"
              placeholder="Valido al"
              validation={{
                required: { value: true, message: 'Valido al' },
              }}
            />
            <FormLabel>Stato</FormLabel>
            <SelectField
              form={form}
              name="status"
              placeholder="Stato"
              validation={{
                required: {
                  value: true,
                  message: 'Inserisci Stato',
                },
              }}
              options={[
                { label: 'ATTIVO', value: 'active' },
                { label: 'ANNULLATO', value: 'inactive' },
              ]}
            />
          </div>

          <div className="mt-4">
            {mode === 'edit' ? (
              <>
                {role === MOVOLAB_ROLE_ADMIN ? <Button>Salva</Button> : null}

                <Button onClick={(e) => openModal(e)} btnStyle="white" className="!text-red-500">
                  Rimuovi Listino
                </Button>
              </>
            ) : (
              <Button>Crea Listino</Button>
            )}
          </div>
        </fieldset>
      </form>

      <ModalConfirmDialog
        isVisible={showModal}
        handleCancel={closeModal}
        handleOk={(e) => {
          removePriceList(e);
        }}
        okText="Rimuovi"
        cancelText="Annulla"
        title="Sei sicuro di voler rimuovere il listino?"
        description={
          <>
            Si sta rimuovendo {form.watch('name')},<br />
            Questa operazione non potrà essere annullata
          </>
        }
      />
    </>
  );
};

export default UpdatePriceListGeneral;
