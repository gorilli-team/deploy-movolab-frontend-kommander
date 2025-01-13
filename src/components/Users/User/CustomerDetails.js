import React, { useState } from 'react';
import { http } from '../../../utils/Utils';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';

import FormLabel from '../../UI/FormLabel';
import { SelectField } from '../../Form/SelectField';
import toast from 'react-hot-toast';

const CustomerDetails = ({ user, onSubmitUpdate }) => {
  const form = useForm();
  const params = useParams();
  const [checkedCentralised, setCheckedCentralised] = useState(true);
  const [checkedSummary, setCheckedSumary] = useState(true);

  const onSubmit = async (data) => {
    try {
      await http({
        method: 'PUT',
        url: `/users/${params.id}`,
        form: data,
      });
      toast.success('Utente aggiornato');
      user.state = data.state;
      onSubmitUpdate();
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  if (!user) {
  } else {
    form.setValue('state', user.state);
  }

  return (
    <div>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-wrap justify-between items-end"
        id="saveUserForm"
      >
        <div className="col-span-1">
          <div className="flex items-center">
            <div>
              <FormLabel>Stato Cliente</FormLabel>
              {/*number*/}
              <SelectField
                form={form}
                name="state"
                type="string"
                placeholder="Stato cliente"
                options={[
                  { value: 'attivo', label: 'attivo' },
                  { value: 'chiuso', label: 'chiuso' },
                  { value: 'annullato', label: 'annullato' },
                ]}
              />
            </div>
          </div>
          <p className="border-b-2 border-gray-800 font-medium text-gray-800 pb-1 mb-1 mt-5">
            Fattura
          </p>
          {/*invoice*/}
          <label className="flex items-center">
            {/*centralized*/}
            <input
              className="mr-2"
              type="checkbox"
              onChange={() => {
                setCheckedCentralised(!checkedCentralised);
                form.setValue('invoiceCentralized', checkedCentralised);
              }}
            />{' '}
            Centralizzata
          </label>
          <label className="flex items-center">
            {/*summary*/}
            <input
              className="mr-2"
              type="checkbox"
              onChange={() => {
                setCheckedSumary(!checkedSummary);
                form.setValue('invoiceSummary', checkedSummary);
              }}
            />{' '}
            Riepologativa
          </label>

          <p className="border-b-2 border-gray-800 font-medium text-gray-800 pb-1 mb-1 mt-5">
            Pagamento
          </p>
          <div className="flex items-center">
            <div className="w-64">
              <FormLabel>Modalità</FormLabel>
              {/*mode*/}
              <SelectField
                form={form}
                name="payment.mode"
                type="string"
                placeholder="Modalità"
                options={[
                  { value: 'contanti', label: 'contanti' },
                  { value: 'carta', label: 'carta' },
                ]}
              />
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-64">
              <FormLabel>Termini</FormLabel>
              {/*terms*/}
              <SelectField
                form={form}
                name="payment.term"
                type="string"
                placeholder="Termini"
                options={[
                  { value: 'pagamento immediato', label: 'pagamento immediato' },
                  { value: 'successivo pagamento', label: 'successivo pagamento' },
                ]}
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CustomerDetails;
