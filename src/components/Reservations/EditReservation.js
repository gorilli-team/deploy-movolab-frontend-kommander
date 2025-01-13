import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import FormLabel from '../UI/FormLabel';
import { SelectField } from '../Form/SelectField';
import GrayButton from '../UI/buttons/GrayButton';

const EditReservation = ({ reservation, updateReservation }) => {
  const form = useForm();

  useEffect(() => {
    if (reservation) {
      form.setValue('code', reservation?.code);
      form.setValue('state', reservation?.state);
    }
  }, [reservation]); // eslint-disable-line

  return (
    <div>
      <p className="text-2xl pt-5">
        Codice di prenotazione: <b>{reservation?.code}</b>
      </p>
      <hr style={{ margin: '20px 0' }} />
      <form onSubmit={form.handleSubmit(updateReservation)}>
        <fieldset disabled={form.formState.isSubmitting} className="w-full">
          <div className="flex">
            <div className="pr-5 w-64">
              <FormLabel>Stato</FormLabel>
              <SelectField
                form={form}
                name="state"
                placeholder="Stato"
                options={[
                  { value: 'aperto', label: 'aperto' },
                  { value: 'attivo', label: 'attivo' },
                  { value: 'chiuso', label: 'chiuso' },
                  { value: 'annullato', label: 'annullato' },
                  { value: 'no show', label: 'no show' },
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-wrap -mx-3 mt-6 ">
              <div className="w-full px-3">
                <GrayButton>Aggiorna prenotazione</GrayButton>
              </div>
            </div>
          </div>
        </fieldset>
      </form>
    </div>
  );
};

export default EditReservation;
