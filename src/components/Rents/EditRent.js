import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import FormLabel from '../UI/FormLabel';
import { SelectField } from '../Form/SelectField';
import WhiteButton from '../UI/buttons/WhiteButton';
import GrayButton from '../UI/buttons/GrayButton';
import { useHistory } from 'react-router-dom';

const EditRent = ({ rent, updateRent }) => {
  const form = useForm();
  const history = useHistory();

  useEffect(() => {
    if (rent) {
      form.setValue('code', rent?.code);
      form.setValue('state', rent?.state);
    }
  }, [rent]); // eslint-disable-line

  return (
    <div className="p-6">
      <div className="flex space-x-2">
        <WhiteButton onClick={() => history.goBack()}>Indietro</WhiteButton>
      </div>
      <p className="text-2xl pt-5">
        Codice movo: <b>{rent?.code}</b>
      </p>
      <hr style={{ margin: '20px 0' }} />
      <form onSubmit={form.handleSubmit(updateRent)}>
        <fieldset disabled={form.formState.isSubmitting} className="w-full">
          <div className="flex">
            <div className="pr-5 w-64">
              <FormLabel>Stato</FormLabel>
              <SelectField
                form={form}
                name="state"
                placeholder="Stato"
                options={[
                  // { value: 'aperto', label: 'aperto' },
                  // { value: 'aperto confermato', label: 'aperto confermato' },
                  // { value: 'attivo', label: 'attivo' },
                  // { value: 'chiuso', label: 'chiuso' },
                  // { value: 'chiuso confermato', label: 'chiuso confermato' },
                  // { value: 'fatturato', label: 'fatturato' },
                  { value: 'annullato', label: 'annullato' },
                  // { value: 'stornato', label: 'stornato' },
                  { value: 'no show', label: 'no show' },
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-wrap -mx-3 mt-6 ">
              <div className="w-full px-3">
                <GrayButton>Aggiorna movo</GrayButton>
              </div>
            </div>
          </div>
        </fieldset>
      </form>
    </div>
  );
};

export default EditRent;
