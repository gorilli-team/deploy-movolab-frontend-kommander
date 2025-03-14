import React from 'react';
import { useForm } from 'react-hook-form';

import FormLabel from '../../UI/FormLabel';
import GrayButton from '../../UI/buttons/GrayButton';
import WhiteButton from '../../UI/buttons/WhiteButton';
import { SelectField } from '../../Form/SelectField';

const UpdateVatModal = ({ type, costAmount, updateCustomCost, closeModal }) => {
  const form = useForm();

  form.setValue('cost', costAmount?.toFixed(2) || 0);

  // eslint-disable-next-line no-unused-vars
  const mapType = (type) => {
    switch (type) {
      case 'fuel':
        return 'Carburante';
      case 'km':
        return 'Km';
      case 'damages':
        return 'Danni';
      case 'kaskoFranchise':
        return 'Kasko';
      case 'rcaFranchise':
        return 'RCA';
      case 'ifFranchise':
        return 'Furto';
      default:
        return 'Carburante';
    }
  };

  const updateCost = async (value) => {
    updateCustomCost(type, value);
    closeModal();
  };

  return (
    <div style={{ height: '450px', width: '600px' }}>
      <div className="justify-center items-center flex fixed inset-0 z-50 outline-none focus:outline-none">
        <div className="relative w-auto my-6 mx-auto max-w-3xl">
          <div className="border-2 rounded-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
            <div className="flex items-start justify-between p-5 border-b border-solid border-slate-200 rounded-t">
              <div className="mr-2">
                <h3 className="text-lg font-semibold mt-2">Aggiornamento IVA</h3>
              </div>
              <div>
                <WhiteButton className="p-1" onClick={closeModal}>
                  x
                </WhiteButton>
              </div>
            </div>
            <div className="relative p-4 flex-auto">
              <form onSubmit={form.handleSubmit(updateCost)}>
                <fieldset disabled={form.formState.isSubmitting} className="w-full">
                  <>
                    <div className="flex">
                      <div className="w-full">
                        <FormLabel>IVA</FormLabel>
                        <SelectField
                          name="type"
                          form={form}
                          options={[
                            { value: '', label: '-- Seleziona --' },
                            { value: 22, label: '22%' },
                            { value: 10, label: '10%' },
                            { value: 4, label: '4%' },
                            { value: 0, label: '0%' },
                          ]}
                        />{' '}
                      </div>
                    </div>
                    <div className="flex flex-wrap -mx-3 mt-2 ">
                      <div className="px-3">
                        <GrayButton
                          onClick={(e) => {
                            e.preventDefault();
                            updateCost(form.getValues('cost'));
                          }}
                        >
                          Aggiorna
                        </GrayButton>
                      </div>
                    </div>
                  </>
                </fieldset>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateVatModal;
